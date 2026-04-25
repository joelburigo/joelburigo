import type { Metadata } from 'next';
import { Hero } from '@/components/sections/hero';
import { Container } from '@/components/patterns/container';
import { DiagnosticoForm } from '@/components/features/auth/diagnostico-form';

export const metadata: Metadata = {
  title: 'Diagnóstico de Vendas — 7 minutos, resultado imediato',
  description:
    'Responda 12 perguntas sobre os 6Ps da sua empresa. Receba um snapshot dos maiores gargalos e o caminho pra destravar. Sem cadastro, sem upsell.',
  alternates: { canonical: '/diagnostico' },
};

export default function DiagnosticoPage() {
  return (
    <>
      <Hero
        kicker="// DIAGNÓSTICO · 7 MIN"
        title={
          <>
            Onde suas vendas <span className="text-acid">travam</span>?
          </>
        }
        subtitle="12 perguntas honestas sobre os 6Ps. Sem cadastro obrigatório — só precisa de um email no fim pra receber o resultado."
      />
      <section className="section">
        <Container size="md">
          <DiagnosticoForm />
        </Container>
      </section>
    </>
  );
}
