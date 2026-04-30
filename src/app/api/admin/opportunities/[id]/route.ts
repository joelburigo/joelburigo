import 'server-only';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/server/services/session';
import {
  getDefaultTeam,
  getOpportunityDetail,
  moveOpportunityStage,
  updateOpportunity,
} from '@/server/services/crm';
import { logAudit } from '@/server/services/admin';

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  await requireAdmin();
  const { id } = await ctx.params;
  const team = await getDefaultTeam();
  const detail = await getOpportunityDetail(id, team.id);
  if (!detail) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  // Serializa BigInts e Dates (Next response usa JSON.stringify)
  const op = detail.opportunity;
  return NextResponse.json({
    opportunity: {
      id: op.id,
      title: op.title,
      value_cents: op.value_cents == null ? null : Number(op.value_cents),
      status: op.status,
      kanban_position: op.kanban_position,
      expected_close_at: op.expected_close_at,
      actual_close_at: op.actual_close_at,
      lost_reason: op.lost_reason,
      notes_md: op.notes_md,
      metadata: op.metadata,
      stage_id: op.stage_id,
      pipeline_id: op.pipeline_id,
      created_at: op.created_at,
      updated_at: op.updated_at,
    },
    contact: {
      id: detail.contact.id,
      name: detail.contact.name,
      email: detail.contact.email,
      whatsapp: detail.contact.whatsapp,
      phone: detail.contact.phone,
      cargo: detail.contact.cargo,
      lifecycle_stage: detail.contact.lifecycle_stage,
      source: detail.contact.source,
      produto_interesse: detail.contact.produto_interesse,
      tags: detail.contact.tags,
      notes_md: detail.contact.notes_md,
      first_touch_at: detail.contact.first_touch_at,
      last_touch_at: detail.contact.last_touch_at,
    },
    company: detail.company
      ? { id: detail.company.id, name: detail.company.name }
      : null,
    pipeline: {
      id: detail.pipeline.id,
      slug: detail.pipeline.slug,
      name: detail.pipeline.name,
    },
    stage: {
      id: detail.stage.id,
      slug: detail.stage.slug,
      name: detail.stage.name,
      kind: detail.stage.kind,
      color: detail.stage.color,
      probability: detail.stage.probability,
    },
    activities: detail.activities.map((a) => ({
      id: a.id,
      type: a.type,
      direction: a.direction,
      subject: a.subject,
      body_md: a.body_md,
      scheduled_for: a.scheduled_for,
      completed_at: a.completed_at,
      metadata: a.metadata,
      created_at: a.created_at,
      owner: a.owner,
    })),
    attribution: detail.attribution
      ? {
          id: detail.attribution.id,
          utm_source: detail.attribution.utm_source,
          utm_medium: detail.attribution.utm_medium,
          utm_campaign: detail.attribution.utm_campaign,
          gclid: detail.attribution.gclid,
          fbclid: detail.attribution.fbclid,
          referrer: detail.attribution.referrer,
          first_landing_page: detail.attribution.first_landing_page,
          last_landing_page: detail.attribution.last_landing_page,
          country: detail.attribution.country,
          region: detail.attribution.region,
          city: detail.attribution.city,
          device: detail.attribution.device,
          browser: detail.attribution.browser,
        }
      : null,
  });
}

const PatchBody = z.object({
  stage_id: z.string().min(1).optional(),
  status: z.enum(['open', 'won', 'lost']).optional(),
  kanban_position: z.number().optional(),
  lost_reason: z.string().nullable().optional(),
  notes_md: z.string().nullable().optional(),
  title: z.string().min(1).optional(),
  value_cents: z.number().int().nonnegative().nullable().optional(),
});

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  const { id } = await ctx.params;
  const json = await req.json().catch(() => null);
  const parsed = PatchBody.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'invalid_body', issues: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const body = parsed.data;

  try {
    let updated;
    // Se mudou stage, usa moveOpportunityStage (cria activity de sistema)
    if (body.stage_id) {
      updated = await moveOpportunityStage(id, body.stage_id, admin.id);
    }

    // Outros campos via updateOpportunity
    const restPatch: Parameters<typeof updateOpportunity>[1] = {};
    if (body.status !== undefined) restPatch.status = body.status;
    if (body.kanban_position !== undefined) restPatch.kanban_position = body.kanban_position;
    if (body.lost_reason !== undefined) restPatch.lost_reason = body.lost_reason;
    if (body.notes_md !== undefined) restPatch.notes_md = body.notes_md;
    if (body.title !== undefined) restPatch.title = body.title;
    if (body.value_cents !== undefined) restPatch.value_cents = body.value_cents;

    if (Object.keys(restPatch).length > 0) {
      updated = await updateOpportunity(id, restPatch);
    }

    if (!updated) {
      return NextResponse.json({ error: 'no_changes' }, { status: 400 });
    }

    await logAudit({
      adminId: admin.id,
      action: 'opportunity.update',
      targetTable: 'opportunities',
      targetId: id,
      payload: body as Record<string, unknown>,
    });

    return NextResponse.json({
      opportunity: {
        ...updated,
        value_cents: updated.value_cents == null ? null : Number(updated.value_cents),
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'failed' },
      { status: 400 }
    );
  }
}
