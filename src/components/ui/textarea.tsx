import * as React from 'react';
import { cn } from '@/lib/utils';

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'bg-ink-2 text-cream flex min-h-[100px] w-full border border-[var(--jb-hair)] px-4 py-3 text-base',
          'placeholder:text-fg-muted',
          'focus-visible:border-acid focus-visible:ring-acid focus-visible:ring-1 focus-visible:outline-none',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'resize-none transition-colors duration-[180ms]',
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
