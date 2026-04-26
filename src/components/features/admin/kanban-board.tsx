'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { OpportunityCard } from './opportunity-card';
import { AutosaveTextarea } from './autosave-textarea';
import { cn } from '@/lib/utils';

export interface KanbanStage {
  id: string;
  name: string;
  color: string | null;
  kind: string;
  position: number;
}

export interface KanbanOpportunity {
  id: string;
  contactId: string;
  contactName: string;
  contactEmail: string | null;
  contactWhatsapp: string | null;
  contactNotesMd: string | null;
  valueCents: number | null;
  productSlug: string | null;
  lastTouchAt: Date | string | null;
  stageId: string;
  pipelineId: string;
  title: string;
}

export interface KanbanActivity {
  id: string;
  type: string;
  subject: string | null;
  body_md: string | null;
  created_at: Date | string;
}

interface KanbanBoardProps {
  pipelineId: string;
  stages: KanbanStage[];
  opportunities: KanbanOpportunity[];
}

export function KanbanBoard({ pipelineId, stages, opportunities }: KanbanBoardProps) {
  const router = useRouter();
  const [opps, setOpps] = React.useState(opportunities);
  const [activeOpp, setActiveOpp] = React.useState<KanbanOpportunity | null>(null);
  const [activities, setActivities] = React.useState<KanbanActivity[]>([]);
  const [loadingDetail, setLoadingDetail] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [lostReason, setLostReason] = React.useState('');
  const [acting, setActing] = React.useState(false);

  React.useEffect(() => {
    setOpps(opportunities);
  }, [opportunities]);

  const filtered = React.useMemo(() => {
    if (!search) return opps;
    const q = search.toLowerCase();
    return opps.filter(
      (o) =>
        o.contactName.toLowerCase().includes(q) ||
        (o.contactEmail ?? '').toLowerCase().includes(q) ||
        (o.contactWhatsapp ?? '').toLowerCase().includes(q)
    );
  }, [opps, search]);

  async function openDetail(opp: KanbanOpportunity) {
    setActiveOpp(opp);
    setActivities([]);
    setLostReason('');
    setLoadingDetail(true);
    try {
      const r = await fetch(`/api/admin/contacts/${opp.contactId}`);
      if (r.ok) {
        const json = (await r.json()) as { activities?: KanbanActivity[] };
        setActivities(json.activities ?? []);
      }
    } catch {
      // silencioso
    } finally {
      setLoadingDetail(false);
    }
  }

  async function handleDrop(stageId: string, e: React.DragEvent) {
    e.preventDefault();
    const oppId = e.dataTransfer.getData('text/opp-id');
    if (!oppId) return;
    const opp = opps.find((o) => o.id === oppId);
    if (!opp || opp.stageId === stageId) return;
    // optimistic
    setOpps((prev) => prev.map((o) => (o.id === oppId ? { ...o, stageId } : o)));
    try {
      const r = await fetch(`/api/admin/opportunities/${oppId}/stage`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ stage_id: stageId }),
      });
      if (!r.ok) throw new Error('failed');
      router.refresh();
    } catch {
      // revert
      setOpps((prev) => prev.map((o) => (o.id === oppId ? { ...o, stageId: opp.stageId } : o)));
    }
  }

  async function markWon() {
    if (!activeOpp) return;
    setActing(true);
    try {
      await fetch(`/api/admin/opportunities/${activeOpp.id}/won`, { method: 'POST' });
      setActiveOpp(null);
      router.refresh();
    } finally {
      setActing(false);
    }
  }

  async function markLost() {
    if (!activeOpp) return;
    if (!lostReason.trim()) return;
    setActing(true);
    try {
      await fetch(`/api/admin/opportunities/${activeOpp.id}/lost`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ reason: lostReason }),
      });
      setActiveOpp(null);
      router.refresh();
    } finally {
      setActing(false);
    }
  }

  async function saveNotes(notesMd: string) {
    if (!activeOpp) return;
    await fetch(`/api/admin/contacts/${activeOpp.contactId}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ notes_md: notesMd }),
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Input
          placeholder="Buscar por nome, email, WhatsApp…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <span className="text-fg-muted font-mono text-[11px] tracking-[0.22em] uppercase">
          {filtered.length}/{opps.length}
        </span>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-4">
        {stages.map((stage) => {
          const stageOpps = filtered.filter((o) => o.stageId === stage.id);
          return (
            <div
              key={stage.id}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(stage.id, e)}
              className={cn(
                'bg-ink-2 flex w-72 shrink-0 flex-col gap-2 border border-[var(--jb-hair)] p-3'
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="size-3"
                    style={{ background: stage.color ?? 'var(--jb-hair-strong)' }}
                  />
                  <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-cream">
                    {stage.name}
                  </span>
                </div>
                <span className="text-fg-muted font-mono text-[11px]">{stageOpps.length}</span>
              </div>
              <div className="flex flex-col gap-2">
                {stageOpps.length === 0 ? (
                  <div className="text-fg-muted border border-dashed border-[var(--jb-hair)] p-4 text-center font-mono text-[11px] tracking-[0.18em] uppercase">
                    Sem leads aqui ainda
                  </div>
                ) : (
                  stageOpps.map((opp) => (
                    <OpportunityCard
                      key={opp.id}
                      id={opp.id}
                      contactName={opp.contactName}
                      contactEmail={opp.contactEmail}
                      valueCents={opp.valueCents != null ? Number(opp.valueCents) : null}
                      productSlug={opp.productSlug}
                      lastTouchAt={opp.lastTouchAt}
                      stageColor={stage.color}
                      onClick={() => openDetail(opp)}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Sheet open={!!activeOpp} onOpenChange={(o) => !o && setActiveOpp(null)}>
        <SheetContent side="right" className="flex w-full max-w-xl flex-col gap-4 overflow-y-auto sm:max-w-xl">
          {activeOpp && (
            <>
              <SheetHeader>
                <SheetTitle>{activeOpp.contactName}</SheetTitle>
                <SheetDescription>
                  {activeOpp.contactEmail ?? '—'}
                  {activeOpp.contactWhatsapp ? ` · ${activeOpp.contactWhatsapp}` : ''}
                </SheetDescription>
              </SheetHeader>

              <div className="flex flex-wrap gap-2">
                {activeOpp.productSlug && <Badge variant="outline">{activeOpp.productSlug}</Badge>}
                {activeOpp.valueCents != null && activeOpp.valueCents > 0 && (
                  <Badge variant="acid">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(Number(activeOpp.valueCents) / 100)}
                  </Badge>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label>Notas</Label>
                <AutosaveTextarea
                  initialValue={activeOpp.contactNotesMd ?? ''}
                  onSave={saveNotes}
                  placeholder="Notas sobre esse lead…"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label>Histórico</Label>
                <div className="flex max-h-64 flex-col gap-2 overflow-y-auto border border-[var(--jb-hair)] p-3">
                  {loadingDetail && <span className="text-fg-muted text-xs">carregando…</span>}
                  {!loadingDetail && activities.length === 0 && (
                    <span className="text-fg-muted text-xs">Sem atividades.</span>
                  )}
                  {activities.map((a) => (
                    <div key={a.id} className="border-l-2 border-[var(--jb-hair)] pl-2 text-xs">
                      <div className="text-cream font-mono text-[10px] tracking-[0.18em] uppercase">
                        {a.type} · {new Date(a.created_at).toLocaleString('pt-BR')}
                      </div>
                      {a.subject && <div className="text-fg-2">{a.subject}</div>}
                      {a.body_md && <div className="text-fg-3 whitespace-pre-wrap">{a.body_md}</div>}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <Label>Encerrar oportunidade</Label>
                <Input
                  placeholder="Motivo (obrigatório se Perdido)"
                  value={lostReason}
                  onChange={(e) => setLostReason(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={markWon}
                    disabled={acting}
                    aria-busy={acting}
                  >
                    Marcar ganho
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={markLost}
                    disabled={acting || !lostReason.trim()}
                    aria-busy={acting}
                  >
                    Perdido
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <input type="hidden" value={pipelineId} readOnly />
    </div>
  );
}
