import type { ReactNode } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/ui/logo';
import { requireUser } from '@/server/services/session';

/**
 * Shell de área logada (app.joelburigo.com.br).
 * Protegido por `proxy.ts` (Edge JWT check) + validação real aqui via DB.
 *
 * Sprint 2 aprimora com: sidebar de fases VSS, progresso, notificações, etc.
 */
export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();

  return (
    <div className="bg-ink flex min-h-screen flex-col">
      <header className="bg-ink/95 sticky top-0 z-50 border-b border-[var(--jb-hair)] backdrop-blur-md">
        <div className="mx-auto flex max-w-[var(--jb-container-max)] items-center justify-between gap-4 px-5 py-4 md:px-10">
          <Link href="/area" aria-label="Minha área">
            <Logo size="md" />
          </Link>
          <nav className="flex items-center gap-4 md:gap-6">
            <Link
              href="/area"
              className="text-cream hover:text-acid font-mono text-[11px] tracking-[0.22em] uppercase"
            >
              Área
            </Link>
            <span
              className="text-fg-3 hidden font-mono text-[11px] tracking-[0.18em] md:inline"
              title={user.email}
            >
              {user.email}
            </span>
            <form action="/api/auth/logout" method="post">
              <button
                type="submit"
                className="text-fg-3 hover:text-fire cursor-pointer font-mono text-[11px] tracking-[0.22em] uppercase"
              >
                Sair
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="grow">{children}</main>
    </div>
  );
}
