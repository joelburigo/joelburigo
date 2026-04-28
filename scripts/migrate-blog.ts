/**
 * scripts/migrate-blog.ts
 *
 * Migra os posts MD em `docs/blog/*.md` pra tabela `blog_posts` (+ `blog_tags`,
 * `blog_post_tags`).
 *
 * Idempotente: usa upsert por `slug`. Pode rodar múltiplas vezes — segunda corrida só
 * atualiza `updated_at` + campos derivados.
 *
 * Uso:
 *   pnpm db:migrate-blog
 *   # ou:
 *   pnpm tsx scripts/migrate-blog.ts
 *
 * Pré-requisitos:
 *   - `DATABASE_URL` no `.env` apontando pro Postgres.
 *   - Schema aplicado: `pnpm db:push`.
 *   - Admin Joel criado: `pnpm db:seed` (script tenta criar mínimo se ausente).
 */
import 'dotenv/config';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, basename, extname } from 'node:path';
import matter from 'gray-matter';
import { ulid } from 'ulid';
import { eq, sql } from 'drizzle-orm';
import { db } from '../src/server/db/client';
import { blog_posts, blog_post_tags, blog_tags, users } from '../src/server/db/schema';

const ADMIN_EMAIL = 'joel@growthmaster.com.br';
const BLOG_DIR = join(process.cwd(), 'docs/blog');

type Frontmatter = {
  title?: string;
  subtitle?: string;
  excerpt?: string;
  description?: string;
  slug?: string;
  category?: string;
  date?: string | Date;
  publishedAt?: string | Date;
  readTime?: string;
  author?: string;
  featured?: boolean;
  pillarContent?: boolean;
  status?: string | boolean;
  heroImage?: string;
  cover?: string;
  coverImage?: string;
  image?: string;
  coverImageAlt?: string;
  tags?: unknown;
  clusterKeywords?: unknown;
  relatedArticles?: string[];
  seoTitle?: string;
  seoDescription?: string;
};

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function deriveExcerpt(fm: Frontmatter, body: string): string | null {
  if (fm.excerpt) return fm.excerpt;
  if (fm.description) return fm.description;
  const firstPara = body
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .find((p) => p && !p.startsWith('#') && !p.startsWith('---'));
  if (!firstPara) return null;
  const stripped = firstPara.replace(/[*_`>#\[\]]/g, '').replace(/\s+/g, ' ').trim();
  return stripped.length > 200 ? `${stripped.slice(0, 197)}...` : stripped;
}

function computeReadingMinutes(body: string): number {
  const words = body.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

function deriveStatus(raw: Frontmatter['status']): 'draft' | 'published' {
  if (raw === undefined || raw === null) return 'published';
  if (typeof raw === 'boolean') return raw ? 'published' : 'draft';
  const v = String(raw).toLowerCase();
  if (v === 'published' || v === 'true' || v === '1') return 'published';
  if (v === 'draft' || v === 'false' || v === '0') return 'draft';
  return 'published';
}

function derivePublishedAt(fm: Frontmatter, filePath: string): Date {
  const candidate = fm.publishedAt ?? fm.date;
  if (candidate) {
    const d = new Date(candidate as string | number | Date);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return statSync(filePath).mtime;
}

function normalizeCoverPath(raw: string | undefined): string | null {
  if (!raw) return null;
  // `../../assets/images/blog/foo.webp` → `/images/blog/foo.webp`
  // arquivos estão em src/assets/images/blog/* mas o build serve por public/images/blog/*
  const file = basename(raw);
  return `/images/blog/${file}`;
}

/**
 * Áudio do post segue convenção `public/audio/blog/<slug>.mp3` (gerado pelo
 * script generate-audio-posts.mjs). Retorna o path do arquivo se existir,
 * senão null — admin pode gerar/anexar depois.
 */
function resolveAudioPath(slug: string): string | null {
  const file = join(process.cwd(), 'public', 'audio', 'blog', `${slug}.mp3`);
  return existsSync(file) ? `/audio/blog/${slug}.mp3` : null;
}

function normalizeTags(fm: Frontmatter): string[] {
  const raw: unknown[] = [];
  if (Array.isArray(fm.tags)) raw.push(...fm.tags);
  if (Array.isArray(fm.clusterKeywords)) raw.push(...fm.clusterKeywords);
  if (fm.category) raw.push(fm.category);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of raw) {
    if (typeof item !== 'string') continue;
    const t = item.trim();
    if (!t) continue;
    const key = t.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(t);
  }
  return out;
}

async function ensureAdminUser(): Promise<string> {
  const existing = await db.select().from(users).where(eq(users.email, ADMIN_EMAIL)).limit(1);
  if (existing.length > 0) return existing[0].id;

  const id = ulid();
  console.warn(
    `[migrate-blog] WARN: admin (${ADMIN_EMAIL}) não existe. Criando placeholder com id=${id}. ` +
      `Rode \`pnpm db:seed\` pra garantir o registro canônico.`
  );
  await db
    .insert(users)
    .values({ id, email: ADMIN_EMAIL, name: 'Joel Burigo', role: 'admin' })
    .onConflictDoNothing();
  const after = await db.select().from(users).where(eq(users.email, ADMIN_EMAIL)).limit(1);
  return after[0]?.id ?? id;
}

async function upsertTag(tagName: string): Promise<string> {
  const tagSlug = slugify(tagName);
  const existing = await db.select().from(blog_tags).where(eq(blog_tags.slug, tagSlug)).limit(1);
  if (existing.length > 0) return existing[0].id;
  const id = ulid();
  await db
    .insert(blog_tags)
    .values({ id, slug: tagSlug, name: tagName })
    .onConflictDoNothing({ target: blog_tags.slug });
  const after = await db.select().from(blog_tags).where(eq(blog_tags.slug, tagSlug)).limit(1);
  return after[0]?.id ?? id;
}

async function migrate() {
  console.info('[migrate-blog] lendo', BLOG_DIR);
  const files = readdirSync(BLOG_DIR).filter((f) => f.endsWith('.md'));
  if (files.length === 0) {
    console.warn('[migrate-blog] nenhum .md encontrado.');
    return;
  }

  const adminId = await ensureAdminUser();

  let created = 0;
  let updated = 0;
  let tagsTouched = 0;
  const issues: string[] = [];

  for (const file of files) {
    const filePath = join(BLOG_DIR, file);
    const raw = readFileSync(filePath, 'utf8');
    const parsed = matter(raw);
    const fm = parsed.data as Frontmatter;
    const body = parsed.content.trim();

    if (!fm.title) {
      issues.push(`${file}: sem 'title' — pulado`);
      continue;
    }

    const slug = (fm.slug ?? basename(file, extname(file))).trim();
    const excerpt = deriveExcerpt(fm, body);
    const reading = computeReadingMinutes(body);
    const status = deriveStatus(fm.status);
    const publishedAt = derivePublishedAt(fm, filePath);
    const coverRaw = fm.heroImage ?? fm.coverImage ?? fm.cover ?? fm.image;
    const coverPath = normalizeCoverPath(coverRaw);
    const audioPath = resolveAudioPath(slug);
    const seoTitle = fm.seoTitle ?? fm.title;
    const seoDescription = fm.seoDescription ?? excerpt ?? null;

    const existing = await db
      .select({ id: blog_posts.id })
      .from(blog_posts)
      .where(eq(blog_posts.slug, slug))
      .limit(1);

    const id = existing[0]?.id ?? ulid();

    await db
      .insert(blog_posts)
      .values({
        id,
        slug,
        title: fm.title,
        subtitle: fm.subtitle ?? null,
        excerpt: excerpt ?? null,
        content_md: body,
        cover_image_path: coverPath,
        cover_image_alt: fm.coverImageAlt ?? fm.title,
        audio_path: audioPath,
        author_id: adminId,
        status,
        published_at: publishedAt,
        reading_minutes: reading,
        seo_title: seoTitle,
        seo_description: seoDescription,
      })
      .onConflictDoUpdate({
        target: blog_posts.slug,
        set: {
          title: fm.title,
          subtitle: fm.subtitle ?? null,
          excerpt: excerpt ?? null,
          content_md: body,
          cover_image_path: coverPath,
          cover_image_alt: fm.coverImageAlt ?? fm.title,
          author_id: adminId,
          status,
          published_at: publishedAt,
          reading_minutes: reading,
          seo_title: seoTitle,
          seo_description: seoDescription,
          updated_at: sql`now()`,
        },
      });

    if (existing.length > 0) updated += 1;
    else created += 1;

    // Tags: limpa associações antigas e recria (idempotente)
    await db.delete(blog_post_tags).where(eq(blog_post_tags.post_id, id));
    const tagNames = normalizeTags(fm);
    for (const tagName of tagNames) {
      const tagId = await upsertTag(tagName);
      await db
        .insert(blog_post_tags)
        .values({ post_id: id, tag_id: tagId })
        .onConflictDoNothing();
      tagsTouched += 1;
    }

    console.info(
      `  ${existing.length > 0 ? '~' : '+'} ${slug} (${reading} min, ${tagNames.length} tags)`
    );
  }

  console.info(
    `\n✓ ${files.length} posts processados (${created} criados, ${updated} atualizados, ${tagsTouched} tag-links).`
  );
  if (issues.length > 0) {
    console.warn('\n[migrate-blog] avisos:');
    for (const issue of issues) console.warn(`  - ${issue}`);
  }
}

migrate()
  .then(() => process.exit(0))
  .catch((err: unknown) => {
    const msg = err instanceof Error ? err.message : String(err);
    if (
      msg.includes('ECONNREFUSED') ||
      msg.includes('ENOTFOUND') ||
      msg.includes('placeholder') ||
      msg.includes('does not exist') ||
      msg.includes('relation "blog_posts"')
    ) {
      console.error('\n[migrate-blog] falha de conexão/schema:', msg);
      console.error(
        'Suba o Postgres local e aplique o schema:\n' +
          '  docker compose up -d pg-joelburigo-site\n' +
          '  pnpm db:push && pnpm db:seed'
      );
    } else {
      console.error('[migrate-blog] erro:', err);
    }
    process.exit(1);
  });
