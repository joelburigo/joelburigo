import 'server-only';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/server/services/session';
import { getDefaultTeam, listOpportunities } from '@/server/services/crm';

const Query = z.object({
  pipeline: z.string().optional(),
  owner: z.string().optional(),
  source: z.string().optional(),
  status: z.enum(['open', 'won', 'lost']).optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  q: z.string().optional(),
  limit: z.coerce.number().int().positive().max(1000).optional(),
});

export async function GET(req: Request) {
  await requireAdmin();
  const { searchParams } = new URL(req.url);
  const parsed = Query.safeParse({
    pipeline: searchParams.get('pipeline') ?? undefined,
    owner: searchParams.get('owner') ?? undefined,
    source: searchParams.get('source') ?? undefined,
    status: searchParams.get('status') ?? undefined,
    from: searchParams.get('from') ?? undefined,
    to: searchParams.get('to') ?? undefined,
    q: searchParams.get('q') ?? undefined,
    limit: searchParams.get('limit') ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'invalid_query', issues: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const f = parsed.data;
  const team = await getDefaultTeam();

  const result = await listOpportunities({
    teamId: team.id,
    pipelineSlug: f.pipeline,
    ownerId: f.owner,
    source: f.source,
    status: f.status ?? 'open',
    from: f.from ? new Date(f.from) : undefined,
    to: f.to ? new Date(f.to) : undefined,
    query: f.q,
    limit: f.limit,
  });

  return NextResponse.json(result);
}
