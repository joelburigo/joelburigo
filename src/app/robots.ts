import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/constants';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin',
          '/admin/',
          '/area',
          '/area/',
          '/fase/',
          '/destravamento/',
          '/onboarding',
          '/advisory/dashboard',
          '/sessao/',
          '/verificar',
          '/vss-aguardando-pagamento',
          '/vss-compra-aprovada',
          '/obrigado',
          '/advisory-aplicacao',
          '/advisory-obrigado',
          '/diagnostico-obrigado',
          '/diagnostico-resultado',
          '/agendamento-sessao',
        ],
      },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
