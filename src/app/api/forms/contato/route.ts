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
import { env } from '@/env';

const bodySchema = z.object({
  nome: z.string().min(1).max(200),
  email: z.string().email().max(320),
  whatsapp: z.string().max(50).optional().nullable(),
  empresa: z.string().max(200).optional().nullable(),
  mensagem: z.string().min(1).max(5000),
  origem: z.string().max(100).optional().nullable(),
});

type ContatoBody = z.infer<typeof bodySchema>;

function clientIp(req: NextRequest): string | null {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0]!.trim();
  return req.headers.get('x-real-ip');
}

async function forwardToN8n(submissionId: string, payload: ContatoBody): Promise<void> {
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

function confirmHtml(nome: string): string {
  return `<!doctype html><html lang="pt-BR"><body style="margin:0;padding:32px;background:#050505;color:#f5f5f5;font-family:Archivo,Arial,sans-serif;">
  <div style="max-width:520px;margin:0 auto;background:#0a0a0a;border:1px solid #1a1a1a;padding:32px;">
    <h1 style="font-family:'Archivo Black',Arial,sans-serif;font-size:20px;text-transform:uppercase;color:#FF3B0F;margin:0 0 16px;">Recebi sua mensagem, ${nome.split(' ')[0]}</h1>
    <p style="font-size:15px;line-height:1.6;color:#d4d4d4;margin:0 0 16px;">Vou responder pessoalmente em até 1 dia útil.</p>
    <p style="font-size:13px;color:#737373;margin:24px 0 0;">— Joel</p>
  </div></body></html>`;
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

  try {
    const submissionId = ulid();
    await db.insert(form_submissions).values({
      id: submissionId,
      type: 'contato',
      data,
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

    void forwardToN8n(submissionId, data);

    void sendEmail({
      to: data.email,
      toName: data.nome,
      subject: 'Recebi sua mensagem · Joel Burigo',
      html: confirmHtml(data.nome),
    });

    return NextResponse.json({ ok: true, id: submissionId });
  } catch (err) {
    console.error('[forms/contato]', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
