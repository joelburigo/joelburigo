'use client';

import { useEffect, useRef, useState } from 'react';
import { getPublicEnv } from '@/lib/public-env';

/**
 * Cloudflare Turnstile widget — auto-injetado.
 *
 * Em dev (sem `TURNSTILE_SITE_KEY`): renderiza placeholder e auto-chama
 * `onVerify('dev-token')` no mount. Em prod: carrega script CF e renderiza
 * widget invisível/managed; callback dispara `onVerify(token)`.
 */

interface TurnstileProps {
  onVerify: (token: string) => void;
  /** Tamanho do widget. Default `flexible`. */
  size?: 'normal' | 'flexible' | 'compact' | 'invisible';
  /** Callback opcional pra erro. */
  onError?: (err: string) => void;
  /** Callback opcional pra expiração (token expira em ~5min). */
  onExpire?: () => void;
}

interface TurnstileApi {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      callback: (token: string) => void;
      'error-callback'?: (err: string) => void;
      'expired-callback'?: () => void;
      size?: string;
      theme?: string;
    }
  ) => string;
  reset: (widgetId?: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
    __jbTurnstileLoading?: boolean;
  }
}

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js';

function ensureScript(): Promise<TurnstileApi> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('SSR'));
  }
  if (window.turnstile) return Promise.resolve(window.turnstile);

  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src^="${SCRIPT_SRC}"]`
    );
    if (existing) {
      const onLoad = () => {
        if (window.turnstile) resolve(window.turnstile);
        else reject(new Error('turnstile not ready'));
      };
      if (window.turnstile) onLoad();
      else existing.addEventListener('load', onLoad, { once: true });
      return;
    }

    const s = document.createElement('script');
    s.src = `${SCRIPT_SRC}?render=explicit`;
    s.async = true;
    s.defer = true;
    s.onload = () => {
      if (window.turnstile) resolve(window.turnstile);
      else reject(new Error('turnstile not ready post-load'));
    };
    s.onerror = () => reject(new Error('failed to load turnstile script'));
    document.head.appendChild(s);
  });
}

export function Turnstile(props: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'dev' | 'error'>('loading');

  useEffect(() => {
    const { TURNSTILE_SITE_KEY } = getPublicEnv();
    const isLocal =
      typeof window !== 'undefined' && /^(localhost|127\.|0\.0\.0\.0)/.test(window.location.hostname);

    if (!TURNSTILE_SITE_KEY || isLocal) {
      setState('dev');
      props.onVerify('dev-token');
      return;
    }

    let cancelled = false;
    ensureScript()
      .then((api) => {
        if (cancelled || !containerRef.current) return;
        widgetIdRef.current = api.render(containerRef.current, {
          sitekey: TURNSTILE_SITE_KEY,
          callback: (token: string) => props.onVerify(token),
          'error-callback': (err: string) => {
            console.warn('[turnstile] widget error', err);
            props.onError?.(err);
          },
          'expired-callback': () => {
            props.onExpire?.();
          },
          size: props.size ?? 'flexible',
          theme: 'dark',
        });
        setState('ready');
      })
      .catch((err: unknown) => {
        console.error('[turnstile] script load failed', err);
        setState('error');
        props.onError?.(err instanceof Error ? err.message : 'load_failed');
      });

    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.reset(widgetIdRef.current);
        } catch {
          /* noop */
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (state === 'dev') {
    return (
      <div
        style={{
          padding: '8px 12px',
          border: '1px dashed #525252',
          fontFamily: 'JetBrains Mono, ui-monospace, Menlo, monospace',
          fontSize: 11,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: '#737373',
        }}
      >
        // Turnstile DEV bypass
      </div>
    );
  }

  return (
    <div className="jb-turnstile">
      <div ref={containerRef} />
      {state === 'error' && (
        <p style={{ color: '#FF3B0F', fontSize: 12, marginTop: 8 }}>
          Falha ao carregar verificação. Recarregue a página.
        </p>
      )}
    </div>
  );
}
