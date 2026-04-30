import 'server-only';
import { NextResponse, type NextRequest } from 'next/server';
import { requireAdmin } from '@/server/services/session';
import { storage } from '@/server/lib/storage';
import { ulid } from '@/server/lib/ulid';
import { slugify } from '@/lib/utils';
import { updateTestimonial, getTestimonialById } from '@/server/services/testimonials';

export const runtime = 'nodejs';
export const maxDuration = 60;

const MAX_BYTES = 12 * 1024 * 1024; // 12MB

function detectImageContentType(filename: string): string {
  const ext = filename.toLowerCase().split('.').pop() ?? '';
  switch (ext) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'avif':
      return 'image/avif';
    case 'gif':
      return 'image/gif';
    default:
      return 'application/octet-stream';
  }
}

/**
 * POST /api/admin/testimonials/[id]/image
 *
 * multipart/form-data:
 *   - file (required): imagem
 *   - kind (optional): 'cover' | 'photo' (default 'cover')
 *   - alt (optional): texto alt (só pra cover)
 *
 * Faz upload do original pro R2 (Cloudflare Image Transformations resolve sizes ao servir)
 * e atualiza o campo correspondente do testimonial.
 */
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await ctx.params;

  const existing = await getTestimonialById(id);
  if (!existing) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

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

  const kind = ((form.get('kind') as string | null) ?? 'cover').toLowerCase();
  if (kind !== 'cover' && kind !== 'photo') {
    return NextResponse.json({ error: 'invalid_kind' }, { status: 400 });
  }
  const alt = (form.get('alt') as string | null) ?? '';

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const baseId = ulid();
    const ext = file.name.toLowerCase().match(/\.[a-z0-9]+$/)?.[0] ?? '';
    const safeName = slugify(file.name.replace(/\.[^.]+$/, '')) || 'image';
    const key = `testimonials/${id}/${kind}-${baseId}-${safeName}${ext}`;
    const contentType = detectImageContentType(file.name);

    await storage.put(key, buffer, contentType);

    const patch =
      kind === 'cover'
        ? { cover_image_path: key, cover_image_alt: alt || existing.cover_image_alt }
        : { client_photo_path: key };
    const updated = await updateTestimonial(id, patch);

    let url: string | null = null;
    try {
      url = storage.publicUrl(key);
    } catch {
      url = null;
    }

    return NextResponse.json({ testimonial: updated, image: { path: key, url, kind } });
  } catch (err) {
    console.error('[testimonial-image] erro', err);
    const msg = err instanceof Error ? err.message : 'erro';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
