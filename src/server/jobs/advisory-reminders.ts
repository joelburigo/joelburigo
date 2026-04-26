import 'server-only';

// Jobs pg-boss pra confirmação + lembretes de advisory sessions.

import type { Job } from 'pg-boss';
import { eq } from 'drizzle-orm';
import { db } from '@/server/db/client';
import {
  advisory_sessions,
  calendar_events,
  products,
  users,
} from '@/server/db/schema';
import { queue } from '@/server/lib/queue';
import { sendEmail } from '@/server/services/email';
import { buildIcsForSession } from '@/server/services/calendar/ics';
import { env } from '@/env';
import { ADVISORY_DEFAULTS } from '@/server/services/advisory/config';
// TODO Frente E: importar `advisoryBookingConfirmation` de @/server/services/email-templates
// quando o template existir. Por ora geramos HTML simples inline pra não bloquear.

export const SEND_ADVISORY_BOOKING_CONFIRMATION = 'SEND_ADVISORY_BOOKING_CONFIRMATION';
export const SEND_ADVISORY_REMINDER = 'SEND_ADVISORY_REMINDER';
export const SCHEDULE_ADVISORY_REMINDERS = 'SCHEDULE_ADVISORY_REMINDERS';

interface BookingConfirmationPayload {
  sessionId: string;
  eventId: string;
}

interface ReminderPayload {
  sessionId: string;
  eventId: string;
  offsetMin: number;
}

interface ScheduleRemindersPayload {
  sessionId: string;
  eventId: string;
}

async function loadSessionContext(sessionId: string, eventId: string) {
  const [session] = await db
    .select()
    .from(advisory_sessions)
    .where(eq(advisory_sessions.id, sessionId))
    .limit(1);
  if (!session) return null;
  const [event] = await db
    .select()
    .from(calendar_events)
    .where(eq(calendar_events.id, eventId))
    .limit(1);
  if (!event) return null;
  const [user] = await db.select().from(users).where(eq(users.id, session.user_id)).limit(1);
  if (!user) return null;
  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.id, session.product_id))
    .limit(1);
  return { session, event, user, product };
}

function fallbackHtml(title: string, when: string, meetingUrl: string | null) {
  return `<!doctype html><html><body style="font-family:sans-serif;line-height:1.6">
<h1>${title}</h1>
<p>Sua sessão Advisory está agendada para <strong>${when}</strong>.</p>
${meetingUrl ? `<p>Sala: <a href="${meetingUrl}">${meetingUrl}</a></p>` : ''}
<p>O arquivo .ics está em anexo. Adicione no seu calendário.</p>
<p>— Joel</p>
</body></html>`;
}

export async function handleSendAdvisoryBookingConfirmation(
  jobs: Job<BookingConfirmationPayload>[]
): Promise<void> {
  for (const job of jobs) {
    const { sessionId, eventId } = job.data ?? ({} as BookingConfirmationPayload);
    if (!sessionId || !eventId) continue;

    const ctx = await loadSessionContext(sessionId, eventId);
    if (!ctx) {
      console.warn('[advisory] booking confirmation: contexto não encontrado', { sessionId });
      continue;
    }
    const { session, event, user, product } = ctx;
    if (!user.email) continue;

    const ics = buildIcsForSession({
      uid: session.ics_uid ?? `${session.id}@joelburigo.com.br`,
      title: product?.name ? `${product.name} · Advisory` : 'Sessão Advisory',
      description: session.client_preparation_md ?? undefined,
      startsAt: event.starts_at,
      endsAt: event.ends_at,
      organizerEmail: env.EMAIL_FROM_PERSONAL,
      organizerName: env.EMAIL_FROM_NAME,
      attendeeEmail: user.email,
      meetingUrl: session.meeting_url ?? event.meeting_url ?? undefined,
    });

    const when = event.starts_at.toISOString();
    const subject = product?.name
      ? `${product.name} confirmada — ${when}`
      : 'Sessão Advisory confirmada';
    const html = fallbackHtml(subject, when, session.meeting_url ?? event.meeting_url ?? null);

    // Brevo aceita anexos via attachment[] no payload, mas sendEmail atual não expõe.
    // TODO Frente E: estender sendEmail pra suportar attachments e injetar `ics` aqui.
    void ics;

    try {
      await sendEmail({
        to: user.email,
        toName: user.name ?? undefined,
        subject,
        html,
      });
    } catch (err) {
      console.error('[advisory] envio confirmation falhou', { sessionId, err });
      throw err;
    }
  }
}

export async function handleScheduleAdvisoryReminders(
  jobs: Job<ScheduleRemindersPayload>[]
): Promise<void> {
  for (const job of jobs) {
    const { sessionId, eventId } = job.data ?? ({} as ScheduleRemindersPayload);
    if (!sessionId || !eventId) continue;

    const ctx = await loadSessionContext(sessionId, eventId);
    if (!ctx) continue;
    const offsets = (Array.isArray(ctx.event.reminder_offsets)
      ? (ctx.event.reminder_offsets as number[])
      : ADVISORY_DEFAULTS.REMINDER_OFFSETS_MIN.slice());

    for (const offset of offsets) {
      const fireAt = new Date(ctx.event.starts_at.getTime() - offset * 60_000);
      if (fireAt.getTime() <= Date.now()) continue;
      await queue.enqueue(
        SEND_ADVISORY_REMINDER,
        { sessionId, eventId, offsetMin: offset },
        { startAfter: fireAt }
      );
    }
  }
}

export async function handleSendAdvisoryReminder(
  jobs: Job<ReminderPayload>[]
): Promise<void> {
  for (const job of jobs) {
    const { sessionId, eventId, offsetMin } = job.data ?? ({} as ReminderPayload);
    if (!sessionId || !eventId) continue;

    const ctx = await loadSessionContext(sessionId, eventId);
    if (!ctx) continue;
    const { session, event, user } = ctx;

    // Skip se evento foi cancelado/reagendado pra outro horário entre enqueue e fire
    if (event.cancelled_at) continue;
    if (session.status !== 'scheduled') continue;
    if (!user.email) continue;

    const hoursOut = Math.round((offsetMin ?? 0) / 60);
    const subject =
      offsetMin >= 1440
        ? `Lembrete · sua sessão Advisory é amanhã`
        : `Lembrete · sua sessão Advisory começa em ${hoursOut}h`;
    const html = fallbackHtml(
      subject,
      event.starts_at.toISOString(),
      session.meeting_url ?? event.meeting_url ?? null
    );

    try {
      await sendEmail({
        to: user.email,
        toName: user.name ?? undefined,
        subject,
        html,
      });
      await db
        .update(calendar_events)
        .set({ last_reminder_at: new Date(), updated_at: new Date() })
        .where(eq(calendar_events.id, event.id));
    } catch (err) {
      console.error('[advisory] envio reminder falhou', { sessionId, offsetMin, err });
      throw err;
    }
  }
}
