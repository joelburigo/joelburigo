'use client';

import { useMemo, useState, useTransition } from 'react';
import { X, Plus } from 'lucide-react';
import type { BlogTag } from '@/server/db/schema';

interface Props {
  allTags: BlogTag[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  onCreated: (tag: BlogTag) => void;
}

export function TagSelector({ allTags, selectedIds, onChange, onCreated }: Props) {
  const [query, setQuery] = useState('');
  const [isPending, startTransition] = useTransition();

  const selected = useMemo(
    () => allTags.filter((t) => selectedIds.includes(t.id)),
    [allTags, selectedIds]
  );
  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allTags
      .filter((t) => !selectedIds.includes(t.id))
      .filter((t) => (q ? t.name.toLowerCase().includes(q) || t.slug.includes(q) : true))
      .slice(0, 8);
  }, [allTags, selectedIds, query]);

  const exactMatch = useMemo(
    () => allTags.find((t) => t.name.toLowerCase() === query.trim().toLowerCase()),
    [allTags, query]
  );

  function add(id: string) {
    if (selectedIds.includes(id)) return;
    onChange([...selectedIds, id]);
    setQuery('');
  }

  function remove(id: string) {
    onChange(selectedIds.filter((x) => x !== id));
  }

  async function createAndAdd() {
    const name = query.trim();
    if (!name) return;
    const res = await fetch('/api/admin/blog/tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) {
      alert('Falha ao criar tag');
      return;
    }
    const { tag } = (await res.json()) as { tag: BlogTag };
    onCreated(tag);
    onChange([...selectedIds, tag.id]);
    setQuery('');
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    if (exactMatch) {
      add(exactMatch.id);
      return;
    }
    if (query.trim()) {
      startTransition(() => {
        void createAndAdd();
      });
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1">
        {selected.map((t) => (
          <span
            key={t.id}
            className="bg-acid/10 border-acid text-acid inline-flex items-center gap-1 border px-2 py-0.5 font-mono text-[11px] uppercase tracking-[0.18em]"
          >
            {t.name}
            <button
              type="button"
              onClick={() => remove(t.id)}
              aria-label={`Remover ${t.name}`}
              className="hover:text-fire"
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Buscar/criar tag (Enter)"
          className="bg-ink text-cream placeholder:text-fg-muted focus:border-acid h-9 w-full border border-[var(--jb-hair)] px-3 text-sm focus:outline-none"
        />
        {query && (suggestions.length > 0 || !exactMatch) && (
          <div className="bg-ink-2 absolute left-0 right-0 top-full z-10 mt-1 max-h-56 overflow-y-auto border border-[var(--jb-hair-strong)]">
            {suggestions.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => add(t.id)}
                className="text-fg-1 hover:bg-ink hover:text-acid flex w-full items-center justify-between px-3 py-1.5 text-left text-xs"
              >
                <span>{t.name}</span>
                <span className="text-fg-3 font-mono text-[10px]">/{t.slug}</span>
              </button>
            ))}
            {!exactMatch && query.trim() && (
              <button
                type="button"
                onClick={() => startTransition(() => void createAndAdd())}
                disabled={isPending}
                className="text-acid border-fire hover:bg-acid hover:text-ink flex w-full items-center gap-2 border-t px-3 py-1.5 text-left text-xs"
              >
                <Plus className="size-3" /> Criar &quot;{query.trim()}&quot;
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
