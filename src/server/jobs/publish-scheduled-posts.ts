import { and, eq, lte, sql } from 'drizzle-orm';
import type { Job } from 'pg-boss';
import { db } from '@/server/db/client';
import { blog_posts } from '@/server/db/schema';
import { publishPost, PUBLISH_SCHEDULED_POST } from '@/server/services/blog-cms';

/**
 * Publish-scheduled-posts — pg-boss handlers.
 *
 * Dois mecanismos (idempotentes):
 *   1. `publish_scheduled_post` — job individual disparado por `schedulePost`
 *      com `startAfter: scheduled_for`. Pega `{ postId }`.
 *   2. `publish_due_posts` — cron a cada 5min de fallback caso o job acima
 *      falhe ou seja perdido. Varre `status='scheduled' AND scheduled_for<=now()`.
 */

export { PUBLISH_SCHEDULED_POST };
export const PUBLISH_DUE_POSTS = 'publish_due_posts';
export const PUBLISH_DUE_POSTS_SCHEDULE = '*/5 * * * *'; // 5min

type PublishScheduledPayload = { postId: string };

export async function handlePublishScheduledPost(jobs: Job<PublishScheduledPayload>[]): Promise<void> {
  for (const job of jobs) {
    const { postId } = job.data;
    if (!postId) continue;
    try {
      const [post] = await db
        .select()
        .from(blog_posts)
        .where(eq(blog_posts.id, postId))
        .limit(1);
      if (!post) {
        console.warn(`[publish-scheduled] post ${postId} não existe`);
        continue;
      }
      if (post.status !== 'scheduled') {
        console.info(`[publish-scheduled] post ${postId} status=${post.status} — skip`);
        continue;
      }
      if (post.scheduled_for && post.scheduled_for.getTime() > Date.now()) {
        console.info(`[publish-scheduled] post ${postId} ainda no futuro — skip`);
        continue;
      }
      await publishPost(postId);
      console.info(`[publish-scheduled] ✓ ${postId} publicado`);
    } catch (err) {
      console.error(`[publish-scheduled] erro em ${postId}:`, err);
    }
  }
}

export async function handlePublishDuePosts(_jobs: Job[]): Promise<void> {
  const due = await db
    .select({ id: blog_posts.id })
    .from(blog_posts)
    .where(
      and(
        eq(blog_posts.status, 'scheduled'),
        lte(blog_posts.scheduled_for, sql`now()`)
      )
    );
  if (due.length === 0) return;
  console.info(`[publish-due] processando ${due.length} posts atrasados`);
  for (const { id } of due) {
    try {
      await publishPost(id);
    } catch (err) {
      console.error(`[publish-due] erro ${id}:`, err);
    }
  }
}
