import 'server-only';
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/server/services/session';
import { getDefaultTeam } from '@/server/services/crm';
import { createMentoria } from '@/server/services/mentorias';

export const runtime = 'nodejs';

const bodySchema = z.object({
  title: z.string().min(3).max(200),
  topic: z.string().max(2000).optional(),
  scheduled_at: z.string().datetime(),
  duration_min: z.number().int().min(15).max(600).optional(),
});

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();

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

  let teamId: string | null = null;
  try {
    const team = await getDefaultTeam();
    teamId = team.id;
  } catch (err) {
    console.warn('[api/admin/mentorias] default team lookup falhou', err);
  }

  try {
    const mentoria = await createMentoria({
      title: parsed.data.title,
      topic: parsed.data.topic ?? null,
      scheduled_at: new Date(parsed.data.scheduled_at),
      duration_min: parsed.data.duration_min,
      ownerId: admin.id,
      teamId,
    });
    return NextResponse.json({ ok: true, mentoria });
  } catch (err) {
    console.error('[api/admin/mentorias] POST', err);
    return NextResponse.json({ ok: false, error: 'create_failed' }, { status: 500 });
  }
}
