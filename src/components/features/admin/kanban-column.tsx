'use client';

import * as React from 'react';
import { KanbanCard } from './kanban-card';
import type { KanbanCardData, KanbanStageLite } from './leads-kanban-shell';

interface Props {
  stage: KanbanStageLite;
  cards: KanbanCardData[];
  onMoveCard: (oppId: string, newStageId: string) => void;
  onClickCard: (id: string) => void;
  activeCardId: string | null;
}

interface DragPayload {
  id: string;
  currentStageId: string;
}

export function KanbanColumn({ stage, cards, onMoveCard, onClickCard, activeCardId }: Props) {
  const [isOver, setIsOver] = React.useState(false);

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isOver) setIsOver(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    // só desativa se sair da column inteira
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsOver(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsOver(false);
    const raw = e.dataTransfer.getData('text/plain');
    if (!raw) return;
    try {
      const payload = JSON.parse(raw) as DragPayload;
      if (payload.currentStageId !== stage.id) {
        onMoveCard(payload.id, stage.id);
      }
    } catch {
      // ignore
    }
  }

  function handleCardDragStart(card: KanbanCardData, e: React.DragEvent) {
    const payload: DragPayload = { id: card.id, currentStageId: card.stage_id };
    e.dataTransfer.setData('text/plain', JSON.stringify(payload));
    e.dataTransfer.effectAllowed = 'move';
    (e.currentTarget as HTMLElement).style.opacity = '0.5';
  }

  function handleCardDragEnd(e: React.DragEvent) {
    (e.currentTarget as HTMLElement).style.opacity = '';
  }

  const stageColor = stage.color ?? 'var(--jb-hair-strong)';

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`bg-ink-2 flex w-72 shrink-0 flex-col gap-2 border p-3 transition-colors ${
        isOver ? 'border-acid bg-[var(--jb-acid-soft)]' : 'border-[var(--jb-hair)]'
      }`}
      style={{ borderTop: `2px solid ${stageColor}` }}
      data-stage-id={stage.id}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <span className="size-2.5 shrink-0" style={{ background: stageColor }} />
          <span className="text-cream truncate font-mono text-[11px] tracking-[0.22em] uppercase">
            {stage.name}
          </span>
        </div>
        <span className="text-fg-muted shrink-0 font-mono text-[11px]">{cards.length}</span>
      </div>

      <div className="flex flex-col gap-2">
        {cards.length === 0 ? (
          <div className="text-fg-muted border border-dashed border-[var(--jb-hair)] p-4 text-center font-mono text-[10px] tracking-[0.18em] uppercase">
            Nenhum lead aqui.
          </div>
        ) : (
          cards.map((card) => (
            <div key={card.id} onDragEnd={handleCardDragEnd}>
              <KanbanCard
                opportunity={card}
                active={card.id === activeCardId}
                onClick={() => onClickCard(card.id)}
                onDragStart={(e) => handleCardDragStart(card, e)}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
