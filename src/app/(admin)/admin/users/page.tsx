import type { Metadata } from 'next';
import { DevStub } from '@/components/patterns/dev-stub';

export const metadata: Metadata = {
  title: 'Admin · Alunos',
  robots: { index: false, follow: false },
};

export default function AdminUsersPage() {
  return (
    <DevStub
      sprint={4}
      route="/admin/users"
      title="Alunos VSS + Advisory"
      description="Sprint 4 entrega: tabela de users com entitlements ativos, progresso VSS, quota LLM usada/mês, próxima sessão Advisory. Filtros por status e produto. Drill-down pra ver perfil e artifacts."
      backHref="/admin"
      backLabel="Dashboard admin"
    />
  );
}
