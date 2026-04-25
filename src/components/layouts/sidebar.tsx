'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, type LucideIcon } from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

export interface SidebarItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
}

export interface SidebarUser {
  email: string;
  name?: string | null;
}

export interface SidebarProps {
  variant: 'app' | 'admin';
  items: SidebarItem[];
  user: SidebarUser;
  /** Optional override; defaults to `usePathname()`. */
  currentPath?: string;
}

const VARIANT_BADGE: Record<SidebarProps['variant'], { text: string; tone: string }> = {
  app: { text: '// ÁREA DO ALUNO', tone: 'text-acid' },
  admin: { text: '// ADMIN', tone: 'text-fire' },
};

function isActive(itemHref: string, pathname: string): boolean {
  if (itemHref === pathname) return true;
  // Treat `/admin` as active only when exact (other admin items handle their own subtree).
  if (itemHref === '/admin') return pathname === '/admin';
  return pathname === itemHref || pathname.startsWith(itemHref + '/');
}

function NavList({
  items,
  pathname,
  onNavigate,
}: {
  items: SidebarItem[];
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-col" aria-label="Navegação principal">
      {items.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href, pathname);
        return (
          <Link
            key={`${item.href}-${item.label}`}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex items-center gap-3 px-4 py-3 font-mono text-[11px] tracking-[0.22em] uppercase border-l-2 transition-colors',
              active
                ? 'border-fire bg-cream/[0.04] text-acid'
                : 'border-transparent text-cream hover:border-acid hover:bg-cream/[0.04]'
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden />
            <span className="flex-1 truncate">{item.label}</span>
            {item.badge && (
              <span className="text-fg-3 border border-[var(--jb-hair)] px-1.5 py-0.5 text-[10px] tracking-[0.18em]">
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

function UserCard({ user }: { user: SidebarUser }) {
  const display = user.name?.trim() || user.email;
  return (
    <div className="border-t border-[var(--jb-hair)] p-4">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-fg-3 font-mono text-[10px] tracking-[0.22em] uppercase">
            // SESSÃO
          </span>
          <span
            className="text-cream truncate font-mono text-[11px] tracking-[0.12em]"
            title={user.email}
          >
            {display}
          </span>
        </div>
        <form action="/api/auth/logout" method="post">
          <button
            type="submit"
            className="text-fg-3 hover:text-fire cursor-pointer font-mono text-[10px] tracking-[0.22em] uppercase transition-colors"
          >
            Sair →
          </button>
        </form>
      </div>
    </div>
  );
}

function SidebarBody({
  variant,
  items,
  user,
  pathname,
  onNavigate,
}: {
  variant: SidebarProps['variant'];
  items: SidebarItem[];
  user: SidebarUser;
  pathname: string;
  onNavigate?: () => void;
}) {
  const badge = VARIANT_BADGE[variant];
  const homeHref = variant === 'admin' ? '/admin' : '/app/area';

  return (
    <div className="flex h-full min-h-screen flex-col">
      <div className="flex flex-col gap-3 px-5 pt-6 pb-5">
        <Link href={homeHref} aria-label="Início" onClick={onNavigate}>
          <Logo size="sm" />
        </Link>
        <span className={cn('font-mono text-[10px] tracking-[0.22em] uppercase', badge.tone)}>
          {badge.text}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto pb-4">
        <NavList items={items} pathname={pathname} onNavigate={onNavigate} />
      </div>
      <UserCard user={user} />
    </div>
  );
}

export function Sidebar({ variant, items, user, currentPath }: SidebarProps) {
  const fallback = usePathname() ?? '';
  const pathname = currentPath ?? fallback;
  const [open, setOpen] = React.useState(false);

  const accent = variant === 'admin' ? 'text-fire' : 'text-acid';

  return (
    <>
      <aside
        className="bg-ink hidden w-[260px] shrink-0 border-r border-[var(--jb-hair)] md:block"
        aria-label="Sidebar"
      >
        <SidebarBody variant={variant} items={items} user={user} pathname={pathname} />
      </aside>

      <header className="bg-ink/95 sticky top-0 z-40 flex items-center justify-between border-b border-[var(--jb-hair)] px-5 py-3 backdrop-blur-md md:hidden">
        <Link href={variant === 'admin' ? '/admin' : '/app/area'} aria-label="Início">
          <Logo size="sm" />
        </Link>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            className="text-cream hover:text-acid inline-flex size-10 items-center justify-center transition-colors"
            aria-label="Abrir menu"
          >
            <Menu className={cn('size-5', accent)} />
          </SheetTrigger>
          <SheetContent
            side="left"
            className="bg-ink w-[280px] border-r-[var(--jb-hair-strong)] p-0 sm:max-w-[280px]"
          >
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <SidebarBody
              variant={variant}
              items={items}
              user={user}
              pathname={pathname}
              onNavigate={() => setOpen(false)}
            />
          </SheetContent>
        </Sheet>
      </header>
    </>
  );
}
