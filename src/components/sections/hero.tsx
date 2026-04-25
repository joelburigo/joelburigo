import Link from 'next/link';
import { Container } from '@/components/patterns/container';

interface HeroProps {
  kicker?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  ctaPrimary?: { label: string; href: string };
  ctaSecondary?: { label: string; href: string };
  note?: React.ReactNode;
}

export function Hero({ kicker, title, subtitle, ctaPrimary, ctaSecondary, note }: HeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-[var(--jb-hair)] bg-ink py-20 md:py-32">
      <div className="grid-overlay" aria-hidden="true" />
      <Container className="relative">
        <div className="flex max-w-4xl flex-col gap-8">
          {kicker && <span className="kicker">{kicker}</span>}
          <h1 className="text-display-md md:text-display-lg">{title}</h1>
          {subtitle && <p className="body-lg max-w-2xl text-fg-2">{subtitle}</p>}
          {(ctaPrimary || ctaSecondary) && (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              {ctaPrimary && (
                <Link href={ctaPrimary.href} className="btn-primary">
                  {ctaPrimary.label} <span className="font-mono">→</span>
                </Link>
              )}
              {ctaSecondary && (
                <Link href={ctaSecondary.href} className="btn-secondary">
                  {ctaSecondary.label}
                </Link>
              )}
            </div>
          )}
          {note && <p className="mono text-fg-muted">{note}</p>}
        </div>
      </Container>
    </section>
  );
}
