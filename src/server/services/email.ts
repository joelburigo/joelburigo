import 'server-only';
import { env } from '@/env';

/**
 * Email transacional via Brevo API.
 * Em dev (NODE_ENV=development) ou sem BREVO_API_KEY: loga e retorna sem enviar.
 */

export interface EmailAttachment {
  filename: string;
  /** Base64 string OU Buffer/string com bytes a serializar. */
  content: Buffer | string;
  contentType?: string;
}

export interface SendEmailParams {
  to: string;
  toName?: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  fromEmail?: string;
  fromName?: string;
  /**
   * Anexos opcionais. Brevo cap: ~10MB total payload (content + html + text).
   * Pra .ics/PDFs pequenos é suficiente — anexos grandes quebram o JSON.
   */
  attachments?: EmailAttachment[];
}

export interface SendEmailResult {
  ok: boolean;
  skipped?: boolean;
  messageId?: string;
  error?: string;
}

export async function sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
  const fromEmail = params.fromEmail ?? env.EMAIL_FROM_TRANSACTIONAL;
  const fromName = params.fromName ?? env.EMAIL_FROM_NAME;

  if (env.NODE_ENV === 'development' || !env.BREVO_API_KEY) {
    console.log('[email] (skipped) →', {
      to: params.to,
      subject: params.subject,
      from: `${fromName} <${fromEmail}>`,
      attachments: params.attachments?.length ?? 0,
    });
    return { ok: true, skipped: true };
  }

  // Brevo aceita attachments via array `attachment[]` com `name` + `content` (base64).
  const brevoAttachments = params.attachments?.map((a) => {
    const base64 =
      typeof a.content === 'string'
        ? // se já está em base64 puro (sem newlines), passa; senão re-encode utf8
          /^[A-Za-z0-9+/=\r\n]+$/.test(a.content) && a.content.length % 4 === 0
          ? a.content.replace(/\s+/g, '')
          : Buffer.from(a.content, 'utf8').toString('base64')
        : a.content.toString('base64');
    return { name: a.filename, content: base64 };
  });

  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': env.BREVO_API_KEY,
        'content-type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({
        sender: { name: fromName, email: fromEmail },
        to: [{ email: params.to, ...(params.toName ? { name: params.toName } : {}) }],
        subject: params.subject,
        htmlContent: params.html,
        ...(params.text ? { textContent: params.text } : {}),
        ...(params.replyTo ? { replyTo: { email: params.replyTo } } : {}),
        ...(brevoAttachments && brevoAttachments.length > 0
          ? { attachment: brevoAttachments }
          : {}),
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error('[email] brevo error', res.status, body);
      return { ok: false, error: `brevo ${res.status}` };
    }
    const data = (await res.json().catch(() => ({}))) as { messageId?: string };
    return { ok: true, messageId: data.messageId };
  } catch (err) {
    console.error('[email] fetch failed', err);
    return { ok: false, error: err instanceof Error ? err.message : 'unknown' };
  }
}
