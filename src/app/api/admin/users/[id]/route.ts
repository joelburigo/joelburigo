import 'server-only';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/server/services/session';
import { getUserDetail, updateUserRole } from '@/server/services/admin';

const Body = z.object({ role: z.enum(['admin', 'user']) });

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  await requireAdmin();
  const { id } = await ctx.params;
  const detail = await getUserDetail(id);
  if (!detail) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  return NextResponse.json(detail);
}

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
  await updateUserRole(id, parsed.data.role, admin.id);
  return NextResponse.json({ ok: true });
}
