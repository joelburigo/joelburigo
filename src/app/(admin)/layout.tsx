import type { ReactNode } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/ui/logo';

/**
 * Shell de admin (admin.joelburigo.com.br).
 * Protegido por middleware — role=admin obrigatório.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-ink flex min-h-screen flex-col">
      <header className="border-fire bg-ink/95 sticky top-0 z-50 border-b backdrop-blur-md">
        <div className="mx-auto flex max-w-[var(--jb-container-max)] items-center justify-between px-5 py-4 md:px-10">
          <div className="flex items-center gap-4">
            <Link href="/admin" aria-label="Admin">
              <Logo size="md" />
            </Link>
            <span className="text-fire font-mono text-[11px] tracking-[0.22em] uppercase">
              // ADMIN
            </span>
          </div>
          <nav className="flex items-center gap-4 font-mono text-[11px] tracking-[0.22em] uppercase">
            <Link href="/admin" className="text-cream hover:text-acid">
              Dashboard
            </Link>
            <Link href="/admin/leads" className="text-cream hover:text-acid">
              Leads
            </Link>
            <Link href="/admin/users" className="text-cream hover:text-acid">
              Alunos
            </Link>
            <Link href="/admin/mentorias" className="text-cream hover:text-acid">
              Mentorias
            </Link>
            <Link href="/admin/blog" className="text-cream hover:text-acid">
              Blog
            </Link>
            <Link href="/api/auth/logout" className="text-fg-3 hover:text-fire">
              Sair
            </Link>
          </nav>
        </div>
      </header>
      <main className="grow">{children}</main>
    </div>
  );
}
