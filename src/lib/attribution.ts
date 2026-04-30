/**
 * Marketing attribution capture (client-side).
 *
 * Cookie `__jb_attr` armazena UTM params + click IDs + page context.
 *
 * First-touch wins pra UTM/click IDs (preserva crédito da campanha que trouxe
 * o lead originalmente — last-touch sobrescreveria atribuição em retargeting).
 * Last-touch atualiza só `last_landing_page` (útil pra entender qual página
 * converteu, sem perder origem).
 *
 * Meta cookies `_fbp`/`_fbc` são re-lidos a cada chamada (Pixel pode setar
 * depois do primeiro page view).
 */

export interface AttributionData {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  gclid?: string;
  fbclid?: string;
  msclkid?: string;
  ttclid?: string;
  referrer?: string;
  first_landing_page?: string;
  last_landing_page?: string;
  fbp?: string;
  fbc?: string;
}

const COOKIE_NAME = '__jb_attr';
const COOKIE_MAX_AGE_DAYS = 90;

const UTM_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
] as const satisfies readonly (keyof AttributionData)[];

const CLICK_ID_KEYS = ['gclid', 'fbclid', 'msclkid', 'ttclid'] as const satisfies readonly (keyof AttributionData)[];

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

function readCookie(name: string): string | undefined {
  if (!isBrowser()) return undefined;
  const prefix = `${name}=`;
  const parts = document.cookie ? document.cookie.split('; ') : [];
  for (const part of parts) {
    if (part.startsWith(prefix)) {
      return decodeURIComponent(part.slice(prefix.length));
    }
  }
  return undefined;
}

function writeCookie(name: string, value: string): void {
  if (!isBrowser()) return;
  const maxAge = COOKIE_MAX_AGE_DAYS * 24 * 60 * 60;
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax${secure}`;
}

function readStoredAttribution(): AttributionData {
  const raw = readCookie(COOKIE_NAME);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === 'object') {
      return parsed as AttributionData;
    }
    return {};
  } catch {
    return {};
  }
}

function readUrlParams(): Partial<AttributionData> {
  if (!isBrowser()) return {};
  const params = new URLSearchParams(window.location.search);
  const out: Partial<AttributionData> = {};
  for (const key of UTM_KEYS) {
    const v = params.get(key);
    if (v) out[key] = v;
  }
  for (const key of CLICK_ID_KEYS) {
    const v = params.get(key);
    if (v) out[key] = v;
  }
  return out;
}

function readMetaCookies(): Pick<AttributionData, 'fbp' | 'fbc'> {
  const out: Pick<AttributionData, 'fbp' | 'fbc'> = {};
  const fbp = readCookie('_fbp');
  const fbc = readCookie('_fbc');
  if (fbp) out.fbp = fbp;
  if (fbc) out.fbc = fbc;
  return out;
}

function readReferrer(): string | undefined {
  if (!isBrowser()) return undefined;
  const ref = document.referrer;
  if (!ref) return undefined;
  try {
    const refUrl = new URL(ref);
    if (refUrl.origin === window.location.origin) return undefined;
    return ref;
  } catch {
    return undefined;
  }
}

function currentPath(): string {
  if (!isBrowser()) return '';
  return window.location.pathname + window.location.search;
}

export function captureAttribution(): AttributionData {
  if (!isBrowser()) return {};

  const stored = readStoredAttribution();
  const urlParams = readUrlParams();
  const meta = readMetaCookies();
  const path = currentPath();

  const isFirstTouch = !stored.first_landing_page;

  const next: AttributionData = { ...stored };

  if (isFirstTouch) {
    for (const key of UTM_KEYS) {
      if (urlParams[key]) next[key] = urlParams[key];
    }
    for (const key of CLICK_ID_KEYS) {
      if (urlParams[key]) next[key] = urlParams[key];
    }
    const ref = readReferrer();
    if (ref) next.referrer = ref;
    if (path) next.first_landing_page = path;
  } else {
    for (const key of UTM_KEYS) {
      if (urlParams[key] && !next[key]) next[key] = urlParams[key];
    }
    for (const key of CLICK_ID_KEYS) {
      if (urlParams[key] && !next[key]) next[key] = urlParams[key];
    }
  }

  if (path) next.last_landing_page = path;

  if (meta.fbp) next.fbp = meta.fbp;
  if (meta.fbc) next.fbc = meta.fbc;

  try {
    writeCookie(COOKIE_NAME, JSON.stringify(next));
  } catch {
    // ignore quota / serialization errors
  }

  return next;
}

export function readAttribution(): AttributionData {
  if (!isBrowser()) return {};
  const stored = readStoredAttribution();
  const meta = readMetaCookies();
  return {
    ...stored,
    ...(meta.fbp ? { fbp: meta.fbp } : {}),
    ...(meta.fbc ? { fbc: meta.fbc } : {}),
  };
}
