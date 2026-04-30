import 'server-only';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/server/services/session';
import { deleteActivity, updateActivity } from '@/server/services/crm';
import { logAudit } from '@/server/services/admin';

const PatchBody = z.object({
  subject: z.string().min(1).max(500).optional(),
  body_md: z.string().nullable().optional(),
  scheduled_for: z.string().datetime().nullable().optional(),
  completed_at: z.string().datetime().nullable().optional(),
  // helper: client can send `mark_completed: true` para setar completed_at = now
  mark_completed: z.boolean().optional(),
});

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  const { id } = await ctx.params;
  const json = await req.json().catch(() => null);
  const parsed = PatchBody.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'invalid_body', issues: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const body = parsed.data;

  try {
    const patch: Parameters<typeof updateActivity>[1] = {};
    if (body.subject !== undefined) patch.subject = body.subject;
    if (body.body_md !== undefined) patch.body_md = body.body_md;
    if (body.scheduled_for !== undefined) {
      patch.scheduled_for = body.scheduled_for ? new Date(body.scheduled_for) : null;
    }
    if (body.completed_at !== undefined) {
      patch.completed_at = body.completed_at ? new Date(body.completed_at) : null;
    } else if (body.mark_completed) {
      patch.completed_at = new Date();
    }

    const updated = await updateActivity(id, patch);
    await logAudit({
      adminId: admin.id,
      action: 'activity.update',
      targetTable: 'activities',
      targetId: id,
      payload: body as Record<string, unknown>,
    });
    return NextResponse.json({ activity: updated });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'failed' },
      { status: 400 }
    );
  }
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  const { id } = await ctx.params;
  try {
    await deleteActivity(id);
    await logAudit({
      adminId: admin.id,
      action: 'activity.delete',
      targetTable: 'activities',
      targetId: id,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'failed' },
      { status: 400 }
    );
  }
}
