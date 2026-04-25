import { NextResponse, type NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/server/db/client';
import { form_submissions } from '@/server/db/schema';
import { ulid } from '@/server/lib/ulid';
import {
  getDefaultTeam,
  upsertContact,
  logActivity,
} from '@/server/services/crm';
import { sendEmail } from '@/server/services/email';
import { formContatoConfirmation } from '@/server/services/email-templates';
import { rateLimit, pickIp } from '@/server/lib/rate-limit';
import { verifyTurnstile } from '@/server/services/turnstile';
import { env } from '@/env';

const bodySchema = z.object({
  nome: z.string().min(1).max(200),
  email: z.string().email().max(320),
  whatsapp: z.string().max(50).optional().nullable(),
  empresa: z.string().max(200).optional().nullable(),
  mensagem: z.string().min(1).max(5000),
  origem: z.string().max(100).optional().nullable(),
  cf_turnstile_token: z.string().optional().nullable(),
});

type ContatoBody = z.infer<typeof bodySchema>;

function clientIp(req: NextRequest): string | null {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0]!.trim();
  return req.headers.get('x-real-ip');
}

async function forwardToN8n(
  submissionId: string,
  payload: Omit<ContatoBody, 'cf_turnstile_token'>
): Promise<void> {
  if (!env.N8N_WEBHOOK_URL) return;
  try {
    const res = await fetch(env.N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ type: 'contato', submission_id: submissionId, data: payload }),
    });
    if (!res.ok) {
      console.error('[forms/contato] n8n status', res.status);
      return;
    }
    await db
      .update(form_submissions)
      .set({ forwarded_to_n8n_at: new Date() })
      .where(eq(form_submissions.id, submissionId));
  } catch (err) {
    console.error('[forms/contato] n8n forward failed', err);
  }
}

export async function POST(req: NextRequest) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'validation', issues: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const data = parsed.data;
  const ip = pickIp(req.headers);

  // Turnstile (dev: bypass automático)
  const ts = await verifyTurnstile(data.cf_turnstile_token, ip);
  if (!ts.valid) {
    return NextResponse.json({ error: 'turnstile_invalid' }, { status: 403 });
  }

  // Rate limit: 3/15min por IP+email
  const emailNorm = data.email.trim().toLowerCase();
  const rl = await rateLimit({
    key: `rl:contato:${ip}:${emailNorm}`,
    max: 3,
    windowSeconds: 15 * 60,
  });
  if (!rl.ok) {
    const retryAfter = Math.max(1, Math.ceil((rl.resetAt.getTime() - Date.now()) / 1000));
    return NextResponse.json(
      { error: 'rate_limited', retry_after: retryAfter },
      { status: 429, headers: { 'retry-after': String(retryAfter) } }
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { cf_turnstile_token: _t, ...persistData } = data;

  try {
    const submissionId = ulid();
    await db.insert(form_submissions).values({
      id: submissionId,
      type: 'contato',
      data: persistData,
      email: data.email.trim().toLowerCase(),
      ip: clientIp(req),
      user_agent: req.headers.get('user-agent'),
    });

    const team = await getDefaultTeam();
    const contact = await upsertContact({
      teamId: team.id,
      name: data.nome,
      email: data.email,
      whatsapp: data.whatsapp ?? null,
      source: 'form_contato',
    });

    await logActivity({
      teamId: team.id,
      contactId: contact.id,
      type: 'form',
      direction: 'inbound',
      subject: `Formulário contato${data.origem ? ` · ${data.origem}` : ''}`,
      body_md: data.mensagem,
      metadata: {
        form_submission_id: submissionId,
        empresa: data.empresa ?? null,
        origem: data.origem ?? null,
      },
    });

    void forwardToN8n(submissionId, persistData);

    const tpl = formContatoConfirmation({ name: data.nome });
    void sendEmail({
      to: data.email,
      toName: data.nome,
      subject: tpl.subject,
      html: tpl.html,
      text: tpl.text,
    });

    return NextResponse.json({ ok: true, id: submissionId });
  } catch (err) {
    console.error('[forms/contato]', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
