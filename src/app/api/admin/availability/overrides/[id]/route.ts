import 'server-only';
import { NextResponse, type NextRequest } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { db } from '@/server/db/client';
import { availability_overrides } from '@/server/db/schema';
import { requireAdmin } from '@/server/services/session';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  const { id } = await params;

  const [existing] = await db
    .select()
    .from(availability_overrides)
    .where(and(eq(availability_overrides.id, id), eq(availability_overrides.owner_id, admin.id)))
    .limit(1);
  if (!existing) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  await db.delete(availability_overrides).where(eq(availability_overrides.id, id));
  return NextResponse.json({ ok: true });
}
