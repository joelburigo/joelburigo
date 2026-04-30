import 'server-only';
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/server/services/session';
import { CONFIG_NAMESPACES, setConfig, type ConfigNamespace } from '@/server/services/config';

export const runtime = 'nodejs';

const bodySchema = z.object({
  namespace: z.enum(CONFIG_NAMESPACES as readonly [ConfigNamespace, ...ConfigNamespace[]]),
  key: z
    .string()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9_.-]+$/i, 'key inválido'),
  value: z.unknown(),
  description: z.string().max(500).optional(),
});

export async function POST(req: NextRequest) {
  let admin;
  try {
    admin = await requireAdmin();
  } catch {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: 'validation', issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    await setConfig(
      parsed.data.namespace,
      parsed.data.key,
      parsed.data.value,
      admin.id,
      parsed.data.description
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[api/admin/config] POST', err);
    return NextResponse.json({ ok: false, error: 'set_failed' }, { status: 500 });
  }
}
