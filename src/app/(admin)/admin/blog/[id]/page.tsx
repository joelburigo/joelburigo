import 'server-only';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { eq, sql } from 'drizzle-orm';
import { db } from '@/server/db/client';
import {
  blog_posts,
  blog_tags,
  blog_post_tags,
  blog_revisions,
} from '@/server/db/schema';
import { requireAdmin } from '@/server/services/session';
import { BlogEditor } from '@/components/features/blog-editor/blog-editor';

export const metadata: Metadata = {
  title: 'Admin · Editar post',
  robots: { index: false, follow: false },
};

export default async function AdminBlogEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const [post] = await db.select().from(blog_posts).where(eq(blog_posts.id, id)).limit(1);
  if (!post) notFound();

  const tagRows = await db
    .select({ tag: blog_tags })
    .from(blog_post_tags)
    .leftJoin(blog_tags, eq(blog_post_tags.tag_id, blog_tags.id))
    .where(eq(blog_post_tags.post_id, id));
  const postTags = tagRows.map((r) => r.tag).filter((t): t is NonNullable<typeof t> => !!t);

  const allTags = await db.select().from(blog_tags).orderBy(blog_tags.name);

  const [{ n: revisionsCount } = { n: 0 }] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(blog_revisions)
    .where(eq(blog_revisions.post_id, id));

  const r2PublicUrl = process.env.R2_PUBLIC_URL ?? '';

  return (
    <BlogEditor
      postId={id}
      r2PublicUrl={r2PublicUrl}
      revisionsCount={Number(revisionsCount)}
      initial={{
        title: post.title,
        subtitle: post.subtitle,
        excerpt: post.excerpt,
        content_md: post.content_md,
        slug: post.slug,
        status: post.status as 'draft' | 'published' | 'scheduled',
        cover_image_path: post.cover_image_path,
        cover_image_alt: post.cover_image_alt,
        seo_title: post.seo_title,
        seo_description: post.seo_description,
        og_image_path: post.og_image_path,
        scheduled_for: post.scheduled_for ? post.scheduled_for.toISOString() : null,
        published_at: post.published_at ? post.published_at.toISOString() : null,
        reading_minutes: post.reading_minutes,
      }}
      initialTagIds={postTags.map((t) => t.id)}
      allTags={allTags}
    />
  );
}
