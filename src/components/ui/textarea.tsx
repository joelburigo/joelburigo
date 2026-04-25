import * as React from 'react';
import { cn } from '@/lib/utils';

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[100px] w-full border border-[var(--jb-hair)] bg-ink-2 px-4 py-3 text-base text-cream',
          'placeholder:text-fg-muted',
          'focus-visible:outline-none focus-visible:border-acid focus-visible:ring-1 focus-visible:ring-acid',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'transition-colors duration-[180ms] resize-none',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };
