import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@/server/db/client';
import { advisory_sessions, users } from '@/server/db/schema';
import { confirmBooking } from '@/server/services/advisory/sessions';

export const runtime = 'nodejs';

const bodySchema = z.object({
  sessionId: z.string().min(1),
  startsAt: z.string().datetime(),
  clientTimezone: z.string().min(1),
});

export async function POST(req: NextRequest) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: 'validation', issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { sessionId, startsAt, clientTimezone } = parsed.data;

  // Carrega session + user (sem login obrigatório — link único é o gate).
  const [session] = await db
    .select()
    .from(advisory_sessions)
    .where(eq(advisory_sessions.id, sessionId))
    .limit(1);

  if (!session) {
    return NextResponse.json({ ok: false, error: 'session_not_found' }, { status: 404 });
  }
  if (session.status !== 'pending_booking') {
    return NextResponse.json({ ok: false, error: 'session_not_bookable' }, { status: 409 });
  }
  if (session.booking_token_expires_at && session.booking_token_expires_at.getTime() < Date.now()) {
    return NextResponse.json({ ok: false, error: 'booking_token_expired' }, { status: 410 });
  }

  const [user] = await db.select().from(users).where(eq(users.id, session.user_id)).limit(1);
  if (!user) {
    // Defesa: session sempre tem user (purchase cria via ensureUserByEmail).
    return NextResponse.json({ ok: false, error: 'user_not_found' }, { status: 400 });
  }

  try {
    const result = await confirmBooking({
      sessionId: session.id,
      startsAt: new Date(startsAt),
      clientTimezone,
      attendeeEmail: user.email,
      attendeeName: user.name ?? undefined,
    });
    return NextResponse.json({
      ok: true,
      sessionId: result.session.id,
      calendarEventId: result.calendarEventId,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown_error';
    if (msg.includes('slot indisponível') || msg.includes('colisão')) {
      return NextResponse.json(
        {
          ok: false,
          error:
            'Esse horário acabou de ser ocupado por outro agendamento. Recarregue a página e escolha outro.',
        },
        { status: 409 }
      );
    }
    if (msg.includes('já finalizada')) {
      return NextResponse.json({ ok: false, error: 'session_finalized' }, { status: 409 });
    }
    console.error('[api/advisory/booking]', err);
    return NextResponse.json({ ok: false, error: 'internal_error' }, { status: 500 });
  }
}
