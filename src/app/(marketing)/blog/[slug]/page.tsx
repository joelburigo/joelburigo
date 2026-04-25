import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import { Container } from '@/components/patterns/container';
import { Badge } from '@/components/ui/badge';
import { getPostBySlug, getPublishedPosts } from '@/server/services/blog';
import { formatDate } from '@/lib/utils';

export const revalidate = 300;

interface Params {
  slug: string;
}

export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.seo_title || post.title,
    description: post.seo_description || post.excerpt || undefined,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt || undefined,
      type: 'article',
      publishedTime: post.published_at?.toISOString(),
      images: post.cover_image_path ? [post.cover_image_path] : undefined,
    },
  };
}

export default async function PostPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  return (
    <article className="section">
      <Container size="md">
        <div className="mb-12 flex flex-col gap-4">
          <Link
            href="/blog"
            className="font-mono text-[11px] uppercase tracking-[0.22em] text-fg-3 hover:text-acid"
          >
            ← Blog
          </Link>
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((t) => (
                <Badge key={t.slug} variant="acid">
                  {t.name}
                </Badge>
              ))}
            </div>
          )}
          <h1 className="text-display-md md:text-display-lg">{post.title}</h1>
          {post.subtitle && <p className="body-lg text-fg-2">{post.subtitle}</p>}
          <div className="mono flex items-center gap-3">
            <span>{post.published_at ? formatDate(post.published_at) : ''}</span>
            {post.reading_minutes && (
              <>
                <span className="text-[var(--jb-hair-strong)]">·</span>
                <span>{post.reading_minutes} min</span>
              </>
            )}
          </div>
        </div>
        <div className="prose prose-invert max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSlug]}>
            {post.content_md}
          </ReactMarkdown>
        </div>
      </Container>
    </article>
  );
}
