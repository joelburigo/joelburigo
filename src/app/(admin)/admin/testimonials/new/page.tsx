import 'server-only';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/server/services/session';
import { createTestimonial } from '@/server/services/testimonials';

/**
 * Cria um draft mínimo e redireciona pro editor.
 * Server component sem UI — efeito colateral de navegação.
 */
export default async function AdminTestimonialNewPage() {
  await requireAdmin();
  const t = await createTestimonial({
    client_name: 'Novo',
    quote_md: '_(escreva o depoimento aqui)_',
    product_used: 'vss',
    published: false,
  });
  redirect(`/admin/testimonials/${t.id}`);
}
