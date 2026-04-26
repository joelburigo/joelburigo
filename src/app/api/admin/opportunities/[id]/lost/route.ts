import 'server-only';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/server/services/session';
import { markOpportunityLost } from '@/server/services/admin';

const Body = z.object({ reason: z.string().min(1).max(500) });

export async function POST(
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
  try {
    await markOpportunityLost(id, parsed.data.reason, admin.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'failed' },
      { status: 400 }
    );
  }
}
