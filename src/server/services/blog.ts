import 'server-only';
import { eq, and, desc, inArray } from 'drizzle-orm';
import { db } from '../db/client';
import { blog_posts, blog_post_tags, blog_tags, type BlogPost, type BlogTag } from '../db/schema';

export type PostWithTags = BlogPost & { tags: BlogTag[] };

/**
 * Lista os posts publicados ordenados por data.
 * Sprint 0: retorna [] se tabela vazia (ainda não tem posts migrados do Astro).
 * Sprint 1: script de migração popula do `/Users/joel/Documents/Dev/joelburigo-site/src/content/blog/*.md`.
 */
export async function getPublishedPosts(): Promise<PostWithTags[]> {
  if (!process.env.DATABASE_URL) return [];
  try {
    const posts = await db
      .select()
      .from(blog_posts)
      .where(eq(blog_posts.status, 'published'))
      .orderBy(desc(blog_posts.published_at));

    if (posts.length === 0) return [];

    const ids = posts.map((p) => p.id);
    const tagRows = await db
      .select({
        post_id: blog_post_tags.post_id,
        tag: blog_tags,
      })
      .from(blog_post_tags)
      .leftJoin(blog_tags, eq(blog_post_tags.tag_id, blog_tags.id))
      .where(inArray(blog_post_tags.post_id, ids));

    const tagsByPost = new Map<string, BlogTag[]>();
    for (const row of tagRows) {
      if (!row.tag) continue;
      const arr = tagsByPost.get(row.post_id) ?? [];
      arr.push(row.tag);
      tagsByPost.set(row.post_id, arr);
    }

    return posts.map((p) => ({ ...p, tags: tagsByPost.get(p.id) ?? [] }));
  } catch (err) {
    // Build time ou dev sem DB rodando: degrada graciosamente em vez de quebrar build.
    if (isBuildOrDev()) {
      console.warn('[blog] getPublishedPosts failed, retornando []:', (err as Error).message);
      return [];
    }
    throw err;
  }
}

function isBuildOrDev() {
  return (
    process.env.NEXT_PHASE === 'phase-production-build' ||
    process.env.NODE_ENV !== 'production'
  );
}

export async function getPostBySlug(slug: string): Promise<PostWithTags | null> {
  if (!process.env.DATABASE_URL) return null;
  try {
    const [post] = await db
      .select()
      .from(blog_posts)
      .where(and(eq(blog_posts.slug, slug), eq(blog_posts.status, 'published')))
      .limit(1);
    if (!post) return null;

    const tagRows = await db
      .select({ tag: blog_tags })
      .from(blog_post_tags)
      .leftJoin(blog_tags, eq(blog_post_tags.tag_id, blog_tags.id))
      .where(eq(blog_post_tags.post_id, post.id));

    return {
      ...post,
      tags: tagRows.map((r) => r.tag).filter((t): t is BlogTag => t !== null),
    };
  } catch (err) {
    if (isBuildOrDev()) {
      console.warn('[blog] getPostBySlug failed, retornando null:', (err as Error).message);
      return null;
    }
    throw err;
  }
}
