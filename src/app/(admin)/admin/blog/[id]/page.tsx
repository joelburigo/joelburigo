import type { Metadata } from 'next';
import { DevStub } from '@/components/patterns/dev-stub';

export const metadata: Metadata = {
  title: 'Admin · Editar post',
  robots: { index: false, follow: false },
};

export default async function AdminBlogEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <DevStub
      sprint={4}
      route={`/admin/blog/${id}`}
      title={`Editar · ${id}`}
      description="Sprint 4 entrega: editor Tiptap carrega post existente, histórico de blog_revisions navegável, on-demand revalidate (revalidatePath) ao publicar, transição draft→scheduled→published com pg-boss cron."
      backHref="/admin/blog"
      backLabel="Voltar pra lista"
    />
  );
}
