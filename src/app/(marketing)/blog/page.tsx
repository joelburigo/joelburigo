import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/patterns/container';
import { SectionHeader } from '@/components/patterns/section-header';
import { Card } from '@/components/ui/card';
import { getPublishedPosts } from '@/server/services/blog';
import { formatDate } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Blog — Joel Burigo',
  description:
    'Ideias sobre vendas escaláveis, framework 6Ps, sistemas de prospecção e gestão de MPEs. Sem fluff.',
  alternates: { canonical: '/blog' },
};

export const revalidate = 60;

export default async function BlogIndexPage() {
  const posts = await getPublishedPosts();

  return (
    <section className="section">
      <Container>
        <SectionHeader
          kicker="// BLOG"
          title="Ideias, sistemas, bastidores"
          description="Textos curtos sobre o que funciona em vendas pra micro e pequena empresa. Sem clickbait."
        />
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.length === 0 && (
            <Card className="md:col-span-2 lg:col-span-3">
              <p className="body text-fg-3">Nenhum post publicado ainda. Volte em breve.</p>
            </Card>
          )}
          {posts.map((post) => (
            <Card key={post.slug} className="flex flex-col gap-4">
              <span className="mono">
                {post.published_at ? formatDate(post.published_at) : 'rascunho'}
                {post.reading_minutes ? ` · ${post.reading_minutes} min` : ''}
              </span>
              <h3 className="heading-3">
                <Link href={`/blog/${post.slug}`} className="hover:text-acid">
                  {post.title}
                </Link>
              </h3>
              {post.excerpt && <p className="body-sm text-fg-2">{post.excerpt}</p>}
              <Link
                href={`/blog/${post.slug}`}
                className="mt-auto inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-acid hover:underline"
              >
                Ler post <span>→</span>
              </Link>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
