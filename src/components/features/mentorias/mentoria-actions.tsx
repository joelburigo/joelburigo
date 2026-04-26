'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Radio, Square, Trash2, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  id: string;
  liveStatus: string;
  status: string;
}

export function MentoriaActions({ id, liveStatus, status }: Props) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  async function call(action: 'mark_live' | 'mark_ended') {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/mentorias/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) {
        console.error('[mentoria-actions] PATCH falhou', await res.text());
      }
      router.refresh();
    } finally {
      setBusy(false);
      setOpen(false);
    }
  }

  async function remove() {
    if (!confirm('Deletar mentoria? O live input no CF também será removido.')) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/mentorias/${id}`, { method: 'DELETE' });
      if (!res.ok) console.error('[mentoria-actions] DELETE falhou');
      router.refresh();
    } finally {
      setBusy(false);
      setOpen(false);
    }
  }

  return (
    <div className="relative">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setOpen((o) => !o)}
        aria-label="Ações"
      >
        <MoreHorizontal className="size-4" />
      </Button>
      {open ? (
        <div className="absolute right-0 top-full z-10 mt-1 flex min-w-[220px] flex-col border border-[var(--jb-hair-strong)] bg-ink-2 p-1 shadow-[6px_6px_0_var(--jb-fire)]">
          {liveStatus !== 'live' && status !== 'recorded' ? (
            <button
              type="button"
              onClick={() => call('mark_live')}
              disabled={busy}
              className="flex items-center gap-2 px-3 py-2 text-left font-mono text-[11px] uppercase tracking-[0.18em] text-cream hover:bg-ink hover:text-fire"
            >
              <Radio className="size-3.5" /> Marcar ao vivo
            </button>
          ) : null}
          {liveStatus === 'live' ? (
            <button
              type="button"
              onClick={() => call('mark_ended')}
              disabled={busy}
              className="flex items-center gap-2 px-3 py-2 text-left font-mono text-[11px] uppercase tracking-[0.18em] text-cream hover:bg-ink hover:text-acid"
            >
              <Square className="size-3.5" /> Marcar finalizada
            </button>
          ) : null}
          <button
            type="button"
            onClick={remove}
            disabled={busy}
            className="flex items-center gap-2 px-3 py-2 text-left font-mono text-[11px] uppercase tracking-[0.18em] text-fire-hot hover:bg-ink"
          >
            <Trash2 className="size-3.5" /> Deletar
          </button>
        </div>
      ) : null}
    </div>
  );
}
