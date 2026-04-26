import 'server-only';
import type { Metadata } from 'next';
import { and, asc, eq, gte, isNull, lte } from 'drizzle-orm';
import { db } from '@/server/db/client';
import { calendar_accounts, calendar_events } from '@/server/db/schema';
import { requireAdmin } from '@/server/services/session';
import {
  AgendaCalendar,
  type AgendaRange,
  type SerializedCalendarEvent,
} from '@/components/features/admin/agenda-calendar';

export const metadata: Metadata = {
  title: 'Agenda · Admin · Joel Burigo',
  robots: { index: false, follow: false },
};

interface SearchParams {
  range?: string;
  ref?: string;
}

function parseRange(raw: string | undefined): AgendaRange {
  if (raw === 'month' || raw === 'day' || raw === 'week') return raw;
  return 'week';
}

function parseRef(raw: string | undefined): string {
  // YYYY-MM-DD
  if (raw && /^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

function refToDate(ref: string): Date {
  const [y, m, d] = ref.split('-').map((n) => parseInt(n, 10));
  return new Date(Date.UTC(y!, (m ?? 1) - 1, d ?? 1, 12, 0, 0));
}

function startOfWeekUTC(d: Date): Date {
  const dow = d.getUTCDay();
  const diff = dow === 0 ? -6 : 1 - dow;
  const start = new Date(d);
  start.setUTCDate(start.getUTCDate() + diff);
  start.setUTCHours(0, 0, 0, 0);
  return start;
}

function startOfMonthUTC(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1, 0, 0, 0));
}

function rangeForView(range: AgendaRange, ref: string): { from: Date; to: Date } {
  const refDate = refToDate(ref);
  if (range === 'day') {
    const from = new Date(refDate);
    from.setUTCHours(0, 0, 0, 0);
    const to = new Date(from);
    to.setUTCDate(to.getUTCDate() + 1);
    return { from, to };
  }
  if (range === 'month') {
    const from = startOfMonthUTC(refDate);
    // estende cobertura pra grid 6×7 que renderiza dias do mês anterior/próximo
    const gridStart = startOfWeekUTC(from);
    const to = new Date(gridStart);
    to.setUTCDate(to.getUTCDate() + 42);
    return { from: gridStart, to };
  }
  // week
  const from = startOfWeekUTC(refDate);
  const to = new Date(from);
  to.setUTCDate(to.getUTCDate() + 7);
  return { from, to };
}

export default async function AdminAgendaPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const admin = await requireAdmin();
  const sp = await searchParams;
  const range = parseRange(sp.range);
  const ref = parseRef(sp.ref);
  const { from, to } = rangeForView(range, ref);

  const [events, googleAccounts] = await Promise.all([
    db
      .select()
      .from(calendar_events)
      .where(
        and(
          eq(calendar_events.owner_id, admin.id),
          isNull(calendar_events.cancelled_at),
          lte(calendar_events.starts_at, to),
          gte(calendar_events.ends_at, from)
        )
      )
      .orderBy(asc(calendar_events.starts_at)),
    db
      .select({ id: calendar_accounts.id })
      .from(calendar_accounts)
      .where(
        and(eq(calendar_accounts.user_id, admin.id), eq(calendar_accounts.status, 'active'))
      )
      .limit(1),
  ]);

  const serialized: SerializedCalendarEvent[] = events.map((e) => ({
    id: e.id,
    source: e.source,
    sourceId: e.source_id,
    title: e.title,
    descriptionMd: e.description_md,
    startsAt: e.starts_at.toISOString(),
    endsAt: e.ends_at.toISOString(),
    timezone: e.timezone,
    meetingUrl: e.meeting_url,
    location: e.location,
    attendees: e.attendees,
    googleEventId: e.google_event_id,
    syncStatus: e.sync_status,
  }));

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <span className="font-mono text-[10px] tracking-[0.22em] text-fire uppercase">
          // ADMIN_AGENDA
        </span>
        <h1 className="heading-1 text-cream">Agenda unificada</h1>
        <p className="body-sm text-fg-3">
          Advisory · mentorias · aulas · activities · Google Calendar (read-only quando externo).
        </p>
      </header>

      <AgendaCalendar
        events={serialized}
        range={range}
        refDate={ref}
        hasGoogleAccount={googleAccounts.length > 0}
      />
    </div>
  );
}
