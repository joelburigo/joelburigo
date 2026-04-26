import 'server-only';
import { NextResponse, type NextRequest } from 'next/server';
import { and, asc, eq, gte } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/server/db/client';
import { availability_overrides } from '@/server/db/schema';
import { ulid } from '@/server/lib/ulid';
import { requireAdmin } from '@/server/services/session';

const createSchema = z.object({
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  kind: z.enum(['block', 'extra']),
  reason: z.string().max(500).optional().nullable(),
});

export async function GET() {
  const admin = await requireAdmin();
  // Pega overrides do passado próximo (últimos 30d) + futuros — UI filtra futuros
  const since = new Date(Date.now() - 30 * 86400_000);
  const rows = await db
    .select()
    .from(availability_overrides)
    .where(
      and(
        eq(availability_overrides.owner_id, admin.id),
        gte(availability_overrides.starts_at, since)
      )
    )
    .orderBy(asc(availability_overrides.starts_at));
  return NextResponse.json({ overrides: rows });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'validation', issues: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const data = parsed.data;

  const startsAt = new Date(data.startsAt);
  const endsAt = new Date(data.endsAt);
  if (endsAt.getTime() <= startsAt.getTime()) {
    return NextResponse.json({ error: 'end_must_be_after_start' }, { status: 400 });
  }

  const id = ulid();
  await db.insert(availability_overrides).values({
    id,
    owner_id: admin.id,
    starts_at: startsAt,
    ends_at: endsAt,
    kind: data.kind,
    reason: data.reason ?? null,
  });

  const [row] = await db
    .select()
    .from(availability_overrides)
    .where(eq(availability_overrides.id, id))
    .limit(1);
  return NextResponse.json({ ok: true, override: row });
}
