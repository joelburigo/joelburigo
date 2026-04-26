import 'server-only';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { requireAdmin } from '@/server/services/session';
import { buildAuthUrl } from '@/server/services/calendar/google-oauth';
import { ulid } from '@/server/lib/ulid';

const STATE_COOKIE = 'gcal_oauth_state';
const STATE_TTL_SEC = 5 * 60;

/**
 * GET /api/calendar/google/connect
 *
 * Inicia o OAuth do Google Calendar:
 *  1. Gera state random
 *  2. Persiste state em cookie httpOnly secure (TTL 5min)
 *  3. Redirect 302 pro consent screen do Google
 */
export async function GET() {
  await requireAdmin();

  const state = ulid();
  const url = buildAuthUrl(state);

  const store = await cookies();
  store.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: STATE_TTL_SEC,
    path: '/',
  });

  return NextResponse.redirect(url, { status: 302 });
}
