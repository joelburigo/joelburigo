'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

/**
 * Botões de "Sincronizar agora" e "Desconectar" usados em
 * `/admin/integrations/google` quando há conta Google ativa.
 */
export function GoogleIntegrationActions() {
  const router = useRouter();
  const [syncing, setSyncing] = React.useState(false);
  const [disconnecting, setDisconnecting] = React.useState(false);

  async function onSync() {
    if (syncing) return;
    setSyncing(true);
    try {
      const res = await fetch('/api/admin/calendar/sync', { method: 'POST' });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        added?: number;
        updated?: number;
        deleted?: number;
        async?: boolean;
        error?: string;
      };
      if (!res.ok || !data.ok) {
        toast.error(data.error ?? 'Falha ao sincronizar');
        return;
      }
      if (data.async) {
        toast.info('Sync iniciado em background');
      } else {
        toast.success(
          `Sync OK — +${data.added ?? 0} / Δ${data.updated ?? 0} / -${data.deleted ?? 0}`
        );
      }
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error('Erro de rede');
    } finally {
      setSyncing(false);
    }
  }

  async function onDisconnect() {
    if (disconnecting) return;
    if (!confirm('Desconectar o Google Calendar? Eventos já sincronizados ficam no DB.')) {
      return;
    }
    setDisconnecting(true);
    try {
      const res = await fetch('/api/admin/calendar/disconnect', { method: 'POST' });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        toast.error(data.error ?? 'Falha ao desconectar');
        return;
      }
      toast.success('Conta desconectada');
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error('Erro de rede');
    } finally {
      setDisconnecting(false);
    }
  }

  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        onClick={onSync}
        disabled={syncing}
        className="border border-acid bg-acid/10 px-5 py-2 font-mono text-[11px] tracking-[0.22em] text-acid uppercase transition-all hover:bg-acid/20 hover:shadow-[3px_3px_0_var(--jb-acid)] disabled:opacity-50"
      >
        {syncing ? 'Sincronizando...' : 'Sincronizar agora →'}
      </button>
      <button
        type="button"
        onClick={onDisconnect}
        disabled={disconnecting}
        className="border border-fire bg-transparent px-5 py-2 font-mono text-[11px] tracking-[0.22em] text-fire uppercase transition-all hover:bg-fire/10 disabled:opacity-50"
      >
        {disconnecting ? 'Desconectando...' : 'Desconectar'}
      </button>
    </div>
  );
}
