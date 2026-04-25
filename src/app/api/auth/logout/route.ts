import { NextResponse, type NextRequest } from 'next/server';
import { clearSessionCookie } from '@/server/services/auth';

export async function POST(req: NextRequest) {
  const dest = req.nextUrl.clone();
  dest.pathname = '/';
  dest.search = '';
  const res = NextResponse.redirect(dest, { status: 303 });
  clearSessionCookie(res);
  return res;
}
