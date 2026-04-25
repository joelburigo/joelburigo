import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { issueMagicLink, sendMagicLinkEmail } from '@/server/services/auth';
import { kv } from '@/server/lib/kv';

const bodySchema = z.object({
  email: z.string().email(),
});

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_SEC = 15 * 60;

interface RateLimitEntry {
  count: number;
  reset_at: number;
}

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
  const rlKey = `rl:magic-link:${email}`;

  try {
    const now = Date.now();
    const entry = (await kv.get<RateLimitEntry>(rlKey)) ?? null;
    if (entry && entry.reset_at > now && entry.count >= RATE_LIMIT_MAX) {
      return NextResponse.json({ ok: true }); // não revela rate limit
    }
    const next: RateLimitEntry =
      entry && entry.reset_at > now
        ? { count: entry.count + 1, reset_at: entry.reset_at }
        : { count: 1, reset_at: now + RATE_LIMIT_WINDOW_SEC * 1000 };
    const ttl = Math.max(1, Math.ceil((next.reset_at - now) / 1000));
    await kv.set(rlKey, next, ttl);

    const result = await issueMagicLink(email);
    await sendMagicLinkEmail(result.user, result.url);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[auth/magic-link]', err);
    // Não revelar — sempre retorna ok pra não enumerar emails
    return NextResponse.json({ ok: true });
  }
}
