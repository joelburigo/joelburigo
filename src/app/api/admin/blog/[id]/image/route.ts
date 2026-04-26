import 'server-only';
import { NextResponse, type NextRequest } from 'next/server';
import { requireAdmin } from '@/server/services/session';
import { processBlogImage } from '@/server/services/blog-cms';

export const runtime = 'nodejs';
export const maxDuration = 60;

const MAX_BYTES = 12 * 1024 * 1024; // 12MB

/**
 * POST /api/admin/blog/[id]/image
 * multipart/form-data: file (required), alt (optional)
 *
 * Processamento sync: sharp resize → 4 variantes WebP → upload R2 → blog_images.
 * Pra MVP `sync` é OK (sharp leva ~1-3s pra 5MB). Se virar gargalo, mover pra
 * pg-boss e responder 202 + URL final via SSE/poll. Veja TODO no service.
 */
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await ctx.params;

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: 'invalid_form' }, { status: 400 });
  }

  const file = form.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'file_required' }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'file_too_large' }, { status: 413 });
  }
  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'not_an_image' }, { status: 400 });
  }
  const alt = (form.get('alt') as string | null) ?? '';

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const image = await processBlogImage({
      postId: id,
      buffer,
      filename: file.name,
      alt,
    });
    return NextResponse.json({ image });
  } catch (err) {
    console.error('[blog-image] erro', err);
    const msg = err instanceof Error ? err.message : 'erro';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
