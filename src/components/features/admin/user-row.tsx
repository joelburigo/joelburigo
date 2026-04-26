'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface UserRowData {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
  lastLoginAt: string | null;
  productSlugs: string[];
  monthTokensUsed: number;
  monthCostCents: number;
  tokenQuota: number | null;
}

interface UserDetail {
  user: { id: string; email: string; name: string | null; role: string };
  profile: Record<string, unknown> | null;
  purchases: Array<{
    purchase: {
      id: string;
      amount_cents: number;
      currency: string;
      status: string;
      paid_at: string | null;
    };
    productName: string | null;
    productSlug: string | null;
  }>;
  entitlements: Array<{
    entitlement: { id: string; status: string; ends_at: string | null };
    productName: string | null;
    productSlug: string | null;
  }>;
  advisorySessions: Array<{
    id: string;
    scheduled_at: string | null;
    status: string;
  }>;
  conversationsCount: number;
}

export function UserRow({ data }: { data: UserRowData }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [detail, setDetail] = React.useState<UserDetail | null>(null);
  const [busy, setBusy] = React.useState(false);

  const tokenPct = data.tokenQuota
    ? Math.min(100, Math.round((data.monthTokensUsed / data.tokenQuota) * 100))
    : null;

  async function openDetail() {
    setOpen(true);
    setDetail(null);
    try {
      const r = await fetch(`/api/admin/users/${data.id}`);
      if (r.ok) setDetail((await r.json()) as UserDetail);
    } catch {
      // ignore
    }
  }

  async function toggleRole() {
    if (busy) return;
    setBusy(true);
    try {
      const newRole = data.role === 'admin' ? 'user' : 'admin';
      await fetch(`/api/admin/users/${data.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      router.refresh();
      setOpen(false);
    } finally {
      setBusy(false);
    }
  }

  async function revokeEntitlement(entitlementId: string) {
    if (!confirm('Revogar entitlement?')) return;
    setBusy(true);
    try {
      await fetch(`/api/admin/entitlements/${entitlementId}/revoke`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ reason: 'admin_revoke' }),
      });
      router.refresh();
      setOpen(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <tr
        className="hover:bg-ink-2 cursor-pointer border-t border-[var(--jb-hair)]"
        onClick={openDetail}
      >
        <td className="text-cream px-3 py-2 font-mono text-xs">{data.email}</td>
        <td className="text-fg-2 px-3 py-2 text-xs">{data.name ?? '—'}</td>
        <td className="px-3 py-2">
          <Badge variant={data.role === 'admin' ? 'fire' : 'default'}>{data.role}</Badge>
        </td>
        <td className="text-fg-3 px-3 py-2 font-mono text-[11px]">
          {new Date(data.createdAt).toLocaleDateString('pt-BR')}
        </td>
        <td className="px-3 py-2">
          <div className="flex flex-wrap gap-1">
            {data.productSlugs.length === 0 ? (
              <span className="text-fg-muted text-[11px]">—</span>
            ) : (
              data.productSlugs.map((s) => (
                <Badge key={s} variant="acid">
                  {s}
                </Badge>
              ))
            )}
          </div>
        </td>
        <td className="px-3 py-2">
          {tokenPct != null ? (
            <div className="flex items-center gap-2">
              <div className="bg-ink h-1.5 w-20 border border-[var(--jb-hair)]">
                <div
                  className="bg-acid h-full"
                  style={{ width: `${tokenPct}%` }}
                />
              </div>
              <span className="text-fg-3 font-mono text-[10px]">{tokenPct}%</span>
            </div>
          ) : (
            <span className="text-fg-muted font-mono text-[11px]">
              {data.monthTokensUsed.toLocaleString('pt-BR')}
            </span>
          )}
        </td>
        <td className="text-fg-3 px-3 py-2 font-mono text-[11px]">
          {data.lastLoginAt ? new Date(data.lastLoginAt).toLocaleDateString('pt-BR') : '—'}
        </td>
      </tr>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="flex w-full max-w-xl flex-col gap-4 overflow-y-auto sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>{data.name ?? data.email}</SheetTitle>
            <SheetDescription>
              {data.email} · role: {data.role}
            </SheetDescription>
          </SheetHeader>

          {!detail && <span className="text-fg-muted text-xs">carregando…</span>}

          {detail && (
            <>
              <div>
                <div className="text-fg-3 font-mono text-[10px] tracking-[0.22em] uppercase">
                  Compras ({detail.purchases.length})
                </div>
                <ul className="mt-2 flex flex-col gap-1">
                  {detail.purchases.map((p) => (
                    <li key={p.purchase.id} className="text-cream text-xs">
                      {p.productSlug ?? '—'} ·{' '}
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: p.purchase.currency,
                      }).format(p.purchase.amount_cents / 100)}{' '}
                      · {p.purchase.status}
                    </li>
                  ))}
                  {detail.purchases.length === 0 && (
                    <li className="text-fg-muted text-xs">Sem compras.</li>
                  )}
                </ul>
              </div>

              <div>
                <div className="text-fg-3 font-mono text-[10px] tracking-[0.22em] uppercase">
                  Entitlements
                </div>
                <ul className="mt-2 flex flex-col gap-1">
                  {detail.entitlements.map((e) => (
                    <li
                      key={e.entitlement.id}
                      className="flex items-center justify-between gap-2 text-xs"
                    >
                      <span className="text-cream">
                        {e.productSlug ?? '—'} · {e.entitlement.status}
                      </span>
                      {e.entitlement.status === 'active' && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          disabled={busy}
                          onClick={() => revokeEntitlement(e.entitlement.id)}
                        >
                          Revogar
                        </Button>
                      )}
                    </li>
                  ))}
                  {detail.entitlements.length === 0 && (
                    <li className="text-fg-muted text-xs">Sem entitlements.</li>
                  )}
                </ul>
              </div>

              <div>
                <div className="text-fg-3 font-mono text-[10px] tracking-[0.22em] uppercase">
                  Sessões Advisory ({detail.advisorySessions.length})
                </div>
                <ul className="mt-2 flex flex-col gap-1">
                  {detail.advisorySessions.slice(0, 5).map((s) => (
                    <li key={s.id} className="text-cream text-xs">
                      {s.scheduled_at
                        ? new Date(s.scheduled_at).toLocaleString('pt-BR')
                        : 'sem data'}{' '}
                      · {s.status}
                    </li>
                  ))}
                  {detail.advisorySessions.length === 0 && (
                    <li className="text-fg-muted text-xs">Nenhuma.</li>
                  )}
                </ul>
              </div>

              <div className="text-fg-3 text-xs">
                Conversations agente: <span className="text-cream">{detail.conversationsCount}</span>
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="button" variant="secondary" size="sm" disabled={busy} onClick={toggleRole}>
                  {data.role === 'admin' ? 'Revogar admin' : 'Promover a admin'}
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
