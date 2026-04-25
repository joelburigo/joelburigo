import 'server-only';
import {
  divider,
  escapeHtml,
  h1,
  kicker,
  p,
  signature,
  renderLayout,
} from './_layout';
import type { RenderedEmail } from './magic-link';

export interface FormContatoConfirmationProps {
  name: string;
}

export function formContatoConfirmation(
  props: FormContatoConfirmationProps
): RenderedEmail {
  const first = props.name.trim().split(' ')[0];
  const subject = 'Recebi seu contato · Joel Burigo';

  const body = `
${kicker('MENSAGEM RECEBIDA')}
${h1(`Recebi sua mensagem, ${escapeHtml(first)}`)}
${p('Joel responde pessoalmente em até <strong style="color:#C6FF00;">1 dia útil</strong>.')}
${p('Se for urgente, manda WhatsApp direto pelo site.')}
${divider()}
${signature()}
`;

  const text = `Recebi sua mensagem, ${first}.

Joel responde pessoalmente em até 1 dia útil.

Se for urgente, manda WhatsApp pelo site.

— Joel`;

  return {
    subject,
    html: renderLayout({ body, title: subject, preheader: 'Joel responde em até 1 dia útil.' }),
    text,
  };
}
