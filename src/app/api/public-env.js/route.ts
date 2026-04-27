import 'server-only';
import { NextResponse } from 'next/server';
import { serializePublicEnv, PUBLIC_ENV_WINDOW_KEY } from '@/lib/public-env';

/**
 * Serve `window.__JB_ENV={...}` como JS externo.
 *
 * Por que rota e não inline em <head>: React 19 emite warning
 * ("Scripts inside React components are never executed") em qualquer
 * <script> raw com inline content dentro do tree. Com `next/script` +
 * `src` apontando aqui, vira external script regular — React não reclama
 * e Next garante carregamento antes de hidratar (strategy=beforeInteractive).
 *
 * Cache: imutável até build (env não muda em runtime). 1h pra dev, max-age
 * grande em prod. Se você adicionar var nova ao public-env, basta hard-reload.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-static';

export function GET() {
  const json = serializePublicEnv();
  const body = `window.${PUBLIC_ENV_WINDOW_KEY}=${json};`;
  return new NextResponse(body, {
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control':
        process.env.NODE_ENV === 'production'
          ? 'public, max-age=3600, s-maxage=3600'
          : 'public, max-age=0, must-revalidate',
    },
  });
}
