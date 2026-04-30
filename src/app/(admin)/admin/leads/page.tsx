import type { Metadata } from 'next';
import { Container } from '@/components/patterns/container';
import { requireAdmin } from '@/server/services/session';
import { getDefaultTeam, listPipelinesWithStages } from '@/server/services/admin';
import { LeadsKanbanShell } from '@/components/features/admin/leads-kanban-shell';

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
  await requireAdmin();
  const sp = await searchParams;
  const team = await getDefaultTeam();
  const pipelinesRaw = await listPipelinesWithStages(team.id);

  const pipelines = pipelinesRaw.map((p) => ({
    id: p.pipeline.id,
    slug: p.pipeline.slug,
    name: p.pipeline.name,
    stages: p.stages.map((s) => ({
      id: s.id,
      slug: s.slug,
      name: s.name,
      kind: s.kind,
      color: s.color,
      position: s.position,
      probability: s.probability,
      pipeline_id: s.pipeline_id,
    })),
  }));

  if (pipelines.length === 0) {
    return (
      <Container size="xl" className="py-2">
        <h1 className="heading-2 text-cream">Leads</h1>
        <p className="text-fg-muted mt-4 text-sm">
          Nenhum pipeline configurado. Rode <code>pnpm db:seed</code>.
        </p>
      </Container>
    );
  }

  const initialPipeline = sp.pipeline ?? pipelines[0]!.slug;

  return (
    <Container size="xl" className="flex flex-col gap-4 py-2">
      <div>
        <span className="kicker text-fire">// CRM · KANBAN</span>
        <h1 className="heading-2 text-cream mt-2">Leads</h1>
      </div>
      <LeadsKanbanShell pipelines={pipelines} initialPipeline={initialPipeline} />
    </Container>
  );
}
