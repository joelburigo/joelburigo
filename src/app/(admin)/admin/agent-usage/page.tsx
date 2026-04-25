import type { Metadata } from 'next';
import { DevStub } from '@/components/patterns/dev-stub';

export const metadata: Metadata = {
  title: 'Admin · Uso do agente',
  robots: { index: false, follow: false },
};

export default function AdminAgentUsagePage() {
  return (
    <DevStub
      sprint={4}
      route="/admin/agent-usage"
      title="Uso do agente IA por aluno/mês"
      description="Sprint 4 entrega: tabela agent_usage agregada — top consumidores de tokens, custo por destravamento, alunos perto do hard limit (500k tokens/mês). Override manual de quota. Audit dos artifacts gerados."
      backHref="/admin"
      backLabel="Dashboard admin"
    />
  );
}
