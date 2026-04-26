import 'server-only';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/server/services/session';
import { getContactDetail, updateContactNotes } from '@/server/services/admin';

const Body = z.object({ notes_md: z.string().max(20_000) });

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  await requireAdmin();
  const { id } = await ctx.params;
  const detail = await getContactDetail(id);
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
  await updateContactNotes(id, parsed.data.notes_md, admin.id);
  return NextResponse.json({ ok: true });
}
