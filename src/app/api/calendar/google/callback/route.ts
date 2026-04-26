import 'server-only';
import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { requireAdmin } from '@/server/services/session';
import {
  exchangeCode,
  saveTokensForUser,
} from '@/server/services/calendar/google-oauth';
import {
  registerWebhookChannel,
} from '@/server/services/calendar/google-sync';
import { queue } from '@/server/lib/queue';
import { env } from '@/env';

const STATE_COOKIE = 'gcal_oauth_state';

function redirectTo(path: string): NextResponse {
  const url = new URL(path, env.PUBLIC_SITE_URL);
  return NextResponse.redirect(url, { status: 302 });
}

/**
 * GET /api/calendar/google/callback
 *
 * Recebe o redirect do Google após consent.
 * Valida state, troca code por tokens, persiste, registra webhook,
 * dispara delta sync inicial em background.
 */
export async function GET(req: NextRequest) {
  const admin = await requireAdmin();

  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const errorParam = url.searchParams.get('error');

  const store = await cookies();
  const expectedState = store.get(STATE_COOKIE)?.value;
  // Sempre limpa o cookie (single-use)
  store.delete(STATE_COOKIE);

  if (errorParam) {
    return redirectTo(
      `/admin/integrations/google?status=error&reason=${encodeURIComponent(errorParam)}`
    );
  }

  if (!code) {
    return redirectTo('/admin/integrations/google?status=error&reason=missing_code');
  }

  if (!state || !expectedState || state !== expectedState) {
    return redirectTo('/admin/integrations/google?status=error&reason=state_mismatch');
  }

  try {
    const exchanged = await exchangeCode(code);
    const accountId = await saveTokensForUser(admin.id, exchanged);

    // Registra webhook (best-effort — sem GOOGLE_WEBHOOK_TOKEN faz no-op)
    try {
      await registerWebhookChannel(accountId);
    } catch (err) {
      console.error('[calendar/callback] registerWebhookChannel falhou', err);
    }

    // Pull inicial em background via queue (worker faz delta-sync)
    await queue.enqueue('PULL_GOOGLE_DELTA', { accountId });

    return redirectTo('/admin/integrations/google?status=connected');
  } catch (err) {
    console.error('[calendar/callback] erro no exchange', err);
    return redirectTo(
      `/admin/integrations/google?status=error&reason=${encodeURIComponent(
        err instanceof Error ? err.message : 'exchange_failed'
      )}`
    );
  }
}
