import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/patterns/container';
import {
  CONFIG_NAMESPACES,
  getAuditLog,
  getNamespace,
  type ConfigNamespace,
} from '@/server/services/config';
import { ConfigEditor } from '@/components/features/admin/config-editor';
import { ConfigAudit } from '@/components/features/admin/config-audit';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Admin · Configurações',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

type Tab = ConfigNamespace | 'audit';

const TAB_LABEL: Record<Tab, string> = {
  pricing: 'Pricing',
  offer: 'Oferta',
  email: 'Email',
  feature: 'Features',
  integration: 'Integrações',
  audit: 'Audit Log',
};

const TAB_ORDER: Tab[] = [...CONFIG_NAMESPACES, 'audit'];

function isValidTab(value: string | undefined): value is Tab {
  if (!value) return false;
  return (TAB_ORDER as string[]).includes(value);
}

export default async function AdminConfigPage({
  searchParams,
}: {
  searchParams: Promise<{ ns?: string }>;
}) {
  const sp = await searchParams;
  const active: Tab = isValidTab(sp.ns) ? sp.ns : 'pricing';

  return (
    <Container size="xl" className="flex flex-col gap-8 py-2">
      <div>
        <span className="kicker text-fire">// CONFIG HUB</span>
        <h1 className="heading-2 text-cream mt-2">Configurações</h1>
        <p className="text-fg-3 mt-2 text-sm">
          Source of truth pra preços, oferta, email, feature toggles e integrações. Cada
          alteração grava audit log.
        </p>
      </div>

      <nav
        aria-label="Namespaces"
        className="flex flex-wrap gap-0 border-b border-[var(--jb-hair)]"
      >
        {TAB_ORDER.map((tab) => {
          const isActive = tab === active;
          return (
            <Link
              key={tab}
              href={`/admin/config?ns=${tab}`}
              className={cn(
                'inline-flex items-center px-5 py-3 font-mono text-[11px] tracking-[0.22em] uppercase border-b-2 -mb-[2px] transition-colors',
                isActive
                  ? 'border-fire text-acid'
                  : 'border-transparent text-cream hover:border-acid hover:text-acid'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              {TAB_LABEL[tab]}
            </Link>
          );
        })}
      </nav>

      {active === 'audit' ? (
        <ConfigAudit initialEntries={await loadAudit()} />
      ) : (
        <ConfigEditor namespace={active} initialEntries={await loadEntries(active)} />
      )}
    </Container>
  );
}

async function loadEntries(ns: ConfigNamespace) {
  const rows = await getNamespace(ns);
  return rows.map((r) => ({
    key: r.key,
    value: r.value,
    description: r.description,
    updated_by: r.updated_by,
    updated_at: r.updated_at.toISOString(),
  }));
}

async function loadAudit() {
  const rows = await getAuditLog({ limit: 100 });
  return rows.map((r) => ({
    id: r.id,
    namespace: r.namespace,
    key: r.key,
    old_value: r.old_value,
    new_value: r.new_value,
    changed_by: r.changed_by,
    changed_at: r.changed_at.toISOString(),
  }));
}
