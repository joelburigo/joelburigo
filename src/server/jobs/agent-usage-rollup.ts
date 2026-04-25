import 'server-only';
import { and, eq, gte, lt, sql } from 'drizzle-orm';
import type { Job } from 'pg-boss';
import { db } from '@/server/db/client';
import { agent_conversations, agent_messages } from '@/server/db/schema';
import { kv } from '@/server/lib/kv';

/**
 * Rollup diário de usage do agente IA.
 *
 * Roda 03:00 UTC. Agrega `agent_messages` do dia anterior por `user_id`
 * (via JOIN com `agent_conversations` pra resolver user) e escreve no
 * `kv_store` namespace `agent_usage_daily`.
 *
 * Por que kv e não tabela:
 *   - `agent_usage` (mensal) cresce on-the-fly via `recordUsage` no service.
 *   - Materialização diária é pra dashboards futuros / observability,
 *     não pra hot path. kv evita criar tabela nova (proibido nesse worktree).
 *
 * Key format: `agent_usage_daily:${userId}:${YYYY-MM-DD}`
 * Value: { input, output, cached, cost_cents, requests }
 */

export const AGENT_USAGE_ROLLUP = 'agent-usage-rollup';
export const schedule = '0 3 * * *'; // 03:00 UTC diário

const DAILY_NAMESPACE = 'agent_usage_daily';

type DailyRow = {
  user_id: string;
  input: number;
  output: number;
  cached: number;
  cost_cents: number;
  requests: number;
};

function yesterdayUtcRange(): { start: Date; end: Date; ymd: string } {
  const now = new Date();
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
  const start = new Date(end.getTime() - 24 * 60 * 60 * 1000);
  const y = start.getUTCFullYear();
  const m = String(start.getUTCMonth() + 1).padStart(2, '0');
  const d = String(start.getUTCDate()).padStart(2, '0');
  return { start, end, ymd: `${y}-${m}-${d}` };
}

/**
 * Handler do job — pg-boss v12 entrega array de jobs (batch). Aceitamos qualquer
 * tamanho de batch; o trabalho é o mesmo (idempotente: sobrescreve kv key).
 */
export async function handleAgentUsageRollup(_jobs: Job[]): Promise<void> {
  const { start, end, ymd } = yesterdayUtcRange();

  // Soma tokens por user via JOIN agent_messages → agent_conversations.
  // Filtra `role = 'assistant'` pra não dobrar (input já vem nos próprios campos
  // tokens_input do assistant message — convenção: armazena par i/o na linha do
  // assistant). Se schema mudar, ajustar.
  const rows = await db
    .select({
      user_id: agent_conversations.user_id,
      input: sql<number>`coalesce(sum(${agent_messages.tokens_input}), 0)`,
      output: sql<number>`coalesce(sum(${agent_messages.tokens_output}), 0)`,
      cached: sql<number>`coalesce(sum(${agent_messages.tokens_cached}), 0)`,
      cost_cents: sql<number>`coalesce(sum(${agent_messages.cost_cents})::float8, 0)`,
      requests: sql<number>`count(*)::int`,
    })
    .from(agent_messages)
    .innerJoin(agent_conversations, eq(agent_messages.conversation_id, agent_conversations.id))
    .where(
      and(
        eq(agent_messages.role, 'assistant'),
        gte(agent_messages.created_at, start),
        lt(agent_messages.created_at, end)
      )
    )
    .groupBy(agent_conversations.user_id);

  if (rows.length === 0) {
    console.info(`[agent-usage-rollup] ${ymd}: 0 users com atividade`);
    return;
  }

  for (const r of rows as DailyRow[]) {
    const key = `${DAILY_NAMESPACE}:${r.user_id}:${ymd}`;
    await kv.set(key, {
      input: Number(r.input),
      output: Number(r.output),
      cached: Number(r.cached),
      cost_cents: Number(r.cost_cents),
      requests: Number(r.requests),
    });
  }

  console.info(`[agent-usage-rollup] ${ymd}: ${rows.length} users agregados em kv_store`);
}
