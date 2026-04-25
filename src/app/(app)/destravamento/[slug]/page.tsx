import type { Metadata } from 'next';
import { DevStub } from '@/components/patterns/dev-stub';

export const metadata: Metadata = {
  title: 'Destravamento',
  robots: { index: false, follow: false },
};

export default async function DestravamentoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <DevStub
      sprint={2}
      route={`/destravamento/${slug}`}
      title={`Workspace · ${slug}`}
      description="Sprint 2 entrega: server component carrega contexto (perfil 6P + artifacts anteriores + quota LLM), passa pra <AgentChat> client (Vercel AI SDK streaming). Tools saveArtifact/updateProfile/markComplete. Painel lateral com artifact preview editável."
      backHref="/area"
      backLabel="Voltar pro dashboard"
    />
  );
}
