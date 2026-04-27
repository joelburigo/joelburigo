import 'server-only';
import { and, eq, sql } from 'drizzle-orm';
import { db } from '@/server/db/client';
import { agent_usage, entitlements, products } from '@/server/db/schema';
import { ulid } from '@/server/lib/ulid';

/**
 * Quota & usage tracking pro agente IA (Sprint 2).
 *
 * Persistência:
 *   - `agent_usage` (mensal por user) é a tabela canônica — UPSERT incremental
 *     em cada `recordUsage`. Aggregation key é `period_month` no formato YYYY-MM.
 *   - `agent_messages` (per-message detail) é responsabilidade do agente B no
 *     route handler `/api/agent/chat`. Quota service trabalha só com o rollup.
 *
 * Limites:
 *   - Default mensal env-driven via `OPENAI_QUOTA_MONTHLY_TOKENS_DEFAULT`
 *     (fallback `2_000_000` se ausente/invalida).
 *   - Soft warning a 80% (`warning: true`).
 *   - Hard limit a 100% (`ok: false`).
 *   - Per-user override: schema atual NÃO tem coluna em `users`. Se for
 *     adicionada no futuro, expandir `monthlyLimitFor` pra ler dela.
 *
 * Cost computation:
 *   - Pricing real do `gpt-5.2` ainda não publicado. `cost_usd` opcional —
 *     se chamador não passar, salvamos 0. Quando preço sair, atualizar
 *     `estimateCostCents` com a tabela real.
 */

export type QuotaStatus = {
  ok: boolean;
  warning: boolean;
  remaining: number;
  limit: number;
  usedThisMonth: number;
  resetAt: Date;
};

const DEFAULT_MONTHLY_LIMIT = 2_000_000;

// TODO: substituir por pricing real do gpt-5.2 quando OpenAI publicar.
// Valores em USD/1M tokens. Se modelo desconhecido, retorna null (=> 0 em cost_cents).
const PRICING_USD_PER_M_TOKENS: Record<string, { input: number; output: number }> = {
  // 'gpt-5.2': { input: 0, output: 0 },
};

function currentPeriodMonth(now: Date = new Date()): string {
  // YYYY-MM em UTC (combina com query "início do mês UTC")
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

function startOfNextMonthUtc(now: Date = new Date()): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0, 0));
}

function parseEnvLimit(): number {
  const raw = process.env.OPENAI_QUOTA_MONTHLY_TOKENS_DEFAULT;
  if (!raw) return DEFAULT_MONTHLY_LIMIT;
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return DEFAULT_MONTHLY_LIMIT;
  return Math.floor(n);
}

/**
 * Limite mensal de tokens pro user.
 *
 * Ordem de prioridade:
 *   1. `entitlements.metadata.token_quota_override` (per-user override admin)
 *   2. `products.monthly_llm_token_quota` (cap por-produto, ex: VSS = 500_000)
 *   3. `OPENAI_QUOTA_MONTHLY_TOKENS_DEFAULT` env (fallback global)
 *
 * Sempre considera o MAIOR cap entre entitlements ativos do user (caso ele
 * tenha múltiplos produtos).
 */
async function monthlyLimitFor(userId: string): Promise<number> {
  const rows = await db
    .select({
      productCap: products.monthly_llm_token_quota,
      metadata: entitlements.metadata,
    })
    .from(entitlements)
    .leftJoin(products, eq(products.id, entitlements.product_id))
    .where(and(eq(entitlements.user_id, userId), eq(entitlements.status, 'active')));

  let bestCap = 0;
  for (const row of rows) {
    const meta = (row.metadata ?? {}) as { token_quota_override?: number | null };
    const override =
      typeof meta.token_quota_override === 'number' && meta.token_quota_override > 0
        ? Math.floor(meta.token_quota_override)
        : null;
    const productCap = row.productCap != null ? Number(row.productCap) : 0;
    const effective = override ?? productCap;
    if (effective > bestCap) bestCap = effective;
  }

  if (bestCap > 0) return bestCap;
  return parseEnvLimit();
}

/**
 * Estima custo em USD pra um par (input, output) tokens. Retorna null se não
 * tiver pricing pro model — chamador pode default pra 0/null.
 */
function estimateCostUsd(model: string, inputTokens: number, outputTokens: number): number | null {
  const price = PRICING_USD_PER_M_TOKENS[model];
  if (!price) return null;
  const cost =
    (inputTokens / 1_000_000) * price.input + (outputTokens / 1_000_000) * price.output;
  return Number(cost.toFixed(6));
}

export async function checkQuota(userId: string): Promise<QuotaStatus> {
  const limit = await monthlyLimitFor(userId);
  const period = currentPeriodMonth();

  const [row] = await db
    .select({
      tokens_input: agent_usage.tokens_input,
      tokens_output: agent_usage.tokens_output,
    })
    .from(agent_usage)
    .where(and(eq(agent_usage.user_id, userId), eq(agent_usage.period_month, period)))
    .limit(1);

  const used = row ? Number(row.tokens_input) + Number(row.tokens_output) : 0;
  const remaining = Math.max(0, limit - used);
  const ratio = limit > 0 ? used / limit : 0;

  return {
    ok: used < limit,
    warning: ratio >= 0.8,
    remaining,
    limit,
    usedThisMonth: used,
    resetAt: startOfNextMonthUtc(),
  };
}

export async function recordUsage(args: {
  userId: string;
  conversationId: string;
  model: string;
  input_tokens: number;
  output_tokens: number;
  cost_usd?: number;
  /** Se for a primeira mensagem da conversa, incrementa conversation_count. */
  isNewConversation?: boolean;
}): Promise<void> {
  const period = currentPeriodMonth();

  // Compute cost se não veio do chamador. cost_usd → cost_cents (USD * 100).
  const computedUsd =
    args.cost_usd ?? estimateCostUsd(args.model, args.input_tokens, args.output_tokens);
  const costCentsDelta = computedUsd != null ? computedUsd * 100 : 0;

  const inputDelta = Math.max(0, Math.floor(args.input_tokens));
  const outputDelta = Math.max(0, Math.floor(args.output_tokens));
  const convDelta = args.isNewConversation ? 1 : 0;

  // UPSERT incremental: se row do mês existe, soma. Senão, cria.
  // PK natural seria (user_id, period_month) mas schema só tem `id` PRIMARY KEY,
  // então usamos pattern manual: tenta UPDATE, se 0 rows insere.
  const updated = await db
    .update(agent_usage)
    .set({
      tokens_input: sql`${agent_usage.tokens_input} + ${inputDelta}`,
      tokens_output: sql`${agent_usage.tokens_output} + ${outputDelta}`,
      cost_cents: sql`${agent_usage.cost_cents} + ${costCentsDelta.toFixed(2)}`,
      conversation_count: sql`${agent_usage.conversation_count} + ${convDelta}`,
    })
    .where(and(eq(agent_usage.user_id, args.userId), eq(agent_usage.period_month, period)))
    .returning({ id: agent_usage.id });

  if (updated.length === 0) {
    await db.insert(agent_usage).values({
      id: ulid(),
      user_id: args.userId,
      period_month: period,
      tokens_input: inputDelta,
      tokens_output: outputDelta,
      tokens_cached: 0,
      cost_cents: costCentsDelta.toFixed(2),
      conversation_count: convDelta,
    });
  }
}
