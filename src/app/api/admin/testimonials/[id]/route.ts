import 'server-only';
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/server/services/session';
import { deleteTestimonial, updateTestimonial } from '@/server/services/testimonials';

const productEnum = z.enum(['vss', 'advisory', 'both']);

const patchSchema = z.object({
  client_name: z.string().min(1).max(200).optional(),
  client_role: z.string().max(120).nullable().optional(),
  client_company: z.string().max(200).nullable().optional(),
  client_segment: z.string().max(120).nullable().optional(),
  client_revenue_range: z.string().max(40).nullable().optional(),
  quote_md: z.string().min(1).optional(),
  result_metric: z.string().max(120).nullable().optional(),
  case_title: z.string().max(200).nullable().optional(),
  case_md: z.string().nullable().optional(),
  cover_image_path: z.string().nullable().optional(),
  cover_image_alt: z.string().max(200).nullable().optional(),
  client_photo_path: z.string().nullable().optional(),
  product_used: productEnum.optional(),
  featured: z.boolean().optional(),
  published: z.boolean().optional(),
  position: z.number().int().optional(),
});

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  await requireAdmin();
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
  try {
    const testimonial = await updateTestimonial(id, parsed.data);
    return NextResponse.json({ testimonial });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'erro';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await ctx.params;
  try {
    await deleteTestimonial(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'erro';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
