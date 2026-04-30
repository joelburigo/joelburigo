'use client';

import * as React from 'react';
import type { KanbanCardData } from './leads-kanban-shell';

interface Props {
  opportunity: KanbanCardData;
  active: boolean;
  onClick: () => void;
  onDragStart: (e: React.DragEvent) => void;
}

function formatBRL(cents: number | null): string | null {
  if (cents == null || cents === 0) return null;
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    Number(cents) / 100
  );
}

function timeAgo(iso: string | null): string {
  if (!iso) return '—';
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const days = Math.floor(diff / 86_400_000);
  if (days < 1) {
    const hours = Math.floor(diff / 3_600_000);
    if (hours < 1) return 'agora';
    return `${hours}h`;
  }
  if (days < 30) return `${days}d`;
  const months = Math.floor(days / 30);
  return `${months}mo`;
}

export function KanbanCard({ opportunity: o, active, onClick, onDragStart }: Props) {
  const value = formatBRL(o.value_cents);
  const ts = timeAgo(o.last_activity_at ?? o.created_at);
  const contact = o.contact;

  return (
    <article
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      tabIndex={0}
      className={`bg-ink-2 group cursor-pointer border p-2.5 transition-colors focus:outline-none ${
        active
          ? 'border-acid'
          : 'border-[var(--jb-hair)] hover:border-acid focus-visible:border-acid'
      }`}
      data-opp-id={o.id}
    >
      {(contact.source || contact.produto_interesse) && (
        <div className="mb-1.5 flex flex-wrap gap-1">
          {contact.source && (
            <span className="bg-ink text-fg-3 inline-block border border-[var(--jb-hair)] px-1.5 py-0.5 font-mono text-[9px] tracking-[0.16em] uppercase">
              {contact.source.replace(/^form_/, '')}
            </span>
          )}
          {contact.produto_interesse && (
            <span className="text-acid border-acid bg-[var(--jb-acid-soft)] inline-block border px-1.5 py-0.5 font-mono text-[9px] tracking-[0.16em] uppercase">
              {contact.produto_interesse}
            </span>
          )}
        </div>
      )}

      <div className="text-cream group-hover:text-acid mb-0.5 truncate text-sm font-semibold transition-colors">
        {contact.name}
      </div>

      <div className="text-fg-3 mb-1.5 truncate font-mono text-[10px]">
        {[contact.email, contact.whatsapp].filter(Boolean).join(' · ') || '—'}
      </div>

      {o.title && o.title !== contact.name && (
        <div className="text-fg-2 mb-1.5 line-clamp-2 text-xs">{o.title}</div>
      )}

      <div className="flex items-center justify-between gap-2 font-mono text-[10px] tracking-[0.16em] uppercase">
        <span className="text-acid">{value ?? '—'}</span>
        <span className="text-fg-muted">há {ts}</span>
      </div>
    </article>
  );
}
