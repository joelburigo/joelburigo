import type { Metadata } from 'next';
import { DevStub } from '@/components/patterns/dev-stub';

export const metadata: Metadata = {
  title: 'Área do aluno',
  robots: { index: false, follow: false },
};

export default function AreaPage() {
  return (
    <DevStub
      sprint={2}
      route="/area"
      title="Dashboard do aluno"
      description="Sprint 2 entrega: progresso visual das 7 fases, próximo destravamento recomendado pelo gargalo declarado, grid de artifacts gerados, próxima mentoria, link pro perfil 6P editável."
      backHref="/"
      backLabel="Home"
    />
  );
}
