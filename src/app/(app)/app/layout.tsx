import type { ReactNode } from 'react';
import { Sidebar, type SidebarItem } from '@/components/layouts/sidebar';
import { requireUser } from '@/server/services/session';

/**
 * Shell de área logada (`/app/*`).
 * Protegido por `proxy.ts` (Edge JWT check) + validação real aqui via DB.
 *
 * `icon` usa string-key do registry em sidebar.tsx (server→client safe).
 */
const APP_NAV: SidebarItem[] = [
  { href: '/app/area', label: 'Dashboard', icon: 'dashboard' },
  { href: '/app/onboarding', label: 'Onboarding 6P', icon: 'sparkles' },
  { href: '/app/area', label: 'Fases VSS', icon: 'graduation-cap' },
  { href: '/app/advisory/dashboard', label: 'Advisory', icon: 'compass' },
  { href: '/app/area', label: 'Configurações', icon: 'settings' },
];

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();

  return (
    <div className="bg-ink min-h-screen md:flex">
      <Sidebar
        variant="app"
        items={APP_NAV}
        user={{ email: user.email, name: user.name ?? null }}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-[var(--jb-hair)] px-6 py-4 md:px-10" />
        <main className="flex-1 px-6 py-8 md:px-10">{children}</main>
      </div>
    </div>
  );
}
