import 'server-only';
import {
  addDays,
  addMinutes,
  endOfDay,
  startOfDay,
  formatISO,
  parseISO,
  differenceInMinutes,
  isBefore,
  isAfter,
  isSameDay,
} from 'date-fns';
import { fromZonedTime, toZonedTime, formatInTimeZone } from 'date-fns-tz';

/**
 * Wrappers TZ-aware sobre date-fns + date-fns-tz.
 * Toda a aritmética de agenda (slot calc, sync Google) acontece em UTC;
 * apresentação ao usuário usa o TZ do owner ou do cliente.
 */

export const DEFAULT_TZ = 'America/Sao_Paulo';

export {
  addDays,
  addMinutes,
  endOfDay,
  startOfDay,
  formatISO,
  parseISO,
  differenceInMinutes,
  isBefore,
  isAfter,
  isSameDay,
  fromZonedTime,
  toZonedTime,
  formatInTimeZone,
};

/**
 * Converte `'HH:MM'` + dia local + TZ → instante UTC absoluto.
 */
export function combineLocalDateAndTime(date: Date, hhmm: string, timezone: string): Date {
  const [h, m] = hhmm.split(':').map((n) => parseInt(n, 10));
  if (Number.isNaN(h) || Number.isNaN(m)) {
    throw new Error(`combineLocalDateAndTime: formato inválido "${hhmm}" (esperado HH:MM)`);
  }
  // Pega Y-M-D na zona alvo (não o local do server)
  const yyyy = formatInTimeZone(date, timezone, 'yyyy-MM-dd');
  const localISO = `${yyyy}T${hhmm.padStart(5, '0')}:00`;
  return fromZonedTime(localISO, timezone);
}

/**
 * Detecta o weekday (0=domingo .. 6=sábado) do `date` na zona indicada.
 */
export function weekdayInTimezone(date: Date, timezone: string): number {
  const wd = formatInTimeZone(date, timezone, 'i'); // 1..7 (segunda..domingo)
  // 'i' do date-fns: 1=segunda → mapear pra 0=domingo .. 6=sábado
  const num = parseInt(wd, 10);
  return num === 7 ? 0 : num;
}

/**
 * Formata pro pt-BR exibindo TZ implícito do cliente.
 * Ex: "qua, 30 abr 2026, 14:00 (BRT)"
 */
export function formatHuman(date: Date, timezone: string): string {
  return formatInTimeZone(date, timezone, "EEE, dd MMM yyyy, HH:mm '('zzz')'", {
    locale: undefined,
  });
}

/**
 * Range absoluto (UTC) cobrindo o dia inteiro [00:00, 24:00) de uma data local.
 */
export function dayRangeInTimezone(
  date: Date,
  timezone: string
): { startsAt: Date; endsAt: Date } {
  const yyyy = formatInTimeZone(date, timezone, 'yyyy-MM-dd');
  const startsAt = fromZonedTime(`${yyyy}T00:00:00`, timezone);
  const endsAt = fromZonedTime(`${yyyy}T23:59:59.999`, timezone);
  return { startsAt, endsAt };
}

/**
 * Verifica se dois ranges [a, b) e [c, d) se sobrepõem.
 */
export function rangesOverlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart.getTime() < bEnd.getTime() && bStart.getTime() < aEnd.getTime();
}
