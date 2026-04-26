import 'server-only';

/**
 * Orquestrador do agente IA da área VSS.
 *
 * Responsabilidades:
 *   - Carregar contexto pro prompt (destravamento + perfil 6P + histórico)
 *   - Criar/recuperar `agent_conversations`
 *   - Chamar `streamText` com graceful degradation (mock em dev sem OPENAI_API_KEY)
 *   - Persistir mensagens user/assistant + uso de tokens (via service E)
 *
 * O route handler em `/api/agent/chat` consome este service. A integração com
 * `quota.ts` (agent E) é feita via stub local até o módulo dele aterrissar.
 */

import { eq, asc, and } from 'drizzle-orm';
import { streamText, simulateReadableStream, stepCountIs, type UIMessage, type ModelMessage } from 'ai';
import { db } from '@/server/db/client';
import {
  agent_conversations,
  agent_messages,
  user_profiles,
  vss_destravamentos,
  vss_modules,
  vss_phases,
  type User,
} from '@/server/db/schema';
import { ulid } from '@/server/lib/ulid';
import { getModel, getModelInfo, estimateCostUsd } from '@/server/lib/llm';
import { buildAgentTools, type ToolContext } from './agent-tools';
import { getFlowFor, type AgentFlow } from './agent-flows';
import { checkQuota, recordUsage } from './quota';

// =====================================================================
// CONTEXT LOADING
// =====================================================================

interface DestravamentoContext {
  id: string;
  code: string;
  slug: string;
  title: string;
  estimatedMinutes: number;
  flowKind: string;
  module: { code: string; title: string };
  phase: { code: string; title: string };
}

async function loadDestravamento(destravamentoId: string): Promise<DestravamentoContext | null> {
  const [row] = await db
    .select({
      id: vss_destravamentos.id,
      code: vss_destravamentos.code,
      slug: vss_destravamentos.slug,
      title: vss_destravamentos.title,
      estimated_minutes: vss_destravamentos.estimated_minutes,
      flow_kind: vss_destravamentos.flow_kind,
      module_code: vss_modules.code,
      module_title: vss_modules.title,
      phase_code: vss_phases.code,
      phase_title: vss_phases.title,
    })
    .from(vss_destravamentos)
    .innerJoin(vss_modules, eq(vss_modules.id, vss_destravamentos.module_id))
    .innerJoin(vss_phases, eq(vss_phases.id, vss_modules.phase_id))
    .where(eq(vss_destravamentos.id, destravamentoId))
    .limit(1);

  if (!row) return null;
  return {
    id: row.id,
    code: row.code,
    slug: row.slug,
    title: row.title,
    estimatedMinutes: row.estimated_minutes,
    flowKind: row.flow_kind,
    module: { code: row.module_code, title: row.module_title },
    phase: { code: row.phase_code, title: row.phase_title },
  };
}

async function loadProfile(userId: string) {
  const [row] = await db
    .select()
    .from(user_profiles)
    .where(eq(user_profiles.user_id, userId))
    .limit(1);
  return row ?? null;
}

async function loadHistory(conversationId: string): Promise<ModelMessage[]> {
  const rows = await db
    .select({
      role: agent_messages.role,
      content: agent_messages.content,
    })
    .from(agent_messages)
    .where(eq(agent_messages.conversation_id, conversationId))
    .orderBy(asc(agent_messages.created_at));

  // `content` é JSONB — pra mensagens persistidas, salvamos como string simples
  // ou array de parts. Aqui aceitamos ambos.
  return rows
    .map((r): ModelMessage | null => {
      const role = r.role as ModelMessage['role'];
      if (role !== 'user' && role !== 'assistant' && role !== 'system' && role !== 'tool') {
        return null;
      }
      const c = r.content as unknown;
      // Compat: string simples
      if (typeof c === 'string') {
        return { role, content: c } as ModelMessage;
      }
      // ModelMessage shape ({ role, content })
      if (c && typeof c === 'object' && 'content' in c) {
        return { role, content: (c as { content: ModelMessage['content'] }).content } as ModelMessage;
      }
      return null;
    })
    .filter((m): m is ModelMessage => m !== null);
}

// =====================================================================
// CONVERSATION LIFECYCLE
// =====================================================================

export interface EnsureConversationInput {
  userId: string;
  conversationId?: string;
  destravamentoId: string;
}

export async function ensureConversation(
  input: EnsureConversationInput
): Promise<{ id: string; isNew: boolean }> {
  if (input.conversationId) {
    const [existing] = await db
      .select({ id: agent_conversations.id })
      .from(agent_conversations)
      .where(
        and(
          eq(agent_conversations.id, input.conversationId),
          eq(agent_conversations.user_id, input.userId)
        )
      )
      .limit(1);
    if (existing) return { id: existing.id, isNew: false };
    // ID foi enviado mas não pertence a esse user / não existe — cria nova.
  }

  const id = ulid();
  await db.insert(agent_conversations).values({
    id,
    user_id: input.userId,
    destravamento_id: input.destravamentoId,
    status: 'active',
    context_snapshot: {},
  });
  return { id, isNew: true };
}

// =====================================================================
// PROMPT BUILDING
// =====================================================================

const SYSTEM_BASE = `Você é o agente IA do VSS — Vendas Sem Segredos, do Joel Burigo. Conduz o aluno por destravamentos práticos do método.

# Tom e estilo (não negociar)
- Português BR direto, "tu" ou "você" — sem formalidade corporativa.
- Concreto sobre vago. Pergunta uma coisa de cada vez quando coletando dados.
- Vocabulário Joel: "destravamento", "sistema", "ICP", "oferta", "cadência", "gargalo", "6P".
- Nunca: "stakeholder", "sinergia", "engajar", "alavancagem".
- Sempre cite números/exemplos do aluno antes de generalizar.

# Como você opera
1. Leia o contexto do destravamento (abaixo) e o perfil 6P do aluno.
2. Conduz a sessão em micro-passos. Confirma entendimento antes de avançar.
3. Quando entregável estiver pronto: chama tool 'saveArtifact'.
4. Quando descobrir info nova relevante do negócio: chama 'updateProfile'.
5. Quando o aluno confirmar que terminou: chama 'markComplete' (e só então).
6. Se sair do escopo / ficar travado: chama 'requestHumanReview' explicando.

# Tools disponíveis (USE quando apropriado)
- **saveArtifact({ title, content_md, kind })** — kinds: icp · oferta · script_vendas · cadencia · precificacao · plano_acao · diagnostico · outro. Salva entregável em markdown. Chama SEMPRE que o aluno e você consolidaram um artefato concreto, mesmo que pequeno.
- **updateProfile({ field, value })** — fields: empresa_nome · segmento · gargalo_principal · produto_md · pessoas_md · precificacao_md · processos_md · performance_md · propaganda_md.
- **markComplete({ summary? })** — só depois do aluno confirmar.
- **requestHumanReview({ reason })** — pra escalar pro Joel.

Se o aluno pedir explicitamente "salva", "registra", "guarda esse artifact", "marca como concluído" — chama a tool imediatamente, sem cerimônia. Depois de chamar uma tool, continua a conversa normalmente confirmando o que rolou.

# Limites
- Não invente cases ou dados do aluno. Se não souber, pergunta.
- Não prometa resultado garantido. Use "aumenta a probabilidade", "tipicamente".
- Não dê conselho jurídico/contábil. Sugira consultar profissional.

Responde sempre em markdown. Sem floreio inicial — vai direto.`;

interface PromptInput {
  destravamento: DestravamentoContext;
  profile: Awaited<ReturnType<typeof loadProfile>>;
  user: Pick<User, 'name' | 'email'>;
  /** Se presente, substitui o systemPrompt base genérico pelo prompt do flow específico. */
  flow?: AgentFlow | null;
}

function buildSystemPrompt({ destravamento, profile, user, flow }: PromptInput): string {
  // Bloco 1: instruções (genérico OU flow âncora — ambos estáveis, cacheáveis)
  // Bloco 2: contexto destravamento (estável dentro de uma conversa)
  // Bloco 3: perfil 6P (muda raramente — também cacheável)
  const baseInstructions = flow?.systemPrompt ?? SYSTEM_BASE;
  const destBlock = `
# Destravamento atual
- Fase: ${destravamento.phase.code} · ${destravamento.phase.title}
- Módulo: ${destravamento.module.code} · ${destravamento.module.title}
- Destravamento: ${destravamento.code} · ${destravamento.title}
- Tempo estimado: ~${destravamento.estimatedMinutes}min
- Flow: ${destravamento.flowKind}
`.trim();

  const profileBits: string[] = [];
  profileBits.push(`- Nome: ${user.name ?? '(não informado)'}`);
  profileBits.push(`- Email: ${user.email}`);
  if (profile?.empresa_nome) profileBits.push(`- Empresa: ${profile.empresa_nome}`);
  if (profile?.segmento) profileBits.push(`- Segmento: ${profile.segmento}`);
  if (profile?.faturamento_atual_cents)
    profileBits.push(`- Faturamento atual: R$ ${(Number(profile.faturamento_atual_cents) / 100).toLocaleString('pt-BR')}`);
  if (profile?.meta_12m_cents)
    profileBits.push(`- Meta 12m: R$ ${(Number(profile.meta_12m_cents) / 100).toLocaleString('pt-BR')}`);
  if (profile?.ticket_medio_cents)
    profileBits.push(`- Ticket médio: R$ ${(Number(profile.ticket_medio_cents) / 100).toLocaleString('pt-BR')}`);
  if (profile?.gargalo_principal) profileBits.push(`- Gargalo principal: ${profile.gargalo_principal}`);

  const sixP: Array<[string, string | null | undefined]> = [
    ['Produto', profile?.produto_md],
    ['Pessoas', profile?.pessoas_md],
    ['Precificação', profile?.precificacao_md],
    ['Processos', profile?.processos_md],
    ['Performance', profile?.performance_md],
    ['Propaganda', profile?.propaganda_md],
  ];
  const sixPFilled = sixP.filter(([, v]) => v && v.trim().length > 0);
  const sixPBlock = sixPFilled.length
    ? `\n## Perfil 6P (preenchido)\n${sixPFilled
        .map(([k, v]) => `### ${k}\n${v}`)
        .join('\n\n')}`
    : '\n## Perfil 6P\n(nenhum dos 6P preenchido ainda — você pode coletar conforme avança)';

  const profileBlock = `
# Aluno
${profileBits.join('\n')}
${sixPBlock}
`.trim();

  return `${baseInstructions}\n\n${destBlock}\n\n${profileBlock}`;
}

// =====================================================================
// MOCK STREAM (graceful degradation)
// =====================================================================

function isMockNeeded(): boolean {
  const key = process.env.OPENAI_API_KEY;
  return !key || key.length < 10 || key === 'sk-placeholder' || key.startsWith('TODO');
}

function mockStreamResponse() {
  const text = '**[mock]** Sou o agente VSS. Em dev sem `OPENAI_API_KEY` válida — configure pra testar de verdade.';
  // Quebra em chunks pequenos pra simular streaming.
  const chunks = text.match(/.{1,12}/g) ?? [text];
  const stream = simulateReadableStream({
    chunks,
    initialDelayInMs: 30,
    chunkDelayInMs: 30,
  }).pipeThrough(new TextEncoderStream());
  return new Response(stream, {
    status: 200,
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'x-agent-mock': '1',
    },
  });
}

// =====================================================================
// PERSISTENCE
// =====================================================================

async function persistUserMessage(conversationId: string, content: string): Promise<void> {
  await db.insert(agent_messages).values({
    id: ulid(),
    conversation_id: conversationId,
    role: 'user',
    content,
  });
}

async function persistAssistantMessage(opts: {
  conversationId: string;
  text: string;
  tokensInput: number;
  tokensOutput: number;
  tokensCached: number;
  model: string;
  provider: string;
  costCents: number;
}): Promise<void> {
  await db.insert(agent_messages).values({
    id: ulid(),
    conversation_id: opts.conversationId,
    role: 'assistant',
    content: opts.text,
    tokens_input: opts.tokensInput,
    tokens_output: opts.tokensOutput,
    tokens_cached: opts.tokensCached,
    model: opts.model,
    provider: opts.provider,
    cost_cents: opts.costCents.toFixed(4),
  });
  await db
    .update(agent_conversations)
    .set({ updated_at: new Date() })
    .where(eq(agent_conversations.id, opts.conversationId));
}

// =====================================================================
// MAIN ENTRY POINT
// =====================================================================

export interface RunAgentInput {
  user: User;
  destravamentoId: string;
  conversationId?: string;
  /** Última mensagem do user (UI message) — vinda do client */
  uiMessages: UIMessage[];
}

export interface RunAgentResult {
  response: Response;
  conversationId: string;
}

/**
 * Ponto de entrada do route handler. Faz tudo:
 *   1. Quota check
 *   2. Carrega contexto (destravamento + perfil + histórico)
 *   3. Cria/recupera conversation
 *   4. Persiste última msg user
 *   5. streamText() com graceful degradation
 *   6. onFinish: persiste resposta + recordUsage
 *   7. Retorna Response streaming pronta
 */
export async function runAgent(input: RunAgentInput): Promise<RunAgentResult> {
  // 1. Quota
  const q = await checkQuota(input.user.id);
  if (!q.ok) {
    return {
      response: new Response(
        JSON.stringify({
          error: 'quota_exceeded',
          reason: `Cota mensal de ${q.limit.toLocaleString('pt-BR')} tokens esgotada. Reseta em ${q.resetAt.toISOString().slice(0, 10)}.`,
          limit: q.limit,
          usedThisMonth: q.usedThisMonth,
          resetAt: q.resetAt.toISOString(),
        }),
        { status: 429, headers: { 'content-type': 'application/json' } }
      ),
      conversationId: input.conversationId ?? '',
    };
  }

  // 2. Contexto destravamento
  const destravamento = await loadDestravamento(input.destravamentoId);
  if (!destravamento) {
    return {
      response: new Response(
        JSON.stringify({ error: 'destravamento_not_found' }),
        { status: 404, headers: { 'content-type': 'application/json' } }
      ),
      conversationId: input.conversationId ?? '',
    };
  }

  const profile = await loadProfile(input.user.id);

  // 3. Conversation
  const { id: conversationId, isNew: isNewConversation } = await ensureConversation({
    userId: input.user.id,
    conversationId: input.conversationId,
    destravamentoId: input.destravamentoId,
  });

  // 4. Persiste última msg user (vinda do client). Histórico do DB é fonte da verdade
  // pro prompt — não confiamos cegamente no array do client.
  const lastUserMsg = [...input.uiMessages].reverse().find((m) => m.role === 'user');
  const lastUserText = extractTextFromUI(lastUserMsg);
  if (lastUserText) {
    await persistUserMessage(conversationId, lastUserText);
  }

  // 5. Resolve flow âncora (null = usa prompt genérico)
  const flow = getFlowFor(destravamento.slug);

  // 6. Build prompt + tools
  const systemPrompt = buildSystemPrompt({
    destravamento,
    profile,
    user: input.user,
    flow,
  });
  const history = await loadHistory(conversationId);

  const toolCtx: ToolContext = {
    userId: input.user.id,
    conversationId,
    destravamentoId: input.destravamentoId,
  };

  // 6. Graceful degradation — mock em dev sem key
  if (isMockNeeded()) {
    if (process.env.NODE_ENV === 'production') {
      return {
        response: new Response(
          JSON.stringify({
            error: 'llm_unavailable',
            reason: 'OPENAI_API_KEY ausente ou inválida em produção.',
          }),
          { status: 503, headers: { 'content-type': 'application/json' } }
        ),
        conversationId,
      };
    }
    // Dev fallback: persiste a resposta mock como assistant pra ficar no histórico
    const mockText =
      '**[mock]** Sou o agente VSS. Em dev sem `OPENAI_API_KEY` válida — configure pra testar de verdade.';
    await persistAssistantMessage({
      conversationId,
      text: mockText,
      tokensInput: 0,
      tokensOutput: 0,
      tokensCached: 0,
      model: 'mock',
      provider: 'mock',
      costCents: 0,
    });
    return { response: mockStreamResponse(), conversationId };
  }

  // 7. Real call — streamText
  const modelInfo = getModelInfo('chat');

  return streamWithLLM({
    model: modelInfo,
    system: systemPrompt,
    history,
    userId: input.user.id,
    conversationId,
    toolCtx,
    isNewConversation,
    flow,
  });
}

// =====================================================================
// streamTextSafe — wrapper que captura 401 da API LLM e degrada pra mock
// =====================================================================

interface StreamWithLLMInput {
  model: { provider: string; model: string };
  system: string;
  history: ModelMessage[];
  userId: string;
  conversationId: string;
  toolCtx: ToolContext;
  isNewConversation: boolean;
  /** Flow âncora opcional — restringe tool allow-list (e no futuro pode forçar model). */
  flow?: AgentFlow | null;
}

async function streamWithLLM(input: StreamWithLLMInput): Promise<RunAgentResult> {
  try {
    const result = streamText({
      model: getModel('chat'),
      system: input.system,
      messages: input.history,
      tools: buildAgentTools(input.toolCtx, input.flow?.tools),
      // Permite multi-step: depois de uma tool call, o model continua e gera
      // texto pro usuário. Default do AI SDK 6 é stepCountIs(1) — sem isso,
      // toda tool call termina a resposta sem texto subsequente.
      stopWhen: stepCountIs(5),
      onFinish: async (event) => {
        try {
          const usage = event.totalUsage;
          const tokensInput = usage.inputTokens ?? 0;
          const tokensOutput = usage.outputTokens ?? 0;
          const tokensCached = usage.inputTokenDetails?.cacheReadTokens ?? 0;
          const costUsd = estimateCostUsd(input.model.model, tokensInput, tokensOutput);
          // cost_cents em agent_messages = USD * 100 (mesma convenção que quota.ts).
          const costCents = costUsd * 100;

          await persistAssistantMessage({
            conversationId: input.conversationId,
            text: event.text,
            tokensInput,
            tokensOutput,
            tokensCached,
            model: input.model.model,
            provider: input.model.provider,
            costCents,
          });
          await recordUsage({
            userId: input.userId,
            conversationId: input.conversationId,
            model: input.model.model,
            input_tokens: tokensInput,
            output_tokens: tokensOutput,
            cost_usd: costUsd,
            isNewConversation: input.isNewConversation,
          });
        } catch (err) {
          console.error('[agent.onFinish]', err);
        }
      },
      onError: ({ error }) => {
        console.error('[agent.streamText]', error);
      },
    });

    return {
      response: result.toUIMessageStreamResponse(),
      conversationId: input.conversationId,
    };
  } catch (err: unknown) {
    // 401/403 da API LLM → graceful degradation em dev
    const status = (err as { statusCode?: number; status?: number })?.statusCode
      ?? (err as { statusCode?: number; status?: number })?.status;
    if (status === 401 || status === 403) {
      if (process.env.NODE_ENV === 'production') {
        return {
          response: new Response(
            JSON.stringify({ error: 'llm_unauthorized' }),
            { status: 503, headers: { 'content-type': 'application/json' } }
          ),
          conversationId: input.conversationId,
        };
      }
      console.warn('[agent] LLM 401/403 — usando mock em dev');
      return { response: mockStreamResponse(), conversationId: input.conversationId };
    }
    console.error('[agent] streamText threw', err);
    throw err;
  }
}

// =====================================================================
// HELPERS
// =====================================================================

function extractTextFromUI(msg: UIMessage | undefined): string {
  if (!msg) return '';
  if (!Array.isArray(msg.parts)) return '';
  const out: string[] = [];
  for (const p of msg.parts) {
    if (p.type === 'text') out.push(p.text);
  }
  return out.join('\n').trim();
}
