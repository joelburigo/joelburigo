'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export interface KanbanFilters {
  q: string;
  status: 'open' | 'won' | 'lost' | 'all';
  source: string[];
  period: '7d' | '30d' | '90d' | 'today' | 'all' | 'custom';
  from: string | null; // ISO date
  to: string | null;
  owner: string | null;
}

export interface KanbanFacets {
  sources: Array<{ value: string; count: number }>;
  owners: Array<{ id: string; name: string | null; email: string }>;
}

interface Props {
  filters: KanbanFilters;
  onFiltersChange: (f: KanbanFilters) => void;
  facets: KanbanFacets;
  counts: { total: number; open: number; won: number; lost: number; winRate: number };
  loading: boolean;
  totalUnfiltered: number;
}

const PERIOD_OPTIONS: Array<{ value: KanbanFilters['period']; label: string }> = [
  { value: 'today', label: 'Hoje' },
  { value: '7d', label: '7d' },
  { value: '30d', label: '30d' },
  { value: '90d', label: '90d' },
  { value: 'all', label: 'Tudo' },
  { value: 'custom', label: 'Custom' },
];

const STATUS_OPTIONS: Array<{ value: KanbanFilters['status']; label: string }> = [
  { value: 'open', label: 'Open' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' },
  { value: 'all', label: 'Todos' },
];

function periodToRange(period: KanbanFilters['period']): { from: string | null; to: string | null } {
  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  if (period === 'all' || period === 'custom') return { from: null, to: null };
  if (period === 'today') return { from: today.toISOString(), to: null };
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  const from = new Date(today);
  from.setUTCDate(from.getUTCDate() - days);
  return { from: from.toISOString(), to: null };
}

export function KanbanToolbar({
  filters,
  onFiltersChange,
  facets,
  counts,
  loading,
  totalUnfiltered,
}: Props) {
  const [qLocal, setQLocal] = React.useState(filters.q);

  // Debounce search input
  React.useEffect(() => {
    const t = setTimeout(() => {
      if (qLocal !== filters.q) {
        onFiltersChange({ ...filters, q: qLocal });
      }
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qLocal]);

  // Resync if external filters change
  React.useEffect(() => {
    if (filters.q !== qLocal) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQLocal(filters.q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.q]);

  function setPeriod(period: KanbanFilters['period']) {
    const range = periodToRange(period);
    onFiltersChange({ ...filters, period, from: range.from, to: range.to });
  }

  function toggleSource(value: string) {
    const next = filters.source.includes(value)
      ? filters.source.filter((s) => s !== value)
      : [...filters.source, value];
    onFiltersChange({ ...filters, source: next });
  }

  function clear() {
    onFiltersChange({
      q: '',
      status: 'open',
      source: [],
      period: '30d',
      from: periodToRange('30d').from,
      to: null,
      owner: null,
    });
    setQLocal('');
  }

  const hasFilters =
    filters.q !== '' ||
    filters.source.length > 0 ||
    filters.status !== 'open' ||
    filters.period !== '30d' ||
    filters.owner !== null;

  return (
    <div className="bg-ink-2 flex flex-col gap-3 border border-[var(--jb-hair)] p-3">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Buscar nome · email · whatsapp · título…"
          value={qLocal}
          onChange={(e) => setQLocal(e.target.value)}
          className="h-9 max-w-sm flex-1 min-w-[200px]"
        />

        <div className="flex items-center gap-1 border border-[var(--jb-hair)]">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => onFiltersChange({ ...filters, status: s.value })}
              className={`px-2.5 py-1.5 font-mono text-[10px] tracking-[0.18em] uppercase transition-colors ${
                filters.status === s.value
                  ? 'bg-[var(--jb-acid-soft)] text-acid'
                  : 'text-fg-3 hover:text-acid'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 border border-[var(--jb-hair)]">
          {PERIOD_OPTIONS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setPeriod(p.value)}
              className={`px-2.5 py-1.5 font-mono text-[10px] tracking-[0.18em] uppercase transition-colors ${
                filters.period === p.value
                  ? 'bg-[var(--jb-acid-soft)] text-acid'
                  : 'text-fg-3 hover:text-acid'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {filters.period === 'custom' && (
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={filters.from?.slice(0, 10) ?? ''}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  from: e.target.value ? new Date(e.target.value).toISOString() : null,
                })
              }
              className="bg-ink-2 text-cream h-9 border border-[var(--jb-hair)] px-2 font-mono text-xs"
            />
            <span className="text-fg-muted">→</span>
            <input
              type="date"
              value={filters.to?.slice(0, 10) ?? ''}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  to: e.target.value ? new Date(e.target.value).toISOString() : null,
                })
              }
              className="bg-ink-2 text-cream h-9 border border-[var(--jb-hair)] px-2 font-mono text-xs"
            />
          </div>
        )}

        {facets.owners.length > 0 && (
          <select
            value={filters.owner ?? ''}
            onChange={(e) => onFiltersChange({ ...filters, owner: e.target.value || null })}
            className="bg-ink-2 text-cream h-9 border border-[var(--jb-hair)] px-2 font-mono text-xs"
          >
            <option value="">Owner: todos</option>
            {facets.owners.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name ?? o.email}
              </option>
            ))}
          </select>
        )}

        {hasFilters && (
          <Button type="button" variant="ghost" size="sm" onClick={clear}>
            Limpar
          </Button>
        )}
      </div>

      {facets.sources.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-fg-muted font-mono text-[10px] tracking-[0.18em] uppercase">
            Source:
          </span>
          {facets.sources.map((s) => {
            const active = filters.source.includes(s.value);
            return (
              <button
                key={s.value}
                type="button"
                onClick={() => toggleSource(s.value)}
                className={`border px-2 py-0.5 font-mono text-[10px] tracking-[0.18em] uppercase transition-colors ${
                  active
                    ? 'border-acid text-acid bg-[var(--jb-acid-soft)]'
                    : 'border-[var(--jb-hair)] text-fg-3 hover:border-acid hover:text-acid'
                }`}
              >
                {s.value} ({s.count})
              </button>
            );
          })}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 border-t border-[var(--jb-hair)] pt-2 font-mono text-[11px] tracking-[0.18em] uppercase">
        <span className="text-fg-muted">
          {loading ? 'carregando…' : `Total: ${counts.total}/${totalUnfiltered}`}
        </span>
        <span className="text-fg-3">·</span>
        <span className="text-cream">Open: {counts.open}</span>
        <span className="text-fg-3">·</span>
        <span className="text-acid">Won: {counts.won}</span>
        <span className="text-fg-3">·</span>
        <span className="text-fire-hot">Lost: {counts.lost}</span>
        <span className="text-fg-3">·</span>
        <span className="text-fg-2">Win rate: {counts.winRate}%</span>
      </div>
    </div>
  );
}
