import type { Metadata } from 'next';
import Link from 'next/link';
import { DevStub } from '@/components/patterns/dev-stub';

export const metadata: Metadata = {
  title: 'Admin · Blog',
  robots: { index: false, follow: false },
};

export default function AdminBlogPage() {
  return (
    <>
      <DevStub
        sprint={4}
        route="/admin/blog"
        title="Blog CMS"
        description="Sprint 4 entrega: lista de posts (draft/scheduled/published) com filtro por status e tag. Botão 'Novo post' abre /admin/blog/new com editor Tiptap + preview MD. Job classify-blog-posts (Opus 4.7, ~$0,10) sugere tags pros 12 posts migrados."
        backHref="/admin"
        backLabel="Dashboard admin"
      />
      <div className="mx-auto max-w-screen-md px-5 pb-20">
        <Link
          href="/admin/blog/new"
          className="text-acid font-mono text-[12px] tracking-[0.22em] uppercase hover:underline"
        >
          → Ver stub do editor (/admin/blog/new)
        </Link>
      </div>
    </>
  );
}
