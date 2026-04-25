import * as React from 'react';
import { cn } from '@/lib/utils';

interface StatusBarProps extends React.HTMLAttributes<HTMLDivElement> {
  left?: React.ReactNode;
  right?: React.ReactNode;
}

export function StatusBar({ left, right, className, ...props }: StatusBarProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 border-b border-[var(--jb-hair)] px-5 py-2.5 md:px-10',
        'text-fg-muted font-mono text-[11px] tracking-[0.22em] uppercase',
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-3">{left}</div>
      <div className="flex items-center gap-3">{right}</div>
    </div>
  );
}

export function LiveDot({ label = 'Ao vivo' }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="dot-live" />
      <span>{label}</span>
    </span>
  );
}
