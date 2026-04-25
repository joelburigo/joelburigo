import { NextResponse } from 'next/server';
import { z } from 'zod';

/**
 * Stub pro Sprint 0 — apenas aceita payload e loga.
 * Sprint 1: persiste em form_submissions + dispara job forward-to-n8n.
 */
const schema = z.object({
  nome: z.string().min(1),
  email: z.string().email(),
  empresa: z.string().min(1),
  faturamento: z.string().optional(),
  gargalo: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const data = schema.parse(json);

    // TODO Sprint 1:
    //   - INSERT form_submissions (type='diagnostico')
    //   - enqueue 'forward_form_n8n' { submission_id }
    //   - enqueue 'score_diagnostico' { submission_id } (agente gera snapshot 6Ps)

    console.info('[form:diagnostico]', { email: data.email, empresa: data.empresa });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : 'invalid payload' },
      { status: 400 }
    );
  }
}
