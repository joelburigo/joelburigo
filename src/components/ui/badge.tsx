import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.22em] px-2.5 py-1 border',
  {
    variants: {
      variant: {
        default: 'bg-ink-2 border-[var(--jb-hair)] text-fg-2',
        acid: 'bg-[var(--jb-acid-soft)] border-[var(--jb-acid-border)] text-acid',
        fire: 'bg-[var(--jb-fire-soft)] border-[var(--jb-fire-border)] text-fire-hot',
        outline: 'bg-transparent border-cream text-cream',
        live: 'bg-[var(--jb-acid-soft-2)] border-acid text-acid',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
