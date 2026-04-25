import { cn } from '@/lib/utils';

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('bg-ink-3/60 animate-pulse border border-[var(--jb-hair)]', className)}
      {...props}
    />
  );
}

export { Skeleton };
