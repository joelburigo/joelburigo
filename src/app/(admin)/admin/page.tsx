import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/patterns/container';
import { Badge } from '@/components/ui/badge';
import { getOverviewStats } from '@/server/services/admin';
import { formatCurrency } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Admin · Dashboard',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
  variant?: 'fire' | 'acid' | 'default';
}

function StatCard({ label, value, hint, variant = 'default' }: StatCardProps) {
  const accent =
    variant === 'fire'
      ? 'border-fire'
      : variant === 'acid'
        ? 'border-acid'
        : 'border-[var(--jb-hair)]';
  return (
    <div className={`bg-ink-2 flex flex-col gap-2 border-2 ${accent} p-5`}>
      <span className="text-fg-3 font-mono text-[10px] tracking-[0.22em] uppercase">{label}</span>
      <span className="text-cream font-display text-3xl font-black">{value}</span>
      {hint && <span className="text-fg-muted text-[11px]">{hint}</span>}
    </div>
  );
}

export default async function AdminPage() {
  const stats = await getOverviewStats();

  return (
    <Container size="xl" className="flex flex-col gap-8 py-2">
      <div>
        <span className="kicker text-fire">// DASHBOARD</span>
        <h1 className="heading-2 text-cream mt-2">Visão geral</h1>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Receita do mês"
          value={formatCurrency(stats.monthRevenueCents)}
          variant="acid"
        />
        <StatCard
          label="Alunos ativos"
          value={stats.activeStudentsCount.toLocaleString('pt-BR')}
        />
        <StatCard
          label="Leads novos / mês"
          value={stats.newLeadsCount.toLocaleString('pt-BR')}
          hint="form_diagnostico, form_contato, form_advisory"
        />
        <StatCard
          label="Custo LLM mês"
          value={formatCurrency(stats.llmCostCentsMonth)}
          variant={stats.llmCostCentsMonth > 50000 ? 'fire' : 'default'}
        />
      </div>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-ink-2 border-2 border-[var(--jb-hair)] p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-fg-3 font-mono text-[11px] tracking-[0.22em] uppercase">
              Últimas atividades
            </span>
            <Link
              href="/admin/leads"
              className="text-fg-muted hover:text-acid font-mono text-[10px] uppercase"
            >
              Kanban →
            </Link>
          </div>
          <ul className="flex flex-col gap-2">
            {stats.recentActivities.length === 0 && (
              <li className="text-fg-muted text-xs">Sem atividades.</li>
            )}
            {stats.recentActivities.map((a) => (
              <li
                key={a.id}
                className="text-cream flex items-start gap-2 border-l-2 border-[var(--jb-hair)] pl-3 text-xs"
              >
                <Badge variant="default">{a.type}</Badge>
                <div className="flex min-w-0 flex-col">
                  <span className="truncate">
                    {a.subject ?? a.opportunityTitle ?? a.contactName ?? '—'}
                  </span>
                  <span className="text-fg-muted font-mono text-[10px]">
                    {new Date(a.created_at).toLocaleString('pt-BR')}
                    {a.contactName && ` · ${a.contactName}`}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-ink-2 border-2 border-[var(--jb-hair)] p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-fg-3 font-mono text-[11px] tracking-[0.22em] uppercase">
              Pendências
            </span>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-[var(--jb-hair)] pb-2">
              <span className="text-cream text-sm">Reembolsos pendentes</span>
              <Link
                href="/admin/refunds"
                className="flex items-center gap-2"
                aria-label="Reembolsos pendentes"
              >
                <Badge variant={stats.pendingRefundsCount > 0 ? 'fire' : 'default'}>
                  {stats.pendingRefundsCount}
                </Badge>
              </Link>
            </div>
            <div>
              <div className="text-cream mb-2 text-sm">
                Sessões Advisory sem notas (&gt;7d): {stats.overdueAdvisorySessions.length}
              </div>
              <ul className="flex flex-col gap-1">
                {stats.overdueAdvisorySessions.slice(0, 5).map((s) => (
                  <li key={s.id} className="text-fg-3 truncate text-xs">
                    · {s.title}{' '}
                    {s.scheduledAt && (
                      <span className="text-fg-muted font-mono text-[10px]">
                        {new Date(s.scheduledAt).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                  </li>
                ))}
                {stats.overdueAdvisorySessions.length === 0 && (
                  <li className="text-fg-muted text-xs">Tudo em dia.</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </Container>
  );
}
