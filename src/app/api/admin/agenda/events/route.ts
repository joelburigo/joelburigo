import 'server-only';
import { NextResponse, type NextRequest } from 'next/server';
import { and, asc, eq, gte, isNull, lte } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/server/db/client';
import { calendar_events } from '@/server/db/schema';
import { requireAdmin } from '@/server/services/session';

const querySchema = z.object({
  from: z.string().datetime(),
  to: z.string().datetime(),
});

/**
 * GET /api/admin/agenda/events?from=ISO&to=ISO
 *
 * Retorna eventos do range pra refresh client-side (após criar override,
 * sync manual, etc). Apenas eventos do owner=admin, não-cancelados.
 */
export async function GET(req: NextRequest) {
  const admin = await requireAdmin();
  const url = new URL(req.url);
  const parsed = querySchema.safeParse({
    from: url.searchParams.get('from'),
    to: url.searchParams.get('to'),
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'validation', issues: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const from = new Date(parsed.data.from);
  const to = new Date(parsed.data.to);
  if (to.getTime() <= from.getTime()) {
    return NextResponse.json({ error: 'to_must_be_after_from' }, { status: 400 });
  }

  const rows = await db
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
    .orderBy(asc(calendar_events.starts_at));

  return NextResponse.json({
    events: rows.map((e) => ({
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
    })),
  });
}
