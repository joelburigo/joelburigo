'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AutosaveTextarea } from './autosave-textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface RefundCardData {
  id: string;
  status: string;
  reason: string | null;
  adminNote: string | null;
  createdAt: string;
  user: { name: string | null; email: string } | null;
  purchase: {
    productName: string | null;
    productSlug: string | null;
    amountCents: number;
    currency: string;
    paidAt: string | null;
  } | null;
}

function formatBRL(cents: number, currency = 'BRL'): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
  }).format(cents / 100);
}

export function RefundCard({ data }: { data: RefundCardData }) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);
  const [denyReason, setDenyReason] = React.useState('');

  async function call(action: 'approve' | 'deny' | 'convert') {
    setBusy(true);
    try {
      const body: Record<string, string> = { action };
      if (action === 'deny') body.denied_reason = denyReason;
      const r = await fetch(`/api/admin/refunds/${data.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (r.ok) router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function saveNote(note: string) {
    await fetch(`/api/admin/refunds/${data.id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ action: 'update_note', admin_note: note }),
    });
  }

  const statusVariant =
    data.status === 'pending'
      ? 'fire'
      : data.status === 'approved'
        ? 'acid'
        : data.status === 'denied'
          ? 'outline'
          : 'default';

  return (
    <article className="bg-ink-2 flex flex-col gap-3 border-2 border-[var(--jb-hair)] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-cream font-semibold">
            {data.user?.name ?? data.user?.email ?? '—'}
          </div>
          <div className="text-fg-3 font-mono text-[11px]">{data.user?.email}</div>
        </div>
        <Badge variant={statusVariant as 'default' | 'acid' | 'fire' | 'outline'}>
          {data.status}
        </Badge>
      </div>

      {data.purchase && (
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{data.purchase.productSlug ?? '—'}</Badge>
          <span className="text-cream text-sm font-semibold">
            {formatBRL(data.purchase.amountCents, data.purchase.currency)}
          </span>
          {data.purchase.paidAt && (
            <span className="text-fg-muted font-mono text-[11px]">
              pago em {new Date(data.purchase.paidAt).toLocaleDateString('pt-BR')}
            </span>
          )}
        </div>
      )}

      {data.reason && (
        <div>
          <Label>Motivo do cliente</Label>
          <p className="text-fg-2 text-sm whitespace-pre-wrap">{data.reason}</p>
        </div>
      )}

      <div>
        <Label>Nota interna</Label>
        <AutosaveTextarea
          initialValue={data.adminNote ?? ''}
          onSave={saveNote}
          placeholder="Notas internas sobre esse pedido…"
        />
      </div>

      {data.status === 'pending' && (
        <>
          <div className="flex flex-col gap-1">
            <Label>Motivo (negar)</Label>
            <Input
              value={denyReason}
              onChange={(e) => setDenyReason(e.target.value)}
              placeholder="Obrigatório se for negar"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={busy}
              onClick={() => call('approve')}
              aria-busy={busy}
            >
              Aprovar
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={busy || !denyReason.trim()}
              onClick={() => call('deny')}
              aria-busy={busy}
            >
              Negar
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={busy}
              onClick={() => call('convert')}
              aria-busy={busy}
            >
              Converter
            </Button>
          </div>
        </>
      )}

      <div className="text-fg-muted font-mono text-[10px] tracking-[0.18em] uppercase">
        criado em {new Date(data.createdAt).toLocaleString('pt-BR')}
      </div>
    </article>
  );
}
