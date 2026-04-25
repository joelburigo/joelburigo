import 'server-only';
import { kv } from './kv';

/**
 * Rate-limit fixed-window via `kv_store`.
 * Compartilhado por magic link, forms públicos e qualquer rota que precise.
 *
 * Limitação conhecida: race entre `get` + `set` (não é atômico). Aceitável
 * pra rate-limit de UX (não é defesa de segurança crítica) — quando precisar
 * de hard guarantee, trocar pra UPSERT atômico SQL.
 */

export interface RateLimitParams {
  /** Chave estável (ex: `rl:contato:${ip}:${email}`). */
  key: string;
  /** Máximo de hits dentro da janela. */
  max: number;
  /** Tamanho da janela em segundos. */
  windowSeconds: number;
}

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  resetAt: Date;
}

interface RateLimitEntry {
  count: number;
  reset_at: number;
}

export async function rateLimit(params: RateLimitParams): Promise<RateLimitResult> {
  const now = Date.now();
  const entry = (await kv.get<RateLimitEntry>(params.key)) ?? null;

  let next: RateLimitEntry;
  if (entry && entry.reset_at > now) {
    next = { count: entry.count + 1, reset_at: entry.reset_at };
  } else {
    next = { count: 1, reset_at: now + params.windowSeconds * 1000 };
  }

  const ttl = Math.max(1, Math.ceil((next.reset_at - now) / 1000));
  await kv.set(params.key, next, ttl);

  const remaining = Math.max(0, params.max - next.count);
  const ok = next.count <= params.max;

  if (!ok) {
    console.log(`[rate-limit] hit key=${params.key} count=${next.count}/${params.max}`);
  }

  return { ok, remaining, resetAt: new Date(next.reset_at) };
}

/** Helper pra extrair IP estável a partir de headers. */
export function pickIp(headers: Headers): string {
  const xff = headers.get('x-forwarded-for');
  if (xff) {
    const first = xff.split(',')[0];
    if (first) return first.trim();
  }
  return headers.get('x-real-ip') ?? 'unknown';
}
