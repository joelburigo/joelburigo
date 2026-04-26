'use client';

import { useMemo, useState, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { formatInTimeZone } from 'date-fns-tz';
import { ptBR } from 'date-fns/locale/pt-BR';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface RawSlot {
  startsAt: string; // ISO
  endsAt: string;
}

interface BookingGridProps {
  slots: RawSlot[];
  sessionId: string;
  defaultTimezone?: string;
  attendeeEmail: string;
  attendeeName: string | null;
}

const TIMEZONE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'America/Sao_Paulo', label: 'Brasília (GMT-03)' },
  { value: 'America/Manaus', label: 'Manaus (GMT-04)' },
  { value: 'America/Rio_Branco', label: 'Rio Branco (GMT-05)' },
  { value: 'America/Noronha', label: 'Noronha (GMT-02)' },
  { value: 'Europe/Lisbon', label: 'Lisboa (GMT+00/01)' },
  { value: 'Europe/London', label: 'Londres (GMT+00/01)' },
  { value: 'America/New_York', label: 'Nova York (GMT-04/05)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (GMT-07/08)' },
];

function detectClientTimezone(fallback = 'America/Sao_Paulo'): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return tz || fallback;
  } catch {
    return fallback;
  }
}

const subscribeNoop = () => () => {};

interface DayGroup {
  dayKey: string; // yyyy-MM-dd no TZ atual
  dayLabel: string;
  slots: Array<{ startsAt: Date; endsAt: Date; iso: string }>;
}

function groupSlotsByDay(slots: RawSlot[], timezone: string): DayGroup[] {
  const map = new Map<string, DayGroup>();
  for (const s of slots) {
    const startsAt = new Date(s.startsAt);
    const dayKey = formatInTimeZone(startsAt, timezone, 'yyyy-MM-dd');
    const dayLabel = formatInTimeZone(startsAt, timezone, "EEE, dd 'de' MMM", { locale: ptBR });
    const existing = map.get(dayKey);
    const slot = { startsAt, endsAt: new Date(s.endsAt), iso: s.startsAt };
    if (existing) {
      existing.slots.push(slot);
    } else {
      map.set(dayKey, { dayKey, dayLabel, slots: [slot] });
    }
  }
  return [...map.values()].sort((a, b) => a.dayKey.localeCompare(b.dayKey));
}

export function BookingGrid({
  slots,
  sessionId,
  defaultTimezone,
  attendeeEmail,
  attendeeName,
}: BookingGridProps) {
  const router = useRouter();
  const fallbackTz = defaultTimezone ?? 'America/Sao_Paulo';
  const detectedTz = useSyncExternalStore(
    subscribeNoop,
    () => detectClientTimezone(fallbackTz),
    () => fallbackTz
  );
  const [overrideTz, setOverrideTz] = useState<string | null>(null);
  const timezone = overrideTz ?? detectedTz;
  const [selectedIso, setSelectedIso] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const tzOptions = useMemo(() => {
    const list = [...TIMEZONE_OPTIONS];
    if (!list.find((o) => o.value === detectedTz)) {
      list.unshift({ value: detectedTz, label: `${detectedTz} (detectado)` });
    }
    return list;
  }, [detectedTz]);

  const grouped = useMemo(() => groupSlotsByDay(slots, timezone), [slots, timezone]);

  async function onConfirm() {
    if (!selectedIso || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/advisory/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          startsAt: selectedIso,
          clientTimezone: timezone,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        sessionId?: string;
        error?: string;
      };
      if (res.status === 409) {
        toast.error(
          data.error ?? 'Esse horário acabou de ser ocupado. Escolhe outro, recarrega a página.'
        );
        setSelectedIso(null);
        return;
      }
      if (!res.ok || !data.ok) {
        throw new Error(data.error ?? 'falha no agendamento');
      }
      toast.success('Sessão agendada. Redirecionando...');
      router.push(`/sessao/${data.sessionId ?? sessionId}`);
    } catch (err) {
      console.error(err);
      toast.error('Não consegui agendar agora. Tenta novamente em alguns segundos.');
      setSubmitting(false);
    }
  }

  if (slots.length === 0) {
    return (
      <div className="bg-ink-2 border-fire mt-10 border p-8">
        <div className="kicker text-fire mb-2">// SEM_HORÁRIOS_DISPONÍVEIS</div>
        <p className="text-cream font-sans text-base">
          Não tem horário disponível nos próximos 30 dias. Mande um email pra{' '}
          <a className="text-acid underline" href="mailto:joel@joelburigo.com.br">
            joel@joelburigo.com.br
          </a>{' '}
          que abrimos uma janela manual.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-10 flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <label
          htmlFor="tz-select"
          className="kicker text-acid"
        >
          // SEU_FUSO_HORÁRIO
        </label>
        <select
          id="tz-select"
          value={timezone}
          onChange={(e) => {
            setOverrideTz(e.target.value);
            setSelectedIso(null);
          }}
          className="bg-ink-2 text-cream border-[var(--jb-hair)] focus-visible:border-acid focus-visible:ring-acid w-full max-w-md border px-4 py-3 font-mono text-sm focus-visible:ring-1 focus-visible:outline-none"
        >
          {tzOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <p className="text-fg-3 font-mono text-xs">
          // detectado: <span className="text-cream">{detectedTz}</span> · todos os horários abaixo
          são exibidos no fuso selecionado.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {grouped.map((day) => (
          <div key={day.dayKey} className="bg-ink-2 border border-[var(--jb-hair)] p-6">
            <div className="font-display text-cream mb-4 text-sm tracking-wider uppercase">
              {day.dayLabel}
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {day.slots.map((s) => {
                const selected = selectedIso === s.iso;
                const label = formatInTimeZone(s.startsAt, timezone, 'HH:mm');
                return (
                  <button
                    key={s.iso}
                    type="button"
                    onClick={() => setSelectedIso(s.iso)}
                    className={cn(
                      'border px-4 py-3 font-mono text-sm transition-all duration-[180ms]',
                      selected
                        ? 'border-acid bg-acid/10 text-acid shadow-[4px_4px_0_var(--jb-acid)]'
                        : 'border-[var(--jb-hair)] text-cream hover:border-fire hover:text-fire'
                    )}
                    aria-pressed={selected}
                    disabled={submitting}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {selectedIso && (
        <div className="border-acid bg-acid/5 border p-8 shadow-[6px_6px_0_var(--jb-acid)]">
          <div className="kicker text-acid mb-3">// CONFIRMAR_AGENDAMENTO</div>
          <h2 className="heading-3 text-cream mb-4">
            {formatInTimeZone(new Date(selectedIso), timezone, "EEEE, dd 'de' MMMM 'às' HH:mm", {
              locale: ptBR,
            })}
          </h2>
          <p className="text-fg-2 mb-6 font-sans text-base">
            Sessão de 90 minutos via Jitsi. Você recebe email com o link e lembrete 24h antes e 1h
            antes.
          </p>

          <dl className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-fg-3 font-mono text-xs uppercase">// nome</dt>
              <dd className="text-cream mt-1 font-sans text-base">
                {attendeeName ?? 'Não informado'}
              </dd>
            </div>
            <div>
              <dt className="text-fg-3 font-mono text-xs uppercase">// email</dt>
              <dd className="text-cream mt-1 font-mono text-sm">{attendeeEmail}</dd>
            </div>
          </dl>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              variant="fire"
              size="lg"
              onClick={onConfirm}
              disabled={submitting}
              aria-busy={submitting}
            >
              {submitting ? 'AGENDANDO...' : 'CONFIRMAR AGENDAMENTO'}{' '}
              <span className="font-mono">→</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="lg"
              onClick={() => setSelectedIso(null)}
              disabled={submitting}
            >
              ESCOLHER OUTRO
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
