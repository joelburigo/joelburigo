import * as React from 'react';
import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  kicker?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: 'left' | 'center';
  className?: string;
}

export function SectionHeader({
  kicker,
  title,
  description,
  align = 'left',
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4',
        align === 'center' && 'items-center text-center',
        className
      )}
    >
      {kicker && <span className="kicker">{kicker}</span>}
      <h2 className="text-display-sm md:text-display-md max-w-3xl">{title}</h2>
      {description && <p className="body-lg text-fg-3 max-w-2xl">{description}</p>}
    </div>
  );
}
