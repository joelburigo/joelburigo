import type { Metadata } from 'next';
import { DevStub } from '@/components/patterns/dev-stub';

export const metadata: Metadata = {
  title: 'Sessão Advisory',
  robots: { index: false, follow: false },
};

export default async function SessaoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <DevStub
      sprint={3}
      route={`/app/sessao/${id}`}
      title={`Sessão · ${id}`}
      description="Sprint 3 entrega: detalhes da sessão (data, duração, link Zoom), formulário de preparação pré-sessão pro cliente preencher, notas do Joel pós-sessão (quando compartilhadas), artifacts gerados na sessão."
      backHref="/app/advisory/dashboard"
      backLabel="Voltar pra Advisory"
    />
  );
}
