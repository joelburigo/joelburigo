import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Sistema único de botões. Usar SEMPRE via <Button> ou <ButtonLink>.
 *
 * NUNCA reimplementar `<button className="bg-acid text-ink ...">` espalhado —
 * isso fragmenta o design system e arrisca contraste no hover (lime + cream
 * herdado do body).
 *
 * - <Button variant="..."> → renderiza <button> (com `asChild` pra Radix Slot)
 * - <ButtonLink href="..." variant="..."> → renderiza Next/Link estilizado
 *
 * Variants:
 *   primary     → fundo acid, texto ink (CTA principal)
 *   fire        → fundo fire, texto ink (CTA secundário/destaque)
 *   secondary   → outline cream, hover acid
 *   outlineAcid → border acid + bg acid/10 + text acid (admin actions)
 *   outlineFire → border fire + bg transparente + text fire (destructive admin)
 *   ghost       → transparente, hover cream/10
 *   link        → texto acid sublinhado
 *   destructive → fundo fire-deep + text cream (deletes)
 *
 * Sizes: sm · default · lg · icon
 */
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-display uppercase font-black tracking-wider transition-all duration-[180ms] ease-[cubic-bezier(0.2,0.9,0.2,1)] cursor-pointer disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid focus-visible:ring-offset-2 focus-visible:ring-offset-ink',
  {
    variants: {
      variant: {
        primary:
          'bg-acid text-ink hover:bg-acid-hot hover:text-ink shadow-[4px_4px_0_var(--jb-fire)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_var(--jb-fire)] active:translate-x-0 active:translate-y-0 active:shadow-[2px_2px_0_var(--jb-fire)]',
        fire:
          'bg-fire text-ink hover:bg-fire-hot hover:text-ink shadow-[4px_4px_0_var(--jb-acid)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_var(--jb-acid)] active:translate-x-0 active:translate-y-0 active:shadow-[2px_2px_0_var(--jb-acid)]',
        secondary:
          'bg-transparent text-cream border border-cream hover:bg-cream/[0.06] hover:border-acid hover:text-acid',
        outlineAcid:
          'bg-acid/10 text-acid border border-acid hover:bg-acid hover:text-ink hover:shadow-[3px_3px_0_var(--jb-acid)]',
        outlineFire:
          'bg-transparent text-fire border border-fire hover:bg-fire hover:text-ink',
        ghost: 'bg-transparent text-cream hover:bg-cream/[0.08] hover:text-acid',
        link: 'text-acid underline-offset-4 hover:underline p-0',
        destructive:
          'bg-fire-deep text-cream hover:bg-fire hover:text-ink shadow-[4px_4px_0_rgba(0,0,0,0.4)] hover:-translate-x-0.5 hover:-translate-y-0.5',
      },
      size: {
        default: 'text-sm px-7 py-3.5 min-h-[44px]',
        sm: 'text-xs px-4 py-2 min-h-[32px]',
        lg: 'text-base px-10 py-5 min-h-[56px]',
        xl: 'text-base px-10 py-6 min-h-[64px]',
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
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
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
