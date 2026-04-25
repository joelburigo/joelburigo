import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  asLink?: boolean;
  href?: string;
  compact?: boolean;
}

export function Logo({ asLink = true, href = '/', compact = false, className, ...props }: LogoProps) {
  const content = (
    <div className={cn('flex items-center gap-2', className)} {...props}>
      <span
        aria-hidden
        className="inline-block size-2 bg-acid"
        style={{ boxShadow: '0 0 12px var(--jb-acid-glow)' }}
      />
      <span className="font-display text-lg font-black uppercase tracking-tight text-cream">
        {compact ? 'JB' : 'Joel Burigo'}
      </span>
    </div>
  );

  if (asLink) {
    return (
      <Link href={href} aria-label="Ir para a home" className="group">
        {content}
      </Link>
    );
  }
  return content;
}
