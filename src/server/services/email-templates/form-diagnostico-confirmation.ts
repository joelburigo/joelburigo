import 'server-only';
import {
  ctaButton,
  divider,
  EMAIL_COLORS,
  escapeHtml,
  h1,
  kicker,
  p,
  pMuted,
  signature,
  renderLayout,
} from './_layout';
import type { RenderedEmail } from './magic-link';

export interface FormDiagnosticoConfirmationProps {
  name: string;
  nivel: string;
  total: number;
  resultadoUrl: string;
}

export function formDiagnosticoConfirmation(
  props: FormDiagnosticoConfirmationProps
): RenderedEmail {
  const first = props.name.trim().split(' ')[0];
  const subject = `Diagnóstico 6Ps · ${props.nivel} (${props.total}/24)`;

  const body = `
${kicker('DIAGNÓSTICO 6PS')}
${h1(`${escapeHtml(props.nivel)} · ${props.total}/24`)}
${p(`Olá ${escapeHtml(first)}, seu score de maturidade nos 6Ps ficou em <strong style="color:${EMAIL_COLORS.acid};">${props.total}/24</strong> — nível <strong style="color:${EMAIL_COLORS.cream};">${escapeHtml(props.nivel)}</strong>.`)}
${p('Veja a leitura completa por P (posicionamento, público, produto, programas, processos, pessoas) e a recomendação do próximo passo:')}
<p style="margin:28px 0;">${ctaButton({ href: props.resultadoUrl, label: 'Ver resultado completo' })}</p>
${divider()}
${pMuted('Recomendação varia por nível: Caótico/Iniciante → começar pelo VSS. Estruturado/Avançado → Advisory. Otimizado → Conselho.')}
${signature()}
`;

  const text = `Diagnóstico 6Ps · ${props.nivel} (${props.total}/24)

Olá ${first}, seu score: ${props.total}/24 — ${props.nivel}.

Resultado completo: ${props.resultadoUrl}

— Joel`;

  return {
    subject,
    html: renderLayout({ body, title: subject, preheader: `Score ${props.total}/24 · ${props.nivel}` }),
    text,
  };
}
