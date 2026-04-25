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
  renderLayout,
} from './_layout';

export interface MagicLinkProps {
  url: string;
  name?: string | null;
  /** TTL em minutos (default 15). */
  ttlMin?: number;
}

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

export function magicLink(props: MagicLinkProps): RenderedEmail {
  const ttl = props.ttlMin ?? 15;
  const first = props.name?.trim().split(' ')[0];
  const greeting = first ? `Oi, ${escapeHtml(first)}.` : 'Oi.';

  const body = `
${kicker('ENTRAR')}
${h1('Seu link de acesso')}
${p(greeting)}
${p(`Clique no botão abaixo pra entrar. O link expira em <strong style="color:${EMAIL_COLORS.acid};">${ttl} minutos</strong> e funciona uma vez só.`)}
<p style="margin:28px 0;">${ctaButton({ href: props.url, label: 'Abrir link' })}</p>
${pMuted(`Ou copie e cole no navegador:<br><span style="font-family:'JetBrains Mono',ui-monospace,Menlo,monospace;color:${EMAIL_COLORS.muted};word-break:break-all;font-size:11px;">${escapeHtml(props.url)}</span>`)}
${divider()}
${pMuted('Se você não pediu este link, ignore este email — ninguém entra sem clicar.')}
`;

  const text = `Seu link de acesso (expira em ${ttl} min, uso único):

${props.url}

Se você não pediu este link, ignore.`;

  return {
    subject: 'Seu link de acesso · Joel Burigo',
    html: renderLayout({ body, title: 'Seu link de acesso', preheader: `Link expira em ${ttl} minutos.` }),
    text,
  };
}
