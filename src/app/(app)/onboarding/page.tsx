import type { Metadata } from 'next';
import { DevStub } from '@/components/patterns/dev-stub';

export const metadata: Metadata = {
  title: 'Onboarding',
  robots: { index: false, follow: false },
};

export default function OnboardingPage() {
  return (
    <DevStub
      sprint={2}
      route="/onboarding"
      title="Onboarding conversacional"
      description="Sprint 2 entrega: agente faz 8-12 perguntas calmas (empresa, oferta, operação, números, gargalo, 6Ps), preenche user_profiles via tool updateProfile, fim mostra resumo editável. 10-15 min."
      backHref="/area"
      backLabel="Pular pra área"
    />
  );
}
