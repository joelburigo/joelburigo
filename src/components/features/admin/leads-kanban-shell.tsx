'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { KanbanToolbar, type KanbanFilters, type KanbanFacets } from './kanban-toolbar';
import { KanbanColumn } from './kanban-column';
import { OpportunityDetailPanel } from './opportunity-detail-panel';

export interface KanbanStageLite {
  id: string;
  slug: string;
  name: string;
  kind: string;
  color: string | null;
  position: number;
  probability: number | null;
  pipeline_id: string;
}

export interface KanbanPipelineLite {
  id: string;
  slug: string;
  name: string;
  stages: KanbanStageLite[];
}

export interface KanbanCardData {
  id: string;
  title: string;
  value_cents: number | null;
  status: 'open' | 'won' | 'lost';
  kanban_position: string;
  stage_id: string;
  pipeline_id: string;
  contact: {
    id: string;
    name: string;
    email: string | null;
    whatsapp: string | null;
    source: string | null;
    produto_interesse: string | null;
  };
  stage: {
    id: string;
    slug: string;
    name: string;
    kind: string;
    color: string | null;
    position: number;
    probability: number | null;
  };
  created_at: string;
  updated_at: string;
  last_activity_at: string | null;
}

interface ApiListResponse {
  items: KanbanCardData[];
  total: number;
  facets?: KanbanFacets;
}

interface Props {
  pipelines: KanbanPipelineLite[];
  initialPipeline: string;
}

const DEFAULT_FILTERS: KanbanFilters = {
  q: '',
  status: 'open',
  source: [],
  period: '30d',
  from: null,
  to: null,
  owner: null,
};

export function LeadsKanbanShell({ pipelines, initialPipeline }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeSlug, setActiveSlug] = React.useState(initialPipeline);
  const [filters, setFilters] = React.useState<KanbanFilters>(DEFAULT_FILTERS);
  const [items, setItems] = React.useState<KanbanCardData[]>([]);
  const [total, setTotal] = React.useState(0);
  const [facets, setFacets] = React.useState<KanbanFacets>({ sources: [], owners: [] });
  const [loading, setLoading] = React.useState(false);
  const [activeOppId, setActiveOppId] = React.useState<string | null>(null);

  const activePipeline = pipelines.find((p) => p.slug === activeSlug) ?? pipelines[0]!;

  // Sync URL pipeline param
  React.useEffect(() => {
    const sp = new URLSearchParams(searchParams.toString());
    if (sp.get('pipeline') !== activeSlug) {
      sp.set('pipeline', activeSlug);
      router.replace(`/admin/leads?${sp.toString()}`, { scroll: false });
    }
  }, [activeSlug, router, searchParams]);

  const fetchItems = React.useCallback(
    async (signal: AbortSignal) => {
      setLoading(true);
      try {
        const sp = new URLSearchParams();
        sp.set('pipeline', activeSlug);
        sp.set('limit', '200');
        if (filters.q) sp.set('q', filters.q);
        if (filters.status) sp.set('status', filters.status);
        if (filters.source.length > 0) sp.set('source', filters.source.join(','));
        if (filters.from) sp.set('from', filters.from);
        if (filters.to) sp.set('to', filters.to);
        if (filters.owner) sp.set('owner', filters.owner);

        const r = await fetch(`/api/admin/opportunities?${sp.toString()}`, { signal });
        if (!r.ok) throw new Error('Falha ao carregar leads.');
        const json = (await r.json()) as ApiListResponse;
        setItems(json.items ?? []);
        setTotal(json.total ?? json.items?.length ?? 0);
        if (json.facets) setFacets(json.facets);
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        toast.error((err as Error).message);
      } finally {
        setLoading(false);
      }
    },
    [activeSlug, filters]
  );

  // debounce + abortable fetch
  React.useEffect(() => {
    const ac = new AbortController();
    const t = setTimeout(() => {
      void fetchItems(ac.signal);
    }, 300);
    return () => {
      clearTimeout(t);
      ac.abort();
    };
  }, [fetchItems]);

  const counts = React.useMemo(() => {
    let open = 0;
    let won = 0;
    let lost = 0;
    for (const it of items) {
      if (it.status === 'won') won++;
      else if (it.status === 'lost') lost++;
      else open++;
    }
    const closed = won + lost;
    const winRate = closed > 0 ? Math.round((won / closed) * 100) : 0;
    return { total: items.length, open, won, lost, winRate };
  }, [items]);

  const cardsByStage = React.useMemo(() => {
    const map = new Map<string, KanbanCardData[]>();
    for (const stage of activePipeline.stages) map.set(stage.id, []);
    for (const it of items) {
      const arr = map.get(it.stage_id);
      if (arr) arr.push(it);
    }
    for (const [, arr] of map) {
      arr.sort((a, b) => Number(a.kanban_position) - Number(b.kanban_position));
    }
    return map;
  }, [items, activePipeline]);

  async function handleMoveCard(oppId: string, newStageId: string) {
    const opp = items.find((i) => i.id === oppId);
    if (!opp || opp.stage_id === newStageId) return;

    const newStage = activePipeline.stages.find((s) => s.id === newStageId);
    if (!newStage) return;

    // Optimistic update
    const previousStageId = opp.stage_id;
    setItems((prev) =>
      prev.map((i) =>
        i.id === oppId
          ? {
              ...i,
              stage_id: newStageId,
              stage: { ...i.stage, ...newStage },
              status: newStage.kind === 'won' ? 'won' : newStage.kind === 'lost' ? 'lost' : 'open',
            }
          : i
      )
    );

    try {
      const r = await fetch(`/api/admin/opportunities/${oppId}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ stage_id: newStageId }),
      });
      if (!r.ok) throw new Error('failed');
      toast.success(`Movido pra "${newStage.name}".`);
    } catch {
      // rollback
      setItems((prev) =>
        prev.map((i) => (i.id === oppId ? { ...i, stage_id: previousStageId } : i))
      );
      toast.error('Falhou. Tenta de novo.');
    }
  }

  function handleOptimisticUpdate(oppId: string, patch: Partial<KanbanCardData>) {
    setItems((prev) => prev.map((i) => (i.id === oppId ? { ...i, ...patch } : i)));
  }

  function handleRemoveItem(oppId: string) {
    // Quando muda status pra won/lost com filtro 'open', remove da lista
    if (filters.status === 'open') {
      setItems((prev) => prev.filter((i) => i.id !== oppId));
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Pipeline tabs */}
      <nav className="flex flex-wrap gap-2">
        {pipelines.map((p) => {
          const active = p.slug === activeSlug;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setActiveSlug(p.slug)}
              className={`border px-3 py-1.5 font-mono text-[11px] tracking-[0.22em] uppercase transition-colors ${
                active
                  ? 'border-acid text-acid bg-[var(--jb-acid-soft)]'
                  : 'border-[var(--jb-hair)] text-fg-3 hover:text-acid hover:border-acid'
              }`}
            >
              {p.name}
            </button>
          );
        })}
      </nav>

      <KanbanToolbar
        filters={filters}
        onFiltersChange={setFilters}
        facets={facets}
        counts={counts}
        loading={loading}
        totalUnfiltered={total}
      />

      <div className="flex gap-4">
        {/* Kanban */}
        <div className="flex flex-1 gap-3 overflow-x-auto pb-4">
          {activePipeline.stages.map((stage) => (
            <KanbanColumn
              key={stage.id}
              stage={stage}
              cards={cardsByStage.get(stage.id) ?? []}
              onMoveCard={handleMoveCard}
              onClickCard={(id) => setActiveOppId(id)}
              activeCardId={activeOppId}
            />
          ))}
        </div>

        {/* Detail panel */}
        {activeOppId && (
          <OpportunityDetailPanel
            opportunityId={activeOppId}
            stages={activePipeline.stages}
            onClose={() => setActiveOppId(null)}
            onOptimisticUpdate={handleOptimisticUpdate}
            onRemoveItem={handleRemoveItem}
            onMoved={(newStageId) => {
              const opp = items.find((i) => i.id === activeOppId);
              if (opp) void handleMoveCard(opp.id, newStageId);
            }}
          />
        )}
      </div>
    </div>
  );
}
