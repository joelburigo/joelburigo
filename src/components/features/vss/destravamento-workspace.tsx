import 'server-only';
import Link from 'next/link';
import { and, asc, desc, eq } from 'drizzle-orm';
import { ChevronRight, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { db } from '@/server/db/client';
import {
  agent_artifacts,
  agent_conversations,
  agent_messages,
  user_progress,
  vss_destravamentos,
  vss_modules,
  vss_phases,
} from '@/server/db/schema';
import { AgentChat, type ChatMessage } from '@/components/features/agent';
import { ArtifactPanel } from './artifact-panel';

interface DestravamentoWorkspaceProps {
  /** User logado. */
  userId: string;
  /** Slug do destravamento. */
  slug: string;
}

/**
 * Workspace do destravamento — server component composto.
 * Carrega: destravamento + módulo + fase + conversation existente + initial messages
 * + artifacts vinculados ao destravamento. Compõe `<AgentChat>` (placeholder por enquanto)
 * + `<ArtifactPanel>` lateral.
 *
 * Retorna `null` se slug não existe (page chama `notFound()`).
 */
export async function DestravamentoWorkspace({ userId, slug }: DestravamentoWorkspaceProps) {
  const [row] = await db
    .select({
      destravamento: vss_destravamentos,
      module: vss_modules,
      phase: vss_phases,
    })
    .from(vss_destravamentos)
    .innerJoin(vss_modules, eq(vss_destravamentos.module_id, vss_modules.id))
    .innerJoin(vss_phases, eq(vss_modules.phase_id, vss_phases.id))
    .where(eq(vss_destravamentos.slug, slug))
    .limit(1);

  if (!row) return null;

  const { destravamento, module, phase } = row;

  // Carrega contexto em paralelo
  const [progressRows, conversationRows, artifacts] = await Promise.all([
    db
      .select()
      .from(user_progress)
      .where(
        and(
          eq(user_progress.user_id, userId),
          eq(user_progress.destravamento_id, destravamento.id)
        )
      )
      .limit(1),
    db
      .select()
      .from(agent_conversations)
      .where(
        and(
          eq(agent_conversations.user_id, userId),
          eq(agent_conversations.destravamento_id, destravamento.id),
          eq(agent_conversations.status, 'active')
        )
      )
      .orderBy(desc(agent_conversations.updated_at))
      .limit(1),
    db
      .select()
      .from(agent_artifacts)
      .where(
        and(
          eq(agent_artifacts.user_id, userId),
          eq(agent_artifacts.destravamento_id, destravamento.id)
        )
      )
      .orderBy(desc(agent_artifacts.created_at)),
  ]);

  const progress = progressRows[0] ?? null;
  const conversation = conversationRows[0] ?? null;

  const messageRows = conversation
    ? await db
        .select()
        .from(agent_messages)
        .where(eq(agent_messages.conversation_id, conversation.id))
        .orderBy(asc(agent_messages.created_at))
    : [];

  const initialMessages: ChatMessage[] = messageRows
    .filter((m) => m.role === 'user' || m.role === 'assistant' || m.role === 'system')
    .map((m) => ({
      id: m.id,
      role: m.role as ChatMessage['role'],
      text: typeof m.content === 'string' ? m.content : JSON.stringify(m.content),
    }));

  const isCompleted = !!progress?.completed_at;
  const isInProgress = !!progress?.started_at && !isCompleted;

  return (
    <div className="flex flex-col gap-8">
      {/* Header / breadcrumb */}
      <header className="flex flex-col gap-4">
        <nav
          aria-label="Breadcrumb"
          className="text-fg-3 flex flex-wrap items-center gap-1.5 font-mono text-[11px] tracking-[0.22em] uppercase"
        >
          <Link href="/app/area" className="hover:text-acid transition-colors">
            Dashboard
          </Link>
          <ChevronRight className="size-3" aria-hidden />
          <Link href={`/app/fase/${phase.slug}`} className="hover:text-acid transition-colors">
            {phase.code} · {phase.title}
          </Link>
          <ChevronRight className="size-3" aria-hidden />
          <span className="text-fg-3">{module.code}</span>
          <ChevronRight className="size-3" aria-hidden />
          <span className="text-cream">{destravamento.code}</span>
        </nav>

        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="kicker text-fire">// {destravamento.code}</span>
            {isCompleted && <Badge variant="acid">Concluído</Badge>}
            {isInProgress && <Badge variant="live">Em andamento</Badge>}
          </div>
          <h1 className="text-display-sm md:text-display-md text-cream">
            {destravamento.title}
          </h1>
          <div className="text-fg-3 flex flex-wrap items-center gap-4 font-mono text-[11px] tracking-[0.22em] uppercase">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-3" aria-hidden /> ~{destravamento.estimated_minutes} min
            </span>
            <span aria-hidden>·</span>
            <span>{module.title}</span>
            <span aria-hidden>·</span>
            <span>v{destravamento.content_version}</span>
          </div>
        </div>
      </header>

      {/* Workspace 2 colunas no desktop, stack no mobile */}
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="flex min-w-0 flex-col gap-4">
          <AgentChat
            destravamentoId={destravamento.id}
            conversationId={conversation?.id}
            initialMessages={initialMessages}
            destravamentoTitle={destravamento.title}
          />
          <p className="text-fg-muted font-mono text-[10px] tracking-[0.22em] uppercase">
            // {initialMessages.length} mensagens carregadas · {artifacts.length} artifact
            {artifacts.length === 1 ? '' : 's'} no destravamento
          </p>
        </div>

        {/* Artifact panel — sticky no desktop, no fim em mobile */}
        <ArtifactPanel artifacts={artifacts} />
      </div>
    </div>
  );
}
