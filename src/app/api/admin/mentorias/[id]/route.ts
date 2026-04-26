import 'server-only';
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/server/services/session';
import { getDefaultTeam } from '@/server/services/crm';
import {
  updateMentoria,
  deleteMentoria,
  markLive,
  markEnded,
} from '@/server/services/mentorias';

export const runtime = 'nodejs';

const patchSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  topic: z.string().max(2000).nullable().optional(),
  scheduled_at: z.string().datetime().optional(),
  duration_min: z.number().int().min(15).max(600).optional(),
  action: z.enum(['mark_live', 'mark_ended']).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  const { id } = await params;

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: 'validation', issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    if (parsed.data.action === 'mark_live') {
      await markLive(id);
      return NextResponse.json({ ok: true });
    }
    if (parsed.data.action === 'mark_ended') {
      await markEnded(id);
      return NextResponse.json({ ok: true });
    }

    let teamId: string | null = null;
    try {
      teamId = (await getDefaultTeam()).id;
    } catch {}

    const updated = await updateMentoria(
      id,
      {
        title: parsed.data.title,
        topic: parsed.data.topic === undefined ? undefined : parsed.data.topic,
        scheduled_at: parsed.data.scheduled_at ? new Date(parsed.data.scheduled_at) : undefined,
        duration_min: parsed.data.duration_min,
      },
      { ownerId: admin.id, teamId }
    );
    if (!updated) {
      return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });
    }
    return NextResponse.json({ ok: true, mentoria: updated });
  } catch (err) {
    console.error('[api/admin/mentorias PATCH]', err);
    return NextResponse.json({ ok: false, error: 'update_failed' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin();
  const { id } = await params;
  try {
    const ok = await deleteMentoria(id);
    if (!ok) return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[api/admin/mentorias DELETE]', err);
    return NextResponse.json({ ok: false, error: 'delete_failed' }, { status: 500 });
  }
}
