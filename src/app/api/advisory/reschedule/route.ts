import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from '@/server/services/session';
import {
  getSessionForUser,
  requestReschedule,
} from '@/server/services/advisory/sessions';

export const runtime = 'nodejs';

const bodySchema = z.object({
  sessionId: z.string().min(1),
  proposedSlots: z
    .array(
      z.object({
        startsAt: z.string().datetime(),
        timezone: z.string().min(1),
      })
    )
    .min(1)
    .max(3),
  reason: z.string().max(2000).optional(),
});

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

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

  const { sessionId, proposedSlots, reason } = parsed.data;

  const session = await getSessionForUser(user.id, sessionId);
  if (!session) {
    return NextResponse.json({ ok: false, error: 'session_not_found' }, { status: 404 });
  }
  if (session.status === 'cancelled' || session.status === 'completed') {
    return NextResponse.json({ ok: false, error: 'session_finalized' }, { status: 409 });
  }

  try {
    const result = await requestReschedule({
      sessionId: session.id,
      requestedByUserId: user.id,
      proposedSlots: proposedSlots.map((s) => ({
        startsAt: new Date(s.startsAt),
        timezone: s.timezone,
      })),
      reason,
    });
    return NextResponse.json({ ok: true, requestId: result.requestId });
  } catch (err) {
    console.error('[api/advisory/reschedule]', err);
    const msg = err instanceof Error ? err.message : 'unknown_error';
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
