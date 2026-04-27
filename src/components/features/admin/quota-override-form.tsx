'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export interface QuotaOverrideFormProps {
  userId: string;
  /** Override atual em tokens (null = sem override, usa cap default). */
  currentOverride: number | null;
  /** Cap default do produto VSS (ex: 500_000). */
  defaultCap: number;
  /** Slug do produto. Default 'vss'. */
  productSlug?: string;
}

export function QuotaOverrideForm({
  userId,
  currentOverride,
  defaultCap,
  productSlug = 'vss',
}: QuotaOverrideFormProps) {
  const router = useRouter();
  const [value, setValue] = React.useState<string>(
    currentOverride != null ? String(currentOverride) : ''
  );
  const [busy, setBusy] = React.useState(false);
  const [msg, setMsg] = React.useState<string | null>(null);

  async function call(override: number | null) {
    setBusy(true);
    setMsg(null);
    try {
      const r = await fetch(`/api/admin/users/${userId}/quota-override`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ override, productSlug }),
      });
      if (!r.ok) {
        const body = (await r.json().catch(() => ({}))) as { error?: string };
        setMsg(body.error ?? `Erro ${r.status}`);
        return;
      }
      setMsg('Salvo.');
      router.refresh();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'erro');
    } finally {
      setBusy(false);
    }
  }

  function onSave(e: React.FormEvent) {
    e.preventDefault();
    const n = Number(value);
    if (!Number.isFinite(n) || n < 0) {
      setMsg('Valor inválido.');
      return;
    }
    void call(Math.floor(n));
  }

  function onRemove() {
    setValue('');
    void call(null);
  }

  const effective = currentOverride ?? defaultCap;

  return (
    <form
      onSubmit={onSave}
      className="border-fg-3/20 bg-ink-2 flex flex-col gap-2 border-2 p-3"
    >
      <div className="text-fg-3 font-mono text-[10px] tracking-[0.2em] uppercase">
        Quota override · {productSlug}
      </div>
      <div className="text-fg-2 text-[11px]">
        Vigente: <span className="text-cream font-mono">{effective.toLocaleString('pt-BR')}</span>{' '}
        tokens/mês{' '}
        {currentOverride != null ? (
          <span className="text-acid">(override)</span>
        ) : (
          <span className="text-fg-muted">(default)</span>
        )}
      </div>
      <div className="flex gap-2">
        <Input
          type="number"
          min={0}
          step={10000}
          inputMode="numeric"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={`default: ${defaultCap.toLocaleString('pt-BR')}`}
          disabled={busy}
          className="flex-1"
        />
        <Button type="submit" disabled={busy} variant="primary" size="sm">
          Salvar
        </Button>
        <Button
          type="button"
          disabled={busy || currentOverride == null}
          onClick={onRemove}
          variant="ghost"
          size="sm"
        >
          Remover
        </Button>
      </div>
      {msg && <div className="text-fg-3 text-[11px]">{msg}</div>}
    </form>
  );
}
