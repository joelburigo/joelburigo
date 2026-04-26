import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/patterns/container';
import {
  getDefaultTeam,
  listOpenOpportunities,
  listPipelinesWithStages,
} from '@/server/services/admin';
import { KanbanBoard, type KanbanOpportunity } from '@/components/features/admin/kanban-board';

export const metadata: Metadata = {
  title: 'Admin · Leads',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ pipeline?: string }>;
}) {
  const sp = await searchParams;
  const team = await getDefaultTeam();
  const allPipelines = await listPipelinesWithStages(team.id);

  const activePipelineSlug = sp.pipeline ?? allPipelines[0]?.pipeline.slug;
  const activePipeline = allPipelines.find((p) => p.pipeline.slug === activePipelineSlug);

  if (!activePipeline) {
    return (
      <Container size="xl" className="py-2">
        <h1 className="heading-2 text-cream">Leads</h1>
        <p className="text-fg-muted mt-4 text-sm">
          Nenhum pipeline configurado. Rode <code>pnpm db:seed</code>.
        </p>
      </Container>
    );
  }

  const opps = await listOpenOpportunities(team.id, {
    pipelineId: activePipeline.pipeline.id,
  });

  const kanbanOpps: KanbanOpportunity[] = opps.map((o) => ({
    id: o.opportunity.id,
    contactId: o.opportunity.contact_id,
    contactName: o.contact?.name ?? '—',
    contactEmail: o.contact?.email ?? null,
    contactWhatsapp: o.contact?.whatsapp ?? null,
    contactNotesMd: o.contact?.notes_md ?? null,
    valueCents: o.opportunity.value_cents != null ? Number(o.opportunity.value_cents) : null,
    productSlug: o.productSlug,
    lastTouchAt: o.contact?.last_touch_at ? o.contact.last_touch_at.toISOString() : null,
    stageId: o.opportunity.stage_id,
    pipelineId: o.opportunity.pipeline_id,
    title: o.opportunity.title,
  }));

  return (
    <Container size="xl" className="flex flex-col gap-6 py-2">
      <div className="flex items-end justify-between gap-4">
        <div>
          <span className="kicker text-fire">// CRM · KANBAN</span>
          <h1 className="heading-2 text-cream mt-2">Leads</h1>
        </div>
        <nav className="flex gap-2">
          {allPipelines.map((p) => {
            const isActive = p.pipeline.slug === activePipelineSlug;
            return (
              <Link
                key={p.pipeline.id}
                href={`/admin/leads?pipeline=${p.pipeline.slug}`}
                className={`border px-3 py-1.5 font-mono text-[11px] tracking-[0.22em] uppercase transition-colors ${
                  isActive
                    ? 'border-acid text-acid bg-[var(--jb-acid-soft)]'
                    : 'border-[var(--jb-hair)] text-fg-3 hover:text-acid hover:border-acid'
                }`}
              >
                {p.pipeline.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <KanbanBoard
        pipelineId={activePipeline.pipeline.id}
        stages={activePipeline.stages.map((s) => ({
          id: s.id,
          name: s.name,
          color: s.color,
          kind: s.kind,
          position: s.position,
        }))}
        opportunities={kanbanOpps}
      />
    </Container>
  );
}
