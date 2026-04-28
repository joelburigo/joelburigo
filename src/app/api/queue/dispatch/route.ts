import 'server-only';
import { NextResponse } from 'next/server';
import { dispatchQueueJob } from '@/server/jobs/dispatch';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Endpoint chamado pelo `custom-worker.ts` no queue handler do CF.
 * Cada mensagem do CF Queue chega aqui via POST com body { job, data }.
 */
export async function POST(req: Request) {
  const secret = req.headers.get('x-cron-secret');
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as
    | { job?: string; data?: unknown }
    | null;
  if (!body?.job) {
    return NextResponse.json({ error: 'invalid_payload' }, { status: 400 });
  }

  try {
    await dispatchQueueJob(body.job, body.data);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(`[/api/queue/dispatch] ${body.job} falhou:`, err);
    return NextResponse.json({ error: 'job_failed', job: body.job }, { status: 500 });
  }
}
