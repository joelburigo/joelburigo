import type { ReactNode } from 'react';
import { Sidebar, type SidebarItem } from '@/components/layouts/sidebar';
import { requireAdmin } from '@/server/services/session';

/**
 * Shell de admin (`/admin/*`).
 * Protegido por `proxy.ts` (Edge JWT check) + validação `role=admin` aqui via DB.
 *
 * `icon` usa string-key do registry em sidebar.tsx (server→client safe).
 */
const ADMIN_NAV: SidebarItem[] = [
  { href: '/admin', label: 'Dashboard', icon: 'dashboard' },
  { href: '/admin/leads', label: 'Leads', icon: 'inbox' },
  { href: '/admin/users', label: 'Alunos', icon: 'users' },
  { href: '/admin/mentorias', label: 'Mentorias', icon: 'video' },
  { href: '/admin/agenda', label: 'Agenda', icon: 'calendar' },
  { href: '/admin/disponibilidade', label: 'Disponibilidade', icon: 'calendar-clock' },
  { href: '/admin/integrations/google', label: 'Integrações', icon: 'plug' },
  { href: '/admin/blog', label: 'Blog', icon: 'file-text' },
  { href: '/admin/agent-usage', label: 'Uso do Agente', icon: 'activity' },
  { href: '/admin/refunds', label: 'Reembolsos', icon: 'inbox' },
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await requireAdmin();

  return (
    <div className="bg-ink min-h-screen md:flex">
      <Sidebar
        variant="admin"
        items={ADMIN_NAV}
        user={{ email: user.email, name: user.name ?? null }}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-fire border-b px-6 py-4 md:px-10" />
        <main className="flex-1 px-6 py-8 md:px-10">{children}</main>
      </div>
    </div>
  );
}
