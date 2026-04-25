import 'server-only';
import Link from 'next/link';
import { and, asc, desc, eq } from 'drizzle-orm';
import { ArrowRight, FileText, Sparkles, Trophy, type LucideIcon } from 'lucide-react';
import { Card, CardFeatured } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { db } from '@/server/db/client';
import {
  agent_artifacts,
  user_progress,
  vss_destravamentos,
  vss_modules,
  vss_phases,
} from '@/server/db/schema';
import { ProgressBar } from './progress-bar';
import { PhaseCard } from './phase-card';

interface DashboardOverviewProps {
  userId: string;
}

const DATE_FMT = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

function safeFormatDate(d: Date | null | undefined): string {
  if (!d) return '—';
  try {
    return DATE_FMT.format(d);
  } catch {
    return '—';
  }
}

interface DestravamentoRow {
  destravamento: typeof vss_destravamentos.$inferSelect;
  module: typeof vss_modules.$inferSelect;
  phase: typeof vss_phases.$inferSelect;
}

/**
 * Dashboard server-component. Carrega:
 *   - todas as fases + count destravamentos
 *   - progresso do user (completed_at notnull)
 *   - próximo destravamento available (primeiro não-completo na ordem)
 *   - últimos 5 artifacts
 *
 * Todos os queries em paralelo. Empty state quando DB ainda vazio (Agent A não rodou seed).
 */
export async function DashboardOverview({ userId }: DashboardOverviewProps) {
  // Carrega tudo em paralelo
  const [phases, allDestravamentos, progressRows, recentArtifacts] = await Promise.all([
    db.select().from(vss_phases).orderBy(asc(vss_phases.position)),
    db
      .select({
        destravamento: vss_destravamentos,
        module: vss_modules,
        phase: vss_phases,
      })
      .from(vss_destravamentos)
      .innerJoin(vss_modules, eq(vss_destravamentos.module_id, vss_modules.id))
      .innerJoin(vss_phases, eq(vss_modules.phase_id, vss_phases.id))
      .orderBy(
        asc(vss_phases.position),
        asc(vss_modules.position),
        asc(vss_destravamentos.position)
      ),
    db.select().from(user_progress).where(eq(user_progress.user_id, userId)),
    db
      .select()
      .from(agent_artifacts)
      .where(and(eq(agent_artifacts.user_id, userId), eq(agent_artifacts.is_current, true)))
      .orderBy(desc(agent_artifacts.created_at))
      .limit(5),
  ]);

  // Estado vazio: Agent A ainda não rodou o seed
  if (phases.length === 0) {
    return <EmptyVssContent />;
  }

  const completedDestravamentoIds = new Set(
    progressRows.filter((r) => r.completed_at !== null).map((r) => r.destravamento_id)
  );
  const startedDestravamentoIds = new Set(
    progressRows.filter((r) => r.started_at !== null).map((r) => r.destravamento_id)
  );

  // Agrupa destravamentos por fase
  const destravamentosByPhase = new Map<string, DestravamentoRow[]>();
  for (const row of allDestravamentos) {
    const list = destravamentosByPhase.get(row.phase.id) ?? [];
    list.push(row);
    destravamentosByPhase.set(row.phase.id, list);
  }

  // Calcula stats por fase
  const phaseStats = phases.map((phase) => {
    const list = destravamentosByPhase.get(phase.id) ?? [];
    const total = list.length;
    const completed = list.filter((r) => completedDestravamentoIds.has(r.destravamento.id)).length;
    return { phase, total, completed };
  });

  // Próximo destravamento = primeiro não-completo na ordem global
  const nextRow = allDestravamentos.find((row) => !completedDestravamentoIds.has(row.destravamento.id));
  const nextIsStarted = nextRow ? startedDestravamentoIds.has(nextRow.destravamento.id) : false;

  // Stats globais
  const totalDestravamentos = allDestravamentos.length;
  const totalCompleted = completedDestravamentoIds.size;
  const completedPhases = phaseStats.filter((s) => s.total > 0 && s.completed >= s.total).length;
  const currentPhaseId = nextRow?.phase.id ?? null;

  // Welcome state: nada começado ainda
  const isFreshStart = totalCompleted === 0 && startedDestravamentoIds.size === 0;

  return (
    <div className="flex flex-col gap-10">
      {/* Hero: stats + próximo destravamento */}
      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <div className="flex flex-col gap-4">
          <StatCard
            kicker="// PROGRESSO GERAL"
            value={`${totalCompleted}/${totalDestravamentos}`}
            label="Destravamentos concluídos"
            icon={Sparkles}
          >
            <ProgressBar
              total={totalDestravamentos}
              completed={totalCompleted}
              tone="fire"
              size="sm"
            />
          </StatCard>
          <div className="grid gap-4 sm:grid-cols-2">
            <StatCard
              kicker="// FASES"
              value={`${completedPhases}/${phases.length}`}
              label="Fases concluídas"
              icon={Trophy}
            />
            <StatCard
              kicker="// ARTIFACTS"
              value={String(recentArtifacts.length)}
              label="Artifacts recentes"
              icon={FileText}
            />
          </div>
        </div>

        <NextDestravamentoCard
          isFreshStart={isFreshStart}
          nextRow={nextRow ?? null}
          nextIsStarted={nextIsStarted}
        />
      </div>

      {/* Grid de fases */}
      <section className="flex flex-col gap-6">
        <header className="flex flex-col gap-2">
          <span className="kicker text-fire">// FASES VSS</span>
          <h2 className="heading-2 text-cream">Sua jornada</h2>
        </header>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {phaseStats.map(({ phase, total, completed }) => (
            <PhaseCard
              key={phase.id}
              slug={phase.slug}
              position={phase.position}
              code={phase.code}
              title={phase.title}
              description={phase.description}
              totalDestravamentos={total}
              completedDestravamentos={completed}
              isCurrent={phase.id === currentPhaseId}
            />
          ))}
        </div>
      </section>

      {/* Recentes artifacts */}
      {recentArtifacts.length > 0 && (
        <section className="flex flex-col gap-4">
          <header className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-2">
              <span className="kicker text-acid">// ÚLTIMOS ARTIFACTS</span>
              <h2 className="heading-3 text-cream">Gerados recentemente</h2>
            </div>
          </header>
          <ul className="flex flex-col">
            {recentArtifacts.map((artifact) => (
              <li
                key={artifact.id}
                className="hover:border-l-fire flex flex-col gap-1 border-l-2 border-l-transparent border-b border-b-[var(--jb-hair)] py-3 pl-4 transition-colors last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-cream font-display text-[15px] uppercase tracking-tight">
                    {artifact.title}
                  </span>
                  <span className="text-fg-3 font-mono text-[10px] tracking-[0.22em] uppercase">
                    {artifact.kind} · v{artifact.version} ·{' '}
                    {safeFormatDate(artifact.created_at)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function StatCard({
  kicker,
  value,
  label,
  icon: Icon,
  children,
}: {
  kicker: string;
  value: string;
  label: string;
  icon: LucideIcon;
  children?: React.ReactNode;
}) {
  return (
    <Card className="flex flex-col gap-3 !p-5">
      <div className="flex items-start justify-between gap-3">
        <span className="kicker text-fire-hot">{kicker}</span>
        <Icon className="text-fg-3 size-4" aria-hidden />
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-display-sm text-cream">{value}</span>
        <span className="text-fg-3 font-mono text-[11px] tracking-[0.22em] uppercase">
          {label}
        </span>
      </div>
      {children}
    </Card>
  );
}

function NextDestravamentoCard({
  isFreshStart,
  nextRow,
  nextIsStarted,
}: {
  isFreshStart: boolean;
  nextRow: DestravamentoRow | null;
  nextIsStarted: boolean;
}) {
  if (isFreshStart) {
    return (
      <CardFeatured className="flex flex-col gap-5">
        <span className="kicker text-acid">// COMECE AQUI</span>
        <h2 className="heading-2 text-cream">Configure seu perfil 6P</h2>
        <p className="body text-fg-2">
          O onboarding leva 8-12 minutos e calibra o agente pra sua realidade. Sem ele, os
          destravamentos ficam genéricos.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="primary">
            <Link href="/app/onboarding">
              Iniciar onboarding <ArrowRight className="size-4" />
            </Link>
          </Button>
          {nextRow ? (
            <Button asChild variant="secondary">
              <Link href={`/app/destravamento/${nextRow.destravamento.slug}`}>
                Ou pular pro 1º destravamento
              </Link>
            </Button>
          ) : null}
        </div>
      </CardFeatured>
    );
  }

  if (!nextRow) {
    return (
      <CardFeatured className="flex flex-col gap-4">
        <span className="kicker text-acid">// COMPLETO</span>
        <h2 className="heading-2 text-cream">Você fechou o VSS.</h2>
        <p className="body text-fg-2">
          Todos os destravamentos disponíveis foram concluídos. Novos lotes são publicados a cada
          sprint — fique de olho.
        </p>
      </CardFeatured>
    );
  }

  return (
    <CardFeatured className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <span className="kicker text-acid">// CONTINUE DE ONDE PAROU</span>
        {nextIsStarted ? (
          <Badge variant="live">Em andamento</Badge>
        ) : (
          <Badge variant="acid">Próximo</Badge>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-fg-3 font-mono text-[11px] tracking-[0.22em] uppercase">
          {nextRow.phase.code} · {nextRow.module.code}
        </span>
        <h2 className="heading-2 text-cream">{nextRow.destravamento.title}</h2>
        <p className="text-fg-3 font-mono text-[11px] tracking-[0.22em] uppercase">
          ~{nextRow.destravamento.estimated_minutes} min · {nextRow.module.title}
        </p>
      </div>
      <Button asChild variant="fire">
        <Link href={`/app/destravamento/${nextRow.destravamento.slug}`}>
          {nextIsStarted ? 'Retomar' : 'Começar'} <ArrowRight className="size-4" />
        </Link>
      </Button>
    </CardFeatured>
  );
}

function EmptyVssContent() {
  return (
    <Card className="flex flex-col gap-4">
      <span className="kicker text-fire-hot">// CONTEÚDO EM PREPARAÇÃO</span>
      <h2 className="heading-2 text-cream">Conteúdo VSS sendo preparado</h2>
      <p className="body text-fg-2">
        As fases e destravamentos estão sendo publicados. Volte em alguns minutos — assim que o
        primeiro lote subir, ele aparece aqui.
      </p>
      <div className="flex flex-wrap gap-3 pt-2">
        <Button asChild variant="secondary">
          <Link href="/app/onboarding">Adiantar onboarding 6P</Link>
        </Button>
      </div>
    </Card>
  );
}
