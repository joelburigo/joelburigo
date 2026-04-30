'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import NextLink from 'next/link';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { TestimonialImageUpload } from './testimonial-image-upload';

type Product = 'vss' | 'advisory' | 'both';

interface InitialT {
  client_name: string;
  client_role: string | null;
  client_company: string | null;
  client_segment: string | null;
  client_revenue_range: string | null;
  quote_md: string;
  result_metric: string | null;
  case_title: string | null;
  case_md: string | null;
  cover_image_path: string | null;
  cover_image_alt: string | null;
  client_photo_path: string | null;
  product_used: Product;
  featured: boolean;
  published: boolean;
  position: number;
}

interface Props {
  id: string;
  initial: InitialT;
  r2PublicUrl: string;
}

type SaveState =
  | { kind: 'idle' }
  | { kind: 'saving' }
  | { kind: 'saved'; at: number }
  | { kind: 'error'; message: string };

export function TestimonialEditor({ id, initial, r2PublicUrl }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [clientName, setClientName] = useState(initial.client_name);
  const [clientRole, setClientRole] = useState(initial.client_role ?? '');
  const [clientCompany, setClientCompany] = useState(initial.client_company ?? '');
  const [clientSegment, setClientSegment] = useState(initial.client_segment ?? '');
  const [revenueRange, setRevenueRange] = useState(initial.client_revenue_range ?? '');
  const [quoteMd, setQuoteMd] = useState(initial.quote_md);
  const [resultMetric, setResultMetric] = useState(initial.result_metric ?? '');
  const [caseTitle, setCaseTitle] = useState(initial.case_title ?? '');
  const [caseMd, setCaseMd] = useState(initial.case_md ?? '');
  const [coverPath, setCoverPath] = useState<string | null>(initial.cover_image_path);
  const [coverAlt, setCoverAlt] = useState(initial.cover_image_alt ?? '');
  const [photoPath, setPhotoPath] = useState<string | null>(initial.client_photo_path);
  const [product, setProduct] = useState<Product>(initial.product_used);
  const [featured, setFeatured] = useState(initial.featured);
  const [published, setPublished] = useState(initial.published);
  const [position, setPosition] = useState(initial.position);

  const [saveState, setSaveState] = useState<SaveState>({ kind: 'idle' });

  async function save() {
    setSaveState({ kind: 'saving' });
    const body = {
      client_name: clientName.trim() || 'Sem nome',
      client_role: clientRole.trim() || null,
      client_company: clientCompany.trim() || null,
      client_segment: clientSegment.trim() || null,
      client_revenue_range: revenueRange.trim() || null,
      quote_md: quoteMd,
      result_metric: resultMetric.trim() || null,
      case_title: caseTitle.trim() || null,
      case_md: caseMd.trim() || null,
      cover_image_alt: coverAlt.trim() || null,
      product_used: product,
      featured,
      published,
      position,
    };
    try {
      const res = await fetch(`/api/admin/testimonials/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setSaveState({ kind: 'error', message: data.error ?? `HTTP ${res.status}` });
        return;
      }
      setSaveState({ kind: 'saved', at: Date.now() });
    } catch (err) {
      setSaveState({ kind: 'error', message: err instanceof Error ? err.message : 'erro' });
    }
  }

  async function remove() {
    if (!confirm('Apagar definitivamente este depoimento?')) return;
    const res = await fetch(`/api/admin/testimonials/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      alert('Erro ao deletar');
      return;
    }
    startTransition(() => router.push('/admin/testimonials'));
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <NextLink
            href="/admin/testimonials"
            className="text-fg-3 hover:text-acid font-mono text-[11px] tracking-[0.22em] uppercase"
          >
            ← Depoimentos
          </NextLink>
          <h1 className="heading-2 text-cream mt-2">{clientName || 'Sem nome'}</h1>
          <SaveStatus state={saveState} />
        </div>
        <div className="flex gap-2">
          <Button onClick={save} disabled={saveState.kind === 'saving'} variant="primary">
            {saveState.kind === 'saving' ? 'salvando...' : 'salvar'}
          </Button>
          <Button onClick={remove} variant="secondary" disabled={isPending}>
            <Trash2 className="size-3.5" /> apagar
          </Button>
        </div>
      </header>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Coluna principal */}
        <div className="flex flex-col gap-6 md:col-span-2">
          <Section title="Cliente">
            <Field label="Nome (cliente ou empresa)">
              <Input value={clientName} onChange={(e) => setClientName(e.target.value)} />
            </Field>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Cargo">
                <Input value={clientRole} onChange={(e) => setClientRole(e.target.value)} />
              </Field>
              <Field label="Empresa">
                <Input value={clientCompany} onChange={(e) => setClientCompany(e.target.value)} />
              </Field>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Segmento">
                <Input value={clientSegment} onChange={(e) => setClientSegment(e.target.value)} />
              </Field>
              <Field label="Faturamento (range)">
                <Input
                  value={revenueRange}
                  onChange={(e) => setRevenueRange(e.target.value)}
                  placeholder="ex: 200-500k"
                />
              </Field>
            </div>
          </Section>

          <Section title="Depoimento">
            <Field label="Quote (markdown · curto)">
              <Textarea
                rows={6}
                value={quoteMd}
                onChange={(e) => setQuoteMd(e.target.value)}
              />
            </Field>
            <Field label="Métrica de resultado">
              <Input
                value={resultMetric}
                onChange={(e) => setResultMetric(e.target.value)}
                placeholder="ex: 3x faturamento em 6m"
              />
            </Field>
          </Section>

          <Section title="Estudo de caso (opcional)">
            <Field label="Título">
              <Input value={caseTitle} onChange={(e) => setCaseTitle(e.target.value)} />
            </Field>
            <Field label="Conteúdo (markdown · longo)">
              <Textarea rows={10} value={caseMd} onChange={(e) => setCaseMd(e.target.value)} />
            </Field>
          </Section>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-6">
          <Section title="Visibilidade">
            <Field label="Produto">
              <select
                value={product}
                onChange={(e) => setProduct(e.target.value as Product)}
                className="bg-ink text-cream h-10 w-full border border-[var(--jb-hair)] px-3 font-mono text-sm"
              >
                <option value="vss">VSS</option>
                <option value="advisory">Advisory</option>
                <option value="both">Ambos</option>
              </select>
            </Field>
            <label className="text-cream flex items-center gap-2 font-mono text-xs">
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
              />
              Publicado
            </label>
            <label className="text-cream flex items-center gap-2 font-mono text-xs">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
              />
              Destaque (featured)
            </label>
            <Field label="Posição (ordem)">
              <Input
                type="number"
                value={position}
                onChange={(e) => setPosition(parseInt(e.target.value, 10) || 0)}
              />
            </Field>
          </Section>

          <Section title="Foto do cliente">
            <TestimonialImageUpload
              id={id}
              kind="photo"
              currentPath={photoPath}
              r2PublicUrl={r2PublicUrl}
              onUploaded={(p) => setPhotoPath(p)}
            />
          </Section>

          <Section title="Capa">
            <TestimonialImageUpload
              id={id}
              kind="cover"
              currentPath={coverPath}
              r2PublicUrl={r2PublicUrl}
              onUploaded={(p) => setCoverPath(p)}
            />
            <Field label="Alt da capa">
              <Input value={coverAlt} onChange={(e) => setCoverAlt(e.target.value)} />
            </Field>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-ink-2 flex flex-col gap-4 border border-[var(--jb-hair)] p-5">
      <h2 className="kicker text-fire">// {title.toUpperCase()}</h2>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-fg-3 font-mono text-[10px] tracking-[0.22em] uppercase">
        {label}
      </Label>
      {children}
    </div>
  );
}

function SaveStatus({ state }: { state: SaveState }) {
  if (state.kind === 'idle') return null;
  if (state.kind === 'saving')
    return <p className="text-fg-3 mt-1 font-mono text-[11px]">salvando...</p>;
  if (state.kind === 'saved')
    return <p className="text-acid mt-1 font-mono text-[11px]">salvo ✓</p>;
  return <p className="text-fire mt-1 font-mono text-[11px]">erro: {state.message}</p>;
}
