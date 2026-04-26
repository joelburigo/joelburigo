'use client';

import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface OpportunityCardProps {
  id: string;
  contactName: string;
  contactEmail: string | null;
  valueCents: number | null;
  productSlug: string | null;
  lastTouchAt: Date | string | null;
  stageColor: string | null;
  onClick?: () => void;
  onDragStart?: (e: React.DragEvent) => void;
}

function formatBRL(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function formatRelative(date: Date | string | null): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  const ms = Date.now() - d.getTime();
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  if (days < 1) return 'hoje';
  if (days === 1) return 'há 1d';
  if (days < 30) return `há ${days}d`;
  const months = Math.floor(days / 30);
  return `há ${months}m`;
}

export function OpportunityCard({
  id,
  contactName,
  contactEmail,
  valueCents,
  productSlug,
  lastTouchAt,
  stageColor,
  onClick,
  onDragStart,
}: OpportunityCardProps) {
  return (
    <button
      type="button"
      data-opp-id={id}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/opp-id', id);
        e.dataTransfer.effectAllowed = 'move';
        onDragStart?.(e);
      }}
      onClick={onClick}
      className={cn(
        'bg-ink-2 text-cream hover:border-acid focus:border-acid w-full cursor-grab border-l-4 border-y border-r border-y-[var(--jb-hair)] border-r-[var(--jb-hair)]',
        'p-3 text-left transition-colors active:cursor-grabbing',
        'focus:outline-none focus:ring-1 focus:ring-acid'
      )}
      style={{ borderLeftColor: stageColor ?? 'var(--jb-hair-strong)' }}
    >
      <div className="text-cream truncate text-sm font-semibold">{contactName}</div>
      {contactEmail && (
        <div className="text-fg-3 mt-0.5 truncate font-mono text-[11px]">{contactEmail}</div>
      )}
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {productSlug && <Badge variant="outline">{productSlug}</Badge>}
        {valueCents != null && valueCents > 0 && (
          <Badge variant="acid">{formatBRL(valueCents)}</Badge>
        )}
      </div>
      <div className="text-fg-muted mt-2 font-mono text-[10px] tracking-[0.18em] uppercase">
        {formatRelative(lastTouchAt)}
      </div>
    </button>
  );
}
