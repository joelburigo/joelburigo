import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

/**
 * Wordmark canônico Terminal Growth.
 * Matches docs/conteudo/brand/assets/logo.svg:
 *   JOEL — Archivo Black 900, cream (#F5F1E8), tracking -0.03em
 *   BURIGO — Archivo 500, fire (#FF3B0F), tracking -0.03em
 * Sem separador. Proporção ~215px JOEL : 305px BURIGO em 520x88.
 */

interface LogoProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Tamanho. Default md (20px). sm=14px · md=20px · lg=28px · xl=40px */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  asLink?: boolean;
  href?: string;
}

const sizeMap = {
  sm: 'text-sm',
  md: 'text-xl',
  lg: 'text-3xl',
  xl: 'text-5xl',
};

export function Logo({
  size = 'md',
  asLink = false,
  href = '/',
  className,
  ...props
}: LogoProps) {
  const wordmark = (
    <span
      className={cn(
        'inline-flex items-baseline tracking-[-0.03em] leading-none',
        sizeMap[size],
        className
      )}
      aria-label="Joel Burigo"
      {...props}
    >
      <span className="font-display text-[color:var(--jb-cream)]">JOEL</span>
      <span className="font-sans font-medium text-[color:var(--jb-fire)]">BURIGO</span>
    </span>
  );

  if (asLink) {
    return (
      <Link href={href} aria-label="Joel Burigo · Home" className="group">
        {wordmark}
      </Link>
    );
  }
  return wordmark;
}

interface LogoStackedProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'fire' | 'acid';
}

const stackedSizeClasses = {
  sm: 'w-20 h-20',
  md: 'w-28 h-28',
  lg: 'w-36 h-36',
  xl: 'w-48 h-48',
};

const stackedTextSize = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-xl',
};

export function LogoStacked({
  size = 'md',
  variant = 'fire',
  className,
  ...props
}: LogoStackedProps) {
  const borderColor = variant === 'fire' ? 'var(--jb-fire)' : 'var(--jb-acid)';
  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center',
        stackedSizeClasses[size],
        className
      )}
      style={{
        background: 'var(--jb-ink-2)',
        border: `1px solid ${borderColor}`,
        boxShadow: `4px 4px 0 ${borderColor}`,
      }}
      {...props}
    >
      <div className="relative z-10 flex flex-col items-center justify-center leading-[0.92]">
        <span
          className={cn(
            'font-display text-[color:var(--jb-cream)] tracking-[-0.04em]',
            stackedTextSize[size]
          )}
        >
          JOEL
        </span>
        <span
          className={cn('font-display tracking-[-0.04em]', stackedTextSize[size])}
          style={{ color: borderColor }}
        >
          BURIGO
        </span>
      </div>
    </div>
  );
}
