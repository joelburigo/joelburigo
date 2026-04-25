import * as React from 'react';
import { cn } from '@/lib/utils';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        'flex h-11 w-full border border-[var(--jb-hair)] bg-ink-2 px-4 py-2 text-base text-cream',
        'placeholder:text-fg-muted',
        'focus-visible:outline-none focus-visible:border-acid focus-visible:ring-1 focus-visible:ring-acid',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'transition-colors duration-[180ms]',
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = 'Input';

export { Input };
