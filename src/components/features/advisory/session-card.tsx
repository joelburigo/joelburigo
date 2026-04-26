import 'server-only';
import Link from 'next/link';
import { ptBR } from 'date-fns/locale';
import { ArrowUpRight, CalendarClock, Video, RefreshCw, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { DEFAULT_TZ, formatInTimeZone } from '@/server/lib/datetime';
import type { AdvisorySession } from '@/server/db/schema';

export type SessionCardViewMode = 'upcoming' | 'past' | 'pending';

interface SessionCardProps {
  session: AdvisorySession;
  productName: string;
  viewMode?: SessionCardViewMode;
}

/**
 * Card de uma `advisory_session` no dashboard do cliente.
 * - `upcoming` (status='scheduled' e scheduled_at >= now): proeminente, com CTA "Entrar na call".
 * - `past` (completed/cancelled): muted, mostra status + link pra notas (se já existirem).
 * - `pending` (status='pending_booking'): alerta acid pedindo agendamento.
 *
 * `scheduled_at` formatado no TZ do cliente (ou DEFAULT_TZ como fallback) em pt-BR.
 */
export function SessionCard({ session, productName, viewMode = 'upcoming' }: SessionCardProps) {
  if (viewMode === 'pending') {
    return <PendingCard session={session} productName={productName} />;
  }
  if (viewMode === 'past') {
    return <PastCard session={session} productName={productName} />;
  }
  return <UpcomingCard session={session} productName={productName} />;
}

// ---------- Variantes ----------

function UpcomingCard({ session, productName }: { session: AdvisorySession; productName: string }) {
  const tz = session.cliente_timezone || DEFAULT_TZ;
  const dateLine = session.scheduled_at
    ? formatInTimeZone(
        session.scheduled_at,
        tz,
        "EEEE, dd 'de' MMMM 'de' yyyy",
        { locale: ptBR }
      )
    : '—';
  const timeLine = session.scheduled_at
    ? formatInTimeZone(session.scheduled_at, tz, "HH:mm '·' zzz", { locale: ptBR })
    : '—';

  return (
    <Card
      className={cn(
        '!bg-ink !border-fire flex flex-col gap-5 !p-6',
        '!shadow-[6px_6px_0_var(--jb-fire)]'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <CalendarClock className="text-fire size-4" aria-hidden />
          <span className="kicker text-fire">// PRÓXIMA SESSÃO</span>
        </div>
        <Badge variant="fire">Confirmada</Badge>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-cream font-display text-[20px] leading-tight uppercase tracking-tight md:text-[24px]">
          {dateLine}
        </h3>
        <p className="text-acid font-mono text-[13px] tracking-[0.18em] uppercase">
          {timeLine}
        </p>
        <p className="text-fg-3 font-mono text-[11px] tracking-[0.22em] uppercase">
          {productName} · {session.duration_min} min
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        {session.meeting_url ? (
          <Button asChild variant="primary" size="sm">
            <a href={session.meeting_url} target="_blank" rel="noopener noreferrer">
              <Video className="size-4" aria-hidden />
              Entrar na call
              <ArrowUpRight className="size-3" aria-hidden />
            </a>
          </Button>
        ) : null}
        <Button asChild variant="secondary" size="sm">
          <Link href={`/sessao/${session.id}`}>Ver detalhes</Link>
        </Button>
        <Button asChild variant="ghost" size="sm">
          <Link href={`/sessao/${session.id}?action=reschedule`}>
            <RefreshCw className="size-4" aria-hidden />
            Solicitar remarcação
          </Link>
        </Button>
      </div>
    </Card>
  );
}

function isBookingTokenAvailable(session: AdvisorySession): boolean {
  if (!session.booking_token) return false;
  if (!session.booking_token_expires_at) return true;
  // `Date.now()` aqui é seguro: server component renderizado por request, sem re-render reativo.
  return session.booking_token_expires_at.getTime() > Date.now();
}

function PendingCard({ session, productName }: { session: AdvisorySession; productName: string }) {
  const tokenAvailable = isBookingTokenAvailable(session);

  return (
    <Card
      className={cn(
        '!border-acid bg-[linear-gradient(180deg,rgba(198,255,0,0.06),var(--jb-ink-2))]',
        'flex flex-col gap-4 !p-6',
        '!shadow-[6px_6px_0_var(--jb-acid)]'
      )}
    >
      <div className="flex items-center gap-2">
        <span className="kicker text-acid">// PENDENTE DE AGENDAMENTO</span>
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="text-cream font-display text-[20px] leading-tight uppercase tracking-tight md:text-[22px]">
          Você comprou {productName}, mas ainda não agendou.
        </h3>
        <p className="body-sm text-fg-2">
          Escolha um horário disponível na agenda do Joel pra travar sua sessão.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        {tokenAvailable ? (
          <Button asChild variant="fire" size="sm">
            <Link href={`/sessao/agendar?token=${encodeURIComponent(session.booking_token!)}`}>
              Agendar agora
              <ArrowUpRight className="size-3" aria-hidden />
            </Link>
          </Button>
        ) : (
          <div className="flex flex-col gap-2">
            <span className="text-fire-hot font-mono text-[11px] tracking-[0.22em] uppercase">
              // TOKEN EXPIRADO
            </span>
            <p className="text-fg-3 body-sm">
              Fala com a gente em{' '}
              <a
                href="mailto:joel@joelburigo.com.br"
                className="text-acid underline-offset-4 hover:underline"
              >
                joel@joelburigo.com.br
              </a>{' '}
              pra reabrir o agendamento.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}

function PastCard({ session, productName }: { session: AdvisorySession; productName: string }) {
  const isCancelled = session.status === 'cancelled' || Boolean(session.cancelled_at);
  const tz = session.cliente_timezone || DEFAULT_TZ;
  const ref = session.scheduled_at ?? session.completed_at ?? session.cancelled_at ?? null;
  const dateLine = ref
    ? formatInTimeZone(ref, tz, "dd 'de' MMM 'de' yyyy '·' HH:mm", { locale: ptBR })
    : '—';

  return (
    <Card className="bg-ink-2 flex flex-col gap-3 !p-5 hover:!shadow-[4px_4px_0_var(--jb-hair-strong)]">
      <div className="flex items-center justify-between gap-3">
        <span className="text-fg-3 font-mono text-[10px] tracking-[0.22em] uppercase">
          {dateLine}
        </span>
        {isCancelled ? (
          <Badge variant="fire">Cancelada</Badge>
        ) : (
          <Badge variant="default">Completada</Badge>
        )}
      </div>
      <h3 className="text-cream font-display text-[16px] leading-tight uppercase tracking-tight">
        {productName}
      </h3>
      {isCancelled && session.cancellation_reason ? (
        <p className="body-sm text-fg-3 line-clamp-2">{session.cancellation_reason}</p>
      ) : null}
      <div className="flex flex-wrap items-center gap-3 pt-1">
        <Link
          href={`/sessao/${session.id}`}
          className="text-fg-3 hover:text-acid font-mono text-[10px] tracking-[0.22em] uppercase"
        >
          Ver detalhes →
        </Link>
        {session.joel_notes_r2_key ? (
          <Link
            href={`/sessao/${session.id}#notas`}
            className="text-acid font-mono text-[10px] tracking-[0.22em] uppercase inline-flex items-center gap-1"
          >
            <FileText className="size-3" aria-hidden />
            Ver notas
          </Link>
        ) : null}
      </div>
    </Card>
  );
}
