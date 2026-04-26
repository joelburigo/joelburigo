import 'server-only';
import { NextResponse, type NextRequest } from 'next/server';
import { env } from '@/env';
import { markRecordingReady } from '@/server/services/mentorias';

export const runtime = 'nodejs';

/**
 * CF Stream webhook receiver.
 *
 * Eventos relevantes:
 *  - `live_input.recording.ready` — replay HLS pronto pra publicar no /app/sessao/:id
 *  - `live_input.connected` / `disconnected` — opcional pra atualizar live_status
 *
 * Auth: header `cf-webhook-auth` (configurado no painel CF) deve bater com
 * `CF_API_TOKEN` (reuse pra evitar mais um secret). Se não setado em dev, aceita.
 *
 * Sempre responde 200 (CF retenta em erro) — incidências viram log.
 */

interface CfWebhookPayload {
  eventType?: string;
  liveInputId?: string;
  videoUid?: string;
  // payload bruto pode trazer outras shapes
  data?: { liveInputId?: string; videoUid?: string };
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get('cf-webhook-auth');
  if (env.CF_API_TOKEN && auth && auth !== env.CF_API_TOKEN) {
    console.warn('[cf-stream webhook] auth mismatch — ignorando');
    return NextResponse.json({ ok: true, ignored: true });
  }

  let payload: CfWebhookPayload = {};
  try {
    payload = (await req.json()) as CfWebhookPayload;
  } catch {
    console.warn('[cf-stream webhook] body inválido');
    return NextResponse.json({ ok: true });
  }

  const liveInputId = payload.liveInputId ?? payload.data?.liveInputId;
  const videoUid = payload.videoUid ?? payload.data?.videoUid;

  if (!liveInputId || !videoUid) {
    console.warn('[cf-stream webhook] payload sem liveInputId/videoUid', payload);
    return NextResponse.json({ ok: true });
  }

  try {
    const updated = await markRecordingReady({ cfLiveInputId: liveInputId, videoUid });
    console.log(`[cf-stream webhook] recording.ready ${liveInputId} → ${updated} mentoria(s)`);
  } catch (err) {
    console.error('[cf-stream webhook] markRecordingReady falhou', err);
  }

  return NextResponse.json({ ok: true });
}
