import 'server-only';
import { NextResponse, type NextRequest } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/server/db/client';
import { availability_windows } from '@/server/db/schema';
import { requireAdmin } from '@/server/services/session';

const HHMM_RE = /^[0-2]\d:[0-5]\d$/;

const patchSchema = z.object({
  weekday: z.number().int().min(0).max(6).optional(),
  startTime: z.string().regex(HHMM_RE).optional(),
  endTime: z.string().regex(HHMM_RE).optional(),
  timezone: z.string().min(1).optional(),
  active: z.boolean().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  const { id } = await params;

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'validation', issues: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const patch = parsed.data;

  // Garante ownership antes de patch
  const [existing] = await db
    .select()
    .from(availability_windows)
    .where(and(eq(availability_windows.id, id), eq(availability_windows.owner_id, admin.id)))
    .limit(1);
  if (!existing) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const update: Record<string, unknown> = {};
  if (patch.weekday !== undefined) update.weekday = patch.weekday;
  if (patch.startTime !== undefined) update.start_time = patch.startTime;
  if (patch.endTime !== undefined) update.end_time = patch.endTime;
  if (patch.timezone !== undefined) update.timezone = patch.timezone;
  if (patch.active !== undefined) update.active = patch.active;
  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'empty_patch' }, { status: 400 });
  }

  const finalStart = (update.start_time as string | undefined) ?? existing.start_time;
  const finalEnd = (update.end_time as string | undefined) ?? existing.end_time;
  if (finalStart.localeCompare(finalEnd) >= 0) {
    return NextResponse.json({ error: 'end_must_be_after_start' }, { status: 400 });
  }

  await db.update(availability_windows).set(update).where(eq(availability_windows.id, id));

  const [row] = await db
    .select()
    .from(availability_windows)
    .where(eq(availability_windows.id, id))
    .limit(1);
  return NextResponse.json({ ok: true, window: row });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  const { id } = await params;

  const [existing] = await db
    .select()
    .from(availability_windows)
    .where(and(eq(availability_windows.id, id), eq(availability_windows.owner_id, admin.id)))
    .limit(1);
  if (!existing) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  await db.delete(availability_windows).where(eq(availability_windows.id, id));
  return NextResponse.json({ ok: true });
}
