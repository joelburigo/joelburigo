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
import { env } from '@/env';

export interface AdvisoryBookingConfirmationProps {
  name: string;
  email: string;
  /** Já formatado pra exibição (ex: "qua, 30 abr 2026, 14:00 (BRT)"). */
  startsAtIso: string;
  durationMin: number;
  meetingUrl: string;
  /** Conteúdo `.ics` (RFC 5545). Anexado como `text/calendar`. */
  icsContent?: string;
  sessionId: string;
  /** Markdown opcional com instruções de preparação. Renderizado como texto simples (preserva quebras). */
  preparationMd?: string;
}

export interface RenderedEmailWithAttachments extends RenderedEmail {
  attachments?: Array<{ filename: string; content: string; type: string }>;
}

/** Converte markdown leve em HTML seguro pra email (parágrafos + bullets). */
function lightMdToHtml(md: string): string {
  const lines = md.split('\n');
  const out: string[] = [];
  let inList = false;
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      if (inList) {
        out.push('</ul>');
        inList = false;
      }
      continue;
    }
    if (/^[-*]\s+/.test(line)) {
      if (!inList) {
        out.push(
          `<ul style="font-size:14px;line-height:1.6;color:${EMAIL_COLORS.fg2};margin:0 0 12px;padding-left:20px;">`
        );
        inList = true;
      }
      out.push(`<li>${escapeHtml(line.replace(/^[-*]\s+/, ''))}</li>`);
    } else {
      if (inList) {
        out.push('</ul>');
        inList = false;
      }
      out.push(p(escapeHtml(line)));
    }
  }
  if (inList) out.push('</ul>');
  return out.join('\n');
}

export function advisoryBookingConfirmation(
  props: AdvisoryBookingConfirmationProps
): RenderedEmailWithAttachments {
  const baseUrl = env.PUBLIC_SITE_URL;
  const dashboardUrl = `${baseUrl}/app/advisory/dashboard`;
  const first = props.name.trim().split(' ')[0] || props.name;
  const subject = `Sessão confirmada — ${props.startsAtIso} · Joel Burigo`;

  const meetingHtml = `<a href="${escapeHtml(props.meetingUrl)}" style="display:inline-block;font-family:'JetBrains Mono',ui-monospace,Menlo,monospace;font-size:14px;color:${EMAIL_COLORS.acid};word-break:break-all;text-decoration:underline;">${escapeHtml(props.meetingUrl)}</a>`;

  const prepBlock = props.preparationMd
    ? `${divider()}
${kicker('PREPARAÇÃO')}
${lightMdToHtml(props.preparationMd)}`
    : '';

  const icsNote = props.icsContent
    ? p(
        `Anexei o convite <strong style="color:${EMAIL_COLORS.cream};">.ics</strong> — abre direto no Google Calendar / Apple Calendar / Outlook.`
      )
    : '';

  const body = `
${kicker('SESSÃO CONFIRMADA')}
${h1('Sessão confirmada')}
${p(`Oi, ${escapeHtml(first)}.`)}
${p('Tua sessão de Advisory tá agendada. Detalhes abaixo:')}

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;border:1px solid ${EMAIL_COLORS.hair};">
  <tr>
    <td style="padding:20px 24px;border-bottom:1px solid ${EMAIL_COLORS.hair};">
      <div style="font-family:'JetBrains Mono',ui-monospace,Menlo,monospace;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:${EMAIL_COLORS.acid};margin-bottom:6px;">// QUANDO</div>
      <div style="font-family:'Archivo Black',Arial Black,Arial,sans-serif;font-size:18px;color:${EMAIL_COLORS.cream};">${escapeHtml(props.startsAtIso)}</div>
    </td>
  </tr>
  <tr>
    <td style="padding:20px 24px;border-bottom:1px solid ${EMAIL_COLORS.hair};">
      <div style="font-family:'JetBrains Mono',ui-monospace,Menlo,monospace;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:${EMAIL_COLORS.acid};margin-bottom:6px;">// DURAÇÃO</div>
      <div style="font-family:'Archivo Black',Arial Black,Arial,sans-serif;font-size:18px;color:${EMAIL_COLORS.cream};">${props.durationMin} minutos</div>
    </td>
  </tr>
  <tr>
    <td style="padding:20px 24px;">
      <div style="font-family:'JetBrains Mono',ui-monospace,Menlo,monospace;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:${EMAIL_COLORS.acid};margin-bottom:6px;">// LINK_DA_CALL</div>
      ${meetingHtml}
    </td>
  </tr>
</table>

<p style="margin:28px 0;">${ctaButton({ href: props.meetingUrl, label: 'Entrar na call', variant: 'acid' })}</p>
<p style="margin:0 0 28px;">${ctaButton({ href: dashboardUrl, label: 'Acessar minha área' })}</p>

${icsNote}
${prepBlock}
${divider()}
${pMuted(`Sessão #${escapeHtml(props.sessionId)} · Precisa remarcar? Responde esse email.`)}
${signature()}
`;

  const text = `Sessão confirmada — ${props.startsAtIso}

Oi, ${first}.

Tua sessão de Advisory tá agendada.

Quando: ${props.startsAtIso}
Duração: ${props.durationMin} minutos
Link da call: ${props.meetingUrl}

Acessar minha área: ${dashboardUrl}
${props.icsContent ? '\nConvite .ics em anexo — abre direto no teu calendário.\n' : ''}${
    props.preparationMd ? `\nPreparação:\n${props.preparationMd}\n` : ''
  }
Sessão #${props.sessionId} · Precisa remarcar? Responde esse email.

— Joel`;

  const result: RenderedEmailWithAttachments = {
    subject,
    html: renderLayout({
      body,
      title: subject,
      preheader: `Sessão confirmada — ${props.startsAtIso}`,
    }),
    text,
  };

  if (props.icsContent) {
    result.attachments = [
      {
        filename: 'sessao-advisory.ics',
        content: Buffer.from(props.icsContent, 'utf8').toString('base64'),
        type: 'text/calendar',
      },
    ];
  }

  return result;
}
