import 'server-only';
import { NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { db } from '@/server/db/client';
import { calendar_accounts } from '@/server/db/schema';
import { requireAdmin } from '@/server/services/session';
import { disconnectGoogleAccount } from '@/server/services/calendar/google-oauth';
import { unregisterWebhookChannel } from '@/server/services/calendar/google-sync';

/**
 * POST /api/admin/calendar/disconnect
 * Stop webhook + revoke + soft delete da calendar_account ativa.
 */
export async function POST() {
  const admin = await requireAdmin();

  const [account] = await db
    .select()
    .from(calendar_accounts)
    .where(and(eq(calendar_accounts.user_id, admin.id), eq(calendar_accounts.status, 'active')))
    .limit(1);

  if (!account) {
    return NextResponse.json({ ok: true, alreadyDisconnected: true });
  }

  // Unregister webhook (best-effort) antes de revogar tokens
  try {
    await unregisterWebhookChannel(account.id);
  } catch (err) {
    console.warn('[admin/calendar/disconnect] unregisterWebhook falhou', err);
  }

  await disconnectGoogleAccount(admin.id);
  return NextResponse.json({ ok: true });
}
