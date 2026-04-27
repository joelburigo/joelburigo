import type { Metadata } from 'next';
import Link from 'next/link';
import { and, eq, inArray, like, or, desc, sql } from 'drizzle-orm';
import { ptBR } from 'date-fns/locale';
import { Container } from '@/components/patterns/container';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SessionCard } from '@/components/features/advisory/session-card';
import { SessionNotes } from '@/components/features/advisory/session-notes';
import { db } from '@/server/db/client';
import {
  advisory_sessions,
  agent_artifacts,
  entitlements,
  products,
  session_reschedule_requests,
  type AdvisorySession,
  type Product,
  type SessionRescheduleRequest,
} from '@/server/db/schema';
import { requireUser } from '@/server/services/session';
import { DEFAULT_TZ, formatInTimeZone } from '@/server/lib/datetime';

export const metadata: Metadata = {
  title: 'Advisory · Sua área 1:1',
  robots: { index: false, follow: false },
};

interface ProposedSlot {
  startsAt: string;
  timezone?: string;
}

function isProposedSlotArray(value: unknown): value is ProposedSlot[] {
  return (
    Array.isArray(value) &&
    value.every(
      (v) => typeof v === 'object' && v !== null && typeof (v as ProposedSlot).startsAt === 'string'
    )
  );
}

function diffDaysFromNow(date: Date): number {
  const ms = date.getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

function countdownLabel(date: Date): string {
  const ms = date.getTime() - Date.now();
  if (ms <= 0) return 'AGORA';
  const minutes = Math.floor(ms / 60000);
  if (minutes < 60) return `EM ${minutes} MIN`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `EM ${hours}H`;
  const days = Math.ceil(hours / 24);
  return `EM ${days} DIA${days === 1 ? '' : 'S'}`;
}

export default async function AdvisoryDashboardPage() {
  const user = await requireUser('/app/advisory/dashboard');

  // 1. Buscar entitlements de Advisory ativos
  const advisoryEntitlements = await db
    .select({
      entitlement: entitlements,
      product: products,
    })
    .from(entitlements)
    .innerJoin(products, eq(entitlements.product_id, products.id))
    .where(
      and(
        eq(entitlements.user_id, user.id),
        eq(entitlements.status, 'active'),
        like(products.slug, 'advisory-%')
      )
    );

  if (advisoryEntitlements.length === 0) {
    return <EmptyState />;
  }

  const productById = new Map<string, Product>(
    advisoryEntitlements.map((e) => [e.product.id, e.product])
  );
  const productNames = Array.from(productById.values())
    .map((p) => p.name)
    .join(' · ');

  // 2. Buscar todas as sessões do user (advisory)
  const sessions = await db
    .select()
    .from(advisory_sessions)
    .where(eq(advisory_sessions.user_id, user.id))
    .orderBy(desc(advisory_sessions.scheduled_at));

  const now = new Date();
  const upcoming: AdvisorySession[] = [];
  const past: AdvisorySession[] = [];
  const pending: AdvisorySession[] = [];

  for (const s of sessions) {
    if (s.status === 'pending_booking' || !s.scheduled_at) {
      pending.push(s);
      continue;
    }
    if (s.status === 'completed' || s.status === 'cancelled' || s.status === 'no_show') {
      past.push(s);
      continue;
    }
    if (s.scheduled_at.getTime() < now.getTime()) {
      past.push(s);
    } else {
      upcoming.push(s);
    }
  }

  upcoming.sort(
    (a, b) => (a.scheduled_at?.getTime() ?? 0) - (b.scheduled_at?.getTime() ?? 0)
  );
  past.sort((a, b) => (b.scheduled_at?.getTime() ?? 0) - (a.scheduled_at?.getTime() ?? 0));

  const sessionIds = sessions.map((s) => s.id);

  // 3. Buscar reschedule requests pendentes
  const rescheduleRequests: SessionRescheduleRequest[] =
    sessionIds.length > 0
      ? await db
          .select()
          .from(session_reschedule_requests)
          .where(
            and(
              inArray(session_reschedule_requests.advisory_session_id, sessionIds),
              or(
                eq(session_reschedule_requests.status, 'pending'),
                eq(session_reschedule_requests.requested_by_user_id, user.id)
              )!
            )
          )
          .orderBy(desc(session_reschedule_requests.created_at))
          .limit(10)
      : [];

  // 4. Buscar artifacts compartilhados pelo Joel via admin
  const sharedArtifacts = await db
    .select()
    .from(agent_artifacts)
    .where(
      and(
        eq(agent_artifacts.user_id, user.id),
        sql`${agent_artifacts.metadata}->>'shared_with_advisory' = 'true'`
      )
    )
    .orderBy(desc(agent_artifacts.created_at))
    .limit(20);

  const nextSession = upcoming[0] ?? null;
  const nextTz = nextSession?.cliente_timezone || DEFAULT_TZ;

  return (
    <section className="section">
      <Container size="xl" className="flex flex-col gap-12">
        {/* Hero */}
        <header className="flex flex-col gap-4">
          <span className="kicker text-acid">// ADVISORY · 1:1 COM JOEL</span>
          <h1 className="text-display-md text-cream">
            {user.name?.trim() ? user.name.split(' ')[0]?.toUpperCase() : 'BEM-VINDO'}
          </h1>
          <p className="text-fg-3 font-mono text-[12px] tracking-[0.18em] uppercase">
            {productNames}
          </p>

          {nextSession && nextSession.scheduled_at ? (
            <Card
              className={`mt-4 flex flex-col gap-3 !border-fire !p-6 !shadow-[6px_6px_0_var(--jb-fire)] bg-ink`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="kicker text-fire">// PRÓXIMA SESSÃO</span>
                {diffDaysFromNow(nextSession.scheduled_at) <= 7 ? (
                  <Badge variant="fire">{countdownLabel(nextSession.scheduled_at)}</Badge>
                ) : null}
              </div>
              <h2 className="text-cream font-display text-[28px] leading-tight uppercase tracking-tight md:text-[32px]">
                {formatInTimeZone(
                  nextSession.scheduled_at,
                  nextTz,
                  "EEEE, dd 'de' MMMM",
                  { locale: ptBR }
                )}
              </h2>
              <p className="text-acid font-mono text-[14px] tracking-[0.18em] uppercase">
                {formatInTimeZone(nextSession.scheduled_at, nextTz, "HH:mm '·' zzz", {
                  locale: ptBR,
                })}{' '}
                · {nextSession.duration_min} MIN
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                {nextSession.meeting_url ? (
                  <Button asChild variant="fire" size="sm">
                    <a
                      href={nextSession.meeting_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Entrar na call →
                    </a>
                  </Button>
                ) : null}
                <Button asChild variant="secondary" size="sm">
                  <Link href={`/sessao/${nextSession.id}`}>Ver detalhes</Link>
                </Button>
                <Button asChild variant="ghost" size="sm">
                  <Link href={`/sessao/${nextSession.id}?action=reschedule`}>Remarcar</Link>
                </Button>
              </div>
            </Card>
          ) : null}
        </header>

        {/* Pending bookings */}
        {pending.length > 0 ? (
          <Section
            kicker="// PENDENTE DE AGENDAMENTO"
            title={`Você tem ${pending.length} sessão${pending.length === 1 ? '' : 'ões'} pra agendar.`}
          >
            <div className="flex flex-col gap-4">
              {pending.map((s) => (
                <SessionCard
                  key={s.id}
                  session={s}
                  productName={productById.get(s.product_id)?.name ?? 'Advisory'}
                  viewMode="pending"
                />
              ))}
            </div>
          </Section>
        ) : null}

        {/* Upcoming sessions */}
        {upcoming.length > 0 ? (
          <Section kicker="// PRÓXIMAS SESSÕES" title="Agendadas">
            <div className="flex flex-col gap-6">
              {upcoming.map((s) => (
                <div key={s.id} className="flex flex-col gap-4">
                  <SessionCard
                    session={s}
                    productName={productById.get(s.product_id)?.name ?? 'Advisory'}
                    viewMode="upcoming"
                  />
                  {s.client_preparation_md ? (
                    <SessionNotes
                      md={s.client_preparation_md}
                      title="Sua preparação"
                      kicker="// PRÉ-SESSÃO"
                    />
                  ) : null}
                </div>
              ))}
            </div>
          </Section>
        ) : null}

        {/* Reschedule requests */}
        {rescheduleRequests.length > 0 ? (
          <Section
            kicker="// REMARCAÇÕES"
            title="Pedidos de remarcação"
            subtitle="Joel responde em até 24h por email confirmando um dos slots."
          >
            <div className="flex flex-col gap-4">
              {rescheduleRequests.map((r) => (
                <RescheduleRequestCard key={r.id} request={r} />
              ))}
            </div>
          </Section>
        ) : null}

        {/* Shared artifacts */}
        {sharedArtifacts.length > 0 ? (
          <Section
            kicker="// MATERIAIS COMPARTILHADOS"
            title="Artifacts trocados"
            subtitle="Documentos que o Joel marcou como relevantes pro seu Advisory."
          >
            <div className="grid gap-4 md:grid-cols-2">
              {sharedArtifacts.map((a) => (
                <Card key={a.id} className="bg-ink-2 flex flex-col gap-3 !p-5">
                  <div className="flex items-center justify-between">
                    <span className="kicker text-acid">// {a.kind.toUpperCase()}</span>
                    <span className="text-fg-3 font-mono text-[10px] tracking-[0.22em] uppercase">
                      v{a.version}
                    </span>
                  </div>
                  <h3 className="text-cream font-display text-[16px] leading-tight uppercase tracking-tight">
                    {a.title}
                  </h3>
                  {a.content_md ? (
                    <p className="text-fg-3 line-clamp-3 font-sans text-sm">
                      {a.content_md.slice(0, 240)}
                      {a.content_md.length > 240 ? '…' : ''}
                    </p>
                  ) : null}
                  <Link
                    href={`/app/workspace/artifacts/${a.id}`}
                    className="text-acid font-mono text-[10px] tracking-[0.22em] uppercase"
                  >
                    Ver completo →
                  </Link>
                </Card>
              ))}
            </div>
          </Section>
        ) : null}

        {/* Past sessions */}
        {past.length > 0 ? (
          <Section kicker="// HISTÓRICO" title="Sessões anteriores">
            <div className="grid gap-4 md:grid-cols-2">
              {past.map((s) => (
                <SessionCard
                  key={s.id}
                  session={s}
                  productName={productById.get(s.product_id)?.name ?? 'Advisory'}
                  viewMode="past"
                />
              ))}
            </div>
          </Section>
        ) : null}

        {/* Empty middle state */}
        {upcoming.length === 0 && pending.length === 0 && past.length === 0 ? (
          <Card className="bg-ink-2 flex flex-col gap-4 !p-8 text-center">
            <span className="kicker text-acid">// SEM SESSÕES AINDA</span>
            <p className="text-fg-2 font-sans">
              Suas sessões aparecem aqui assim que forem agendadas.
            </p>
          </Card>
        ) : null}
      </Container>
    </section>
  );
}

// ---------- helpers ----------

function Section({
  kicker,
  title,
  subtitle,
  children,
}: {
  kicker: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <span className="kicker text-acid">{kicker}</span>
        <h2 className="heading-2 text-cream">{title}</h2>
        {subtitle ? <p className="text-fg-3 body-sm">{subtitle}</p> : null}
      </div>
      {children}
    </section>
  );
}

function RescheduleRequestCard({ request }: { request: SessionRescheduleRequest }) {
  const slots = isProposedSlotArray(request.proposed_slots) ? request.proposed_slots : [];
  const statusLabel: Record<string, string> = {
    pending: 'AGUARDANDO JOEL',
    accepted: 'ACEITA',
    rejected: 'REJEITADA',
    cancelled: 'CANCELADA',
  };
  const statusVariant: 'fire' | 'default' = request.status === 'pending' ? 'fire' : 'default';

  return (
    <Card className="bg-ink-2 flex flex-col gap-3 !p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-fg-3 font-mono text-[10px] tracking-[0.22em] uppercase">
          Pedido de {formatInTimeZone(request.created_at, DEFAULT_TZ, "dd/MM/yyyy '·' HH:mm")}
        </span>
        <Badge variant={statusVariant}>
          {statusLabel[request.status] ?? request.status.toUpperCase()}
        </Badge>
      </div>
      <ul className="flex flex-col gap-1">
        {slots.map((slot, idx) => {
          let label = slot.startsAt;
          try {
            label = formatInTimeZone(
              new Date(slot.startsAt),
              slot.timezone || DEFAULT_TZ,
              "EEE, dd MMM yyyy '·' HH:mm '('zzz')'",
              { locale: ptBR }
            );
          } catch {
            // mantém ISO bruto se parse falhar
          }
          return (
            <li
              key={idx}
              className="text-cream font-mono text-[12px] tracking-[0.06em]"
            >
              <span className="text-acid">→</span> {label}
            </li>
          );
        })}
      </ul>
      {request.admin_note ? (
        <p className="text-fg-3 body-sm border-l-fire border-l-2 pl-3">{request.admin_note}</p>
      ) : null}
    </Card>
  );
}

function EmptyState() {
  return (
    <section className="section">
      <Container size="md" className="flex flex-col gap-6 text-center">
        <span className="kicker text-acid">// ADVISORY</span>
        <h1 className="heading-1 text-cream">Você ainda não tem Advisory ativo.</h1>
        <p className="text-fg-2 body">
          Advisory é 1:1 comigo: Sessão Estratégica (90 min), Sprint 30 dias, ou Conselho
          Executivo recorrente. Pra clientes que precisam de conselheiro presente — não só método.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Button asChild variant="fire">
            <Link href="/advisory">Conhecer Advisory →</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/app/area">Voltar pra área</Link>
          </Button>
        </div>
      </Container>
    </section>
  );
}

