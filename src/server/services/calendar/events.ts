import 'server-only';

// CRUD do hub `calendar_events` + enfileiramento de push pra Google.

import { eq } from 'drizzle-orm';
import { db } from '@/server/db/client';
import { calendar_events } from '@/server/db/schema';
import { ulid } from '@/server/lib/ulid';
import { queue } from '@/server/lib/queue';
import { DEFAULT_TZ } from '@/server/lib/datetime';

export type CalendarEventSource =
  | 'advisory_session'
  | 'mentoria'
  | 'aula'
  | 'activity'
  | 'manual';

export interface CreateCalendarEventInput {
  ownerId: string;
  teamId?: string | null;
  source: CalendarEventSource;
  sourceId?: string | null;
  title: string;
  descriptionMd?: string | null;
  startsAt: Date;
  endsAt: Date;
  timezone?: string;
  meetingUrl?: string | null;
  location?: string | null;
  attendees?: Array<{ email: string; name?: string }>;
  reminderOffsets?: number[];
  visibility?: 'public' | 'private' | 'confidential';
}

export type CalendarEventRow = typeof calendar_events.$inferSelect;

const PUSH_JOB = 'PUSH_CALENDAR_EVENT';

export async function createCalendarEvent(
  input: CreateCalendarEventInput
): Promise<CalendarEventRow> {
  const id = ulid();
  const now = new Date();
  await db.insert(calendar_events).values({
    id,
    owner_id: input.ownerId,
    team_id: input.teamId ?? null,
    source: input.source,
    source_id: input.sourceId ?? null,
    title: input.title,
    description_md: input.descriptionMd ?? null,
    starts_at: input.startsAt,
    ends_at: input.endsAt,
    timezone: input.timezone ?? DEFAULT_TZ,
    meeting_url: input.meetingUrl ?? null,
    location: input.location ?? null,
    visibility: input.visibility ?? 'private',
    attendees: input.attendees ?? [],
    reminder_offsets: input.reminderOffsets ?? [1440, 60],
    sync_status: 'pending_push',
    created_at: now,
    updated_at: now,
  });

  await queue.enqueue(PUSH_JOB, { eventId: id });

  const [row] = await db.select().from(calendar_events).where(eq(calendar_events.id, id)).limit(1);
  return row!;
}

export interface UpdateCalendarEventPatch {
  title?: string;
  descriptionMd?: string | null;
  startsAt?: Date;
  endsAt?: Date;
  timezone?: string;
  meetingUrl?: string | null;
  location?: string | null;
  attendees?: Array<{ email: string; name?: string }>;
  reminderOffsets?: number[];
  visibility?: 'public' | 'private' | 'confidential';
}

export async function updateCalendarEvent(
  eventId: string,
  patch: UpdateCalendarEventPatch
): Promise<void> {
  const update: Record<string, unknown> = { updated_at: new Date(), sync_status: 'pending_push' };
  if (patch.title !== undefined) update.title = patch.title;
  if (patch.descriptionMd !== undefined) update.description_md = patch.descriptionMd;
  if (patch.startsAt !== undefined) update.starts_at = patch.startsAt;
  if (patch.endsAt !== undefined) update.ends_at = patch.endsAt;
  if (patch.timezone !== undefined) update.timezone = patch.timezone;
  if (patch.meetingUrl !== undefined) update.meeting_url = patch.meetingUrl;
  if (patch.location !== undefined) update.location = patch.location;
  if (patch.attendees !== undefined) update.attendees = patch.attendees;
  if (patch.reminderOffsets !== undefined) update.reminder_offsets = patch.reminderOffsets;
  if (patch.visibility !== undefined) update.visibility = patch.visibility;

  await db.update(calendar_events).set(update).where(eq(calendar_events.id, eventId));
  await queue.enqueue(PUSH_JOB, { eventId });
}

export async function cancelCalendarEvent(eventId: string, reason?: string): Promise<void> {
  await db
    .update(calendar_events)
    .set({
      cancelled_at: new Date(),
      cancellation_reason: reason ?? null,
      sync_status: 'pending_push',
      updated_at: new Date(),
    })
    .where(eq(calendar_events.id, eventId));
  await queue.enqueue(PUSH_JOB, { eventId });
}

export function generateJitsiUrl(seed?: string): string {
  return `https://meet.jit.si/joelburigo-${seed ?? ulid()}`;
}
