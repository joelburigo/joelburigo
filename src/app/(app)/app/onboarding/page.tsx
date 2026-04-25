import type { Metadata } from 'next';
import { eq } from 'drizzle-orm';
import { Container } from '@/components/patterns/container';
import { OnboardingForm } from '@/components/features/onboarding';
import { db } from '@/server/db/client';
import { user_profiles } from '@/server/db/schema';
import { requireUser } from '@/server/services/session';

export const metadata: Metadata = {
  title: 'Onboarding 6Ps',
  robots: { index: false, follow: false },
};

interface RawData {
  steps?: Record<string, Record<string, string>>;
  [k: string]: unknown;
}

export default async function OnboardingPage() {
  const user = await requireUser();

  const [profile] = await db
    .select()
    .from(user_profiles)
    .where(eq(user_profiles.user_id, user.id))
    .limit(1);

  const raw = (profile?.raw_data ?? {}) as RawData;
  const initial: Record<string, Record<string, string>> = {};

  // Reaproveita raw_data.steps[N] (form linear) — espelhado por profileKey.
  if (raw.steps) {
    // raw.steps é indexado por número de step. Convertemos pra `profileKey`.
    const { ONBOARDING_STEPS } = await import('@/components/features/onboarding/steps');
    for (const step of ONBOARDING_STEPS) {
      const slice = raw.steps[String(step.position)];
      if (slice) initial[step.profileKey] = slice;
    }
  }

  return (
    <section className="section-sm">
      <Container size="md" className="flex flex-col gap-10">
        <div className="flex flex-col gap-2">
          <span className="kicker text-fire">// ONBOARDING 6PS</span>
          <p className="body-lg text-fg-2 max-w-2xl">
            Antes do destravamento, o sistema precisa te conhecer. 6 perguntas
            curtas — uma por P. Pode voltar e editar a qualquer momento.
          </p>
        </div>

        <OnboardingForm initial={initial} />
      </Container>
    </section>
  );
}
