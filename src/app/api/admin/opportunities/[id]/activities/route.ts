import 'server-only';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@/server/db/client';
import { opportunities } from '@/server/db/schema';
import { requireAdmin } from '@/server/services/session';
import { createActivity, getDefaultTeam } from '@/server/services/crm';

const Body = z.object({
  type: z.enum(['note', 'task', 'call', 'email', 'whatsapp', 'meeting']),
  direction: z.enum(['inbound', 'outbound', 'internal']).optional(),
  subject: z.string().min(1).max(500),
  body_md: z.string().optional(),
  scheduled_for: z.string().datetime().optional(),
});

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  const { id } = await ctx.params;
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'invalid_body', issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const team = await getDefaultTeam();
  const [opp] = await db.select().from(opportunities).where(eq(opportunities.id, id)).limit(1);
  if (!opp || opp.team_id !== team.id) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  const data = parsed.data;
  const activity = await createActivity({
    teamId: team.id,
    contactId: opp.contact_id,
    opportunityId: id,
    ownerId: admin.id,
    type: data.type,
    direction: data.direction ?? null,
    subject: data.subject,
    body_md: data.body_md ?? null,
    scheduled_for: data.scheduled_for ? new Date(data.scheduled_for) : null,
  });

  return NextResponse.json({ activity });
}
