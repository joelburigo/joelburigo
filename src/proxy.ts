import { NextResponse, type NextRequest } from 'next/server';

/**
 * Proxy de proteção de rotas (Next 16+ — antes era `middleware`).
 *
 * Rotas públicas (marketing): tudo fora de /area, /fase, /destravamento, /onboarding,
 *   /advisory/dashboard, /sessao, /admin.
 *
 * Rotas logadas (/area, /fase, /destravamento, /onboarding, /advisory/dashboard, /sessao):
 *   exigem cookie `jb_session` válido.
 *
 * Rotas admin (/admin, /admin/*): exigem session + role=admin (validado no layout via DB).
 *
 * Sprint 0: stub que redireciona se cookie ausente. Sprint 1 valida JWT + consulta KV.
 */

const PROTECTED_PREFIXES = [
  '/area',
  '/fase',
  '/destravamento',
  '/onboarding',
  '/advisory/dashboard',
  '/sessao',
];

const ADMIN_PREFIXES = ['/admin'];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const session = req.cookies.get('jb_session')?.value;

  const isAdmin = ADMIN_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'));
  const isProtected =
    isAdmin || PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'));

  if (!isProtected) return NextResponse.next();

  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = '/entrar';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  // Validação de JWT + role=admin fica nas páginas (layout `(admin)` consulta DB).
  // Proxy só bloqueia quando cookie ausente pra evitar I/O em Edge runtime.
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match tudo exceto:
     * - /api (tem auth próprio por handler)
     * - /_next (assets do Next)
     * - arquivos estáticos (imagens, favicon, etc)
     */
    '/((?!api|_next/static|_next/image|favicon.svg|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|webp|avif|svg|ico|css|js)).*)',
  ],
};
