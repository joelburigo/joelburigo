import 'server-only';
import { NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { db } from '@/server/db/client';
import { calendar_accounts } from '@/server/db/schema';
import { requireAdmin } from '@/server/services/session';
import { pullDeltaFromGoogle } from '@/server/services/calendar/google-sync';
import { queue } from '@/server/lib/queue';

const SYNC_TIMEOUT_MS = 25_000;

/**
 * POST /api/admin/calendar/sync
 *
 * Roda pullDeltaFromGoogle síncrono pra dar feedback imediato no admin UI.
 * Se demorar mais que 25s, cai num fallback que enfileira pelo worker.
 */
export async function POST() {
  const admin = await requireAdmin();

  const [account] = await db
    .select()
    .from(calendar_accounts)
    .where(and(eq(calendar_accounts.user_id, admin.id), eq(calendar_accounts.status, 'active')))
    .limit(1);

  if (!account) {
    return NextResponse.json({ error: 'no_active_account' }, { status: 404 });
  }

  try {
    const result = await Promise.race([
      pullDeltaFromGoogle(account.id),
      new Promise<{ added: number; updated: number; deleted: number; timeout: true }>((resolve) =>
        setTimeout(
          () => resolve({ added: 0, updated: 0, deleted: 0, timeout: true }),
          SYNC_TIMEOUT_MS
        )
      ),
    ]);

    if ('timeout' in result && result.timeout) {
      // Enfileira o resto via worker
      await queue.enqueue('PULL_GOOGLE_DELTA', { accountId: account.id });
      return NextResponse.json({
        ok: true,
        async: true,
        message: 'sync iniciado em background',
      });
    }

    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error('[admin/calendar/sync]', err);
    return NextResponse.json(
      { error: 'sync_failed', message: err instanceof Error ? err.message : 'unknown' },
      { status: 500 }
    );
  }
}
