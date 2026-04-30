import * as React from 'react';
import Link, { type LinkProps } from 'next/link';
import type { VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { buttonVariants } from './button';

/**
 * <ButtonLink> — Next/Link estilizado com as MESMAS variants do <Button>.
 *
 * Quando usar:
 *   <ButtonLink href="/foo" variant="primary"> → navegação interna
 *   <ButtonLink href="https://..." external variant="secondary"> → externa (renderiza <a> normal)
 *   <ButtonLink href="mailto:..." variant="ghost"> → email/tel
 *
 * Sempre usar isso em vez de copiar `<Link className="bg-acid text-ink ...">`
 * inline. Single source of truth pra estilo de botão.
 */

type ButtonLinkBaseProps = VariantProps<typeof buttonVariants> & {
  className?: string;
  children: React.ReactNode;
};

type InternalLinkProps = ButtonLinkBaseProps &
  Omit<LinkProps, 'href'> & {
    href: LinkProps['href'];
    external?: false;
    target?: React.HTMLAttributeAnchorTarget;
    rel?: string;
  };

type ExternalLinkProps = ButtonLinkBaseProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
    href: string;
    external: true;
  };

export type ButtonLinkProps = InternalLinkProps | ExternalLinkProps;

export const ButtonLink = React.forwardRef<HTMLAnchorElement, ButtonLinkProps>(
  ({ className, variant, size, children, ...props }, ref) => {
    const classes = cn(buttonVariants({ variant, size }), className);

    if ('external' in props && props.external) {
      const { external: _external, href, ...anchorProps } = props;
      return (
        <a
          ref={ref}
          href={href}
          rel={anchorProps.rel ?? 'noopener noreferrer'}
          target={anchorProps.target ?? '_blank'}
          className={classes}
          {...anchorProps}
        >
          {children}
        </a>
      );
    }

    const { href, ...linkProps } = props as InternalLinkProps;
    return (
      <Link ref={ref} href={href} className={classes} {...linkProps}>
        {children}
      </Link>
    );
  }
);
ButtonLink.displayName = 'ButtonLink';
