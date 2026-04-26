import 'server-only';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { eq, and } from 'drizzle-orm';
import { ArrowLeft, Radio, Calendar, Lock } from 'lucide-react';
import { ptBR } from 'date-fns/locale';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Container } from '@/components/patterns/container';
import { requireOnboarded } from '@/server/services/session';
import {
  getMentoria,
  listUpcomingMentorias,
  type Mentoria,
} from '@/server/services/mentorias';
import { iframeUrlFor, isCfStreamConfigured } from '@/server/services/cf-stream';
import { db } from '@/server/db/client';
import { entitlements, products } from '@/server/db/schema';
import { DEFAULT_TZ, formatInTimeZone } from '@/server/lib/datetime';
import { PresenceTracker } from '@/components/features/mentorias/presence-tracker';

export const metadata: Metadata = {
  title: 'Sessão',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

const PRE_LIVE_WINDOW_MIN = 5;

async function userHasVssEntitlement(userId: string): Promise<boolean> {
  const rows = await db
    .select({ id: entitlements.id })
    .from(entitlements)
    .innerJoin(products, eq(entitlements.product_id, products.id))
    .where(
      and(
        eq(entitlements.user_id, userId),
        eq(entitlements.status, 'active'),
        eq(products.slug, 'vss')
      )
    )
    .limit(1);
  return rows.length > 0;
}

export default async function SessaoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user } = await requireOnboarded();

  const mentoria = await getMentoria(id);

  // Não é mentoria → fallback dev stub (advisory_session ainda não migrado nesta entrega)
  if (!mentoria) {
    return (
      <DevStub
        sprint={3}
        route={`/app/sessao/${id}`}
        title={`Sessão · ${id}`}
        description="Detalhes de sessão Advisory virão na entrega Sprint 3 (rodando em paralelo)."
        backHref="/app/area"
        backLabel="Voltar"
      />
    );
  }

  const hasAccess = await userHasVssEntitlement(user.id);
  if (!hasAccess) {
    redirect('/app/area');
  }

  const upcoming = await listUpcomingMentorias(5);

  return (
    <Container className="py-12">
      <Link
        href="/app/area"
        className="text-fg-3 hover:text-acid mb-6 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em]"
      >
        <ArrowLeft className="size-3" /> Voltar
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <main>
          <MentoriaViewer mentoria={mentoria} />
          <PresenceTracker id={mentoria.id} enabled={mentoria.live_status === 'live'} />
        </main>
        <UpcomingSidebar items={upcoming.filter((u) => u.id !== mentoria.id)} />
      </div>
    </Container>
  );
}

function MentoriaViewer({ mentoria }: { mentoria: Mentoria }) {
  const dateStr = formatInTimeZone(
    mentoria.scheduled_at,
    DEFAULT_TZ,
    "EEEE, dd 'de' MMMM 'de' yyyy '·' HH:mm '('zzz')'",
    { locale: ptBR }
  );

  const now = Date.now();
  const startsAt = mentoria.scheduled_at.getTime();
  const minutesUntil = Math.floor((startsAt - now) / 60_000);
  const isLive = mentoria.live_status === 'live';
  const hasReplay = Boolean(mentoria.recording_ready_at && mentoria.cf_playback_id);
  const closeToStart = !isLive && !hasReplay && minutesUntil <= PRE_LIVE_WINDOW_MIN;

  // Player target: replay tem prioridade se pronto, senão live input
  const playerUid = hasReplay ? mentoria.cf_playback_id : mentoria.cf_live_input_id;
  const showPlayer = (isLive || closeToStart || hasReplay) && playerUid && isCfStreamConfigured();

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          {isLive ? (
            <>
              <Radio className="text-acid size-4 animate-pulse" />
              <span className="kicker text-acid">// AO VIVO AGORA</span>
            </>
          ) : hasReplay ? (
            <span className="kicker text-fg-3">// REPLAY</span>
          ) : (
            <>
              <Calendar className="text-fire size-4" />
              <span className="kicker text-fire">// MENTORIA AGENDADA</span>
            </>
          )}
        </div>
        <h1 className="heading-2 text-cream uppercase tracking-tight">{mentoria.title}</h1>
        <p className="text-acid font-mono text-[12px] uppercase tracking-[0.18em]">{dateStr}</p>
        {mentoria.topic ? (
          <p className="body text-fg-2 mt-2 max-w-3xl">{mentoria.topic}</p>
        ) : null}
      </header>

      {showPlayer ? (
        <div className="aspect-video w-full border border-[var(--jb-hair-strong)] bg-ink shadow-[6px_6px_0_var(--jb-fire)]">
          <iframe
            src={iframeUrlFor(playerUid!)}
            className="h-full w-full"
            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
            allowFullScreen
            title={mentoria.title}
          />
        </div>
      ) : !hasReplay && !isLive ? (
        <CountdownPanel mentoria={mentoria} minutesUntil={minutesUntil} />
      ) : (
        <Card className="!border-acid flex flex-col gap-2">
          <Lock className="text-acid size-5" />
          <p className="body text-fg-2">
            Player do Cloudflare Stream ainda não configurado neste ambiente.
          </p>
        </Card>
      )}

      {hasReplay ? (
        <Badge variant="default" className="self-start">
          Gravado em{' '}
          {formatInTimeZone(mentoria.recording_ready_at!, DEFAULT_TZ, 'dd/MM/yyyy HH:mm', {
            locale: ptBR,
          })}
        </Badge>
      ) : null}
    </div>
  );
}

function CountdownPanel({
  mentoria,
  minutesUntil,
}: {
  mentoria: Mentoria;
  minutesUntil: number;
}) {
  let label: string;
  if (minutesUntil <= 0) {
    label = 'Começando a qualquer momento';
  } else if (minutesUntil < 60) {
    label = `Em ${minutesUntil} min`;
  } else if (minutesUntil < 60 * 24) {
    label = `Em ${Math.round(minutesUntil / 60)}h`;
  } else {
    label = `Em ${Math.round(minutesUntil / (60 * 24))} dia(s)`;
  }
  return (
    <Card className="!border-fire flex flex-col gap-3">
      <span className="kicker text-fire">// AGUARDANDO INÍCIO</span>
      <p className="font-display text-cream text-[28px] uppercase leading-tight">{label}</p>
      <p className="body-sm text-fg-3">
        Quando o Joel iniciar a transmissão, esta página atualiza com o player ao vivo
        automaticamente. Recarregue a página se nada aparecer no horário.
      </p>
      {mentoria.topic ? (
        <p className="body-sm text-fg-2 mt-2">
          <strong className="text-cream">Pauta:</strong> {mentoria.topic}
        </p>
      ) : null}
    </Card>
  );
}

function UpcomingSidebar({ items }: { items: Mentoria[] }) {
  if (items.length === 0) return <aside />;
  return (
    <aside className="flex flex-col gap-4">
      <span className="kicker text-fg-3">// PRÓXIMAS MENTORIAS</span>
      {items.map((m) => (
        <Link
          key={m.id}
          href={`/app/sessao/${m.id}`}
          className="block border border-[var(--jb-hair)] bg-ink-2 p-4 hover:border-acid hover:shadow-[4px_4px_0_var(--jb-acid)]"
        >
          <p className="text-cream font-display text-[14px] uppercase leading-tight">
            {m.title}
          </p>
          <p className="text-fg-3 mt-1 font-mono text-[10px] tracking-[0.18em] uppercase">
            {formatInTimeZone(m.scheduled_at, DEFAULT_TZ, "dd/MM '·' HH:mm", { locale: ptBR })}
          </p>
        </Link>
      ))}
    </aside>
  );
}
