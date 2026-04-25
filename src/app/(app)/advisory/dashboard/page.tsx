import type { Metadata } from 'next';
import { DevStub } from '@/components/patterns/dev-stub';

export const metadata: Metadata = {
  title: 'Advisory · Dashboard',
  robots: { index: false, follow: false },
};

export default function AdvisoryDashboardPage() {
  return (
    <DevStub
      sprint={3}
      route="/advisory/dashboard"
      title="Advisory · Sua área 1:1"
      description="Sprint 3 entrega: lista de sessões agendadas/passadas, embed Cal.com pra agendar, histórico de notas compartilhadas pelo Joel, artifacts trocados, link pra próxima sessão."
      backHref="/area"
      backLabel="Área principal"
    />
  );
}
