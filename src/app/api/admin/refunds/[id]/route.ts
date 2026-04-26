import 'server-only';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/server/services/session';
import { processRefundAction, updateRefundNote } from '@/server/services/admin';

const Body = z.object({
  action: z.enum(['approve', 'deny', 'convert', 'update_note']),
  admin_note: z.string().max(2000).optional(),
  denied_reason: z.string().max(500).optional(),
});

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  const { id } = await ctx.params;
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }
  if (parsed.data.action === 'update_note') {
    await updateRefundNote(id, parsed.data.admin_note ?? '', admin.id);
  } else {
    await processRefundAction(id, parsed.data.action, admin.id, {
      adminNote: parsed.data.admin_note,
      deniedReason: parsed.data.denied_reason,
    });
  }
  return NextResponse.json({ ok: true });
}
