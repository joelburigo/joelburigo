import 'server-only';
import { env } from '@/env';

/**
 * Cloudflare Turnstile — server-side verification.
 *
 * Em dev (sem `TURNSTILE_SECRET_KEY` ou token === 'dev-token'): retorna valid=true.
 */

export interface TurnstileResult {
  valid: boolean;
  error?: string;
}

interface TurnstileApiResponse {
  success: boolean;
  'error-codes'?: string[];
  challenge_ts?: string;
  hostname?: string;
  action?: string;
}

const ENDPOINT = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export async function verifyTurnstile(
  token: string | null | undefined,
  ip?: string | null
): Promise<TurnstileResult> {
  if (!env.TURNSTILE_SECRET_KEY) {
    console.log('[turnstile] dev bypass (sem TURNSTILE_SECRET_KEY)');
    return { valid: true };
  }
  if (!token) {
    return { valid: false, error: 'missing_token' };
  }
  if (token === 'dev-token') {
    console.log('[turnstile] dev-token bypass');
    return { valid: true };
  }

  try {
    const params = new URLSearchParams();
    params.set('secret', env.TURNSTILE_SECRET_KEY);
    params.set('response', token);
    if (ip) params.set('remoteip', ip);

    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    if (!res.ok) {
      console.error('[turnstile] http', res.status);
      return { valid: false, error: `http_${res.status}` };
    }

    const data = (await res.json()) as TurnstileApiResponse;
    if (!data.success) {
      const code = data['error-codes']?.join(',') ?? 'unknown';
      console.warn('[turnstile] failed', code);
      return { valid: false, error: code };
    }
    return { valid: true };
  } catch (err) {
    console.error('[turnstile] fetch failed', err);
    return { valid: false, error: err instanceof Error ? err.message : 'unknown' };
  }
}
