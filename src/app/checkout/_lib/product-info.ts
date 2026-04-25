export type CheckoutProductSlug =
  | 'vss'
  | 'advisory-sessao'
  | 'advisory-sprint'
  | 'advisory-conselho';

interface ProductInfo {
  slug: CheckoutProductSlug;
  name: string;
  shortName: string;
  productPath: string;
  successCopy: string;
  pendingCopy: string;
  errorCopy: string;
}

const FALLBACK: ProductInfo = {
  slug: 'vss',
  name: 'sua compra',
  shortName: 'PRODUTO',
  productPath: '/',
  successCopy:
    'Em até 1 minuto você recebe um email com seu acesso. Se não chegar em 5 minutos, confere o spam ou fala comigo.',
  pendingCopy:
    'Pagamento em análise. Você recebe um email assim que aprovar — normalmente em poucos minutos pra Pix, até 2 dias úteis pra boleto.',
  errorCopy:
    'O pagamento não foi aprovado. Pode ser limite, validação ou cartão recusado. Tenta de novo com outro cartão ou Pix.',
};

const MAP: Record<CheckoutProductSlug, ProductInfo> = {
  vss: {
    slug: 'vss',
    name: 'Vendas Sem Segredos',
    shortName: 'VSS',
    productPath: '/vendas-sem-segredos',
    successCopy:
      'Bem-vindo ao VSS. Em até 1 minuto você recebe um email com o link de acesso à área e o link da próxima mentoria ao vivo. Bora pra cima.',
    pendingCopy:
      'Seu acesso ao VSS é liberado assim que o pagamento aprovar. Pix costuma cair em minutos. Boleto pode levar até 2 dias úteis. Você recebe email automático.',
    errorCopy:
      'Pagamento do VSS não aprovado. Tenta de novo — Pix funciona pra qualquer banco e libera acesso na hora.',
  },
  'advisory-sessao': {
    slug: 'advisory-sessao',
    name: 'Sessão Estratégica Advisory',
    shortName: 'ADVISORY · SESSÃO',
    productPath: '/advisory',
    successCopy:
      'Sessão Estratégica confirmada. Em até 1 minuto você recebe email com link pra agendar os 90 minutos diretamente na minha agenda.',
    pendingCopy:
      'Pagamento da Sessão Estratégica em análise. Assim que aprovar, você recebe email com link de agendamento.',
    errorCopy:
      'Pagamento da Sessão Estratégica não aprovado. Tenta de novo com outro cartão ou Pix.',
  },
  'advisory-sprint': {
    slug: 'advisory-sprint',
    name: 'Sprint Estratégico Advisory',
    shortName: 'ADVISORY · SPRINT',
    productPath: '/advisory',
    successCopy:
      'Sprint Estratégico confirmado. Em até 1 minuto você recebe email com link pra agendar a primeira das 4 sessões + WhatsApp direto comigo.',
    pendingCopy:
      'Pagamento do Sprint Estratégico em análise. Assim que aprovar, você recebe email com link de agendamento e contato direto.',
    errorCopy:
      'Pagamento do Sprint Estratégico não aprovado. Tenta de novo — pra valor cheio, Pix é o caminho mais rápido.',
  },
  'advisory-conselho': {
    slug: 'advisory-conselho',
    name: 'Conselho Executivo Advisory',
    shortName: 'ADVISORY · CONSELHO',
    productPath: '/advisory',
    successCopy:
      'Conselho Executivo ativado. Em até 1 minuto você recebe email com onboarding, agenda das 8 sessões/mês e WhatsApp prioritário comigo.',
    pendingCopy:
      'Pagamento do Conselho Executivo em análise. Assim que aprovar, eu mesmo te chamo no WhatsApp pra começar.',
    errorCopy:
      'Pagamento do Conselho Executivo não aprovado. Pra esse valor recomendo Pix — libera na hora.',
  },
};

export function getProductInfo(slug?: string | null): ProductInfo {
  if (!slug) return FALLBACK;
  if ((MAP as Record<string, ProductInfo>)[slug]) {
    return MAP[slug as CheckoutProductSlug];
  }
  return FALLBACK;
}
