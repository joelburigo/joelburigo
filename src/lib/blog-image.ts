/**
 * Helpers de URL pra mídia do blog (imagem + áudio).
 *
 * - Imagens: usam Cloudflare Image Transformations no momento de servir, evitando
 *   pré-processar (sharp não roda em Workers). Doc:
 *   https://developers.cloudflare.com/images/transform-images/transform-via-url/
 * - Aceita 3 formatos no `cover_image_path`:
 *   1. `/images/foo.webp`     → asset bundlado em public/ (legacy)
 *   2. `https://...`           → URL absoluta (e.g. R2 publicUrl pré-resolvido)
 *   3. `blog/<post>/<id>.jpg` → R2 key relativo (admin upload pós-migração)
 */

const R2_PUBLIC_URL = (process.env.R2_PUBLIC_URL || process.env.NEXT_PUBLIC_R2_PUBLIC_URL || '').replace(
  /\/$/,
  '',
);

const CIT_BASE = (
  process.env.NEXT_PUBLIC_IMAGE_TRANSFORM_BASE ||
  process.env.PUBLIC_SITE_URL ||
  ''
).replace(/\/$/, '');

export type ImageVariant = {
  width?: number;
  quality?: number;
  format?: 'auto' | 'webp' | 'avif';
  fit?: 'scale-down' | 'contain' | 'cover' | 'crop' | 'pad';
};

const DEFAULT_VARIANT: Required<ImageVariant> = {
  width: 1080,
  quality: 82,
  format: 'auto',
  fit: 'scale-down',
};

/** Resolve `path` em URL absoluta. */
function resolveSourceUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (path.startsWith('/')) return path;
  if (R2_PUBLIC_URL) return `${R2_PUBLIC_URL}/${path}`;
  // Fallback (dev sem R2_PUBLIC_URL setado): trata como path absoluto.
  return `/${path}`;
}

/**
 * URL final pra renderizar imagem do blog. Aplica CIT em produção.
 */
export function blogImageUrl(path: string, variant: ImageVariant = {}): string {
  const source = resolveSourceUrl(path);
  // Sem CIT_BASE configurado, devolve a fonte direto. CIT vai entrar
  // automático quando setarmos NEXT_PUBLIC_IMAGE_TRANSFORM_BASE em prod.
  if (!CIT_BASE) return source;
  // Assets locais já são otimizados pelo build do Next; pulamos CIT.
  if (source.startsWith('/')) return source;
  const v = { ...DEFAULT_VARIANT, ...variant };
  const opts = [
    `width=${v.width}`,
    `quality=${v.quality}`,
    `format=${v.format}`,
    `fit=${v.fit}`,
  ].join(',');
  return `${CIT_BASE}/cdn-cgi/image/${opts}/${source}`;
}

/** srcset pra <img sizes>. */
export function blogImageSrcSet(
  path: string,
  format: 'auto' | 'webp' | 'avif' = 'auto',
): string {
  return [480, 720, 1080, 1920]
    .map((w) => `${blogImageUrl(path, { width: w, format })} ${w}w`)
    .join(', ');
}

/**
 * URL do áudio do post. Convenção: `/audio/blog/<slug>.mp3` se relativo,
 * senão usa `path` como está.
 */
export function blogAudioUrl(path: string | null | undefined, slug?: string): string | null {
  if (path) {
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    if (path.startsWith('/')) return path;
    if (R2_PUBLIC_URL) return `${R2_PUBLIC_URL}/${path}`;
    return `/${path}`;
  }
  if (slug) return `/audio/blog/${slug}.mp3`;
  return null;
}
