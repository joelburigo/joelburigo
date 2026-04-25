import { NextResponse } from 'next/server';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  subject: z.string().min(1),
  message: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const data = schema.parse(await req.json());
    // TODO Sprint 1: persist em form_submissions + enqueue forward_form_n8n
    console.info('[form:contato]', { email: data.email, subject: data.subject });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : 'invalid' },
      { status: 400 }
    );
  }
}
