'use client';

// Componente cliente que formata data/hora no TZ detectado do navegador
// e gera o link "Adicionar ao Google Calendar".

import { useSyncExternalStore } from 'react';
import { formatInTimeZone } from 'date-fns-tz';
import { ptBR } from 'date-fns/locale/pt-BR';
import { Button } from '@/components/ui/button';

interface Props {
  startsAt: string; // ISO
  endsAt: string; // ISO
  defaultTimezone: string;
  meetingUrl: string | null;
  title?: string;
  description?: string;
}

function detectClientTimezone(fallback: string): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || fallback;
  } catch {
    return fallback;
  }
}

// Stable empty subscribe (TZ não muda durante a sessão; useSyncExternalStore só pra
// alinhar SSR/CSR sem violar `react-hooks/set-state-in-effect`).
function subscribe(): () => void {
  return () => {};
}

function buildGoogleCalendarUrl(
  startsAtIso: string,
  endsAtIso: string,
  meetingUrl: string | null,
  title: string,
  description: string
): string {
  const fmt = (iso: string) =>
    new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const dates = `${fmt(startsAtIso)}/${fmt(endsAtIso)}`;
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates,
    details: description + (meetingUrl ? `\n\nLink Jitsi: ${meetingUrl}` : ''),
  });
  if (meetingUrl) params.set('location', meetingUrl);
  return `https://calendar.google.com/calendar/r/eventedit?${params.toString()}`;
}

export function SessionDetailDisplay({
  startsAt,
  endsAt,
  defaultTimezone,
  meetingUrl,
  title = 'Advisory · Sessão',
  description = 'Sessão Advisory de 90 minutos com Joel Burigo.',
}: Props) {
  const tz = useSyncExternalStore(
    subscribe,
    () => detectClientTimezone(defaultTimezone),
    () => defaultTimezone
  );

  const startDate = new Date(startsAt);
  const dateLabel = formatInTimeZone(startDate, tz, "EEEE, dd 'de' MMMM 'de' yyyy", {
    locale: ptBR,
  });
  const timeLabel = formatInTimeZone(startDate, tz, 'HH:mm');
  const endTimeLabel = formatInTimeZone(new Date(endsAt), tz, 'HH:mm');
  const tzAbbrev = formatInTimeZone(startDate, tz, 'zzz');

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-fg-3 font-mono text-xs uppercase">// data</p>
        <p className="text-cream mt-1 font-sans text-xl">{dateLabel}</p>
      </div>
      <div>
        <p className="text-fg-3 font-mono text-xs uppercase">// horário</p>
        <p className="text-acid mt-1 font-mono text-2xl">
          {timeLabel} – {endTimeLabel} <span className="text-fg-3 text-base">({tzAbbrev})</span>
        </p>
        <p className="text-fg-3 mt-1 font-mono text-xs">// fuso: {tz}</p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {meetingUrl && (
          <Button asChild variant="fire" size="lg">
            <a href={meetingUrl} target="_blank" rel="noopener noreferrer">
              ENTRAR NA SALA <span className="font-mono">→</span>
            </a>
          </Button>
        )}
        <Button asChild variant="secondary" size="lg">
          <a
            href={buildGoogleCalendarUrl(startsAt, endsAt, meetingUrl, title, description)}
            target="_blank"
            rel="noopener noreferrer"
          >
            ADICIONAR AO GOOGLE CALENDAR
          </a>
        </Button>
      </div>
    </div>
  );
}
