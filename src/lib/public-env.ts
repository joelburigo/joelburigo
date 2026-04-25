/**
 * Public env exposure — server injeta no `<script id="__jb_env">` do layout
 * raiz, client lê via `getPublicEnv()`.
 *
 * Next 16 não auto-expõe `process.env.X` ao browser (precisa prefixo
 * `NEXT_PUBLIC_*`). Como o `.env.tpl` herda padrão Astro (`PUBLIC_*`),
 * em vez de duplicar mirrors, server ler de `env.ts` e serializar pro
 * window. Lista é hard-coded — só vars realmente públicas.
 */

import { env } from '@/env';

export interface PublicEnv {
  TURNSTILE_SITE_KEY: string | null;
  GTM_ID: string | null;
  META_PIXEL_ID: string | null;
  GA4_MEASUREMENT_ID: string | null;
}

/** Server-only: monta o objeto que vai pro client. */
export function buildPublicEnv(): PublicEnv {
  return {
    TURNSTILE_SITE_KEY: env.TURNSTILE_SITE_KEY ?? null,
    GTM_ID: env.PUBLIC_GTM_ID ?? null,
    META_PIXEL_ID: env.PUBLIC_META_PIXEL_ID ?? null,
    GA4_MEASUREMENT_ID: env.GA4_MEASUREMENT_ID ?? null,
  };
}

/** Server-only: serializa pra `<script>` (escape básico). */
export function serializePublicEnv(): string {
  // JSON.stringify + escapar `</` previne quebra do </script>
  return JSON.stringify(buildPublicEnv()).replace(/</g, '\\u003c');
}

const WINDOW_KEY = '__JB_ENV';

/**
 * Client-only helper. SSR retorna defaults nulos.
 */
export function getPublicEnv(): PublicEnv {
  if (typeof window === 'undefined') {
    return {
      TURNSTILE_SITE_KEY: null,
      GTM_ID: null,
      META_PIXEL_ID: null,
      GA4_MEASUREMENT_ID: null,
    };
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any; // único cast: window não tipa __JB_ENV
  return (w[WINDOW_KEY] as PublicEnv | undefined) ?? {
    TURNSTILE_SITE_KEY: null,
    GTM_ID: null,
    META_PIXEL_ID: null,
    GA4_MEASUREMENT_ID: null,
  };
}

export const PUBLIC_ENV_WINDOW_KEY = WINDOW_KEY;
