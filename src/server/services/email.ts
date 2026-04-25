import 'server-only';
import { env } from '@/env';

/**
 * Email transacional via Brevo API.
 * Em dev (NODE_ENV=development) ou sem BREVO_API_KEY: loga e retorna sem enviar.
 */

export interface SendEmailParams {
  to: string;
  toName?: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  fromEmail?: string;
  fromName?: string;
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
    });
    return { ok: true, skipped: true };
  }

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
