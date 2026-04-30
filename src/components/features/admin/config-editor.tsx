'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

export interface ConfigEntry {
  key: string;
  value: unknown;
  description: string | null;
  updated_by: string | null;
  updated_at: string;
}

type ValueKind = 'boolean' | 'number' | 'string' | 'json';

function detectKind(value: unknown): ValueKind {
  if (typeof value === 'boolean') return 'boolean';
  if (typeof value === 'number') return 'number';
  if (typeof value === 'string') return 'string';
  return 'json';
}

function formatJson(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

interface SaveState {
  status: 'idle' | 'saving' | 'success' | 'error';
  message?: string;
}

function ConfigRow({
  namespace,
  entry,
  onSaved,
}: {
  namespace: string;
  entry: ConfigEntry;
  onSaved: () => void;
}) {
  const kind = detectKind(entry.value);

  // Estado local do input (string/number/bool/json)
  const [boolValue, setBoolValue] = React.useState<boolean>(
    kind === 'boolean' ? (entry.value as boolean) : false
  );
  const [numberValue, setNumberValue] = React.useState<string>(
    kind === 'number' ? String(entry.value as number) : ''
  );
  const [stringValue, setStringValue] = React.useState<string>(
    kind === 'string' ? (entry.value as string) : ''
  );
  const [jsonValue, setJsonValue] = React.useState<string>(
    kind === 'json' ? formatJson(entry.value) : formatJson(entry.value)
  );

  const [save, setSave] = React.useState<SaveState>({ status: 'idle' });

  function buildValue(): { ok: true; value: unknown } | { ok: false; error: string } {
    if (kind === 'boolean') return { ok: true, value: boolValue };
    if (kind === 'number') {
      if (numberValue.trim() === '') return { ok: false, error: 'número vazio' };
      const n = Number(numberValue);
      if (!Number.isFinite(n)) return { ok: false, error: 'número inválido' };
      return { ok: true, value: n };
    }
    if (kind === 'string') return { ok: true, value: stringValue };
    // json
    try {
      return { ok: true, value: JSON.parse(jsonValue) };
    } catch (err) {
      return { ok: false, error: `JSON inválido: ${(err as Error).message}` };
    }
  }

  async function handleSave() {
    const built = buildValue();
    if (!built.ok) {
      setSave({ status: 'error', message: built.error });
      return;
    }
    setSave({ status: 'saving' });
    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          namespace,
          key: entry.key,
          value: built.value,
          ...(entry.description ? { description: entry.description } : {}),
        }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        setSave({ status: 'error', message: j.error ?? `HTTP ${res.status}` });
        return;
      }
      setSave({ status: 'success' });
      onSaved();
    } catch (err) {
      setSave({ status: 'error', message: (err as Error).message });
    }
  }

  return (
    <article className="bg-ink-2 flex flex-col gap-3 border-2 border-[var(--jb-hair)] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <code className="text-acid font-mono text-sm">{entry.key}</code>
            <Badge variant="outline">{kind}</Badge>
          </div>
          {entry.description && (
            <p className="text-fg-3 mt-1 text-xs">{entry.description}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor={`val-${entry.key}`}>Valor</Label>
        {kind === 'boolean' && (
          <label className="flex cursor-pointer items-center gap-3">
            <input
              id={`val-${entry.key}`}
              type="checkbox"
              checked={boolValue}
              onChange={(e) => setBoolValue(e.target.checked)}
              className="border-fire text-acid focus:ring-acid h-5 w-5 cursor-pointer rounded-none border-2 bg-transparent"
            />
            <span className="text-cream font-mono text-sm">
              {boolValue ? 'true' : 'false'}
            </span>
          </label>
        )}
        {kind === 'number' && (
          <Input
            id={`val-${entry.key}`}
            type="number"
            value={numberValue}
            onChange={(e) => setNumberValue(e.target.value)}
            inputMode="decimal"
          />
        )}
        {kind === 'string' && (
          <Input
            id={`val-${entry.key}`}
            type="text"
            value={stringValue}
            onChange={(e) => setStringValue(e.target.value)}
          />
        )}
        {kind === 'json' && (
          <Textarea
            id={`val-${entry.key}`}
            value={jsonValue}
            onChange={(e) => setJsonValue(e.target.value)}
            rows={6}
            className="font-mono text-xs"
          />
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-fg-muted font-mono text-[10px] tracking-[0.18em] uppercase">
          atualizado em {new Date(entry.updated_at).toLocaleString('pt-BR')}
          {entry.updated_by ? ` · por ${entry.updated_by.slice(-8)}` : ''}
        </div>
        <div className="flex items-center gap-3">
          {save.status === 'success' && (
            <span className="text-acid font-mono text-[11px] tracking-[0.18em] uppercase">
              ✓ salvo
            </span>
          )}
          {save.status === 'error' && (
            <span className="text-fire font-mono text-[11px]">{save.message}</span>
          )}
          <Button
            type="button"
            variant="primary"
            size="sm"
            disabled={save.status === 'saving'}
            onClick={handleSave}
            aria-busy={save.status === 'saving'}
          >
            {save.status === 'saving' ? 'Salvando…' : 'Salvar'}
          </Button>
        </div>
      </div>
    </article>
  );
}

export function ConfigEditor({
  namespace,
  initialEntries,
}: {
  namespace: string;
  initialEntries: ConfigEntry[];
}) {
  const router = useRouter();

  if (initialEntries.length === 0) {
    return (
      <p className="text-fg-muted text-xs">
        Nenhuma config no namespace <code className="font-mono">{namespace}</code>. Rode{' '}
        <code className="font-mono">pnpm db:seed</code>.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {initialEntries.map((entry) => (
        <ConfigRow
          key={`${namespace}:${entry.key}`}
          namespace={namespace}
          entry={entry}
          onSaved={() => router.refresh()}
        />
      ))}
    </div>
  );
}
