import type { ReactNode } from 'react';
import {
  Compass,
  GraduationCap,
  LayoutDashboard,
  Settings,
  Sparkles,
} from 'lucide-react';
import { Sidebar, type SidebarItem } from '@/components/layouts/sidebar';
import { requireUser } from '@/server/services/session';

/**
 * Shell de área logada (`/app/*`).
 * Protegido por `proxy.ts` (Edge JWT check) + validação real aqui via DB.
 *
 * Sprint 2 popula header com breadcrumbs/status; Sprint 4 expande sidebar com fases VSS.
 */
const APP_NAV: SidebarItem[] = [
  { href: '/app/area', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/app/onboarding', label: 'Onboarding 6P', icon: Sparkles },
  { href: '/app/area', label: 'Fases VSS', icon: GraduationCap },
  { href: '/app/advisory/dashboard', label: 'Advisory', icon: Compass },
  { href: '/app/area', label: 'Configurações', icon: Settings },
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
