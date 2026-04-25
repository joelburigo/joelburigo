import 'server-only';
import { and, eq, sql } from 'drizzle-orm';
import { db } from '@/server/db/client';
import {
  teams,
  contacts,
  pipelines,
  stages,
  opportunities,
  activities,
  type Team,
  type Contact,
  type Opportunity,
  type Activity,
} from '@/server/db/schema';
import { ulid } from '@/server/lib/ulid';

const DEFAULT_TEAM_SLUG = 'joelburigo';

export async function getDefaultTeam(): Promise<Team> {
  const [team] = await db.select().from(teams).where(eq(teams.slug, DEFAULT_TEAM_SLUG)).limit(1);
  if (!team) {
    throw new Error(`Team default "${DEFAULT_TEAM_SLUG}" não existe — rode pnpm db:seed.`);
  }
  return team;
}

// --------- Contacts ---------

export interface UpsertContactInput {
  teamId: string;
  name: string;
  email: string;
  whatsapp?: string | null;
  source?: string | null;
  produto_interesse?: string | null;
  lifecycle_stage?: string | null;
  ownerId?: string | null;
}

export async function upsertContact(input: UpsertContactInput): Promise<Contact> {
  const email = input.email.trim().toLowerCase();

  const [existing] = await db
    .select()
    .from(contacts)
    .where(and(eq(contacts.team_id, input.teamId), eq(contacts.email, email)))
    .limit(1);

  const now = new Date();

  if (existing) {
    const patch: Partial<typeof contacts.$inferInsert> = {
      last_touch_at: now,
      updated_at: now,
    };
    if (!existing.whatsapp && input.whatsapp) patch.whatsapp = input.whatsapp;
    if ((!existing.name || existing.name.length === 0) && input.name) patch.name = input.name;
    if (!existing.produto_interesse && input.produto_interesse) {
      patch.produto_interesse = input.produto_interesse;
    }
    if (!existing.owner_id && input.ownerId) patch.owner_id = input.ownerId;

    const [updated] = await db
      .update(contacts)
      .set(patch)
      .where(eq(contacts.id, existing.id))
      .returning();
    if (!updated) throw new Error('failed to update contact');
    return updated;
  }

  const id = ulid();
  const [created] = await db
    .insert(contacts)
    .values({
      id,
      team_id: input.teamId,
      name: input.name,
      email,
      whatsapp: input.whatsapp ?? null,
      source: input.source ?? null,
      produto_interesse: input.produto_interesse ?? null,
      lifecycle_stage: input.lifecycle_stage ?? 'lead',
      owner_id: input.ownerId ?? null,
      first_touch_at: now,
      last_touch_at: now,
    })
    .returning();
  if (!created) throw new Error('failed to create contact');
  return created;
}

// --------- Activities ---------

export interface LogActivityInput {
  teamId: string;
  contactId?: string | null;
  opportunityId?: string | null;
  ownerId?: string | null;
  type: string;
  direction?: 'inbound' | 'outbound' | 'internal' | null;
  subject?: string | null;
  body_md?: string | null;
  metadata?: Record<string, unknown>;
}

export async function logActivity(input: LogActivityInput): Promise<Activity> {
  const id = ulid();
  const now = new Date();
  const [created] = await db
    .insert(activities)
    .values({
      id,
      team_id: input.teamId,
      contact_id: input.contactId ?? null,
      opportunity_id: input.opportunityId ?? null,
      owner_id: input.ownerId ?? null,
      type: input.type,
      direction: input.direction ?? null,
      subject: input.subject ?? null,
      body_md: input.body_md ?? null,
      metadata: input.metadata ?? {},
      created_at: now,
    })
    .returning();
  if (!created) throw new Error('failed to log activity');

  if (input.contactId) {
    await db
      .update(contacts)
      .set({ last_touch_at: now })
      .where(eq(contacts.id, input.contactId));
  }

  return created;
}

// --------- Pipelines / Stages ---------

async function resolvePipelineAndStage(
  teamId: string,
  pipelineSlug: string,
  stageSlug: string
): Promise<{ pipelineId: string; stageId: string }> {
  const [pipeline] = await db
    .select()
    .from(pipelines)
    .where(and(eq(pipelines.team_id, teamId), eq(pipelines.slug, pipelineSlug)))
    .limit(1);
  if (!pipeline) throw new Error(`Pipeline "${pipelineSlug}" não existe no team.`);

  const [stage] = await db
    .select()
    .from(stages)
    .where(and(eq(stages.pipeline_id, pipeline.id), eq(stages.slug, stageSlug)))
    .limit(1);
  if (!stage) throw new Error(`Stage "${stageSlug}" não existe na pipeline "${pipelineSlug}".`);

  return { pipelineId: pipeline.id, stageId: stage.id };
}

// --------- Opportunities ---------

export interface CreateOpportunityInput {
  teamId: string;
  contactId: string;
  pipelineSlug: string;
  stageSlug: string;
  productId?: string | null;
  title: string;
  value_cents?: number | bigint | null;
  ownerId?: string | null;
  metadata?: Record<string, unknown>;
}

export async function createOpportunity(input: CreateOpportunityInput): Promise<Opportunity> {
  const { pipelineId, stageId } = await resolvePipelineAndStage(
    input.teamId,
    input.pipelineSlug,
    input.stageSlug
  );

  // kanban_position = max(existing in stage) + 1000
  const [maxRow] = await db
    .select({ max: sql<string>`coalesce(max(${opportunities.kanban_position}), 0)` })
    .from(opportunities)
    .where(eq(opportunities.stage_id, stageId));

  const nextPos = (Number(maxRow?.max ?? 0) + 1000).toString();

  const id = ulid();
  const value =
    input.value_cents === undefined || input.value_cents === null
      ? null
      : typeof input.value_cents === 'bigint'
        ? input.value_cents
        : BigInt(input.value_cents);

  const [created] = await db
    .insert(opportunities)
    .values({
      id,
      team_id: input.teamId,
      contact_id: input.contactId,
      pipeline_id: pipelineId,
      stage_id: stageId,
      product_id: input.productId ?? null,
      owner_id: input.ownerId ?? null,
      title: input.title,
      value_cents: value,
      currency: 'BRL',
      status: 'open',
      kanban_position: nextPos,
      metadata: input.metadata ?? {},
    })
    .returning();
  if (!created) throw new Error('failed to create opportunity');
  return created;
}

export async function moveOpportunityToStage(
  oppId: string,
  stageSlug: string
): Promise<Opportunity> {
  const [opp] = await db.select().from(opportunities).where(eq(opportunities.id, oppId)).limit(1);
  if (!opp) throw new Error(`Opportunity ${oppId} não existe.`);

  const [stage] = await db
    .select()
    .from(stages)
    .where(and(eq(stages.pipeline_id, opp.pipeline_id), eq(stages.slug, stageSlug)))
    .limit(1);
  if (!stage) throw new Error(`Stage "${stageSlug}" não existe na pipeline da opp.`);

  const [updated] = await db
    .update(opportunities)
    .set({ stage_id: stage.id, updated_at: new Date() })
    .where(eq(opportunities.id, oppId))
    .returning();
  if (!updated) throw new Error('failed to move opportunity');

  await logActivity({
    teamId: opp.team_id,
    contactId: opp.contact_id,
    opportunityId: opp.id,
    type: 'system',
    direction: 'internal',
    subject: `Movida para "${stage.name}"`,
    metadata: { from_stage_id: opp.stage_id, to_stage_id: stage.id },
  });

  return updated;
}

export async function markOpportunityWon(
  oppId: string,
  purchaseId: string
): Promise<Opportunity> {
  const [opp] = await db.select().from(opportunities).where(eq(opportunities.id, oppId)).limit(1);
  if (!opp) throw new Error(`Opportunity ${oppId} não existe.`);

  const [wonStage] = await db
    .select()
    .from(stages)
    .where(and(eq(stages.pipeline_id, opp.pipeline_id), eq(stages.kind, 'won')))
    .limit(1);
  if (!wonStage) throw new Error('Pipeline não tem stage kind=won.');

  const now = new Date();
  const [updated] = await db
    .update(opportunities)
    .set({
      status: 'won',
      stage_id: wonStage.id,
      actual_close_at: now,
      purchase_id: purchaseId,
      updated_at: now,
    })
    .where(eq(opportunities.id, oppId))
    .returning();
  if (!updated) throw new Error('failed to mark opportunity won');

  await logActivity({
    teamId: opp.team_id,
    contactId: opp.contact_id,
    opportunityId: opp.id,
    type: 'system',
    direction: 'internal',
    subject: `Ganha (purchase ${purchaseId})`,
    metadata: { purchase_id: purchaseId, stage_id: wonStage.id },
  });

  return updated;
}
