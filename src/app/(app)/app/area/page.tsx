import type { Metadata } from 'next';
import { Container } from '@/components/patterns/container';
import { DashboardOverview } from '@/components/features/vss';
import { requireOnboarded } from '@/server/services/session';

export const metadata: Metadata = {
  title: 'Sua área',
  robots: { index: false, follow: false },
};

const DATE_FMT = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

function formatDate(d: Date | null | undefined): string {
  if (!d) return '—';
  try {
    return DATE_FMT.format(d);
  } catch {
    return '—';
  }
}

export default async function AreaPage() {
  const { user } = await requireOnboarded();

  return (
    <section className="section">
      <Container size="xl" className="flex flex-col gap-10">
        <header className="flex flex-col gap-3">
          <span className="kicker text-acid">// SUA ÁREA</span>
          <h1 className="text-display-md text-cream">
            {user.name?.trim() ? user.name.split(' ')[0]?.toUpperCase() : 'BEM-VINDO'}
          </h1>
          <div className="text-fg-3 flex flex-col gap-1 font-mono text-[12px] tracking-[0.18em] uppercase sm:flex-row sm:items-center sm:gap-6">
            <span>{user.email}</span>
            <span aria-hidden className="hidden sm:inline">
              ·
            </span>
            <span>Última visita: {formatDate(user.last_login_at)}</span>
          </div>
        </header>

        <DashboardOverview userId={user.id} />
      </Container>
    </section>
  );
}
