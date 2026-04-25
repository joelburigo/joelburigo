import 'server-only';

/**
 * Layout base para todos os email templates Terminal Growth.
 * Brutalist · preto `#050505` · fire `#FF3B0F` · acid `#C6FF00`.
 *
 * String pura — sem deps. Mobile-friendly: `max-width:600px`.
 */

export interface LayoutProps {
  /** Conteúdo HTML interno do card (sem o wrapper). */
  body: string;
  /** Pré-header oculto pra preview no inbox. */
  preheader?: string;
  /** Título <title> do documento (default `Joel Burigo`). */
  title?: string;
}

const COLORS = {
  ink: '#050505',
  ink2: '#0a0a0a',
  hair: '#1a1a1a',
  cream: '#f5f5f5',
  fg2: '#d4d4d4',
  muted: '#737373',
  dim: '#525252',
  fire: '#FF3B0F',
  acid: '#C6FF00',
};

export const EMAIL_COLORS = COLORS;

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Botão CTA fire (default) ou acid. */
export function ctaButton(opts: {
  href: string;
  label: string;
  variant?: 'fire' | 'acid';
}): string {
  const isAcid = opts.variant === 'acid';
  const bg = isAcid ? COLORS.acid : COLORS.fire;
  const shadow = isAcid ? COLORS.fire : COLORS.acid;
  return `<a href="${opts.href}" style="display:inline-block;background:${bg};color:${COLORS.ink};font-family:'Archivo Black',Arial Black,Arial,sans-serif;text-transform:uppercase;letter-spacing:0.05em;font-size:14px;padding:16px 28px;text-decoration:none;border:2px solid ${COLORS.ink};box-shadow:6px 6px 0 ${shadow};">${escapeHtml(opts.label)}</a>`;
}

export function renderLayout(props: LayoutProps): string {
  const title = props.title ?? 'Joel Burigo';
  const preheader = props.preheader ?? '';
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark">
<meta name="supported-color-schemes" content="dark">
<title>${escapeHtml(title)}</title>
<style>
  body { margin:0; padding:0; background:${COLORS.ink}; }
  a { color:${COLORS.fire}; }
  @media (max-width: 620px) {
    .jb-card { padding:24px !important; }
    .jb-h1 { font-size:22px !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background:${COLORS.ink};color:${COLORS.cream};font-family:Archivo,Arial,sans-serif;">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;color:${COLORS.ink};">${escapeHtml(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${COLORS.ink};">
  <tr>
    <td align="center" style="padding:32px 16px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">
        <tr>
          <td class="jb-card" style="background:${COLORS.ink2};border:1px solid ${COLORS.hair};padding:40px;">
            ${props.body}
          </td>
        </tr>
        <tr>
          <td style="padding:24px 8px;font-family:'JetBrains Mono',ui-monospace,Menlo,monospace;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:${COLORS.dim};">
            // Joel Burigo · joelburigo.com.br
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

export function h1(text: string): string {
  return `<h1 class="jb-h1" style="font-family:'Archivo Black',Arial Black,Arial,sans-serif;font-size:26px;line-height:1.1;letter-spacing:0.02em;text-transform:uppercase;color:${COLORS.fire};margin:0 0 20px;">${escapeHtml(text)}</h1>`;
}

export function kicker(text: string): string {
  return `<p style="font-family:'JetBrains Mono',ui-monospace,Menlo,monospace;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:${COLORS.acid};margin:0 0 12px;">// ${escapeHtml(text)}</p>`;
}

export function p(text: string): string {
  return `<p style="font-size:15px;line-height:1.6;color:${COLORS.fg2};margin:0 0 16px;">${text}</p>`;
}

export function pMuted(text: string): string {
  return `<p style="font-size:13px;line-height:1.5;color:${COLORS.muted};margin:0 0 12px;">${text}</p>`;
}

export function divider(): string {
  return `<div style="height:1px;background:${COLORS.hair};margin:24px 0;"></div>`;
}

export function signature(): string {
  return `<p style="font-size:14px;color:${COLORS.fg2};margin:24px 0 0;">— Joel Burigo</p>`;
}
