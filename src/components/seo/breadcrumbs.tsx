import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

/**
 * Breadcrumbs com schema.org BreadcrumbList JSON-LD inline.
 */
export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  if (!items || items.length === 0) return null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.label,
      item: `https://joelburigo.com.br${item.href}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="Breadcrumb" className={cn('flex items-center gap-2', className)}>
        <ol className="text-fg-muted flex flex-wrap items-center gap-2 font-mono text-[11px] tracking-[0.22em] uppercase">
          {items.map((item, idx) => {
            const isLast = idx === items.length - 1;
            return (
              <li key={item.href} className="flex items-center gap-2">
                {isLast ? (
                  <span className="text-cream" aria-current="page">
                    {item.label}
                  </span>
                ) : (
                  <Link href={item.href} className="hover:text-acid transition-colors">
                    {item.label}
                  </Link>
                )}
                {!isLast && <span className="text-[var(--jb-hair-strong)]">/</span>}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
