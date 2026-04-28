import 'server-only';
import { NextResponse } from 'next/server';
import { handleScheduled } from '@/server/jobs/scheduled';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Endpoint chamado pelo `custom-worker.ts` no scheduled handler do CF.
 * Dispatcher real está em `src/server/jobs/scheduled.ts` (importado aqui
 * dentro do bundle OpenNext, com react-server condition correta).
 */
export async function POST(req: Request) {
  const secret = req.headers.get('x-cron-secret');
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as
    | { cron?: string; scheduledTime?: number }
    | null;
  if (!body?.cron || !body.scheduledTime) {
    return NextResponse.json({ error: 'invalid_payload' }, { status: 400 });
  }

  try {
    await handleScheduled({ cron: body.cron, scheduledTime: body.scheduledTime }, {});
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[/api/cron] handler falhou:', err);
    return NextResponse.json({ error: 'handler_failed' }, { status: 500 });
  }
}
