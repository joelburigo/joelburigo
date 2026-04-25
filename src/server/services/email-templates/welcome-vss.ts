import 'server-only';
import {
  ctaButton,
  divider,
  EMAIL_COLORS,
  escapeHtml,
  h1,
  kicker,
  p,
  signature,
  renderLayout,
} from './_layout';
import type { RenderedEmail } from './magic-link';

export interface WelcomeVssProps {
  name?: string | null;
  areaUrl: string;
}

export function welcomeVss(props: WelcomeVssProps): RenderedEmail {
  const first = props.name?.trim().split(' ')[0] || 'campeão';
  const subject = `Bem-vindo ao VSS, ${first}`;

  const body = `
${kicker('PAGAMENTO APROVADO')}
${h1(`Bem-vindo ao VSS, ${first}`)}
${p('Você acabou de comprar o método. Acesso vitalício, atualizações inclusas, sem mensalidade.')}
${p('<strong style="color:' + EMAIL_COLORS.cream + ';">Próximos passos:</strong>')}
<ol style="font-size:15px;line-height:1.7;color:${EMAIL_COLORS.fg2};margin:0 0 24px;padding-left:20px;">
  <li>Acessa a área e completa o onboarding (5 min).</li>
  <li>Roda o primeiro destravamento — escolhido pelo agente com base no teu diagnóstico.</li>
  <li>Entra na próxima mentoria ao vivo (toda semana, replay disponível).</li>
</ol>
<p style="margin:28px 0;">${ctaButton({ href: props.areaUrl, label: 'Acessar área VSS' })}</p>
${divider()}
${p('Se travar em qualquer ponto: responde esse email. Eu leio.')}
${signature()}
`;

  const text = `Bem-vindo ao VSS, ${first}.

Pagamento aprovado. Acesso vitalício.

Próximos passos:
1. Acessa a área e completa o onboarding (5 min)
2. Roda o primeiro destravamento
3. Entra na próxima mentoria ao vivo

Acessar: ${props.areaUrl}

Se travar, responde esse email.
— Joel`;

  return {
    subject,
    html: renderLayout({ body, title: subject, preheader: 'Acesso liberado. Próximos passos no e-mail.' }),
    text,
  };
}

export type { RenderedEmail };
export { escapeHtml };
