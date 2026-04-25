import type { ReactNode } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/ui/logo';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-[var(--jb-hair)] bg-ink">
        <div className="mx-auto flex max-w-[var(--jb-container-max)] items-center justify-between px-5 py-5 md:px-10">
          <Link href="/" aria-label="Joel Burigo · Home">
            <Logo size="md" />
          </Link>
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-fg-muted">
            Área restrita
          </span>
        </div>
      </header>
      <main className="grow">{children}</main>
    </div>
  );
}
