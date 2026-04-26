import type { Metadata } from 'next';
import { Container } from '@/components/patterns/container';
import { Badge } from '@/components/ui/badge';
import { getAgentUsageStats } from '@/server/services/admin';
import { formatCurrency } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Admin · Uso do agente',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function AdminAgentUsagePage() {
  const stats = await getAgentUsageStats();
  const tokensTotalMonth = stats.totals.tokensInput + stats.totals.tokensOutput;

  return (
    <Container size="xl" className="flex flex-col gap-8 py-2">
      <div>
        <span className="kicker text-fire">// LLM · USAGE</span>
        <h1 className="heading-2 text-cream mt-2">Uso do agente</h1>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Tokens entrada" value={stats.totals.tokensInput.toLocaleString('pt-BR')} />
        <Stat label="Tokens saída" value={stats.totals.tokensOutput.toLocaleString('pt-BR')} />
        <Stat
          label="Tokens cache hit"
          value={stats.totals.tokensCached.toLocaleString('pt-BR')}
          hint={`${tokensTotalMonth > 0 ? Math.round((stats.totals.tokensCached / tokensTotalMonth) * 100) : 0}% do total`}
        />
        <Stat
          label="Custo mês"
          value={formatCurrency(stats.totals.costCents)}
          variant={stats.totals.costCents > 50000 ? 'fire' : 'acid'}
        />
      </div>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="Top 10 consumers (mês)">
          {stats.topConsumers.length === 0 ? (
            <Empty />
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="text-fg-3 font-mono text-[10px] tracking-[0.22em] uppercase">
                <tr>
                  <th className="py-1">Email</th>
                  <th className="py-1 text-right">Tokens</th>
                  <th className="py-1 text-right">Custo</th>
                </tr>
              </thead>
              <tbody>
                {stats.topConsumers.map((c) => (
                  <tr key={c.userId} className="border-t border-[var(--jb-hair)]">
                    <td className="text-cream py-1.5 font-mono">{c.userEmail}</td>
                    <td className="text-fg-2 py-1.5 text-right font-mono">
                      {c.tokensTotal.toLocaleString('pt-BR')}
                    </td>
                    <td className="text-acid py-1.5 text-right font-mono">
                      {formatCurrency(c.costCents)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        <Card title="Top 10 destravamentos (custo)">
          {stats.costByDestravamento.length === 0 ? (
            <Empty />
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="text-fg-3 font-mono text-[10px] tracking-[0.22em] uppercase">
                <tr>
                  <th className="py-1">Destravamento</th>
                  <th className="py-1 text-right">Mensagens</th>
                  <th className="py-1 text-right">Custo</th>
                </tr>
              </thead>
              <tbody>
                {stats.costByDestravamento.map((d, i) => (
                  <tr key={`${d.destravamentoId ?? 'none'}-${i}`} className="border-t border-[var(--jb-hair)]">
                    <td className="text-cream py-1.5">
                      {d.destravamentoTitle ?? <span className="text-fg-muted">[sem destravamento]</span>}
                    </td>
                    <td className="text-fg-2 py-1.5 text-right font-mono">
                      {d.messagesCount}
                    </td>
                    <td className="text-acid py-1.5 text-right font-mono">
                      {formatCurrency(d.costCents)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </section>

      <Card title="Últimos artifacts gerados">
        {stats.recentArtifacts.length === 0 ? (
          <Empty />
        ) : (
          <ul className="flex flex-col gap-2">
            {stats.recentArtifacts.map((a) => (
              <li
                key={a.id}
                className="text-cream flex items-center gap-3 border-b border-[var(--jb-hair)] py-1.5 text-xs last:border-0"
              >
                <Badge variant="default">{a.kind}</Badge>
                <span className="flex-1 truncate">{a.title}</span>
                <span className="text-fg-3 font-mono text-[11px]">{a.userEmail ?? '—'}</span>
                <span className="text-fg-muted font-mono text-[10px]">
                  {new Date(a.createdAt).toLocaleString('pt-BR')}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <p className="text-fg-muted text-[11px]">
        TODO Sprint 4 v2: override manual de quota por user (campo ainda usa{' '}
        <code className="text-acid">entitlements.metadata.token_quota_override</code>; UI por user
        em /admin/users vai gravar lá).
      </p>
    </Container>
  );
}

function Stat({
  label,
  value,
  hint,
  variant = 'default',
}: {
  label: string;
  value: string;
  hint?: string;
  variant?: 'default' | 'fire' | 'acid';
}) {
  const accent =
    variant === 'fire' ? 'border-fire' : variant === 'acid' ? 'border-acid' : 'border-[var(--jb-hair)]';
  return (
    <div className={`bg-ink-2 flex flex-col gap-2 border-2 ${accent} p-5`}>
      <span className="text-fg-3 font-mono text-[10px] tracking-[0.22em] uppercase">{label}</span>
      <span className="text-cream font-display text-2xl font-black">{value}</span>
      {hint && <span className="text-fg-muted text-[11px]">{hint}</span>}
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-ink-2 border-2 border-[var(--jb-hair)] p-5">
      <div className="text-fg-3 mb-3 font-mono text-[11px] tracking-[0.22em] uppercase">{title}</div>
      {children}
    </div>
  );
}

function Empty() {
  return <p className="text-fg-muted text-xs">Sem dados ainda.</p>;
}
