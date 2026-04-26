import 'server-only';
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/server/services/session';
import { updatePost, deletePost, setPostTags } from '@/server/services/blog-cms';

const patchSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  subtitle: z.string().max(300).nullable().optional(),
  excerpt: z.string().max(500).nullable().optional(),
  content_md: z.string().optional(),
  cover_image_path: z.string().nullable().optional(),
  cover_image_alt: z.string().nullable().optional(),
  slug: z.string().min(1).max(120).optional(),
  seo_title: z.string().max(120).nullable().optional(),
  seo_description: z.string().max(200).nullable().optional(),
  og_image_path: z.string().nullable().optional(),
  reading_minutes: z.number().int().positive().optional(),
  tag_ids: z.array(z.string()).optional(),
});

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  const { id } = await ctx.params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'validation', issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { tag_ids, ...patch } = parsed.data;
  try {
    const post = await updatePost(id, patch, admin.id);
    if (tag_ids) await setPostTags(id, tag_ids);
    return NextResponse.json({ post });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'erro';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await ctx.params;
  try {
    await deletePost(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'erro';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
