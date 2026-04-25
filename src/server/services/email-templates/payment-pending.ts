import 'server-only';
import {
  ctaButton,
  divider,
  escapeHtml,
  h1,
  kicker,
  p,
  pMuted,
  signature,
  renderLayout,
} from './_layout';
import type { RenderedEmail } from './magic-link';

export interface PaymentPendingProps {
  name?: string | null;
  productName: string;
  areaUrl: string;
}

export function paymentPending(props: PaymentPendingProps): RenderedEmail {
  const first = props.name?.trim().split(' ')[0];
  const greeting = first ? `Oi, ${escapeHtml(first)}.` : 'Oi.';
  const subject = `Pagamento em análise · ${props.productName}`;

  const body = `
${kicker('PAGAMENTO EM ANÁLISE')}
${h1('Pagamento em análise')}
${p(greeting)}
${p(`Recebi a tentativa de pagamento pra <strong>${escapeHtml(props.productName)}</strong>. O gateway tá processando — costuma sair em alguns minutos (boleto ou Pix) ou até 2h úteis (cartão).`)}
${p('Você recebe um novo email assim que aprovar. Não precisa fazer nada agora.')}
<p style="margin:28px 0;">${ctaButton({ href: props.areaUrl, label: 'Acompanhar status' })}</p>
${divider()}
${pMuted('Se passou de 24h sem aprovar, responde esse email que eu olho no painel.')}
${signature()}
`;

  const text = `Pagamento em análise · ${props.productName}

${greeting}

Pagamento processando. Aguarda confirmação por email.

Acompanhar: ${props.areaUrl}

— Joel`;

  return {
    subject,
    html: renderLayout({ body, title: subject, preheader: 'Pagamento processando — aguarda confirmação.' }),
    text,
  };
}
