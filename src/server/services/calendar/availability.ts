import 'server-only';

// Cálculo de slots disponíveis a partir de availability_windows + overrides + calendar_events.

import { and, eq, gte, isNull, lte } from 'drizzle-orm';
import { db } from '@/server/db/client';
import {
  availability_overrides,
  availability_windows,
  calendar_events,
} from '@/server/db/schema';
import {
  addDays,
  addMinutes,
  combineLocalDateAndTime,
  DEFAULT_TZ,
  rangesOverlap,
  weekdayInTimezone,
} from '@/server/lib/datetime';

export type SlotProposal = { startsAt: Date; endsAt: Date };

export interface ListAvailableSlotsOptions {
  ownerId: string;
  durationMin: number;
  rangeStart: Date;
  rangeEnd: Date;
  // Não afeta cálculo (sempre UTC); reservado pra quando UI quiser hint do TZ alvo.
  clientTimezone?: string;
  granularityMin?: number;
}

const MAX_SLOTS = 200;
const DEFAULT_GRANULARITY_MIN = 30;

interface MaterializedRange {
  startsAt: Date;
  endsAt: Date;
}

function materializeWindowsForDay(
  day: Date,
  windowsForWeekday: Array<{ start_time: string; end_time: string; timezone: string }>
): MaterializedRange[] {
  const ranges: MaterializedRange[] = [];
  for (const w of windowsForWeekday) {
    const startsAt = combineLocalDateAndTime(day, w.start_time, w.timezone);
    const endsAt = combineLocalDateAndTime(day, w.end_time, w.timezone);
    if (endsAt.getTime() <= startsAt.getTime()) continue;
    ranges.push({ startsAt, endsAt });
  }
  return ranges;
}

function expandRangeToSlots(
  range: MaterializedRange,
  durationMin: number,
  granularityMin: number
): SlotProposal[] {
  const slots: SlotProposal[] = [];
  let cursor = range.startsAt;
  // Iteração em passos de granularity; cada slot dura durationMin
  while (cursor.getTime() + durationMin * 60_000 <= range.endsAt.getTime()) {
    const endsAt = addMinutes(cursor, durationMin);
    slots.push({ startsAt: cursor, endsAt });
    cursor = addMinutes(cursor, granularityMin);
  }
  return slots;
}

export async function listAvailableSlots(
  opts: ListAvailableSlotsOptions
): Promise<SlotProposal[]> {
  const granularity = opts.granularityMin ?? DEFAULT_GRANULARITY_MIN;
  const now = new Date();

  if (opts.rangeEnd.getTime() <= opts.rangeStart.getTime()) return [];

  const [windows, overrides, busyEvents] = await Promise.all([
    db
      .select()
      .from(availability_windows)
      .where(
        and(eq(availability_windows.owner_id, opts.ownerId), eq(availability_windows.active, true))
      ),
    db
      .select()
      .from(availability_overrides)
      .where(
        and(
          eq(availability_overrides.owner_id, opts.ownerId),
          // Pega overrides que sobrepõem [rangeStart, rangeEnd]
          lte(availability_overrides.starts_at, opts.rangeEnd),
          gte(availability_overrides.ends_at, opts.rangeStart)
        )
      ),
    db
      .select()
      .from(calendar_events)
      .where(
        and(
          eq(calendar_events.owner_id, opts.ownerId),
          isNull(calendar_events.cancelled_at),
          lte(calendar_events.starts_at, opts.rangeEnd),
          gte(calendar_events.ends_at, opts.rangeStart)
        )
      ),
  ]);

  const blocks = overrides.filter((o) => o.kind === 'block');
  const extras = overrides.filter((o) => o.kind === 'extra');

  // Para cada dia em [rangeStart, rangeEnd], materializa janelas no TZ do owner
  const ownerTimezone = windows[0]?.timezone ?? DEFAULT_TZ;
  const windowsByWeekday = new Map<number, typeof windows>();
  for (const w of windows) {
    const list = windowsByWeekday.get(w.weekday) ?? [];
    list.push(w);
    windowsByWeekday.set(w.weekday, list);
  }

  const allSlots: SlotProposal[] = [];
  // Itera dia-a-dia (no TZ do owner) entre rangeStart e rangeEnd
  let dayCursor = new Date(opts.rangeStart);
  // Limitador defensivo (60 dias máx)
  for (let i = 0; i < 60; i++) {
    if (dayCursor.getTime() > opts.rangeEnd.getTime()) break;

    const wd = weekdayInTimezone(dayCursor, ownerTimezone);
    const dayWindows = windowsByWeekday.get(wd) ?? [];
    const ranges = materializeWindowsForDay(dayCursor, dayWindows);
    for (const r of ranges) {
      // Recorta range pelo [rangeStart, rangeEnd]
      const clippedStart = r.startsAt.getTime() < opts.rangeStart.getTime() ? opts.rangeStart : r.startsAt;
      const clippedEnd = r.endsAt.getTime() > opts.rangeEnd.getTime() ? opts.rangeEnd : r.endsAt;
      if (clippedEnd.getTime() <= clippedStart.getTime()) continue;
      allSlots.push(
        ...expandRangeToSlots(
          { startsAt: clippedStart, endsAt: clippedEnd },
          opts.durationMin,
          granularity
        )
      );
    }

    dayCursor = addDays(dayCursor, 1);
  }

  // Adiciona slots de overrides 'extra'
  for (const ex of extras) {
    const clippedStart =
      ex.starts_at.getTime() < opts.rangeStart.getTime() ? opts.rangeStart : ex.starts_at;
    const clippedEnd = ex.ends_at.getTime() > opts.rangeEnd.getTime() ? opts.rangeEnd : ex.ends_at;
    if (clippedEnd.getTime() <= clippedStart.getTime()) continue;
    allSlots.push(
      ...expandRangeToSlots(
        { startsAt: clippedStart, endsAt: clippedEnd },
        opts.durationMin,
        granularity
      )
    );
  }

  // Filtros: passado, blocks, calendar_events ocupados
  const filtered = allSlots.filter((slot) => {
    if (slot.startsAt.getTime() <= now.getTime()) return false;

    for (const b of blocks) {
      if (rangesOverlap(slot.startsAt, slot.endsAt, b.starts_at, b.ends_at)) return false;
    }
    for (const ev of busyEvents) {
      if (rangesOverlap(slot.startsAt, slot.endsAt, ev.starts_at, ev.ends_at)) return false;
    }
    return true;
  });

  // Dedup (overrides extra podem coincidir com windows) e ordena
  const uniq = new Map<number, SlotProposal>();
  for (const s of filtered) {
    uniq.set(s.startsAt.getTime(), s);
  }
  const sorted = [...uniq.values()].sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());

  return sorted.slice(0, MAX_SLOTS);
}
