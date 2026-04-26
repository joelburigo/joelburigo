import 'server-only';
import { NextResponse, type NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/server/db/client';
import { calendar_accounts } from '@/server/db/schema';
import { queue } from '@/server/lib/queue';
import { env } from '@/env';

/**
 * POST /api/calendar/google/webhook
 *
 * Endpoint público chamado pelo Google quando há mudanças no calendar
 * (push notifications). Headers relevantes:
 *  - X-Goog-Channel-Id: id que registramos
 *  - X-Goog-Channel-Token: precisa bater com env.GOOGLE_WEBHOOK_TOKEN
 *  - X-Goog-Resource-Id: identifica o calendar
 *  - X-Goog-Resource-State: sync · exists · not_exists
 *
 * Resposta deve ser <30s (Google fecha conexão). Por isso só enfileira
 * o pull e retorna 200 OK imediatamente.
 */
export async function POST(req: NextRequest) {
  const channelId = req.headers.get('x-goog-channel-id');
  const channelToken = req.headers.get('x-goog-channel-token');
  const resourceState = req.headers.get('x-goog-resource-state');

  // Valida token: silently retorna 401 se inválido (defense-in-depth — não vaza info)
  if (!env.GOOGLE_WEBHOOK_TOKEN || channelToken !== env.GOOGLE_WEBHOOK_TOKEN) {
    return new NextResponse(null, { status: 401 });
  }

  // Initial 'sync' notification — Google manda 1× quando a watch é criada
  if (resourceState === 'sync') {
    return new NextResponse(null, { status: 200 });
  }

  if (!channelId) {
    return new NextResponse(null, { status: 400 });
  }

  try {
    const [account] = await db
      .select({ id: calendar_accounts.id })
      .from(calendar_accounts)
      .where(eq(calendar_accounts.webhook_channel_id, channelId))
      .limit(1);

    if (!account) {
      // Channel desconhecido — possivelmente stale. 200 pra Google parar de retentar.
      console.warn('[calendar/webhook] channel não encontrado', { channelId });
      return new NextResponse(null, { status: 200 });
    }

    await queue.enqueue('PULL_GOOGLE_DELTA', { accountId: account.id });
  } catch (err) {
    console.error('[calendar/webhook] enqueue falhou', err);
    // 200 mesmo assim — Google retentaria e a próxima notificação cobre
  }

  return new NextResponse(null, { status: 200 });
}
