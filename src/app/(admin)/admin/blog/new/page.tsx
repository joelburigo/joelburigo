import type { Metadata } from 'next';
import { DevStub } from '@/components/patterns/dev-stub';

export const metadata: Metadata = {
  title: 'Admin · Novo post',
  robots: { index: false, follow: false },
};

export default function AdminBlogNewPage() {
  return (
    <DevStub
      sprint={4}
      route="/admin/blog/new"
      title="Novo post"
      description="Sprint 4 entrega: editor Tiptap + extensão tiptap-markdown (MD source-of-truth). Upload cover/inline → R2 com resize sharp multi-variante. Tags multi-select. SEO pane. Status draft/scheduled/published. Auto-save em blog_revisions a cada 30s."
      backHref="/admin/blog"
      backLabel="Voltar pra lista"
    />
  );
}
