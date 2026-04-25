/**
 * Constantes compartilhadas client + server (safe em ambos).
 * Nada sensível aqui — só URLs públicas, slugs, mapeamentos.
 */

export const SITE = {
  name: 'Joel Burigo',
  longName: 'Joel Burigo - Vendas Escaláveis',
  url: 'https://joelburigo.com.br',
  twitter: '@joelburigo',
  locale: 'pt_BR',
  language: 'pt-BR',
  region: 'BR-SC',
  place: 'Florianópolis',
  description:
    'Sistema completo de vendas escaláveis para micro e pequenas empresas. Transforme vendas aleatórias em previsíveis com o Framework dos 6Ps.',
  keywords:
    'vendas escaláveis, vendas B2B, CRM, consultoria vendas, framework 6Ps, Joel Burigo, vendas sem segredos, strategic advisory',
  social: {
    youtube: 'https://www.youtube.com/@joelburigo',
    linkedin: 'https://www.linkedin.com/in/joelburigo/',
    instagram: 'https://www.instagram.com/joelburigo/',
  },
} as const;

export const PRODUCTS = {
  vss: {
    id: 'vss',
    name: 'Vendas Sem Segredos',
    shortName: 'VSS',
    price_cents: 199700, // R$ 1.997,00
    currency: 'BRL',
    accessKind: 'lifetime',
  },
  advisorySession: {
    id: 'advisory_sessao',
    name: 'Sessão Advisory',
    price_cents: 99700, // R$ 997,00
    currency: 'BRL',
    accessKind: 'one_time',
  },
  advisorySprint: {
    id: 'advisory_sprint',
    name: 'Sprint Advisory 30 dias',
    price_cents: 750000, // R$ 7.500,00
    currency: 'BRL',
    accessKind: 'one_time',
  },
  advisoryCouncil: {
    id: 'advisory_conselho',
    name: 'Conselho Executivo',
    price_cents: 1500000, // R$ 15.000,00/mês
    currency: 'BRL',
    accessKind: 'manual',
  },
} as const;

export const REFUND_POLICY = {
  days: 15,
  description:
    '15 dias, sem perguntas — Joel revisa cada pedido (oportunidade de entender e reter)',
} as const;

export const TIMEZONE = 'America/Sao_Paulo';
