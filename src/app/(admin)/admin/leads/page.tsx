import type { Metadata } from 'next';
import { DevStub } from '@/components/patterns/dev-stub';

export const metadata: Metadata = {
  title: 'Admin · Leads',
  robots: { index: false, follow: false },
};

export default function AdminLeadsPage() {
  return (
    <DevStub
      sprint={4}
      route="/admin/leads"
      title="Leads — form_submissions"
      description="Sprint 4 entrega: tabela de form_submissions com filtro por type (diagnostico, contato, advisory_aplicacao), data, status. Export CSV. Notas internas. Reenvio pro n8n se webhook falhou."
      backHref="/admin"
      backLabel="Dashboard admin"
    />
  );
}
