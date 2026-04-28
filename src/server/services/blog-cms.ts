import 'server-only';
import { and, eq, sql } from 'drizzle-orm';
import { revalidateTag } from 'next/cache';
import { db } from '@/server/db/client';
import {
  blog_posts,
  blog_tags,
  blog_post_tags,
  blog_revisions,
  blog_images,
  type BlogPost,
  type BlogTag,
} from '@/server/db/schema';
import { ulid } from '@/server/lib/ulid';
import { storage } from '@/server/lib/storage';
import { queue } from '@/server/lib/queue';
import { slugify, readingMinutes } from '@/lib/utils';

/**
 * Blog CMS service — write-side. Leitor público (`blog.ts`) é separado e cacheado.
 *
 * Sempre que um post sai de draft, mudamos visibilidade pública → invalidate
 * `blog-posts` cache tag (consumida por `getPublishedPosts`/`getPostBySlug`).
 */

const CACHE_TAG = 'blog-posts';
export const PUBLISH_SCHEDULED_POST = 'publish_scheduled_post';

// ────────────────────────────────────────────────────────────────────────────
// CRUD
// ────────────────────────────────────────────────────────────────────────────

export async function createDraftPost(authorId: string): Promise<BlogPost> {
  const id = ulid();
  const slugSuffix = id.slice(-6).toLowerCase();
  const [post] = await db
    .insert(blog_posts)
    .values({
      id,
      slug: `novo-post-${slugSuffix}`,
      title: 'Novo post',
      content_md: '',
      status: 'draft',
      author_id: authorId,
      reading_minutes: 1,
    })
    .returning();
  if (!post) throw new Error('Falha ao criar draft');
  return post;
}

export type UpdatePostPatch = Partial<{
  title: string;
  subtitle: string | null;
  excerpt: string | null;
  content_md: string;
  cover_image_path: string | null;
  cover_image_alt: string | null;
  slug: string;
  seo_title: string | null;
  seo_description: string | null;
  og_image_path: string | null;
  reading_minutes: number;
}>;

export async function updatePost(
  id: string,
  patch: UpdatePostPatch,
  savedBy: string
): Promise<BlogPost> {
  // Slug uniqueness validation
  if (patch.slug) {
    const normalized = slugify(patch.slug);
    if (!normalized) throw new Error('Slug inválido');
    const conflict = await db
      .select({ id: blog_posts.id })
      .from(blog_posts)
      .where(and(eq(blog_posts.slug, normalized), sql`${blog_posts.id} != ${id}`))
      .limit(1);
    if (conflict.length > 0) throw new Error('Slug já em uso');
    patch.slug = normalized;
  }

  // Auto-calc reading minutes if content changed but not provided
  if (patch.content_md !== undefined && patch.reading_minutes === undefined) {
    patch.reading_minutes = readingMinutes(patch.content_md);
  }

  const [updated] = await db
    .update(blog_posts)
    .set({ ...patch, updated_at: new Date() })
    .where(eq(blog_posts.id, id))
    .returning();
  if (!updated) throw new Error('Post não encontrado');

  // Snapshot revision (apenas se mudou title ou content)
  if (patch.title !== undefined || patch.content_md !== undefined) {
    await db.insert(blog_revisions).values({
      id: ulid(),
      post_id: id,
      title: updated.title,
      content_md: updated.content_md,
      saved_by: savedBy,
    });
  }

  if (updated.status === 'published') revalidateTag(CACHE_TAG, { expire: 0 });
  return updated;
}

export async function publishPost(id: string): Promise<BlogPost> {
  const [updated] = await db
    .update(blog_posts)
    .set({ status: 'published', published_at: new Date(), updated_at: new Date() })
    .where(eq(blog_posts.id, id))
    .returning();
  if (!updated) throw new Error('Post não encontrado');
  revalidateTag(CACHE_TAG, { expire: 0 });
  return updated;
}

export async function unpublishPost(id: string): Promise<BlogPost> {
  const [updated] = await db
    .update(blog_posts)
    .set({ status: 'draft', updated_at: new Date() })
    .where(eq(blog_posts.id, id))
    .returning();
  if (!updated) throw new Error('Post não encontrado');
  revalidateTag(CACHE_TAG, { expire: 0 });
  return updated;
}

export async function schedulePost(id: string, scheduledFor: Date): Promise<BlogPost> {
  if (scheduledFor.getTime() <= Date.now()) {
    throw new Error('Data de agendamento precisa ser no futuro');
  }
  const [updated] = await db
    .update(blog_posts)
    .set({
      status: 'scheduled',
      scheduled_for: scheduledFor,
      updated_at: new Date(),
    })
    .where(eq(blog_posts.id, id))
    .returning();
  if (!updated) throw new Error('Post não encontrado');
  await queue.enqueue(PUBLISH_SCHEDULED_POST, { postId: id }, { startAfter: scheduledFor });
  revalidateTag(CACHE_TAG, { expire: 0 });
  return updated;
}

export async function deletePost(id: string): Promise<void> {
  await db.delete(blog_posts).where(eq(blog_posts.id, id));
  revalidateTag(CACHE_TAG, { expire: 0 });
}

// ────────────────────────────────────────────────────────────────────────────
// Tags
// ────────────────────────────────────────────────────────────────────────────

export async function listAllTags(): Promise<BlogTag[]> {
  return db.select().from(blog_tags).orderBy(blog_tags.name);
}

export async function upsertTag(name: string): Promise<BlogTag> {
  const trimmed = name.trim();
  if (!trimmed) throw new Error('Nome inválido');
  const slug = slugify(trimmed);
  const existing = await db.select().from(blog_tags).where(eq(blog_tags.slug, slug)).limit(1);
  if (existing[0]) return existing[0];
  const [created] = await db
    .insert(blog_tags)
    .values({ id: ulid(), slug, name: trimmed })
    .returning();
  if (!created) throw new Error('Falha ao criar tag');
  return created;
}

export async function setPostTags(postId: string, tagIds: string[]): Promise<void> {
  await db.delete(blog_post_tags).where(eq(blog_post_tags.post_id, postId));
  if (tagIds.length > 0) {
    await db
      .insert(blog_post_tags)
      .values(tagIds.map((tag_id) => ({ post_id: postId, tag_id })));
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Images — upload original pro R2; resize/format por Cloudflare Image
// Transformations no momento de servir (helper em src/lib/blog-image.ts).
// ────────────────────────────────────────────────────────────────────────────

export type ProcessedImage = {
  path: string; // chave R2 do original
  url: string; // URL pública (sem transform — render aplica CIT)
  alt: string;
  width: number;
  height: number;
  size_bytes: number;
};

function detectImageContentType(filename: string): string {
  const ext = filename.toLowerCase().split('.').pop() ?? '';
  switch (ext) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'avif':
      return 'image/avif';
    case 'gif':
      return 'image/gif';
    default:
      return 'application/octet-stream';
  }
}

export async function processBlogImage(opts: {
  postId: string;
  buffer: Buffer;
  filename: string;
  alt?: string;
}): Promise<ProcessedImage> {
  const { postId, buffer, filename, alt = '' } = opts;
  const baseId = ulid();
  const ext = filename.toLowerCase().match(/\.[a-z0-9]+$/)?.[0] ?? '';
  const safeName = slugify(filename.replace(/\.[^.]+$/, '')) || 'image';
  const key = `blog/${postId}/${baseId}-${safeName}${ext}`;
  const contentType = detectImageContentType(filename);

  await storage.put(key, buffer, contentType);

  // Cloudflare Image Transformations infere width/height ao servir;
  // armazenamos 0 quando o cliente não puder inferir aqui (Workers runtime
  // sem sharp). O render sabe lidar com width/height ausentes (CSS aspect).
  const size_bytes = buffer.byteLength;

  await db.insert(blog_images).values({
    id: ulid(),
    post_id: postId,
    path: key,
    alt,
    width: 0,
    height: 0,
    size_bytes,
    variant: 'orig',
  });

  return {
    path: key,
    url: storage.publicUrl(key),
    alt,
    width: 0,
    height: 0,
    size_bytes,
  };
}
