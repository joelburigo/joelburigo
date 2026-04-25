import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { issueMagicLink, sendMagicLinkEmail } from '@/server/services/auth';
import { rateLimit, pickIp } from '@/server/lib/rate-limit';
import { verifyTurnstile } from '@/server/services/turnstile';

const bodySchema = z.object({
  email: z.string().email(),
  cf_turnstile_token: z.string().optional().nullable(),
});

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_SEC = 15 * 60;

export async function POST(req: NextRequest) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'validation', issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const email = parsed.data.email.trim().toLowerCase();
  const ip = pickIp(req.headers);

  // Turnstile (em dev sem secret: bypass)
  const ts = await verifyTurnstile(parsed.data.cf_turnstile_token, ip);
  if (!ts.valid) {
    return NextResponse.json({ error: 'turnstile_invalid' }, { status: 403 });
  }

  try {
    const rl = await rateLimit({
      key: `rl:magic-link:${email}`,
      max: RATE_LIMIT_MAX,
      windowSeconds: RATE_LIMIT_WINDOW_SEC,
    });
    if (!rl.ok) {
      // Não revela rate limit ao caller — sempre retorna ok pra não enumerar.
      return NextResponse.json({ ok: true });
    }

    const result = await issueMagicLink(email);
    await sendMagicLinkEmail(result.user, result.url);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[auth/magic-link]', err);
    // Não revelar — sempre retorna ok pra não enumerar emails
    return NextResponse.json({ ok: true });
  }
}
