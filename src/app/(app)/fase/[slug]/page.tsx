import type { Metadata } from 'next';
import { DevStub } from '@/components/patterns/dev-stub';

export const metadata: Metadata = {
  title: 'Fase VSS',
  robots: { index: false, follow: false },
};

export default async function FasePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <DevStub
      sprint={2}
      route={`/fase/${slug}`}
      title={`Fase · ${slug}`}
      description="Sprint 2 entrega: navegação dos módulos e destravamentos da fase. Marca completed visualmente. Botão pra próximo destravamento. Consolidação automática (Opus) ao fim da fase gera 'Plano da Fase'."
      backHref="/area"
      backLabel="Voltar pro dashboard"
    />
  );
}
