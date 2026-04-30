import 'server-only';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/server/services/session';
import { getTestimonialById } from '@/server/services/testimonials';
import { TestimonialEditor } from '@/components/features/testimonials/testimonial-editor';

export const metadata: Metadata = {
  title: 'Admin · Editar depoimento',
  robots: { index: false, follow: false },
};

export default async function AdminTestimonialEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const t = await getTestimonialById(id);
  if (!t) notFound();

  const r2PublicUrl = process.env.R2_PUBLIC_URL ?? '';

  return (
    <TestimonialEditor
      id={id}
      r2PublicUrl={r2PublicUrl}
      initial={{
        client_name: t.client_name,
        client_role: t.client_role,
        client_company: t.client_company,
        client_segment: t.client_segment,
        client_revenue_range: t.client_revenue_range,
        quote_md: t.quote_md,
        result_metric: t.result_metric,
        case_title: t.case_title,
        case_md: t.case_md,
        cover_image_path: t.cover_image_path,
        cover_image_alt: t.cover_image_alt,
        client_photo_path: t.client_photo_path,
        product_used: t.product_used as 'vss' | 'advisory' | 'both',
        featured: t.featured,
        published: t.published,
        position: t.position,
      }}
    />
  );
}
