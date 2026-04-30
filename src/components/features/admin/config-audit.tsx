'use client';

import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface AuditEntry {
  id: string;
  namespace: string;
  key: string;
  old_value: unknown;
  new_value: unknown;
  changed_by: string | null;
  changed_at: string;
}

function fmtJson(value: unknown): string {
  if (value === null || value === undefined) return '∅';
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export function ConfigAudit({ initialEntries }: { initialEntries: AuditEntry[] }) {
  const [nsFilter, setNsFilter] = React.useState('');
  const [keyFilter, setKeyFilter] = React.useState('');

  const filtered = React.useMemo(() => {
    const ns = nsFilter.trim().toLowerCase();
    const key = keyFilter.trim().toLowerCase();
    return initialEntries.filter((e) => {
      if (ns && !e.namespace.toLowerCase().includes(ns)) return false;
      if (key && !e.key.toLowerCase().includes(key)) return false;
      return true;
    });
  }, [initialEntries, nsFilter, keyFilter]);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <Label htmlFor="ns-filter">Namespace</Label>
          <Input
            id="ns-filter"
            value={nsFilter}
            onChange={(e) => setNsFilter(e.target.value)}
            placeholder="ex: pricing"
          />
        </div>
        <div>
          <Label htmlFor="key-filter">Key</Label>
          <Input
            id="key-filter"
            value={keyFilter}
            onChange={(e) => setKeyFilter(e.target.value)}
            placeholder="ex: vss.price_cents"
          />
        </div>
      </div>

      <div className="text-fg-3 font-mono text-[11px] tracking-[0.22em] uppercase">
        {filtered.length} de {initialEntries.length} entradas
      </div>

      {filtered.length === 0 ? (
        <p className="text-fg-muted text-xs">Sem entradas pra esses filtros.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {filtered.map((entry) => (
            <li
              key={entry.id}
              className="bg-ink-2 flex flex-col gap-3 border-2 border-[var(--jb-hair)] p-5"
            >
              <header className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{entry.namespace}</Badge>
                  <code className="text-acid font-mono text-sm">{entry.key}</code>
                </div>
                <div className="text-fg-muted font-mono text-[10px] tracking-[0.18em] uppercase">
                  {new Date(entry.changed_at).toLocaleString('pt-BR')}
                  {entry.changed_by ? ` · ${entry.changed_by.slice(-8)}` : ''}
                </div>
              </header>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <Label>Antes</Label>
                  <pre className="bg-ink text-fg-2 overflow-x-auto border border-[var(--jb-hair)] p-3 font-mono text-[11px] whitespace-pre-wrap">
                    {fmtJson(entry.old_value)}
                  </pre>
                </div>
                <div>
                  <Label>Depois</Label>
                  <pre className="bg-ink text-acid overflow-x-auto border border-[var(--jb-hair)] p-3 font-mono text-[11px] whitespace-pre-wrap">
                    {fmtJson(entry.new_value)}
                  </pre>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
