import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-display uppercase font-black tracking-wider transition-all duration-[180ms] ease-[cubic-bezier(0.2,0.9,0.2,1)] cursor-pointer disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid focus-visible:ring-offset-2 focus-visible:ring-offset-ink',
  {
    variants: {
      variant: {
        primary:
          'bg-acid text-ink shadow-[4px_4px_0_var(--jb-fire)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_var(--jb-fire)] active:translate-x-0 active:translate-y-0 active:shadow-[2px_2px_0_var(--jb-fire)]',
        fire: 'bg-fire text-ink shadow-[4px_4px_0_var(--jb-acid)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_var(--jb-acid)] active:translate-x-0 active:translate-y-0 active:shadow-[2px_2px_0_var(--jb-acid)]',
        secondary:
          'bg-transparent text-cream border border-cream hover:bg-cream/10 hover:border-acid hover:text-acid',
        ghost: 'bg-transparent text-cream hover:bg-cream/10',
        link: 'text-acid underline-offset-4 hover:underline p-0',
        destructive:
          'bg-fire text-cream hover:bg-fire-deep shadow-[4px_4px_0_rgba(0,0,0,0.4)] hover:-translate-x-0.5 hover:-translate-y-0.5',
      },
      size: {
        default: 'text-sm px-7 py-3.5',
        sm: 'text-xs px-4 py-2',
        lg: 'text-base px-10 py-5',
        icon: 'size-10 p-0',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
