import type { Metadata } from 'next';
import { DevStub } from '@/components/patterns/dev-stub';

export const metadata: Metadata = {
  title: 'Diagnóstico de Vendas — 7 minutos, resultado imediato',
  description:
    'Responda 12 perguntas sobre os 6Ps da sua empresa. Receba um snapshot dos maiores gargalos e o caminho pra destravar.',
  alternates: { canonical: '/diagnostico' },
};

export default function DiagnosticoPage() {
  return (
    <DevStub
      sprint={0}
      route="/diagnostico"
      title="Diagnóstico 6Ps"
      description="Próximo passo do Sprint 0 (port byte-fiel): trazer DiagnosticoPage.astro original (98 linhas) + form HighLevel completo. Conteúdo intacto do Astro de produção."
      backHref="/"
      backLabel="Voltar pra home"
    />
  );
}
