import 'server-only';
import type { Metadata } from 'next';
import Link from 'next/link';
import { and, desc, eq, ilike, sql, inArray, or } from 'drizzle-orm';
import { db } from '@/server/db/client';
import {
  blog_posts,
  blog_tags,
  blog_post_tags,
  blog_revisions,
  type BlogTag,
} from '@/server/db/schema';
import { requireAdmin } from '@/server/services/session';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { BlogListActions } from '@/components/features/blog-editor/blog-list-actions';
import { NewPostButton } from '@/components/features/blog-editor/new-post-button';

export const metadata: Metadata = {
  title: 'Admin · Blog',
  robots: { index: false, follow: false },
};

type Status = 'all' | 'draft' | 'published' | 'scheduled';

interface SearchParams {
  status?: string;
  q?: string;
}

export default async function AdminBlogPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const status: Status =
    sp.status === 'draft' || sp.status === 'published' || sp.status === 'scheduled'
      ? sp.status
      : 'all';
  const q = (sp.q ?? '').trim();

  const conds = [];
  if (status !== 'all') conds.push(eq(blog_posts.status, status));
  if (q) {
    conds.push(or(ilike(blog_posts.title, `%${q}%`), ilike(blog_posts.slug, `%${q}%`))!);
  }

  const posts = await db
    .select()
    .from(blog_posts)
    .where(conds.length > 0 ? and(...conds) : undefined)
    .orderBy(desc(blog_posts.updated_at));

  const ids = posts.map((p) => p.id);
  const tagsByPost = new Map<string, BlogTag[]>();
  const revisionCount = new Map<string, number>();

  if (ids.length > 0) {
    const tagRows = await db
      .select({ post_id: blog_post_tags.post_id, tag: blog_tags })
      .from(blog_post_tags)
      .leftJoin(blog_tags, eq(blog_post_tags.tag_id, blog_tags.id))
      .where(inArray(blog_post_tags.post_id, ids));
    for (const r of tagRows) {
      if (!r.tag) continue;
      const arr = tagsByPost.get(r.post_id) ?? [];
      arr.push(r.tag);
      tagsByPost.set(r.post_id, arr);
    }
    const revRows = await db
      .select({
        post_id: blog_revisions.post_id,
        n: sql<number>`count(*)::int`,
      })
      .from(blog_revisions)
      .where(inArray(blog_revisions.post_id, ids))
      .groupBy(blog_revisions.post_id);
    for (const r of revRows) revisionCount.set(r.post_id, Number(r.n));
  }

  const counts = await db
    .select({ status: blog_posts.status, n: sql<number>`count(*)::int` })
    .from(blog_posts)
    .groupBy(blog_posts.status);
  const total = counts.reduce((s, c) => s + Number(c.n), 0);
  const countOf = (s: Status): number =>
    s === 'all' ? total : Number(counts.find((c) => c.status === s)?.n ?? 0);

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="kicker text-fire">// SPRINT 4 · BLOG CMS</span>
          <h1 className="heading-2 text-cream mt-2">Posts</h1>
          <p className="text-fg-3 body-sm mt-1">
            {total} {total === 1 ? 'post' : 'posts'} no banco
          </p>
        </div>
        <NewPostButton />
      </header>

      <form
        method="get"
        className="bg-ink-2 flex flex-col gap-4 border border-[var(--jb-hair)] p-4 md:flex-row md:items-center"
      >
        <div className="flex flex-wrap gap-2">
          {(['all', 'draft', 'scheduled', 'published'] as const).map((s) => {
            const active = s === status;
            const href = `/admin/blog?${new URLSearchParams({
              ...(s === 'all' ? {} : { status: s }),
              ...(q ? { q } : {}),
            }).toString()}`;
            return (
              <Link
                key={s}
                href={href}
                className={`border px-3 py-1.5 font-mono text-[11px] tracking-[0.22em] uppercase transition-colors ${
                  active
                    ? 'bg-acid border-acid text-ink'
                    : 'bg-ink text-fg-2 hover:text-acid hover:border-acid border-[var(--jb-hair)]'
                }`}
              >
                {s} · {countOf(s)}
              </Link>
            );
          })}
        </div>
        <div className="flex flex-1 items-center gap-2">
          <Input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Buscar título ou slug..."
            className="h-9"
          />
          {status !== 'all' && <input type="hidden" name="status" value={status} />}
          <Button type="submit" variant="secondary" size="sm">
            Buscar
          </Button>
        </div>
      </form>

      {posts.length === 0 ? (
        <div className="border border-[var(--jb-hair)] p-12 text-center">
          <p className="text-fg-3 font-mono text-sm tracking-[0.22em] uppercase">
            Nenhum post {status !== 'all' ? status : ''} {q ? `pra "${q}"` : ''}
          </p>
        </div>
      ) : (
        <div className="bg-ink-2 overflow-x-auto border border-[var(--jb-hair)]">
          <table className="w-full text-sm">
            <thead className="border-fire bg-ink border-b">
              <tr className="text-fg-3 font-mono text-[10px] tracking-[0.22em] uppercase">
                <th className="px-4 py-3 text-left">Título</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Tags</th>
                <th className="px-4 py-3 text-right">Min</th>
                <th className="px-4 py-3 text-right">Views</th>
                <th className="px-4 py-3 text-right">Rev</th>
                <th className="px-4 py-3 text-left">Atualizado</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => {
                const tags = tagsByPost.get(p.id) ?? [];
                const rev = revisionCount.get(p.id) ?? 0;
                return (
                  <tr
                    key={p.id}
                    className="hover:bg-ink/40 border-t border-[var(--jb-hair)]"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/blog/${p.id}`}
                        className="text-cream hover:text-acid font-medium"
                      >
                        {p.title}
                      </Link>
                      <div className="text-fg-3 mt-0.5 font-mono text-[11px]">
                        /{p.slug}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={p.status} scheduledFor={p.scheduled_for} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {tags.length === 0 ? (
                          <span className="text-fg-muted text-[11px]">—</span>
                        ) : (
                          tags.slice(0, 3).map((t) => (
                            <Badge key={t.id} variant="default">
                              {t.name}
                            </Badge>
                          ))
                        )}
                        {tags.length > 3 && (
                          <span className="text-fg-3 text-[11px]">+{tags.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="text-fg-2 px-4 py-3 text-right font-mono text-xs">
                      {p.reading_minutes ?? '—'}
                    </td>
                    <td className="text-fg-2 px-4 py-3 text-right font-mono text-xs">
                      {p.view_count}
                    </td>
                    <td className="text-fg-3 px-4 py-3 text-right font-mono text-xs">
                      {rev}
                    </td>
                    <td className="text-fg-3 px-4 py-3 font-mono text-[11px]">
                      {formatDate(p.updated_at, {
                        day: '2-digit',
                        month: '2-digit',
                        year: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <BlogListActions
                        postId={p.id}
                        status={p.status as 'draft' | 'published' | 'scheduled'}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatusBadge({
  status,
  scheduledFor,
}: {
  status: string;
  scheduledFor: Date | null;
}) {
  if (status === 'published') return <Badge variant="acid">publicado</Badge>;
  if (status === 'scheduled') {
    return (
      <Badge variant="fire">
        agendado
        {scheduledFor
          ? ` · ${formatDate(scheduledFor, {
              day: '2-digit',
              month: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            })}`
          : ''}
      </Badge>
    );
  }
  return <Badge variant="outline">draft</Badge>;
}
