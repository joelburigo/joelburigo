import 'server-only';
import { unstable_cache } from 'next/cache';
import { eq, and, desc, inArray, lte, sql } from 'drizzle-orm';
import { db } from '../db/client';
import { blog_posts, blog_post_tags, blog_tags, type BlogPost, type BlogTag } from '../db/schema';

export type PostWithTags = BlogPost & { tags: BlogTag[] };

const CACHE_TAG = 'blog-posts';
const CACHE_TTL_SECONDS = 300; // 5 min

/**
 * Lista os posts publicados ordenados por `published_at desc`.
 *
 * Fonte única: tabela `blog_posts` (DB). Pra reimportar a partir dos MDs em
 * `docs/blog/*.md`, rode `pnpm db:migrate-blog` (upsert por slug).
 *
 * Cache: tag `blog-posts` (TTL 5min). Pra invalidar manualmente após edit no
 * admin: `import { revalidateTag } from 'next/cache'; revalidateTag('blog-posts');`
 */
const _getPublishedPostsCached = unstable_cache(
  async (): Promise<PostWithTags[]> => fetchPublishedFromDb(),
  ['blog:getPublishedPosts'],
  { tags: [CACHE_TAG], revalidate: CACHE_TTL_SECONDS }
);

export async function getPublishedPosts(): Promise<PostWithTags[]> {
  const rows = await _getPublishedPostsCached();
  return rows.map(revivePost);
}

const _getPostBySlugCached = unstable_cache(
  async (slug: string): Promise<PostWithTags | null> => fetchPostBySlugFromDb(slug),
  ['blog:getPostBySlug'],
  { tags: [CACHE_TAG], revalidate: CACHE_TTL_SECONDS }
);

export async function getPostBySlug(slug: string): Promise<PostWithTags | null> {
  const row = await _getPostBySlugCached(slug);
  return row ? revivePost(row) : null;
}

/**
 * `unstable_cache` serializa o resultado via JSON, então `Date` vira `string`.
 * Reidrata pra `Date` antes de devolver pros componentes.
 */
function revivePost(p: PostWithTags): PostWithTags {
  const toDate = (v: Date | string | null | undefined): Date | null => {
    if (!v) return null;
    return v instanceof Date ? v : new Date(v);
  };
  return {
    ...p,
    published_at: toDate(p.published_at) as PostWithTags['published_at'],
    scheduled_for: toDate(p.scheduled_for) as PostWithTags['scheduled_for'],
    created_at: (toDate(p.created_at) ?? new Date()) as PostWithTags['created_at'],
    updated_at: (toDate(p.updated_at) ?? new Date()) as PostWithTags['updated_at'],
  };
}

// ────────────────────────────────────────────────────────────────────────────
// DB readers
// ────────────────────────────────────────────────────────────────────────────

async function fetchPublishedFromDb(): Promise<PostWithTags[]> {
  const posts = await db
    .select()
    .from(blog_posts)
    .where(and(eq(blog_posts.status, 'published'), lte(blog_posts.published_at, sql`now()`)))
    .orderBy(desc(blog_posts.published_at));

  if (posts.length === 0) return [];

  const ids = posts.map((p) => p.id);
  const tagRows = await db
    .select({ post_id: blog_post_tags.post_id, tag: blog_tags })
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
}

async function fetchPostBySlugFromDb(slug: string): Promise<PostWithTags | null> {
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
}
