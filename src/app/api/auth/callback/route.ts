import { NextResponse, type NextRequest } from 'next/server';
import {
  verifyMagicLink,
  createSession,
  setSessionCookie,
} from '@/server/services/auth';

function isSafeNext(next: string | null): next is string {
  return !!next && next.startsWith('/') && !next.startsWith('//');
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.clone();
  const token = url.searchParams.get('token');
  const nextParam = url.searchParams.get('next');
  const next = isSafeNext(nextParam) ? nextParam : '/app/area';

  if (!token) {
    const redir = req.nextUrl.clone();
    redir.pathname = '/entrar';
    redir.search = '?error=missing_token';
    return NextResponse.redirect(redir);
  }

  try {
    const user = await verifyMagicLink(token);
    const jwt = await createSession(user);

    const dest = req.nextUrl.clone();
    dest.pathname = next;
    dest.search = '';
    const res = NextResponse.redirect(dest);
    setSessionCookie(res, jwt);
    return res;
  } catch (err) {
    console.error('[auth/callback]', err);
    const redir = req.nextUrl.clone();
    redir.pathname = '/entrar';
    redir.search = '?error=invalid_token';
    return NextResponse.redirect(redir);
  }
}
