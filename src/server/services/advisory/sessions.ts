import 'server-only';

// Lifecycle de advisory sessions: criação pós-purchase, booking, reschedule, cancelamento.

import { and, asc, eq, isNull, ne } from 'drizzle-orm';
import { db } from '@/server/db/client';
import {
  advisory_sessions,
  calendar_events,
  session_reschedule_requests,
  type AdvisorySession,
} from '@/server/db/schema';
import { ulid } from '@/server/lib/ulid';
import { queue } from '@/server/lib/queue';
import { addMinutes, DEFAULT_TZ, rangesOverlap } from '@/server/lib/datetime';
import { env } from '@/env';
import { ADVISORY_DEFAULTS } from './config';
import { cancelCalendarEvent, generateJitsiUrl } from '@/server/services/calendar/events';

const SEND_BOOKING_CONFIRMATION = 'SEND_ADVISORY_BOOKING_CONFIRMATION';
const SCHEDULE_REMINDERS = 'SCHEDULE_ADVISORY_REMINDERS';

export interface CreatePendingSessionInput {
  userId: string;
  productId: string;
  purchaseId?: string | null;
  durationMin?: number;
  tokenTtlDays?: number;
  ownerId?: string;
}

export interface CreatePendingSessionResult {
  session: AdvisorySession;
  bookingToken: string;
  bookingUrl: string;
}

function makeBookingToken(): string {
  // 32 bytes URL-safe (não-enumerable). ULID seria suficiente, mas randomização extra mata enumeração.
  return `bk_${ulid()}_${ulid().slice(-8)}`;
}

export async function createPendingSession(
  input: CreatePendingSessionInput
): Promise<CreatePendingSessionResult> {
  const id = ulid();
  const ttlDays = input.tokenTtlDays ?? ADVISORY_DEFAULTS.BOOKING_TOKEN_TTL_DAYS;
  const bookingToken = makeBookingToken();
  const expiresAt = new Date(Date.now() + ttlDays * 86400_000);
  const now = new Date();

  await db.insert(advisory_sessions).values({
    id,
    user_id: input.userId,
    product_id: input.productId,
    purchase_id: input.purchaseId ?? null,
    booking_token: bookingToken,
    booking_token_expires_at: expiresAt,
    duration_min: input.durationMin ?? ADVISORY_DEFAULTS.SESSION_DURATION_MIN,
    status: 'pending_booking',
    created_at: now,
    updated_at: now,
  });

  const [session] = await db
    .select()
    .from(advisory_sessions)
    .where(eq(advisory_sessions.id, id))
    .limit(1);

  return {
    session: session!,
    bookingToken,
    bookingUrl: `${env.PUBLIC_SITE_URL}/sessao/agendar?token=${encodeURIComponent(bookingToken)}`,
  };
}

export async function findSessionByBookingToken(token: string): Promise<AdvisorySession | null> {
  const [row] = await db
    .select()
    .from(advisory_sessions)
    .where(eq(advisory_sessions.booking_token, token))
    .limit(1);
  if (!row) return null;
  if (row.status === 'cancelled' || row.status === 'completed') return null;
  if (row.booking_token_expires_at && row.booking_token_expires_at.getTime() < Date.now()) {
    return null;
  }
  return row;
}

export interface ConfirmBookingInput {
  sessionId: string;
  startsAt: Date;
  clientTimezone: string;
  ownerId?: string;
  attendeeEmail?: string;
  attendeeName?: string;
  joelEmail?: string;
}

export interface ConfirmBookingResult {
  session: AdvisorySession;
  calendarEventId: string;
}

async function findOwnerIdFallback(): Promise<string> {
  // Fallback: o owner é o admin Joel. Se houver múltiplos admins, refinar caller.
  // Estratégia: pega user com role=admin (seed garante que existe).
  const { users } = await import('@/server/db/schema');
  const [admin] = await db.select().from(users).where(eq(users.role, 'admin')).limit(1);
  if (!admin) throw new Error('[advisory] nenhum admin (owner) encontrado');
  return admin.id;
}

export async function confirmBooking(input: ConfirmBookingInput): Promise<ConfirmBookingResult> {
  return await db.transaction(async (tx) => {
    const [session] = await tx
      .select()
      .from(advisory_sessions)
      .where(eq(advisory_sessions.id, input.sessionId))
      .limit(1);
    if (!session) throw new Error('[advisory] session não encontrada');
    if (session.status === 'completed' || session.status === 'cancelled') {
      throw new Error('[advisory] session já finalizada');
    }

    const duration = session.duration_min ?? ADVISORY_DEFAULTS.SESSION_DURATION_MIN;
    const endsAt = addMinutes(input.startsAt, duration);

    const ownerId = input.ownerId ?? (await findOwnerIdFallback());

    // Sanity check: detecta colisão direta no hub (defense-in-depth — UI já filtra slots).
    const colliding = await tx
      .select()
      .from(calendar_events)
      .where(and(eq(calendar_events.owner_id, ownerId), isNull(calendar_events.cancelled_at)));
    for (const ev of colliding) {
      if (rangesOverlap(input.startsAt, endsAt, ev.starts_at, ev.ends_at)) {
        throw new Error('[advisory] slot indisponível (colisão com evento existente)');
      }
    }

    const meetingUrl = generateJitsiUrl(session.id);
    const icsUid = `${session.id}@joelburigo.com.br`;

    // Inline create calendar_event (não usa createCalendarEvent pra ficar transacional)
    const eventId = ulid();
    const now = new Date();
    await tx.insert(calendar_events).values({
      id: eventId,
      owner_id: ownerId,
      source: 'advisory_session',
      source_id: session.id,
      title: 'Advisory · Sessão',
      description_md: session.client_preparation_md ?? null,
      starts_at: input.startsAt,
      ends_at: endsAt,
      timezone: input.clientTimezone || DEFAULT_TZ,
      meeting_url: meetingUrl,
      visibility: 'private',
      attendees:
        input.attendeeEmail !== undefined
          ? [{ email: input.attendeeEmail, name: input.attendeeName }]
          : [],
      reminder_offsets: ADVISORY_DEFAULTS.REMINDER_OFFSETS_MIN,
      sync_status: 'pending_push',
      created_at: now,
      updated_at: now,
    });

    await tx
      .update(advisory_sessions)
      .set({
        scheduled_at: input.startsAt,
        booked_at: now,
        cliente_timezone: input.clientTimezone,
        meeting_url: meetingUrl,
        calendar_event_id: eventId,
        ics_uid: icsUid,
        status: 'scheduled',
        updated_at: now,
      })
      .where(eq(advisory_sessions.id, session.id));

    const [updated] = await tx
      .select()
      .from(advisory_sessions)
      .where(eq(advisory_sessions.id, session.id))
      .limit(1);

    // Enfileira side-effects pós-commit (queue.enqueue não participa da TX, mas ok — idempotente).
    await queue.enqueue('PUSH_CALENDAR_EVENT', { eventId });
    await queue.enqueue(SEND_BOOKING_CONFIRMATION, {
      sessionId: session.id,
      eventId,
    });
    await queue.enqueue(SCHEDULE_REMINDERS, { sessionId: session.id, eventId });

    return { session: updated!, calendarEventId: eventId };
  });
}

export interface ListUserSessionsOptions {
  includeCompleted?: boolean;
}

export async function listUserSessions(
  userId: string,
  opts?: ListUserSessionsOptions
): Promise<AdvisorySession[]> {
  if (opts?.includeCompleted) {
    return await db
      .select()
      .from(advisory_sessions)
      .where(eq(advisory_sessions.user_id, userId))
      .orderBy(asc(advisory_sessions.created_at));
  }
  return await db
    .select()
    .from(advisory_sessions)
    .where(
      and(
        eq(advisory_sessions.user_id, userId),
        ne(advisory_sessions.status, 'completed'),
        ne(advisory_sessions.status, 'cancelled')
      )
    )
    .orderBy(asc(advisory_sessions.created_at));
}

export async function getSessionForUser(
  userId: string,
  sessionId: string
): Promise<AdvisorySession | null> {
  const [row] = await db
    .select()
    .from(advisory_sessions)
    .where(and(eq(advisory_sessions.id, sessionId), eq(advisory_sessions.user_id, userId)))
    .limit(1);
  return row ?? null;
}

export async function cancelSession(sessionId: string, reason?: string): Promise<void> {
  const [session] = await db
    .select()
    .from(advisory_sessions)
    .where(eq(advisory_sessions.id, sessionId))
    .limit(1);
  if (!session) return;
  if (session.status === 'cancelled' || session.status === 'completed') return;

  const now = new Date();
  await db
    .update(advisory_sessions)
    .set({
      status: 'cancelled',
      cancelled_at: now,
      cancellation_reason: reason ?? null,
      updated_at: now,
    })
    .where(eq(advisory_sessions.id, sessionId));

  if (session.calendar_event_id) {
    await cancelCalendarEvent(session.calendar_event_id, reason);
  }
}

export interface RequestRescheduleInput {
  sessionId: string;
  requestedByUserId: string;
  proposedSlots: Array<{ startsAt: Date; timezone: string }>;
  reason?: string;
}

export async function requestReschedule(
  input: RequestRescheduleInput
): Promise<{ requestId: string }> {
  if (input.proposedSlots.length === 0 || input.proposedSlots.length > 3) {
    throw new Error('[advisory] reschedule precisa de 1 a 3 slots propostos');
  }
  const requestId = ulid();
  await db.insert(session_reschedule_requests).values({
    id: requestId,
    advisory_session_id: input.sessionId,
    requested_by_user_id: input.requestedByUserId,
    proposed_slots: input.proposedSlots.map((s) => ({
      starts_at: s.startsAt.toISOString(),
      timezone: s.timezone,
    })),
    reason: input.reason ?? null,
    status: 'pending',
    created_at: new Date(),
  });
  return { requestId };
}

export interface ApproveRescheduleInput {
  requestId: string;
  chosenStartsAt: Date;
  adminNote?: string;
}

export async function approveReschedule(input: ApproveRescheduleInput): Promise<void> {
  await db.transaction(async (tx) => {
    const [request] = await tx
      .select()
      .from(session_reschedule_requests)
      .where(eq(session_reschedule_requests.id, input.requestId))
      .limit(1);
    if (!request) throw new Error('[advisory] reschedule request não encontrada');
    if (request.status !== 'pending') throw new Error('[advisory] request já resolvida');

    const [session] = await tx
      .select()
      .from(advisory_sessions)
      .where(eq(advisory_sessions.id, request.advisory_session_id))
      .limit(1);
    if (!session) throw new Error('[advisory] session da request não encontrada');

    // Cancela evento antigo
    const oldEventId = session.calendar_event_id;
    const duration = session.duration_min ?? ADVISORY_DEFAULTS.SESSION_DURATION_MIN;
    const endsAt = addMinutes(input.chosenStartsAt, duration);
    const now = new Date();

    if (oldEventId) {
      await tx
        .update(calendar_events)
        .set({
          cancelled_at: now,
          cancellation_reason: 'rescheduled',
          sync_status: 'pending_push',
          updated_at: now,
        })
        .where(eq(calendar_events.id, oldEventId));
    }

    // Cria novo evento (espelha owner do antigo se houver)
    const ownerId = oldEventId
      ? (await tx.select().from(calendar_events).where(eq(calendar_events.id, oldEventId)).limit(1))[0]
          ?.owner_id ?? (await findOwnerIdFallback())
      : await findOwnerIdFallback();

    const newEventId = ulid();
    await tx.insert(calendar_events).values({
      id: newEventId,
      owner_id: ownerId,
      source: 'advisory_session',
      source_id: session.id,
      title: 'Advisory · Sessão',
      description_md: session.client_preparation_md ?? null,
      starts_at: input.chosenStartsAt,
      ends_at: endsAt,
      timezone: session.cliente_timezone ?? DEFAULT_TZ,
      meeting_url: session.meeting_url,
      visibility: 'private',
      attendees: [],
      reminder_offsets: ADVISORY_DEFAULTS.REMINDER_OFFSETS_MIN,
      sync_status: 'pending_push',
      created_at: now,
      updated_at: now,
    });

    await tx
      .update(advisory_sessions)
      .set({
        scheduled_at: input.chosenStartsAt,
        calendar_event_id: newEventId,
        updated_at: now,
      })
      .where(eq(advisory_sessions.id, session.id));

    await tx
      .update(session_reschedule_requests)
      .set({
        status: 'accepted',
        resolution_event_id: newEventId,
        admin_note: input.adminNote ?? null,
        resolved_at: now,
      })
      .where(eq(session_reschedule_requests.id, input.requestId));

    if (oldEventId) {
      await queue.enqueue('PUSH_CALENDAR_EVENT', { eventId: oldEventId });
    }
    await queue.enqueue('PUSH_CALENDAR_EVENT', { eventId: newEventId });
    await queue.enqueue(SEND_BOOKING_CONFIRMATION, { sessionId: session.id, eventId: newEventId });
    await queue.enqueue(SCHEDULE_REMINDERS, { sessionId: session.id, eventId: newEventId });
  });
}

export async function rejectReschedule(requestId: string, adminNote?: string): Promise<void> {
  await db
    .update(session_reschedule_requests)
    .set({
      status: 'rejected',
      admin_note: adminNote ?? null,
      resolved_at: new Date(),
    })
    .where(eq(session_reschedule_requests.id, requestId));
}
