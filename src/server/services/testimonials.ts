import 'server-only';
import { unstable_cache, revalidateTag } from 'next/cache';
import { and, asc, desc, eq, ilike, or } from 'drizzle-orm';
import { db } from '@/server/db/client';
import { testimonials, type NewTestimonial, type Testimonial } from '@/server/db/schema';
import { ulid } from '@/server/lib/ulid';

export type ProductFilter = 'vss' | 'advisory' | 'both' | 'all';

const CACHE_TAG = 'testimonials';
const CACHE_TTL_SECONDS = 300;

/**
 * Source única de testimonials/cases.
 * Leitura pública via `unstable_cache(tag=testimonials)`.
 * Mutations sempre invalidam a tag.
 */

function reviveDates(t: Testimonial): Testimonial {
  const toDate = (v: Date | string): Date => (v instanceof Date ? v : new Date(v));
  return {
    ...t,
    created_at: toDate(t.created_at),
    updated_at: toDate(t.updated_at),
  };
}

const _listPublishedCached = unstable_cache(
  async (product: ProductFilter, featured: 'true' | 'false' | 'any', limit: number) => {
    const conds = [eq(testimonials.published, true)];
    if (product !== 'all') {
      // 'both' significa que o testimonial cobre os dois produtos — sempre aparece
      conds.push(
        product === 'both'
          ? eq(testimonials.product_used, 'both')
          : or(eq(testimonials.product_used, product), eq(testimonials.product_used, 'both'))!
      );
    }
    if (featured !== 'any') conds.push(eq(testimonials.featured, featured === 'true'));

    return db
      .select()
      .from(testimonials)
      .where(and(...conds))
      .orderBy(desc(testimonials.featured), asc(testimonials.position), desc(testimonials.created_at))
      .limit(limit);
  },
  ['testimonials:listPublished'],
  { tags: [CACHE_TAG], revalidate: CACHE_TTL_SECONDS }
);

export async function listPublishedTestimonials(opts?: {
  product?: ProductFilter;
  featured?: boolean;
  limit?: number;
}): Promise<Testimonial[]> {
  const product = opts?.product ?? 'all';
  const featured: 'true' | 'false' | 'any' =
    opts?.featured === undefined ? 'any' : opts.featured ? 'true' : 'false';
  const limit = opts?.limit ?? 100;
  try {
    const rows = await _listPublishedCached(product, featured, limit);
    return rows.map(reviveDates);
  } catch (err) {
    console.error('[testimonials] listPublished falhou:', err instanceof Error ? err.message : err);
    return [];
  }
}

export async function getTestimonialById(id: string): Promise<Testimonial | null> {
  const [row] = await db.select().from(testimonials).where(eq(testimonials.id, id)).limit(1);
  return row ?? null;
}

export async function getTestimonialBySlugOrTitle(s: string): Promise<Testimonial | null> {
  const term = s.trim();
  if (!term) return null;
  const [row] = await db
    .select()
    .from(testimonials)
    .where(
      or(
        eq(testimonials.id, term),
        eq(testimonials.client_name, term),
        ilike(testimonials.case_title, term)
      )
    )
    .limit(1);
  return row ?? null;
}

export async function listAllForAdmin(): Promise<Testimonial[]> {
  return db
    .select()
    .from(testimonials)
    .orderBy(desc(testimonials.featured), asc(testimonials.position), desc(testimonials.created_at));
}

export async function createTestimonial(
  input: Omit<NewTestimonial, 'id' | 'created_at' | 'updated_at'>
): Promise<Testimonial> {
  const id = ulid();
  const [row] = await db
    .insert(testimonials)
    .values({ ...input, id })
    .returning();
  if (!row) throw new Error('Falha ao criar testimonial');
  revalidateTag(CACHE_TAG, { expire: 0 });
  return row;
}

export async function updateTestimonial(
  id: string,
  input: Partial<Omit<NewTestimonial, 'id'>>
): Promise<Testimonial> {
  const [row] = await db
    .update(testimonials)
    .set({ ...input, updated_at: new Date() })
    .where(eq(testimonials.id, id))
    .returning();
  if (!row) throw new Error('Testimonial não encontrado');
  revalidateTag(CACHE_TAG, { expire: 0 });
  return row;
}

export async function deleteTestimonial(id: string): Promise<void> {
  await db.delete(testimonials).where(eq(testimonials.id, id));
  revalidateTag(CACHE_TAG, { expire: 0 });
}
