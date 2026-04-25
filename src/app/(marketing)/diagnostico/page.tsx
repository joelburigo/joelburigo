import type { Metadata } from 'next';
import { DiagnosticoPage } from '@/components/sections/diagnostico-page';

export const metadata: Metadata = {
  title: 'Diagnóstico 6Ps Gratuito - Checklist de Vendas | Joel Burigo',
  description:
    'Baixe gratuitamente o checklist dos 6Ps e descubra qual está travando o crescimento das suas vendas. Diagnóstico completo em 10 minutos.',
  keywords: [
    'diagnóstico vendas',
    'checklist vendas',
    'avaliação vendas',
    'framework 6Ps',
    'auditoria vendas',
  ],
  alternates: { canonical: '/diagnostico' },
};

export default function DiagnosticoRoute() {
  return (
    <DiagnosticoPage
      breadcrumbItems={[
        { label: 'Home', href: '/' },
        { label: 'Diagnóstico', href: '/diagnostico' },
      ]}
    />
  );
}
