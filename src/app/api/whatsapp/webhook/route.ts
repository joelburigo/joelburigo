import { NextResponse } from 'next/server';
import { and, eq, sql } from 'drizzle-orm';
import { db } from '@/server/db/client';
import { contacts, activities, form_submissions } from '@/server/db/schema';
import { ulid } from '@/server/lib/ulid';
import { env } from '@/env';
import { getDefaultTeam, logActivity } from '@/server/services/crm';
import { normalizePhone } from '@/server/services/whatsapp';

export const runtime = 'nodejs';

/**
 * Webhook EvolutionAPI.
 * Configurar no painel: ${PUBLIC_SITE_URL}/api/whatsapp/webhook (POST, header `apikey`).
 * Sempre 200 (EvolutionAPI faz retry agressivo em não-2xx).
 *
 * Eventos suportados: messages.upsert (mensagens recebidas).
 * Sem mídia ainda — só conversation/extendedTextMessage.
 */

interface EvolutionMessageKey {
  remoteJid?: string;
  fromMe?: boolean;
  id?: string;
}

interface EvolutionMessageContent {
  conversation?: string;
  extendedTextMessage?: { text?: string };
}

interface EvolutionMessageData {
  key?: EvolutionMessageKey;
  message?: EvolutionMessageContent;
  messageTimestamp?: number | string;
  pushName?: string;
}

interface EvolutionWebhookBody {
  event?: string;
  instance?: string;
  data?: EvolutionMessageData;
}

function extractText(msg: EvolutionMessageContent | undefined): string | null {
  if (!msg) return null;
  if (typeof msg.conversation === 'string' && msg.conversation.trim()) return msg.conversation;
  const ext = msg.extendedTextMessage?.text;
  if (typeof ext === 'string' && ext.trim()) return ext;
  return null;
}

function phoneFromJid(jid: string | undefined): string | null {
  if (!jid) return null;
  // Formato: 5511987654321@s.whatsapp.net (também pode ser @c.us)
  const raw = jid.split('@')[0];
  return normalizePhone(raw);
}

export async function POST(req: Request) {
  // Verificação simples por header apikey (opcional dependendo da config EvolutionAPI)
  const headerApiKey = req.headers.get('apikey');
  if (env.EVOLUTION_API_KEY) {
    if (!headerApiKey) {
      console.warn('[whatsapp/webhook] sem header apikey — aceitando em dev/sem strict mode');
    } else if (headerApiKey !== env.EVOLUTION_API_KEY) {
      console.warn('[whatsapp/webhook] apikey mismatch');
      return NextResponse.json({ ok: false, error: 'invalid_apikey' }, { status: 200 });
    }
  }

  let body: EvolutionWebhookBody;
  try {
    body = (await req.json()) as EvolutionWebhookBody;
  } catch {
    console.warn('[whatsapp/webhook] body inválido');
    return NextResponse.json({ ok: true });
  }

  if (body.event !== 'messages.upsert') {
    return NextResponse.json({ ok: true, ignored: body.event ?? 'no_event' });
  }

  const data = body.data;
  if (!data?.key) return NextResponse.json({ ok: true, ignored: 'no_key' });

  // Só inbound
  if (data.key.fromMe === true) {
    return NextResponse.json({ ok: true, ignored: 'from_me' });
  }

  const waMessageId = data.key.id ?? null;
  const phone = phoneFromJid(data.key.remoteJid);
  const text = extractText(data.message);
  const pushName = data.pushName ?? null;
  const ts = data.messageTimestamp ?? null;

  // Idempotência por wa_message_id em activities.metadata
  if (waMessageId) {
    const dup = await db
      .select({ id: activities.id })
      .from(activities)
      .where(sql`${activities.metadata}->>'wa_message_id' = ${waMessageId}`)
      .limit(1);
    if (dup.length > 0) {
      return NextResponse.json({ ok: true, deduped: true });
    }
  }

  let team;
  try {
    team = await getDefaultTeam();
  } catch (err) {
    console.error('[whatsapp/webhook] sem default team', err);
    return NextResponse.json({ ok: true });
  }

  // Procura contact por whatsapp normalizado
  let contactId: string | null = null;
  if (phone) {
    const all = await db
      .select({ id: contacts.id, whatsapp: contacts.whatsapp })
      .from(contacts)
      .where(eq(contacts.team_id, team.id));
    for (const c of all) {
      if (normalizePhone(c.whatsapp) === phone) {
        contactId = c.id;
        break;
      }
    }
  }

  const metadata: Record<string, unknown> = {
    wa_message_id: waMessageId,
    wa_timestamp: ts,
    wa_phone: phone,
    wa_jid: data.key.remoteJid,
    wa_push_name: pushName,
    instance: body.instance,
  };

  if (contactId) {
    try {
      await logActivity({
        teamId: team.id,
        contactId,
        type: 'whatsapp',
        direction: 'inbound',
        subject: pushName ?? phone ?? null,
        body_md: text,
        metadata,
      });
    } catch (err) {
      console.error('[whatsapp/webhook] logActivity falhou', err);
    }
  } else {
    // Contact desconhecido — registra em form_submissions pra triagem manual
    console.warn('[whatsapp/webhook] contact desconhecido', phone);
    try {
      await db.insert(form_submissions).values({
        id: ulid(),
        type: 'whatsapp_unknown',
        data: { ...metadata, text, raw: body } as Record<string, unknown>,
        email: null,
      });
    } catch (err) {
      console.error('[whatsapp/webhook] form_submissions insert falhou', err);
    }
  }

  // Idempotência defensiva via duplicate-check garantida acima.
  // Sempre 200.
  return NextResponse.json({ ok: true, contactId });
}

// Alguns paineis EvolutionAPI fazem GET de health-check
export async function GET() {
  return NextResponse.json({ ok: true, service: 'whatsapp-webhook' });
}
