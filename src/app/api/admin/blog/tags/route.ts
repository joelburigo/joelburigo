import 'server-only';
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/server/services/session';
import { listAllTags, upsertTag } from '@/server/services/blog-cms';

export async function GET() {
  await requireAdmin();
  const tags = await listAllTags();
  return NextResponse.json({ tags });
}

const createSchema = z.object({ name: z.string().min(1).max(60) });

export async function POST(req: NextRequest) {
  await requireAdmin();
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }
  const parsed = createSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'validation', issues: parsed.error.flatten() },
      { status: 400 }
    );
  }
  try {
    const tag = await upsertTag(parsed.data.name);
    return NextResponse.json({ tag });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'erro';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
