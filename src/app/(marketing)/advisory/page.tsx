import type { Metadata } from 'next';
import { DevStub } from '@/components/patterns/dev-stub';

export const metadata: Metadata = {
  title: 'Advisory Strategic — Conselho executivo 1:1 com Joel Burigo',
  description:
    'Sessão avulsa, Sprint de 30 dias ou Conselho Executivo mensal. Para MPEs com urgência e contexto que exige pensamento sob medida.',
  alternates: { canonical: '/advisory' },
};

export default function AdvisoryPage() {
  return (
    <DevStub
      sprint={0}
      route="/advisory"
      title="Advisory Strategic"
      description="Próximo passo do Sprint 0 (port byte-fiel): trazer AdvisoryPage.astro original (352 linhas) — 3 modalidades, processo, garantia. Conteúdo intacto do Astro de produção."
      backHref="/"
      backLabel="Voltar pra home"
    />
  );
}
