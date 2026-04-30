'use client';

import * as React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import type { KanbanCardData, KanbanStageLite } from './leads-kanban-shell';

interface ActivityItem {
  id: string;
  type: string;
  direction: string | null;
  subject: string | null;
  body_md: string | null;
  scheduled_for: string | null;
  completed_at: string | null;
  created_at: string;
  owner: { id: string; name: string | null; email: string } | null;
}

interface AttributionData {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  gclid: string | null;
  fbclid: string | null;
  msclkid: string | null;
  ttclid: string | null;
  referrer: string | null;
  first_landing_page: string | null;
  last_landing_page: string | null;
  device: string | null;
  browser: string | null;
  os: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
}

interface DetailResponse {
  opportunity: {
    id: string;
    title: string;
    value_cents: number | null;
    status: 'open' | 'won' | 'lost';
    stage_id: string;
    pipeline_id: string;
    notes_md: string | null;
    lost_reason: string | null;
    created_at: string;
    updated_at: string;
  };
  contact: {
    id: string;
    name: string;
    email: string | null;
    whatsapp: string | null;
    phone: string | null;
    cargo: string | null;
    source: string | null;
    produto_interesse: string | null;
    notes_md: string | null;
  };
  company: {
    id: string;
    name: string;
    segmento: string | null;
    porte: string | null;
    faturamento_aprox_cents: number | null;
    website: string | null;
  } | null;
  pipeline: { id: string; slug: string; name: string };
  stage: { id: string; slug: string; name: string; kind: string; color: string | null };
  activities: ActivityItem[];
  attribution: AttributionData | null;
}

interface Props {
  opportunityId: string;
  stages: KanbanStageLite[];
  onClose: () => void;
  onOptimisticUpdate: (oppId: string, patch: Partial<KanbanCardData>) => void;
  onRemoveItem: (oppId: string) => void;
  onMoved: (newStageId: string) => void;
}

const ACTIVITY_TYPES: Array<{ value: string; label: string }> = [
  { value: 'note', label: 'Nota' },
  { value: 'task', label: 'Tarefa' },
  { value: 'call', label: 'Ligação' },
  { value: 'email', label: 'Email' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'meeting', label: 'Reunião' },
];

function formatBRL(cents: number | null | undefined): string {
  if (cents == null) return '—';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    Number(cents) / 100
  );
}

function formatDateTime(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('pt-BR');
}

export function OpportunityDetailPanel({
  opportunityId,
  stages,
  onClose,
  onOptimisticUpdate,
  onRemoveItem,
  onMoved,
}: Props) {
  const [data, setData] = React.useState<DetailResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [acting, setActing] = React.useState(false);
  const [showLostModal, setShowLostModal] = React.useState(false);
  const [lostReason, setLostReason] = React.useState('');
  const panelRef = React.useRef<HTMLDivElement>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`/api/admin/opportunities/${opportunityId}`);
      if (!r.ok) throw new Error('Falha ao carregar oportunidade.');
      const json = (await r.json()) as DetailResponse;
      setData(json);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [opportunityId]);

  React.useEffect(() => {
    // Fetch externo no mount/refresh — setState ocorre apenas após resposta async, não sincronamente.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  // ESC fecha
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !showLostModal) onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, showLostModal]);

  async function markWon() {
    if (!data) return;
    const wonStage = stages.find((s) => s.kind === 'won');
    if (!wonStage) {
      toast.error('Pipeline não tem stage "won" configurada.');
      return;
    }
    setActing(true);
    try {
      const r = await fetch(`/api/admin/opportunities/${opportunityId}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ status: 'won', stage_id: wonStage.id }),
      });
      if (!r.ok) throw new Error('Falha ao marcar won.');
      toast.success('Marcado como ganho.');
      onOptimisticUpdate(opportunityId, { status: 'won', stage_id: wonStage.id });
      onRemoveItem(opportunityId);
      onClose();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setActing(false);
    }
  }

  async function confirmLost() {
    if (!data || !lostReason.trim()) return;
    const lostStage = stages.find((s) => s.kind === 'lost');
    if (!lostStage) {
      toast.error('Pipeline não tem stage "lost" configurada.');
      return;
    }
    setActing(true);
    try {
      const r = await fetch(`/api/admin/opportunities/${opportunityId}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          status: 'lost',
          stage_id: lostStage.id,
          lost_reason: lostReason.trim(),
        }),
      });
      if (!r.ok) throw new Error('Falha ao marcar lost.');
      toast.success('Marcado como perdido.');
      onOptimisticUpdate(opportunityId, { status: 'lost', stage_id: lostStage.id });
      onRemoveItem(opportunityId);
      setShowLostModal(false);
      onClose();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setActing(false);
    }
  }

  async function changeStage(stageId: string) {
    if (!data || stageId === data.opportunity.stage_id) return;
    onMoved(stageId);
    onClose();
  }

  return (
    <>
      <aside
        ref={panelRef}
        className="bg-ink-2 fixed right-0 top-0 z-40 flex h-screen w-full max-w-[420px] flex-col overflow-y-auto border-l-2 border-fire shadow-[-8px_0_0_rgba(0,0,0,0.4)]"
        role="dialog"
        aria-label="Detalhes da oportunidade"
      >
        <header className="bg-ink-2 sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-[var(--jb-hair)] p-4">
          <div className="min-w-0 flex-1">
            <span className="kicker text-fire">// LEAD</span>
            <h2 className="heading-3 text-cream mt-1 truncate">
              {loading ? 'carregando…' : data?.contact.name ?? '—'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-fg-3 hover:text-acid -mr-1 -mt-1 p-1 transition-colors"
            aria-label="Fechar"
          >
            <X className="size-5" />
          </button>
        </header>

        {loading || !data ? (
          <div className="text-fg-muted p-4 font-mono text-xs">carregando…</div>
        ) : (
          <div className="flex flex-col gap-5 p-4">
            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              <Badge variant={data.opportunity.status === 'won' ? 'acid' : data.opportunity.status === 'lost' ? 'fire' : 'outline'}>
                {data.opportunity.status}
              </Badge>
              {data.contact.produto_interesse && (
                <Badge variant="acid">{data.contact.produto_interesse}</Badge>
              )}
              {data.contact.source && <Badge>{data.contact.source}</Badge>}
              {data.opportunity.value_cents != null && data.opportunity.value_cents > 0 && (
                <Badge variant="acid">{formatBRL(data.opportunity.value_cents)}</Badge>
              )}
            </div>

            {/* Quick info */}
            <section className="flex flex-col gap-1.5 border border-[var(--jb-hair)] p-3 font-mono text-xs">
              <Row label="Email" value={data.contact.email} />
              <Row label="WhatsApp" value={data.contact.whatsapp} />
              {data.contact.phone && <Row label="Tel" value={data.contact.phone} />}
              {data.contact.cargo && <Row label="Cargo" value={data.contact.cargo} />}
              {data.company && (
                <>
                  <Row label="Empresa" value={data.company.name} />
                  {data.company.segmento && <Row label="Segmento" value={data.company.segmento} />}
                  {data.company.faturamento_aprox_cents != null && (
                    <Row label="Faturamento" value={formatBRL(data.company.faturamento_aprox_cents)} />
                  )}
                </>
              )}
              <Row label="Título" value={data.opportunity.title} />
              <Row label="Stage" value={data.stage.name} />
              <Row label="Criado" value={formatDateTime(data.opportunity.created_at)} />
            </section>

            {/* Stage selector */}
            <section className="flex flex-col gap-2">
              <Label>Mudar stage</Label>
              <select
                value={data.opportunity.stage_id}
                onChange={(e) => changeStage(e.target.value)}
                className="bg-ink text-cream h-10 border border-[var(--jb-hair)] px-2 font-mono text-xs"
              >
                {stages.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.kind})
                  </option>
                ))}
              </select>
            </section>

            {/* Won/Lost actions */}
            {data.opportunity.status === 'open' && (
              <section className="flex gap-2">
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={markWon}
                  disabled={acting}
                  className="flex-1"
                >
                  Marcar Won
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowLostModal(true)}
                  disabled={acting}
                  className="flex-1"
                >
                  Marcar Lost
                </Button>
              </section>
            )}

            {data.opportunity.status === 'lost' && data.opportunity.lost_reason && (
              <section className="border border-[var(--jb-fire-border)] bg-[var(--jb-fire-soft)] p-3">
                <span className="text-fire-hot kicker">// LOST REASON</span>
                <p className="text-fg-2 mt-1 text-sm">{data.opportunity.lost_reason}</p>
              </section>
            )}

            {/* Attribution */}
            {data.attribution && hasAttributionData(data.attribution) && (
              <section className="flex flex-col gap-2">
                <Label>Atribuição</Label>
                <div className="flex flex-col gap-1 border border-[var(--jb-hair)] p-3 font-mono text-[11px]">
                  {data.attribution.utm_source && (
                    <Row label="utm_source" value={data.attribution.utm_source} />
                  )}
                  {data.attribution.utm_medium && (
                    <Row label="utm_medium" value={data.attribution.utm_medium} />
                  )}
                  {data.attribution.utm_campaign && (
                    <Row label="utm_campaign" value={data.attribution.utm_campaign} />
                  )}
                  {data.attribution.utm_term && (
                    <Row label="utm_term" value={data.attribution.utm_term} />
                  )}
                  {data.attribution.utm_content && (
                    <Row label="utm_content" value={data.attribution.utm_content} />
                  )}
                  {data.attribution.gclid && <Row label="gclid" value={data.attribution.gclid} />}
                  {data.attribution.fbclid && <Row label="fbclid" value={data.attribution.fbclid} />}
                  {data.attribution.msclkid && (
                    <Row label="msclkid" value={data.attribution.msclkid} />
                  )}
                  {data.attribution.ttclid && (
                    <Row label="ttclid" value={data.attribution.ttclid} />
                  )}
                  {data.attribution.referrer && (
                    <Row label="referrer" value={data.attribution.referrer} />
                  )}
                  {data.attribution.first_landing_page && (
                    <Row label="first_landing" value={data.attribution.first_landing_page} />
                  )}
                  {data.attribution.last_landing_page && (
                    <Row label="last_landing" value={data.attribution.last_landing_page} />
                  )}
                  {(data.attribution.country || data.attribution.city) && (
                    <Row
                      label="geo"
                      value={[
                        data.attribution.city,
                        data.attribution.region,
                        data.attribution.country,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    />
                  )}
                  {(data.attribution.device || data.attribution.browser) && (
                    <Row
                      label="device"
                      value={[data.attribution.device, data.attribution.browser, data.attribution.os]
                        .filter(Boolean)
                        .join(' · ')}
                    />
                  )}
                </div>
              </section>
            )}

            {/* Activity form */}
            <ActivityForm
              opportunityId={opportunityId}
              onCreated={() => void load()}
            />

            {/* Timeline */}
            <section className="flex flex-col gap-2">
              <Label>Histórico ({data.activities.length})</Label>
              <div className="flex flex-col gap-2">
                {data.activities.length === 0 ? (
                  <div className="text-fg-muted border border-dashed border-[var(--jb-hair)] p-3 text-center font-mono text-[11px] tracking-[0.18em] uppercase">
                    Sem atividades.
                  </div>
                ) : (
                  data.activities.map((a) => (
                    <ActivityRow key={a.id} activity={a} onChanged={() => void load()} />
                  ))
                )}
              </div>
            </section>
          </div>
        )}
      </aside>

      {/* Lost reason modal */}
      {showLostModal && (
        <div
          className="bg-ink/80 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
          onClick={() => setShowLostModal(false)}
        >
          <div
            className="bg-ink-2 w-full max-w-md border border-fire p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="kicker text-fire">// MARCAR LOST</span>
            <h3 className="heading-3 text-cream mt-2">Motivo da perda</h3>
            <Textarea
              value={lostReason}
              onChange={(e) => setLostReason(e.target.value)}
              placeholder="Por quê esse lead não fechou?"
              rows={4}
              className="mt-3"
              autoFocus
            />
            <div className="mt-4 flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowLostModal(false)}
                disabled={acting}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={confirmLost}
                disabled={acting || !lostReason.trim()}
              >
                Confirmar perda
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex gap-2">
      <span className="text-fg-muted shrink-0 tracking-[0.16em] uppercase">{label}:</span>
      <span className="text-fg-2 truncate">{value}</span>
    </div>
  );
}

function hasAttributionData(a: AttributionData): boolean {
  return Object.values(a).some((v) => v != null && v !== '');
}

interface ActivityFormProps {
  opportunityId: string;
  onCreated: () => void;
}

function ActivityForm({ opportunityId, onCreated }: ActivityFormProps) {
  const [type, setType] = React.useState('note');
  const [subject, setSubject] = React.useState('');
  const [body, setBody] = React.useState('');
  const [scheduledFor, setScheduledFor] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  async function submit() {
    if (!subject.trim()) {
      toast.error('Subject obrigatório.');
      return;
    }
    setSubmitting(true);
    try {
      const r = await fetch(`/api/admin/opportunities/${opportunityId}/activities`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          type,
          subject: subject.trim(),
          body_md: body.trim() || null,
          scheduled_for: type === 'task' && scheduledFor ? new Date(scheduledFor).toISOString() : null,
        }),
      });
      if (!r.ok) throw new Error('Falha ao criar atividade.');
      toast.success('Atividade salva.');
      setSubject('');
      setBody('');
      setScheduledFor('');
      setType('note');
      onCreated();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="flex flex-col gap-2 border border-[var(--jb-hair)] p-3">
      <Label>Adicionar atividade</Label>
      <div className="flex gap-2">
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="bg-ink text-cream h-9 border border-[var(--jb-hair)] px-2 font-mono text-xs"
        >
          {ACTIVITY_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <Input
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="h-9 flex-1"
        />
      </div>
      <Textarea
        placeholder="Body (markdown)"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
      />
      {type === 'task' && (
        <input
          type="datetime-local"
          value={scheduledFor}
          onChange={(e) => setScheduledFor(e.target.value)}
          className="bg-ink text-cream h-9 border border-[var(--jb-hair)] px-2 font-mono text-xs"
        />
      )}
      <Button
        type="button"
        variant="primary"
        size="sm"
        onClick={submit}
        disabled={submitting || !subject.trim()}
      >
        {submitting ? 'Salvando…' : 'Salvar atividade'}
      </Button>
    </section>
  );
}

interface ActivityRowProps {
  activity: ActivityItem;
  onChanged: () => void;
}

function ActivityRow({ activity: a, onChanged }: ActivityRowProps) {
  const [busy, setBusy] = React.useState(false);

  async function toggleComplete() {
    setBusy(true);
    try {
      const r = await fetch(`/api/admin/activities/${a.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          completed_at: a.completed_at ? null : new Date().toISOString(),
        }),
      });
      if (!r.ok) throw new Error('Falha.');
      onChanged();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!confirm('Apagar essa atividade?')) return;
    setBusy(true);
    try {
      const r = await fetch(`/api/admin/activities/${a.id}`, { method: 'DELETE' });
      if (!r.ok) throw new Error('Falha.');
      toast.success('Apagada.');
      onChanged();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="border-l-2 border-[var(--jb-hair)] pl-3 hover:border-acid">
      <div className="text-cream flex items-center justify-between gap-2 font-mono text-[10px] tracking-[0.18em] uppercase">
        <span>
          {a.type}
          {a.direction ? ` · ${a.direction}` : ''}
          {' · '}
          {formatDateTime(a.created_at)}
        </span>
        <div className="flex gap-1">
          {a.type === 'task' && (
            <button
              type="button"
              onClick={toggleComplete}
              disabled={busy}
              className={`px-1.5 py-0.5 text-[9px] transition-colors ${
                a.completed_at ? 'text-acid' : 'text-fg-muted hover:text-acid'
              }`}
            >
              {a.completed_at ? '✓ feito' : 'marcar feito'}
            </button>
          )}
          <button
            type="button"
            onClick={remove}
            disabled={busy}
            className="text-fg-muted hover:text-fire-hot px-1.5 py-0.5 text-[9px] transition-colors"
          >
            apagar
          </button>
        </div>
      </div>
      {a.subject && <div className="text-fg-2 mt-1 text-sm">{a.subject}</div>}
      {a.body_md && (
        <div className="text-fg-3 prose prose-invert prose-sm mt-1 max-w-none text-xs">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{a.body_md}</ReactMarkdown>
        </div>
      )}
      {a.scheduled_for && (
        <div className="text-fg-muted mt-1 font-mono text-[10px]">
          agendada: {formatDateTime(a.scheduled_for)}
          {a.completed_at && ` · concluída: ${formatDateTime(a.completed_at)}`}
        </div>
      )}
      {a.owner && (
        <div className="text-fg-muted mt-1 font-mono text-[10px]">
          por {a.owner.name ?? a.owner.email}
        </div>
      )}
    </div>
  );
}
