import type { Metadata } from 'next';
import Link from 'next/link';
import { eq } from 'drizzle-orm';
import { Container } from '@/components/patterns/container';
import { Button } from '@/components/ui/button';
import { BookingGrid } from '@/components/features/advisory/booking-grid';
import { db } from '@/server/db/client';
import { users } from '@/server/db/schema';
import {
  findSessionByBookingToken,
} from '@/server/services/advisory/sessions';
import { listAvailableSlots } from '@/server/services/calendar/availability';
import { getAdvisoryOwnerId } from '@/server/services/advisory/owner';
import { ADVISORY_DEFAULTS } from '@/server/services/advisory/config';
import { addDays } from '@/server/lib/datetime';

export const metadata: Metadata = {
  title: 'Agendar Sessão Advisory · Joel Burigo',
  description:
    'Escolha um horário pra sua Sessão Advisory de 90 minutos com o Joel. Link único, expira em 30 dias.',
  robots: { index: false, follow: false },
};

interface SearchParams {
  token?: string;
}

function InvalidTokenState({ reason }: { reason: 'missing' | 'invalid' | 'expired' }) {
  const titleByReason: Record<typeof reason, string> = {
    missing: 'Link sem token',
    invalid: 'Token inválido ou já usado',
    expired: 'Link expirado',
  };
  const descByReason: Record<typeof reason, string> = {
    missing: 'A URL precisa do parâmetro `?token=`. Confira o email que você recebeu.',
    invalid:
      'O link que você abriu não é válido. Pode ter sido digitado errado ou já foi usado pra agendar.',
    expired:
      'Esse link expirou (válido por 30 dias após a compra). Manda mensagem pra gente que reabilitamos.',
  };

  return (
    <div className="border-fire bg-fire/10 border p-8 shadow-[6px_6px_0_var(--jb-fire)]">
      <div className="kicker text-fire mb-3">// LINK_INVÁLIDO</div>
      <h2 className="heading-2 text-cream mb-3">{titleByReason[reason]}</h2>
      <p className="text-fg-2 mb-6 font-sans text-base">{descByReason[reason]}</p>
      <Button asChild variant="fire">
        <Link href="/contato">FALAR COM A GENTE →</Link>
      </Button>
    </div>
  );
}

export default async function AgendarPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <main className="bg-ink relative overflow-hidden pt-20">
        <div className="grid-overlay" />
        <Container className="relative z-10 py-16 md:py-24">
          <InvalidTokenState reason="missing" />
        </Container>
      </main>
    );
  }

  const session = await findSessionByBookingToken(token);
  if (!session) {
    return (
      <main className="bg-ink relative overflow-hidden pt-20">
        <div className="grid-overlay" />
        <Container className="relative z-10 py-16 md:py-24">
          <InvalidTokenState reason="invalid" />
        </Container>
      </main>
    );
  }

  // Se já está agendada (status='scheduled'), redireciona pra página da sessão.
  if (session.status === 'scheduled') {
    return (
      <main className="bg-ink relative overflow-hidden pt-20">
        <div className="grid-overlay" />
        <Container className="relative z-10 py-16 md:py-24">
          <div className="border-acid bg-acid/10 border p-8 shadow-[6px_6px_0_var(--jb-acid)]">
            <div className="kicker text-acid mb-3">// JÁ_AGENDADA</div>
            <h2 className="heading-2 text-cream mb-3">Essa sessão já tem horário</h2>
            <p className="text-fg-2 mb-6 font-sans text-base">
              Você já confirmou um horário pra essa sessão. Acesse a página dela pra ver detalhes
              ou pedir remarcação.
            </p>
            <Button asChild variant="primary">
              <Link href={`/sessao/${session.id}?token=${encodeURIComponent(token)}`}>
                VER MINHA SESSÃO →
              </Link>
            </Button>
          </div>
        </Container>
      </main>
    );
  }

  // Buscar dados do attendee (já comprado — user existe)
  const [user] = await db.select().from(users).where(eq(users.id, session.user_id)).limit(1);

  // Listar slots disponíveis
  const ownerId = await getAdvisoryOwnerId();
  const now = new Date();
  const rangeEnd = addDays(now, 30);
  const durationMin = session.duration_min ?? ADVISORY_DEFAULTS.SESSION_DURATION_MIN;

  const slots = await listAvailableSlots({
    ownerId,
    durationMin,
    rangeStart: now,
    rangeEnd,
  });

  return (
    <main className="bg-ink relative overflow-hidden pt-20">
      <div className="grid-overlay" />
      <Container className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-4xl">
          <header className="mb-10 flex flex-col gap-4">
            <span className="kicker text-acid">// ADVISORY · AGENDAR · 90_MIN</span>
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
              Agende sua{' '}
              <span className="text-acid">Sessão Advisory</span>
              <br />
              <span className="text-fire">90 minutos</span> com Joel Burigo
            </h1>
            <p className="text-fg-2 mt-2 max-w-2xl font-sans text-lg">
              Escolha o horário que cabe na sua agenda. Após confirmar, você recebe email com link
              do Jitsi e lembretes automáticos. O link de agendamento é único — guarde se precisar
              voltar.
            </p>
          </header>

          <BookingGrid
            slots={slots.map((s) => ({
              startsAt: s.startsAt.toISOString(),
              endsAt: s.endsAt.toISOString(),
            }))}
            sessionId={session.id}
            defaultTimezone={session.cliente_timezone ?? 'America/Sao_Paulo'}
            attendeeEmail={user?.email ?? ''}
            attendeeName={user?.name ?? null}
          />
        </div>
      </Container>
    </main>
  );
}
