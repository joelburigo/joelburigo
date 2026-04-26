import 'server-only';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, Radio, Calendar, Archive } from 'lucide-react';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Container } from '@/components/patterns/container';
import { requireAdmin } from '@/server/services/session';
import { listMentorias, type Mentoria } from '@/server/services/mentorias';
import { iframeUrlFor, hlsUrlFor, isCfStreamConfigured } from '@/server/services/cf-stream';
import { DEFAULT_TZ, formatInTimeZone } from '@/server/lib/datetime';
import { CopyButton } from '@/components/features/mentorias/copy-button';
import { NewMentoriaDialog } from '@/components/features/mentorias/new-mentoria-dialog';
import { MentoriaActions } from '@/components/features/mentorias/mentoria-actions';

export const metadata: Metadata = {
  title: 'Admin · Mentorias',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function AdminMentoriasPage() {
  await requireAdmin();
  const all = await listMentorias();

  const live = all.filter((m) => m.live_status === 'live');
  const scheduled = all.filter((m) => m.live_status !== 'live' && m.status === 'scheduled');
  const recorded = all.filter((m) => m.status === 'recorded');

  return (
    <Container className="py-12">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="kicker text-fire">// SPRINT 4 · MENTORIAS VSS</span>
          <h1 className="heading-2 text-cream mt-2 uppercase tracking-tight">Mentorias</h1>
          <p className="body-sm text-fg-3 mt-2 max-w-xl">
            CRUD de mentorias com Cloudflare Stream Live Input. RTMP key alimenta o OBS;
            replay HLS publica automaticamente quando webhook chega.
          </p>
          {!isCfStreamConfigured() ? (
            <p className="font-mono text-[10px] text-acid mt-3 tracking-[0.18em] uppercase">
              // CF_STREAM em modo mock — defina CF_API_TOKEN + CF_STREAM_CUSTOMER_CODE pra produção
            </p>
          ) : null}
        </div>
        <NewMentoriaDialog />
      </header>

      <Section
        kicker="// AO VIVO AGORA"
        accent="fire"
        icon={<Radio className="text-fire size-4 animate-pulse" />}
        empty="Nenhuma mentoria ao vivo."
        items={live}
      />

      <Section
        kicker="// PRÓXIMAS"
        accent="acid"
        icon={<Calendar className="text-acid size-4" />}
        empty="Nenhuma mentoria agendada."
        items={scheduled}
      />

      <Section
        kicker="// REPLAY DISPONÍVEL"
        accent="dim"
        icon={<Archive className="text-fg-3 size-4" />}
        empty="Nenhuma mentoria gravada ainda."
        items={recorded}
      />
    </Container>
  );
}

function Section({
  kicker,
  accent,
  icon,
  empty,
  items,
}: {
  kicker: string;
  accent: 'fire' | 'acid' | 'dim';
  icon: React.ReactNode;
  empty: string;
  items: Mentoria[];
}) {
  const kickerColor =
    accent === 'fire' ? 'text-fire' : accent === 'acid' ? 'text-acid' : 'text-fg-3';
  return (
    <section className="mb-12">
      <div className="mb-4 flex items-center gap-2">
        {icon}
        <span className={`kicker ${kickerColor}`}>{kicker}</span>
        <span className="text-fg-3 font-mono text-[10px] tracking-[0.22em] uppercase">
          ({items.length})
        </span>
      </div>
      {items.length === 0 ? (
        <p className="body-sm text-fg-3">{empty}</p>
      ) : (
        <div className="flex flex-col gap-4">
          {items.map((m) => (
            <MentoriaCard key={m.id} mentoria={m} accent={accent} />
          ))}
        </div>
      )}
    </section>
  );
}

function MentoriaCard({
  mentoria,
  accent,
}: {
  mentoria: Mentoria;
  accent: 'fire' | 'acid' | 'dim';
}) {
  const dateStr = formatInTimeZone(
    mentoria.scheduled_at,
    DEFAULT_TZ,
    "EEE, dd 'de' MMM 'de' yyyy '·' HH:mm '('zzz')'",
    { locale: ptBR }
  );
  const accentClass =
    accent === 'fire'
      ? '!border-fire !shadow-[6px_6px_0_var(--jb-fire)]'
      : accent === 'acid'
        ? '!border-acid'
        : 'opacity-80';

  const playbackUid = mentoria.cf_playback_id;
  const liveUid = mentoria.cf_live_input_id;
  const iframeTarget = playbackUid ?? liveUid;

  return (
    <Card className={`${accentClass} flex flex-col gap-4`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h3 className="text-cream font-display text-[18px] uppercase leading-tight tracking-tight">
            {mentoria.title}
          </h3>
          <p className="text-fg-3 font-mono text-[10px] tracking-[0.22em] uppercase">
            {dateStr} · {mentoria.duration_min} min
          </p>
          {mentoria.topic ? (
            <p className="body-sm text-fg-2 mt-1 max-w-2xl">{mentoria.topic}</p>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <StatusBadges mentoria={mentoria} />
          <MentoriaActions
            id={mentoria.id}
            liveStatus={mentoria.live_status}
            status={mentoria.status}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {mentoria.rtmp_url ? (
          <CopyButton label="RTMP URL" value={mentoria.rtmp_url} />
        ) : null}
        {mentoria.rtmp_stream_key ? (
          <CopyButton label="STREAM KEY" value={mentoria.rtmp_stream_key} mask />
        ) : null}
        {playbackUid && isCfStreamConfigured() ? (
          <CopyButton label="HLS PLAYBACK" value={hlsUrlFor(playbackUid)} />
        ) : null}
        {iframeTarget && isCfStreamConfigured() ? (
          <CopyButton label="IFRAME" value={iframeUrlFor(iframeTarget)} />
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-1">
        <Link
          href={`/app/sessao/${mentoria.id}`}
          className="text-acid hover:text-cream font-mono text-[10px] tracking-[0.22em] uppercase inline-flex items-center gap-1"
        >
          Abrir página da sessão
          <ArrowUpRight className="size-3" />
        </Link>
      </div>
    </Card>
  );
}

function StatusBadges({ mentoria }: { mentoria: Mentoria }) {
  if (mentoria.live_status === 'live') {
    return <Badge variant="live">Ao vivo</Badge>;
  }
  if (mentoria.status === 'recorded') {
    return <Badge variant="default">Gravada</Badge>;
  }
  if (mentoria.live_status === 'ended') {
    return <Badge variant="default">Encerrada</Badge>;
  }
  return <Badge variant="acid">Agendada</Badge>;
}
