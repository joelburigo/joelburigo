import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from '@/server/services/session';
import { runAgent } from '@/server/services/agent';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const bodySchema = z.object({
  destravamentoId: z.string().min(1),
  conversationId: z.string().min(1).optional(),
  // Aceita o formato UI message do AI SDK (id, role, parts[]).
  messages: z
    .array(
      z.object({
        id: z.string(),
        role: z.enum(['user', 'assistant', 'system']),
        parts: z
          .array(
            z.union([
              z.object({ type: z.literal('text'), text: z.string() }),
              // Outros tipos (file, tool-*) — passamos adiante mas sem validação rígida
              z.object({ type: z.string() }).passthrough(),
            ])
          )
          .optional()
          .default([]),
      })
    )
    .min(1),
});

export async function POST(req: NextRequest) {
  // Auth — não usamos `requireUser()` aqui porque `redirect()` não funciona
  // dentro de uma route handler que retorna stream. Devolvemos 401 explícito.
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

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

  try {
    const { response } = await runAgent({
      user,
      destravamentoId: parsed.data.destravamentoId,
      conversationId: parsed.data.conversationId,
      // O Zod já garantiu o shape básico; cast pra UIMessage é seguro o bastante
      // pra extrair `role` e `parts.text`. Se chegar parte desconhecida, ignoramos.
      uiMessages: parsed.data.messages as never,
    });
    return response;
  } catch (err) {
    console.error('[api/agent/chat]', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
