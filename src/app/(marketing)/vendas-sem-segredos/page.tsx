import type { Metadata } from 'next';
import { DevStub } from '@/components/patterns/dev-stub';

export const metadata: Metadata = {
  title: 'Vendas Sem Segredos (VSS) — Sistema DIY com copiloto IA',
  description:
    'Playbook completo dos 6Ps das Vendas Escaláveis. Aplicação guiada por copiloto IA. 15 módulos, 66 destravamentos, mentorias ao vivo mensais. Acesso vitalício R$ 1.997.',
  alternates: { canonical: '/vendas-sem-segredos' },
};

export default function VssPage() {
  return (
    <DevStub
      sprint={0}
      route="/vendas-sem-segredos"
      title="Vendas Sem Segredos"
      description="Próximo passo do Sprint 0 (port byte-fiel): trazer VSSPage.astro original (408 linhas) — hero, oferta, pricing, garantia, depoimentos. Conteúdo intacto do Astro de produção."
      backHref="/"
      backLabel="Voltar pra home"
    />
  );
}
