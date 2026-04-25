import type { Metadata } from 'next';
import { DevStub } from '@/components/patterns/dev-stub';

export const metadata: Metadata = {
  title: 'Admin · Dashboard',
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <DevStub
      sprint={4}
      route="/admin"
      title="Dashboard admin"
      description="Sprint 4 entrega: receita do mês (via API Stripe/MP em tempo real), MRR, alunos ativos, leads recentes, custo LLM mês corrente, próximos compromissos Advisory + mentorias."
      backHref="/"
      backLabel="Site público"
    />
  );
}
