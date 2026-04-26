import 'server-only';
import { NextResponse, type NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/server/db/client';
import { session_reschedule_requests } from '@/server/db/schema';
import { requireAdmin } from '@/server/services/session';
import {
  approveReschedule,
  rejectReschedule,
} from '@/server/services/advisory/sessions';

const bodySchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('approve'),
    chosenStartsAt: z.string().datetime(),
    adminNote: z.string().max(2000).optional().nullable(),
  }),
  z.object({
    action: z.literal('reject'),
    adminNote: z.string().max(2000).optional().nullable(),
  }),
]);

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin();
  const { id } = await params;

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'validation', issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const [request] = await db
    .select()
    .from(session_reschedule_requests)
    .where(eq(session_reschedule_requests.id, id))
    .limit(1);
  if (!request) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  if (request.status !== 'pending') {
    return NextResponse.json({ error: 'already_resolved', status: request.status }, { status: 409 });
  }

  try {
    if (parsed.data.action === 'approve') {
      await approveReschedule({
        requestId: id,
        chosenStartsAt: new Date(parsed.data.chosenStartsAt),
        adminNote: parsed.data.adminNote ?? undefined,
      });
    } else {
      await rejectReschedule(id, parsed.data.adminNote ?? undefined);
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[admin/advisory/reschedule]', err);
    return NextResponse.json(
      { error: 'action_failed', message: err instanceof Error ? err.message : 'unknown' },
      { status: 500 }
    );
  }
}
