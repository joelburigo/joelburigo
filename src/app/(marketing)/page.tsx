import type { Metadata } from 'next';
import { HeroSection } from '@/components/home/hero-section';
import { QuemSouSection } from '@/components/home/quem-sou-section';
import { ProblemSection } from '@/components/home/problem-section';
import { FrameworkSection } from '@/components/home/framework-section';
import { ProofSocialSection } from '@/components/home/proof-social-section';
import { PathwaysSection } from '@/components/home/pathways-section';
import { BlogPostsSection } from '@/components/home/blog-posts-section';
import { FinalCtaSection } from '@/components/home/final-cta-section';
import { SITE } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Joel Burigo - Vendas Escaláveis para MPEs',
  description:
    'Estruture vendas previsíveis em 90 dias. Método 6Ps condensado de 17+ anos e 140+ empresas. DIY (VSS) ou Advisory 1:1.',
  keywords: [
    'vendas escaláveis',
    'vendas B2B',
    'CRM',
    'consultoria vendas',
    'framework 6Ps',
    'Joel Burigo',
    'vendas sem segredos',
    'strategic advisory',
  ],
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
      <HeroSection />
      <QuemSouSection />
      <ProblemSection />
      <FrameworkSection />
      <ProofSocialSection />
      <PathwaysSection />
      <BlogPostsSection />
      <FinalCtaSection />
    </>
  );
}
