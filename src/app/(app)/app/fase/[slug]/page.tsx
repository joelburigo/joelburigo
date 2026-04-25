import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { and, asc, eq, inArray } from 'drizzle-orm';
import { ArrowLeft } from 'lucide-react';
import { Container } from '@/components/patterns/container';
import { FaseNav, ProgressBar } from '@/components/features/vss';
import { db } from '@/server/db/client';
import {
  user_progress,
  vss_destravamentos,
  vss_modules,
  vss_phases,
} from '@/server/db/schema';
import { requireUser } from '@/server/services/session';

export const metadata: Metadata = {
  title: 'Fase VSS',
  robots: { index: false, follow: false },
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function FasePage({ params }: PageProps) {
  const { slug } = await params;
  const user = await requireUser(`/app/fase/${slug}`);

  const [phase] = await db
    .select()
    .from(vss_phases)
    .where(eq(vss_phases.slug, slug))
    .limit(1);

  if (!phase) {
    notFound();
  }

  // Stats da fase pra header (módulos e destravamentos completos)
  const modules = await db
    .select()
    .from(vss_modules)
    .where(eq(vss_modules.phase_id, phase.id))
    .orderBy(asc(vss_modules.position));

  const moduleIds = modules.map((m) => m.id);

  const destravamentos =
    moduleIds.length === 0
      ? []
      : await db
          .select()
          .from(vss_destravamentos)
          .where(inArray(vss_destravamentos.module_id, moduleIds));

  const destIds = destravamentos.map((d) => d.id);

  const completedRows =
    destIds.length === 0
      ? []
      : await db
          .select()
          .from(user_progress)
          .where(
            and(
              eq(user_progress.user_id, user.id),
              inArray(user_progress.destravamento_id, destIds)
            )
          );

  const totalDest = destravamentos.length;
  const completedDest = completedRows.filter((r) => r.completed_at !== null).length;

  return (
    <section className="section">
      <Container size="xl" className="flex flex-col gap-10">
        <header className="flex flex-col gap-5">
          <Link
            href="/app/area"
            className="text-fg-3 hover:text-acid inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.22em] uppercase transition-colors"
          >
            <ArrowLeft className="size-3" aria-hidden />
            Voltar pro dashboard
          </Link>

          <div className="flex flex-col gap-3">
            <span className="kicker text-fire">
              // {phase.code} · FASE {String(phase.position).padStart(2, '0')}
            </span>
            <h1 className="text-display-md text-cream">{phase.title}</h1>
            {phase.description ? (
              <p className="body-lg text-fg-2 max-w-3xl">{phase.description}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2 pt-2 sm:max-w-md">
            <ProgressBar
              total={totalDest}
              completed={completedDest}
              tone={completedDest >= totalDest && totalDest > 0 ? 'acid' : 'fire'}
              showLabel
              label={`${completedDest} / ${totalDest} destravamentos`}
            />
          </div>
        </header>

        <FaseNav phaseId={phase.id} userId={user.id} />
      </Container>
    </section>
  );
}
