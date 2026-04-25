import { NextResponse, type NextRequest } from 'next/server';
import { verifySession, SESSION } from '@/lib/jwt';

/**
 * Proxy de proteção de rotas (Next 16+ — antes era `middleware`).
 *
 * Rotas públicas (marketing): tudo fora dos prefixos abaixo.
 *
 * Rotas logadas (PROTECTED_PREFIXES): exigem JWT válido em cookie `jb_session`.
 *
 * Rotas admin (ADMIN_PREFIXES): exigem session + role=admin (validado aqui via JWT;
 * cross-check com DB acontece no layout `(admin)` durante navegação).
 *
 * Edge runtime — usa apenas `jose` + `JWT_SECRET` (sem DB / server-only).
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

function matchesPrefix(pathname: string, prefixes: readonly string[]): boolean {
  return prefixes.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

function redirectToLogin(req: NextRequest, pathname: string, error?: string): NextResponse {
  const url = req.nextUrl.clone();
  url.pathname = '/entrar';
  url.search = '';
  url.searchParams.set('next', pathname);
  if (error) url.searchParams.set('error', error);
  return NextResponse.redirect(url);
}

export async function proxy(req: NextRequest): Promise<NextResponse> {
  const { pathname } = req.nextUrl;

  const isAdmin = matchesPrefix(pathname, ADMIN_PREFIXES);
  const isProtected = isAdmin || matchesPrefix(pathname, PROTECTED_PREFIXES);

  if (!isProtected) return NextResponse.next();

  const token = req.cookies.get(SESSION.cookieName)?.value;
  if (!token) return redirectToLogin(req, pathname);

  const payload = await verifySession(token);
  if (!payload) return redirectToLogin(req, pathname, 'session_expired');

  if (isAdmin && payload.role !== 'admin') {
    const url = req.nextUrl.clone();
    url.pathname = '/area';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match tudo exceto:
     * - /api (tem auth próprio por handler)
     * - /_next (assets do Next)
     * - arquivos estáticos
     */
    '/((?!api|_next/static|_next/image|favicon.svg|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|webp|avif|svg|ico|css|js)).*)',
  ],
};
