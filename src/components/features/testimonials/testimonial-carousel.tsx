import 'server-only';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  listPublishedTestimonials,
  type ProductFilter,
} from '@/server/services/testimonials';
import type { Testimonial } from '@/server/db/schema';

interface Props {
  productSlug?: ProductFilter;
  featured?: boolean;
  limit?: number;
}

const R2_PUBLIC_URL = (process.env.R2_PUBLIC_URL ?? '').replace(/\/$/, '');

function resolveImage(path: string | null): string | null {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (path.startsWith('/')) return path;
  if (!R2_PUBLIC_URL) return null;
  return `${R2_PUBLIC_URL}/${path}`;
}

/**
 * Carrossel/grid de prova social — Server Component.
 * Consome `testimonials` do DB com cache `unstable_cache`.
 */
export async function TestimonialCarousel({
  productSlug = 'all',
  featured,
  limit = 9,
}: Props) {
  const items = await listPublishedTestimonials({
    product: productSlug,
    featured,
    limit,
  });

  if (items.length === 0) return null;

  return (
    <section className="py-12 md:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <div className="kicker mb-3" style={{ color: 'var(--jb-acid)' }}>
            // PROVA_SOCIAL · CASES_REAIS
          </div>
          <h2 className="heading-2 text-cream">
            Quem aplicou. Quem <span className="text-acid">cresceu.</span>
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {items.map((t) => (
            <TestimonialCard key={t.id} t={t} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ t }: { t: Testimonial }) {
  const photo = resolveImage(t.client_photo_path);
  const cover = resolveImage(t.cover_image_path);
  const isAdvisory = t.product_used === 'advisory';

  return (
    <article className="bg-ink-2 hover:border-acid flex flex-col border border-[var(--jb-hair)] p-6 transition-all duration-[180ms] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[6px_6px_0_var(--jb-acid)]">
      {cover && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={cover}
          alt={t.cover_image_alt ?? t.client_name}
          className="mb-4 h-32 w-full border border-[var(--jb-hair)] object-cover"
        />
      )}

      <div className="mb-4 flex items-start justify-between gap-2 border-b border-[var(--jb-hair)] pb-4">
        <div
          className="kicker"
          style={{ color: isAdvisory ? 'var(--jb-fire)' : 'var(--jb-acid)' }}
        >
          // {t.product_used.toUpperCase()}
        </div>
        {t.result_metric && (
          <div className="text-acid border border-[var(--jb-acid-border)] bg-[var(--jb-acid-soft)] px-2 py-1 font-mono text-[10px] tracking-[0.2em] uppercase">
            ▲ {t.result_metric}
          </div>
        )}
      </div>

      <div className="mb-4 flex items-center gap-3">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo}
            alt={t.client_name}
            className="size-12 border border-[var(--jb-hair)] object-cover"
          />
        ) : (
          <div className="bg-ink text-acid font-display flex size-12 items-center justify-center border border-[var(--jb-hair)] text-lg">
            {t.client_name.charAt(0)}
          </div>
        )}
        <div className="min-w-0">
          <h3 className="text-cream truncate font-sans text-sm font-semibold">{t.client_name}</h3>
          <p className="text-fg-muted truncate font-mono text-[10px] tracking-[0.22em] uppercase">
            {[t.client_role, t.client_company].filter(Boolean).join(' · ') ||
              t.client_segment ||
              ''}
          </p>
        </div>
      </div>

      {(t.client_segment || t.client_revenue_range) && (
        <div className="mb-4 flex flex-wrap gap-2">
          {t.client_segment && (
            <span className="text-fg-3 border border-[var(--jb-hair)] px-2 py-0.5 font-mono text-[10px] tracking-[0.18em] uppercase">
              {t.client_segment}
            </span>
          )}
          {t.client_revenue_range && (
            <span className="text-fg-3 border border-[var(--jb-hair)] px-2 py-0.5 font-mono text-[10px] tracking-[0.18em] uppercase">
              {t.client_revenue_range}
            </span>
          )}
        </div>
      )}

      <div className="text-fg-2 prose-testimonial flex-1 font-sans text-sm leading-relaxed">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{t.quote_md}</ReactMarkdown>
      </div>
    </article>
  );
}
