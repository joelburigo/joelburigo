'use client';

import Link from 'next/link';
import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Logo } from '@/components/ui/logo';
import { cn } from '@/lib/utils';

interface NavLink {
  name: string;
  path: string;
}

interface MobileMenuProps {
  navLinks: NavLink[];
  secondaryLinks: NavLink[];
}

export function MobileMenu({ navLinks, secondaryLinks }: MobileMenuProps) {
  return (
    <Sheet>
      <SheetTrigger
        className="relative z-50 inline-flex size-11 items-center justify-center text-cream md:hidden"
        aria-label="Abrir menu"
      >
        <Menu className="size-6" />
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-full max-w-full bg-ink border-l-[var(--jb-hair-strong)] sm:max-w-md"
      >
        <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
        <div className="flex flex-col gap-8 pt-4">
          <Logo />
          <nav className="flex flex-col gap-5">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={cn(
                  'font-display text-2xl font-black uppercase tracking-tight text-cream',
                  'transition-colors hover:text-acid'
                )}
              >
                {link.name}
              </Link>
            ))}
          </nav>
          <div className="h-px bg-[var(--jb-hair)]" />
          <nav className="flex flex-col gap-3">
            {secondaryLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className="font-mono text-xs uppercase tracking-[0.22em] text-fg-3 transition-colors hover:text-acid"
              >
                {link.name}
              </Link>
            ))}
          </nav>
          <div className="mt-4">
            <Link href="/diagnostico" className="btn-primary">
              Diagnóstico <span className="font-mono">→</span>
            </Link>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
