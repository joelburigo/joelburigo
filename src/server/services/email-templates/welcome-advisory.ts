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
  areaUrl: string;
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

  const ctaLabel = props.modalidade === 'sessao' ? 'Agendar sessão' : 'Acessar área';

  const body = `
${kicker('ADVISORY CONFIRMADA')}
${h1(`${label} confirmada`)}
${p(greeting)}
${p(`Pagamento aprovado pra <strong style="color:${EMAIL_COLORS.cream};">${label}</strong>.`)}
${p(MODALIDADE_PROXIMO[props.modalidade])}
<p style="margin:28px 0;">${ctaButton({ href: props.areaUrl, label: ctaLabel })}</p>
${divider()}
${p('Qualquer dúvida — responde esse email direto.')}
${signature()}
`;

  const text = `${label} confirmada.

${greeting}

Pagamento aprovado.

${stripHtml(MODALIDADE_PROXIMO[props.modalidade])}

Próximo passo: ${props.areaUrl}

— Joel`;

  return {
    subject,
    html: renderLayout({ body, title: subject, preheader: `${label} confirmada — próximos passos.` }),
    text,
  };
}

function stripHtml(s: string): string {
  return s.replace(/<[^>]+>/g, '');
}
