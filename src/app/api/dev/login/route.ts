import 'server-only';
import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/server/db/client';
import { users } from '@/server/db/schema';
import { createSession, setSessionCookie } from '@/server/services/auth';

/**
 * Quick-login dev-only. Aceita `?as=admin|vss|lead` ou body `{ as }`.
 * BLOQUEADO em produção (404 silencioso).
 */

const PROFILES: Record<string, string> = {
  admin: 'joel@growthmaster.com.br',
  vss: 'demo-vss@joelburigo.dev',
  lead: 'demo-lead@joelburigo.dev',
};

export const runtime = 'nodejs';

async function handle(profile: string | null) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });
  }
  if (!profile || !(profile in PROFILES)) {
    return NextResponse.json(
      { ok: false, error: 'invalid_profile', accepts: Object.keys(PROFILES) },
      { status: 400 }
    );
  }

  const email = PROFILES[profile]!;
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user) {
    return NextResponse.json(
      { ok: false, error: 'user_not_found', hint: 'rode `pnpm db:seed`' },
      { status: 404 }
    );
  }

  const jwt = await createSession(user);
  const res = NextResponse.redirect(new URL('/area', process.env.PUBLIC_SITE_URL ?? 'http://localhost:4321'));
  setSessionCookie(res, jwt);
  return res;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  return handle(url.searchParams.get('as'));
}

export async function POST(req: Request) {
  let profile: string | null = null;
  try {
    const body = (await req.json()) as { as?: string };
    profile = body.as ?? null;
  } catch {
    profile = new URL(req.url).searchParams.get('as');
  }
  return handle(profile);
}
