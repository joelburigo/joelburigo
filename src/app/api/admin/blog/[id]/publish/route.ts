import 'server-only';
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/server/services/session';
import { publishPost, unpublishPost } from '@/server/services/blog-cms';

const bodySchema = z.object({ action: z.enum(['publish', 'unpublish']).default('publish') });

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await ctx.params;
  let payload: unknown = {};
  try {
    payload = await req.json();
  } catch {
    // body opcional
  }
  const parsed = bodySchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: 'validation' }, { status: 400 });
  }
  try {
    const post =
      parsed.data.action === 'publish' ? await publishPost(id) : await unpublishPost(id);
    return NextResponse.json({ post });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'erro';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
