import type { ReactNode } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/ui/logo';

/**
 * Shell de área logada (app.joelburigo.com.br).
 * Protegido por middleware — session obrigatória.
 *
 * Sprint 2 aprimora com: sidebar de fases VSS, progresso, notificações, etc.
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-ink">
      <header className="sticky top-0 z-50 border-b border-[var(--jb-hair)] bg-ink/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-[var(--jb-container-max)] items-center justify-between px-5 py-4 md:px-10">
          <Link href="/area" aria-label="Minha área">
            <Logo asLink={false} />
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              href="/area"
              className="font-mono text-[11px] uppercase tracking-[0.22em] text-cream hover:text-acid"
            >
              Área
            </Link>
            <Link
              href="/advisory/dashboard"
              className="font-mono text-[11px] uppercase tracking-[0.22em] text-cream hover:text-acid"
            >
              Advisory
            </Link>
            <Link
              href="/api/auth/logout"
              className="font-mono text-[11px] uppercase tracking-[0.22em] text-fg-3 hover:text-fire"
            >
              Sair
            </Link>
          </nav>
        </div>
      </header>
      <main className="grow">{children}</main>
    </div>
  );
}
