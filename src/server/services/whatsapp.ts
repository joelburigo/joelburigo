import 'server-only';
import { env } from '@/env';

/**
 * Adapter EvolutionAPI (self-hosted no growth-infra).
 *
 * Sem EVOLUTION_API_URL/KEY: skipa silenciosamente (retorna ok+skipped),
 * mesmo padrão de email.ts. Permite rodar dev sem credenciais.
 *
 * Doc: https://doc.evolution-api.com/v2/api-reference/get-information
 *
 * Limitações atuais:
 *  - só texto (sendText). Mídia/template real ficam pra Sprint posterior.
 *  - sendTemplate é stub: substitui {{var}} no string passado e chama sendText.
 */

export interface SendTextParams {
  to: string;
  message: string;
}

export interface SendTemplateParams {
  to: string;
  template: string; // texto cru com placeholders {{var}}
  variables?: Record<string, string>;
}

export interface SendResult {
  ok: boolean;
  messageId?: string;
  skipped?: boolean;
  error?: string;
}

/**
 * Normaliza pra E.164 sem `+` (ex: 5511987654321).
 *
 * Aceita:
 *  - `(11) 98765-4321`
 *  - `+55 11 98765 4321`
 *  - `5511987654321`
 *  - `11987654321`
 *
 * Regra BR: celular tem 9 dígitos começando com 9 após o DDD.
 * Fixo (8 dígitos) também aceito mas raramente usado pra WhatsApp.
 */
export function normalizePhone(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const digits = String(raw).replace(/\D/g, '');
  if (!digits) return null;

  let withCountry = digits;
  if (digits.length === 10 || digits.length === 11) {
    // DDD + número, sem código de país
    withCountry = `55${digits}`;
  } else if (digits.length === 12 || digits.length === 13) {
    // já tem 55 prefixado
    if (!digits.startsWith('55')) return null;
    withCountry = digits;
  } else {
    return null;
  }

  // Esperado: 55 + DDD(2) + 8|9 dígitos = 12 ou 13
  if (withCountry.length !== 12 && withCountry.length !== 13) return null;

  const ddd = withCountry.slice(2, 4);
  const localPart = withCountry.slice(4);

  // DDD válido BR: 11-99 (não começa com 0)
  if (ddd[0] === '0') return null;

  // Celular (9 dígitos) precisa começar com 9
  if (localPart.length === 9 && localPart[0] !== '9') return null;
  // Fixo (8 dígitos) — primeiro dígito 2-5
  if (localPart.length === 8 && !/^[2-5]/.test(localPart)) return null;

  return withCountry;
}

interface EvolutionSendResponse {
  key?: { id?: string; remoteJid?: string };
  messageTimestamp?: number | string;
  status?: string;
}

export async function sendText(params: SendTextParams): Promise<SendResult> {
  const baseUrl = env.EVOLUTION_API_URL;
  const apiKey = env.EVOLUTION_API_KEY;
  const instance = env.EVOLUTION_INSTANCE;

  if (!baseUrl || !apiKey) {
    console.log('[whatsapp] (skipped) →', { to: params.to, len: params.message.length });
    return { ok: true, skipped: true };
  }

  const number = normalizePhone(params.to);
  if (!number) {
    console.warn('[whatsapp] número inválido', params.to);
    return { ok: false, error: 'invalid_phone' };
  }

  const url = `${baseUrl.replace(/\/$/, '')}/message/sendText/${encodeURIComponent(instance)}`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        apikey: apiKey,
        'content-type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({ number, text: params.message }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error('[whatsapp] evolution error', res.status, body);
      return { ok: false, error: `evolution ${res.status}` };
    }

    const data = (await res.json().catch(() => ({}))) as EvolutionSendResponse;
    const messageId = data.key?.id;
    console.log('[whatsapp] sent', { to: number, messageId });
    return { ok: true, messageId };
  } catch (err) {
    console.error('[whatsapp] fetch failed', err);
    return { ok: false, error: err instanceof Error ? err.message : 'unknown' };
  }
}

/**
 * Stub: substitui `{{var}}` no template e delega pra sendText.
 * Quando EvolutionAPI suportar templates oficiais (WABA), troca implementação.
 */
export async function sendTemplate(params: SendTemplateParams): Promise<SendResult> {
  const vars = params.variables ?? {};
  const message = params.template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    return Object.prototype.hasOwnProperty.call(vars, key) ? String(vars[key] ?? '') : '';
  });
  return sendText({ to: params.to, message });
}
