import 'server-only';
import { NextResponse, type NextRequest } from 'next/server';
import { and, asc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/server/db/client';
import { availability_windows } from '@/server/db/schema';
import { ulid } from '@/server/lib/ulid';
import { requireAdmin } from '@/server/services/session';
import { DEFAULT_TZ } from '@/server/lib/datetime';

const HHMM_RE = /^[0-2]\d:[0-5]\d$/;

const createSchema = z.object({
  weekday: z.number().int().min(0).max(6),
  startTime: z.string().regex(HHMM_RE),
  endTime: z.string().regex(HHMM_RE),
  timezone: z.string().min(1).optional(),
  active: z.boolean().optional(),
});

function compareHHMM(a: string, b: string): number {
  return a.localeCompare(b);
}

export async function GET() {
  const admin = await requireAdmin();
  const rows = await db
    .select()
    .from(availability_windows)
    .where(eq(availability_windows.owner_id, admin.id))
    .orderBy(asc(availability_windows.weekday), asc(availability_windows.start_time));
  return NextResponse.json({ windows: rows });
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
  if (compareHHMM(data.startTime, data.endTime) >= 0) {
    return NextResponse.json({ error: 'end_must_be_after_start' }, { status: 400 });
  }

  // Detecta colisão com outra janela ativa do mesmo dia
  const existing = await db
    .select()
    .from(availability_windows)
    .where(
      and(
        eq(availability_windows.owner_id, admin.id),
        eq(availability_windows.weekday, data.weekday),
        eq(availability_windows.active, true)
      )
    );
  for (const w of existing) {
    if (
      compareHHMM(data.startTime, w.end_time) < 0 &&
      compareHHMM(w.start_time, data.endTime) < 0
    ) {
      return NextResponse.json({ error: 'overlap_with_existing_window' }, { status: 409 });
    }
  }

  const id = ulid();
  await db.insert(availability_windows).values({
    id,
    owner_id: admin.id,
    weekday: data.weekday,
    start_time: data.startTime,
    end_time: data.endTime,
    timezone: data.timezone ?? DEFAULT_TZ,
    active: data.active ?? true,
  });

  const [row] = await db
    .select()
    .from(availability_windows)
    .where(eq(availability_windows.id, id))
    .limit(1);

  return NextResponse.json({ ok: true, window: row });
}
