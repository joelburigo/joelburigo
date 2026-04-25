import { cn } from '@/lib/utils';

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('animate-pulse bg-ink-3/60 border border-[var(--jb-hair)]', className)} {...props} />;
}

export { Skeleton };
