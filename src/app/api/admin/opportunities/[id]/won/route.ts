import 'server-only';
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/server/services/session';
import { markOpportunityWon } from '@/server/services/admin';

export async function POST(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  const { id } = await ctx.params;
  try {
    await markOpportunityWon(id, admin.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'failed' },
      { status: 400 }
    );
  }
}
