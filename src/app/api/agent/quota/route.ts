import 'server-only';
import { NextResponse, type NextRequest } from 'next/server';
import { getCurrentUser } from '@/server/services/session';
import { checkQuota } from '@/server/services/quota';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/agent/quota
 * Retorna status atual de quota mensal pra UI mostrar soft-warn / hard-cap.
 */
export async function GET(_req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const q = await checkQuota(user.id);
  const percent = q.limit > 0 ? Math.min(100, Math.round((q.usedThisMonth / q.limit) * 100)) : 0;
  return NextResponse.json({
    ok: q.ok,
    warning: q.warning,
    used: q.usedThisMonth,
    limit: q.limit,
    remaining: q.remaining,
    percent,
    resetAt: q.resetAt.toISOString(),
  });
}
