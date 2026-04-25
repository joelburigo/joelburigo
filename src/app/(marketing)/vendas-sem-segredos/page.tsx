import type { Metadata } from 'next';
import { VssPage } from '@/components/sections/vss-page';
import { SITE } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'VSS: Sistema de Vendas em 90 Dias | Joel Burigo',
  description:
    'Programa completo com CRM, mentorias semanais e Framework 6Ps. De vendas aleatórias para previsíveis. R$ 1.997.',
  keywords: [
    'vendas sem segredos',
    'programa vendas',
    'curso vendas B2B',
    'CRM vendas',
    'framework 6Ps',
    'mentoria vendas',
  ],
  alternates: { canonical: '/vendas-sem-segredos' },
};

const vssSchema = {
  '@context': 'https://schema.org',
  '@type': 'Course',
  name: 'Vendas Sem Segredos',
  description:
    'Programa completo com CRM, mentorias semanais e Framework 6Ps. De vendas aleatórias para previsíveis. R$ 1.997.',
  url: `${SITE.url}/vendas-sem-segredos`,
  provider: { '@type': 'Organization', name: 'Joel Burigo', url: SITE.url },
  instructor: { '@type': 'Person', name: 'Joel Burigo', url: `${SITE.url}/sobre` },
  offers: {
    '@type': 'Offer',
    price: '1997',
    priceCurrency: 'BRL',
    availability: 'https://schema.org/InStock',
    validFrom: '2024-01-01',
  },
  hasCourseInstance: {
    '@type': 'CourseInstance',
    courseMode: 'online',
    duration: 'P90D',
    courseWorkload: '66 aulas + 48 mentorias ao vivo',
  },
  educationalLevel: 'Intermediário',
  teaches: 'Framework dos 6Ps para vendas escaláveis',
  numberOfCredits: '15 módulos',
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    reviewCount: '140',
    bestRating: '5',
  },
};

export default function VendasSemSegredosPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(vssSchema) }}
      />
      <VssPage
        breadcrumbItems={[
          { label: 'Home', href: '/' },
          { label: 'Vendas Sem Segredos', href: '/vendas-sem-segredos' },
        ]}
      />
    </>
  );
}
