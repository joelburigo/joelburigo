import { NextResponse, type NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/server/db/client';
import { diagnostico_submissions } from '@/server/db/schema';
import { ulid } from '@/server/lib/ulid';
import {
  getDefaultTeam,
  upsertContact,
  createOpportunity,
  logActivity,
} from '@/server/services/crm';
import { sendEmail } from '@/server/services/email';
import { env } from '@/env';

const score04 = z.number().int().min(0).max(4);

const bodySchema = z.object({
  nome: z.string().min(1).max(200),
  email: z.string().email().max(320),
  whatsapp: z.string().max(50).optional().nullable(),
  empresa: z.string().max(200).optional().nullable(),
  segmento: z.string().max(120).optional().nullable(),
  faturamento_aprox: z.string().max(60).optional().nullable(),
  scores: z.object({
    posicionamento: score04,
    publico: score04,
    produto: score04,
    programas: score04,
    processos: score04,
    pessoas: score04,
  }),
  raw_answers: z.record(z.unknown()).default({}),
});

type DiagnosticoBody = z.infer<typeof bodySchema>;

function nivelMaturidade(total: number): string {
  if (total <= 6) return 'Caótico';
  if (total <= 12) return 'Iniciante';
  if (total <= 18) return 'Estruturado';
  if (total <= 22) return 'Avançado';
  return 'Otimizado';
}

function clientIp(req: NextRequest): string | null {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0]!.trim();
  return req.headers.get('x-real-ip');
}

async function forwardToN8n(submissionId: string, payload: unknown): Promise<void> {
  if (!env.N8N_WEBHOOK_URL) return;
  try {
    const res = await fetch(env.N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ type: 'diagnostico', submission_id: submissionId, data: payload }),
    });
    if (!res.ok) {
      console.error('[forms/diagnostico] n8n status', res.status);
      return;
    }
    await db
      .update(diagnostico_submissions)
      .set({ forwarded_to_n8n_at: new Date() })
      .where(eq(diagnostico_submissions.id, submissionId));
  } catch (err) {
    console.error('[forms/diagnostico] n8n forward failed', err);
  }
}

function confirmHtml(nome: string, total: number, nivel: string, resultadoUrl: string): string {
  return `<!doctype html><html lang="pt-BR"><body style="margin:0;padding:32px;background:#050505;color:#f5f5f5;font-family:Archivo,Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;background:#0a0a0a;border:1px solid #1a1a1a;padding:32px;">
    <h1 style="font-family:'Archivo Black',Arial,sans-serif;font-size:22px;text-transform:uppercase;color:#FF3B0F;margin:0 0 12px;">Diagnóstico 6Ps · ${nivel}</h1>
    <p style="font-size:15px;line-height:1.6;color:#d4d4d4;margin:0 0 8px;">Olá ${nome.split(' ')[0]}, seu score: <strong style="color:#C6FF00;">${total}/24</strong>.</p>
    <p style="font-size:15px;line-height:1.6;color:#d4d4d4;margin:0 0 24px;">Veja a leitura completa por P:</p>
    <p style="margin:0 0 24px;">
      <a href="${resultadoUrl}" style="display:inline-block;background:#FF3B0F;color:#050505;font-family:'Archivo Black',Arial,sans-serif;text-transform:uppercase;letter-spacing:0.05em;font-size:14px;padding:14px 24px;text-decoration:none;border:2px solid #050505;box-shadow:4px 4px 0 #C6FF00;">
        Ver resultado completo
      </a>
    </p>
    <p style="font-size:12px;color:#525252;margin:24px 0 0;">— Joel</p>
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
  const data: DiagnosticoBody = parsed.data;

  try {
    const s = data.scores;
    const total =
      s.posicionamento + s.publico + s.produto + s.programas + s.processos + s.pessoas;
    const nivel = nivelMaturidade(total);

    const submissionId = ulid();
    await db.insert(diagnostico_submissions).values({
      id: submissionId,
      nome: data.nome,
      email: data.email.trim().toLowerCase(),
      whatsapp: data.whatsapp ?? null,
      empresa: data.empresa ?? null,
      segmento: data.segmento ?? null,
      faturamento_aprox: data.faturamento_aprox ?? null,
      score_posicionamento: s.posicionamento,
      score_publico: s.publico,
      score_produto: s.produto,
      score_programas: s.programas,
      score_processos: s.processos,
      score_pessoas: s.pessoas,
      score_total: total,
      nivel_maturidade: nivel,
      raw_answers: data.raw_answers,
      ip: clientIp(req),
      user_agent: req.headers.get('user-agent'),
    });

    const team = await getDefaultTeam();
    const contact = await upsertContact({
      teamId: team.id,
      name: data.nome,
      email: data.email,
      whatsapp: data.whatsapp ?? null,
      source: 'form_diagnostico',
      produto_interesse: 'vss',
    });

    const opp = await createOpportunity({
      teamId: team.id,
      contactId: contact.id,
      pipelineSlug: 'vss',
      stageSlug: 'qualificado',
      title: `Diagnóstico 6Ps – ${data.nome}`,
      value_cents: 199700,
      metadata: {
        diagnostico_id: submissionId,
        score_total: total,
        nivel,
      },
    });

    await logActivity({
      teamId: team.id,
      contactId: contact.id,
      opportunityId: opp.id,
      type: 'form',
      direction: 'inbound',
      subject: `Diagnóstico 6Ps · ${nivel} (${total}/24)`,
      metadata: {
        diagnostico_id: submissionId,
        scores: s,
      },
    });

    void forwardToN8n(submissionId, { ...data, score_total: total, nivel_maturidade: nivel });

    const resultadoUrl = `${env.PUBLIC_SITE_URL}/diagnostico/resultado?id=${encodeURIComponent(submissionId)}`;
    void (async () => {
      const result = await sendEmail({
        to: data.email,
        toName: data.nome,
        subject: `Seu diagnóstico 6Ps · ${nivel} (${total}/24)`,
        html: confirmHtml(data.nome, total, nivel, resultadoUrl),
      });
      if (result.ok && !result.skipped) {
        await db
          .update(diagnostico_submissions)
          .set({ email_sent_at: new Date() })
          .where(eq(diagnostico_submissions.id, submissionId));
      }
    })();

    return NextResponse.json({ ok: true, id: submissionId });
  } catch (err) {
    console.error('[forms/diagnostico]', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
