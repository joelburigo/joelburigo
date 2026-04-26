import 'server-only';
import { NextResponse, type NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/server/db/client';
import { mentoria_presencas, mentorias } from '@/server/db/schema';
import { getCurrentUser } from '@/server/services/session';

export const runtime = 'nodejs';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });

  const { id } = await params;
  const [m] = await db.select().from(mentorias).where(eq(mentorias.id, id)).limit(1);
  if (!m) return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });

  // Só registra se está live
  if (m.live_status !== 'live') {
    return NextResponse.json({ ok: true, registered: false });
  }

  await db
    .insert(mentoria_presencas)
    .values({ mentoria_id: id, user_id: user.id })
    .onConflictDoNothing();

  return NextResponse.json({ ok: true, registered: true });
}
