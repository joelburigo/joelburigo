import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import ReactMarkdown from 'react-markdown';
import { Container } from '@/components/patterns/container';
import { Button } from '@/components/ui/button';
import { db } from '@/server/db/client';
import { advisory_sessions } from '@/server/db/schema';
import { findSessionByBookingToken } from '@/server/services/advisory/sessions';
import { getCurrentUser } from '@/server/services/session';
import { SessionDetailDisplay } from '@/components/features/advisory/session-detail-display';
import { RescheduleModal } from '@/components/features/advisory/reschedule-modal';

export const metadata: Metadata = {
  title: 'Sessão Advisory · Joel Burigo',
  description: 'Detalhes do seu agendamento Advisory.',
  robots: { index: false, follow: false },
};

interface Params {
  id: string;
}

interface SearchParams {
  token?: string;
}

export default async function SessionDetailPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}) {
  const { id } = await params;
  const { token } = await searchParams;
  const renderedAt = new Date();

  // Carrega session direto
  const [session] = await db
    .select()
    .from(advisory_sessions)
    .where(eq(advisory_sessions.id, id))
    .limit(1);

  if (!session) {
    return (
      <main className="bg-ink relative overflow-hidden pt-20">
        <div className="grid-overlay" />
        <Container className="relative z-10 py-16 md:py-24">
          <div className="border-fire bg-fire/10 border p-8">
            <div className="kicker text-fire mb-3">// SESSÃO_NÃO_ENCONTRADA</div>
            <h2 className="heading-2 text-cream mb-3">Sessão não existe</h2>
            <p className="text-fg-2 mb-6 font-sans text-base">
              O ID informado não corresponde a nenhuma sessão.
            </p>
            <Button asChild variant="fire">
              <Link href="/contato">FALAR COM A GENTE →</Link>
            </Button>
          </div>
        </Container>
      </main>
    );
  }

  // Auth: aceita ou via booking token (read-only) ou via login
  let isAuthorizedViaToken = false;
  let isAuthorizedViaLogin = false;
  const currentUser = await getCurrentUser();

  if (token) {
    const tokenSession = await findSessionByBookingToken(token);
    // findSessionByBookingToken filtra status cancelled/completed e expirados.
    // Pra essa página queremos ser mais permissivos — aceitamos token válido (não expirado)
    // independente do status, exceto cancelled.
    const [bySameToken] = await db
      .select()
      .from(advisory_sessions)
      .where(eq(advisory_sessions.booking_token, token))
      .limit(1);
    if (
      bySameToken &&
      bySameToken.id === session.id &&
      (!bySameToken.booking_token_expires_at ||
        bySameToken.booking_token_expires_at.getTime() > renderedAt.getTime())
    ) {
      isAuthorizedViaToken = true;
    }
    void tokenSession; // silencia unused
  }

  if (currentUser && currentUser.id === session.user_id) {
    isAuthorizedViaLogin = true;
  }

  if (!isAuthorizedViaToken && !isAuthorizedViaLogin) {
    redirect(`/entrar?next=/sessao/${id}`);
  }

  // Se ainda em pending_booking → manda pro fluxo de agendar (com token se tiver)
  if (session.status === 'pending_booking') {
    if (token) {
      redirect(`/sessao/agendar?token=${encodeURIComponent(token)}`);
    }
    return (
      <main className="bg-ink relative overflow-hidden pt-20">
        <div className="grid-overlay" />
        <Container className="relative z-10 py-16 md:py-24">
          <div className="border-fire bg-fire/10 border p-8">
            <div className="kicker text-fire mb-3">// AINDA_NÃO_AGENDADA</div>
            <h2 className="heading-2 text-cream mb-3">Essa sessão ainda não foi agendada</h2>
            <p className="text-fg-2 mb-6 font-sans text-base">
              Use o link único que enviamos no seu email pra escolher o horário.
            </p>
          </div>
        </Container>
      </main>
    );
  }

  if (session.status === 'cancelled') {
    return (
      <main className="bg-ink relative overflow-hidden pt-20">
        <div className="grid-overlay" />
        <Container className="relative z-10 py-16 md:py-24">
          <div className="border-fire bg-fire/10 border p-8">
            <div className="kicker text-fire mb-3">// CANCELADA</div>
            <h2 className="heading-2 text-cream mb-3">Sessão cancelada</h2>
            <p className="text-fg-2 mb-6 font-sans text-base">
              {session.cancellation_reason ?? 'Sessão foi cancelada.'} Entre em contato pra
              reagendar.
            </p>
            <Button asChild variant="fire">
              <Link href="/contato">FALAR COM A GENTE →</Link>
            </Button>
          </div>
        </Container>
      </main>
    );
  }

  // status === 'scheduled' | 'completed'
  const startsAt = session.scheduled_at;
  if (!startsAt) {
    // edge — agendada mas sem scheduled_at é estado inconsistente
    return (
      <main className="bg-ink relative overflow-hidden pt-20">
        <Container className="relative z-10 py-16 md:py-24">
          <div className="border-fire bg-fire/10 border p-8">
            <h2 className="heading-2 text-cream mb-3">Estado inconsistente</h2>
            <p className="text-fg-2 mb-6 font-sans text-base">
              Sessão sem horário registrado. Mande email pra joel@joelburigo.com.br.
            </p>
          </div>
        </Container>
      </main>
    );
  }

  const durationMin = session.duration_min ?? 90;
  const endsAt = new Date(startsAt.getTime() + durationMin * 60_000);
  const isCompleted = session.status === 'completed';

  return (
    <main className="bg-ink relative overflow-hidden pt-20">
      <div className="grid-overlay" />
      <Container className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-5xl">
          <header className="mb-10 flex flex-col gap-4">
            <span className="kicker text-acid">
              // ADVISORY · SESSÃO {isCompleted ? 'CONCLUÍDA' : 'CONFIRMADA'}
            </span>
            <h1
              className="font-display text-cream"
              style={{
                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                fontWeight: 900,
                letterSpacing: '-0.045em',
                lineHeight: '0.96',
                textTransform: 'uppercase',
                margin: 0,
              }}
            >
              Sua{' '}
              <span className="text-fire">Sessão Advisory</span>
            </h1>
          </header>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
            <div className="flex flex-col gap-8">
              <div className="border-acid bg-acid/5 border p-8 shadow-[6px_6px_0_var(--jb-acid)]">
                <div className="kicker text-acid mb-4">
                  // {isCompleted ? 'JÁ_ACONTECEU' : 'CONFIRMADO'}
                </div>
                <SessionDetailDisplay
                  startsAt={startsAt.toISOString()}
                  endsAt={endsAt.toISOString()}
                  defaultTimezone={session.cliente_timezone ?? 'America/Sao_Paulo'}
                  meetingUrl={session.meeting_url}
                />
              </div>

              {!isCompleted && (
                <div className="bg-ink-2 border border-[var(--jb-hair)] p-8">
                  <div className="kicker mb-3">// AÇÕES</div>
                  <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    {isAuthorizedViaLogin && (
                      <Button asChild variant="primary">
                        <Link href="/app/advisory/dashboard">ACESSAR MINHA ÁREA</Link>
                      </Button>
                    )}
                    {isAuthorizedViaLogin ? (
                      <RescheduleModal
                        sessionId={session.id}
                        defaultTimezone={session.cliente_timezone ?? 'America/Sao_Paulo'}
                      />
                    ) : (
                      <Button asChild variant="secondary">
                        <Link href={`/entrar?next=/sessao/${session.id}`}>
                          ENTRAR PRA REMARCAR
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>

            <aside className="flex flex-col gap-6">
              {session.client_preparation_md && (
                <div className="bg-ink-2 border border-[var(--jb-hair)] p-6">
                  <div className="kicker text-fire mb-3">// PREPARAÇÃO</div>
                  <div className="prose prose-invert max-w-none text-fg-2 font-sans">
                    <ReactMarkdown>{session.client_preparation_md}</ReactMarkdown>
                  </div>
                </div>
              )}
              <div className="bg-ink-2 border border-[var(--jb-hair)] p-6">
                <div className="kicker mb-3">// FORMATO</div>
                <ul className="text-fg-2 flex flex-col gap-2 font-sans text-sm">
                  <li>· {durationMin} minutos via Jitsi</li>
                  <li>· Lembretes: 24h e 1h antes</li>
                  <li>· Gravação opcional (combinamos no início)</li>
                  <li>· Notas + próximos passos por email após</li>
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </Container>
    </main>
  );
}
