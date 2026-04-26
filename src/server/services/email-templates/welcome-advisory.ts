import 'server-only';
import {
  ctaButton,
  divider,
  EMAIL_COLORS,
  h1,
  kicker,
  p,
  signature,
  renderLayout,
} from './_layout';
import type { RenderedEmail } from './magic-link';

export type AdvisoryModalidade = 'sessao' | 'sprint' | 'conselho';

export interface WelcomeAdvisoryProps {
  name?: string | null;
  modalidade: AdvisoryModalidade;
  /** URL fallback (área logada / dashboard advisory). */
  areaUrl: string;
  /**
   * URL única de booking (`/sessao/agendar?token=...`) — opcional.
   * Quando passada e modalidade=`sessao`: vira o CTA primário.
   * Quando passada e modalidade=`sprint`: vira CTA secundário (kickoff).
   * Quando modalidade=`conselho`: ignorada.
   */
  bookingUrl?: string;
}

const MODALIDADE_LABEL: Record<AdvisoryModalidade, string> = {
  sessao: 'Sessão Advisory',
  sprint: 'Sprint Advisory',
  conselho: 'Conselho Advisory',
};

const MODALIDADE_PROXIMO: Record<AdvisoryModalidade, string> = {
  sessao:
    'Você tem <strong style="color:' +
    EMAIL_COLORS.acid +
    ';">30 dias</strong> pra agendar a sessão. Eu já bloqueio 90 minutos com você. Sai com plano de ação no fim.',
  sprint:
    'Sprint = 2 semanas comigo. Vamos atacar o gargalo principal do teu funil/oferta. Primeira call essa semana.',
  conselho:
    'Conselho = recorrência mensal. Te puxo do operacional pro estratégico. Combino primeira call de calibração nos próximos dias.',
};

export function welcomeAdvisory(props: WelcomeAdvisoryProps): RenderedEmail {
  const label = MODALIDADE_LABEL[props.modalidade];
  const subject = `${label} confirmada · Próximos passos`;
  const first = props.name?.trim().split(' ')[0];
  const greeting = first ? `Oi, ${first}.` : 'Oi.';

  // CTA por modalidade.
  // sessao + bookingUrl → primário "Agendar minha sessão de 90 minutos" (acid)
  //                        + nota "acesso único, expira em 30 dias"
  // sessao s/ bookingUrl → fallback "Agendar sessão" → areaUrl
  // sprint + bookingUrl → primário "Acessar área" → areaUrl
  //                        + secundário "Agendar kickoff agora" → bookingUrl (acid)
  // sprint s/ bookingUrl → "Acessar área"
  // conselho            → "Acessar área"
  const isSessao = props.modalidade === 'sessao';
  const isSprint = props.modalidade === 'sprint';
  const useBooking = Boolean(props.bookingUrl);

  let primaryCtaHtml = '';
  let secondaryCtaHtml = '';
  let bookingCopyHtml = '';

  if (isSessao && useBooking && props.bookingUrl) {
    primaryCtaHtml = ctaButton({
      href: props.bookingUrl,
      label: 'Agendar minha sessão de 90 minutos',
      variant: 'acid',
    });
    bookingCopyHtml = p(
      `Seu acesso é <strong style="color:${EMAIL_COLORS.acid};">único e expira em 30 dias</strong>. Escolha o melhor horário pra você.`
    );
  } else if (isSessao) {
    primaryCtaHtml = ctaButton({ href: props.areaUrl, label: 'Agendar sessão' });
  } else if (isSprint) {
    primaryCtaHtml = ctaButton({ href: props.areaUrl, label: 'Acessar área' });
    if (useBooking && props.bookingUrl) {
      secondaryCtaHtml = `<p style="margin:0 0 28px;">${ctaButton({
        href: props.bookingUrl,
        label: 'Agendar kickoff agora',
        variant: 'acid',
      })}</p>`;
    }
  } else {
    primaryCtaHtml = ctaButton({ href: props.areaUrl, label: 'Acessar área' });
  }

  const body = `
${kicker('ADVISORY CONFIRMADA')}
${h1(`${label} confirmada`)}
${p(greeting)}
${p(`Pagamento aprovado pra <strong style="color:${EMAIL_COLORS.cream};">${label}</strong>.`)}
${p(MODALIDADE_PROXIMO[props.modalidade])}
${bookingCopyHtml}
<p style="margin:28px 0;">${primaryCtaHtml}</p>
${secondaryCtaHtml}
${divider()}
${p('Qualquer dúvida — responde esse email direto.')}
${signature()}
`;

  // Plain text fallback
  const textCtaPrimary =
    isSessao && useBooking && props.bookingUrl
      ? `Agendar sessão (link único, expira em 30 dias):\n${props.bookingUrl}`
      : isSessao
        ? `Agendar sessão: ${props.areaUrl}`
        : `Acessar área: ${props.areaUrl}`;

  const textCtaSecondary =
    isSprint && useBooking && props.bookingUrl ? `\n\nAgendar kickoff: ${props.bookingUrl}` : '';

  const text = `${label} confirmada.

${greeting}

Pagamento aprovado.

${stripHtml(MODALIDADE_PROXIMO[props.modalidade])}
${
  isSessao && useBooking
    ? '\nSeu acesso é único e expira em 30 dias. Escolha o melhor horário pra você.\n'
    : ''
}
${textCtaPrimary}${textCtaSecondary}

— Joel`;

  return {
    subject,
    html: renderLayout({
      body,
      title: subject,
      preheader: `${label} confirmada — próximos passos.`,
    }),
    text,
  };
}

function stripHtml(s: string): string {
  return s.replace(/<[^>]+>/g, '');
}
