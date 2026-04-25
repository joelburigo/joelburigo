import type { Metadata } from 'next';
import { Hero } from '@/components/sections/hero';
import { ProofBar } from '@/components/sections/proof-bar';
import { Framework6Ps } from '@/components/sections/framework-6ps';
import { Pathways } from '@/components/sections/pathways';
import { FinalCta } from '@/components/sections/final-cta';
import { SITE } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Joel Burigo - Vendas Escaláveis para MPEs',
  description:
    'Estruture vendas previsíveis em 90 dias. Método 6Ps condensado de 17+ anos e 140+ empresas. DIY (VSS) ou Advisory 1:1.',
  alternates: { canonical: '/' },
};

const homeJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE.url}/#organization`,
      name: SITE.name,
      url: SITE.url,
      logo: { '@type': 'ImageObject', url: `${SITE.url}/images/joel-burigo-logo.webp` },
      founder: { '@type': 'Person', name: SITE.name },
      sameAs: [SITE.social.youtube, SITE.social.linkedin, SITE.social.instagram],
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE.url}/#website`,
      url: SITE.url,
      name: SITE.longName,
      publisher: { '@id': `${SITE.url}/#organization` },
      inLanguage: SITE.language,
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }}
      />
      <Hero
        kicker="// sistema > improviso"
        title={
          <>
            Vendas que funcionam <span className="text-acid">como máquina</span>, não como loteria.
          </>
        }
        subtitle="17+ anos e ~R$ 1 bilhão em vendas estruturadas, condensados em 6 pilares replicáveis. Você escolhe: DIY com copiloto (VSS) ou 1:1 comigo (Advisory)."
        ctaPrimary={{ label: 'Fazer diagnóstico', href: '/diagnostico' }}
        ctaSecondary={{ label: 'Ver Vendas Sem Segredos', href: '/vendas-sem-segredos' }}
        note="7 minutos · sem cadastro · sem upsell"
      />
      <ProofBar />
      <Framework6Ps />
      <Pathways />
      <FinalCta />
    </>
  );
}
