import 'server-only';
import { and, asc, desc, eq, gte, inArray, lt, or, sql, like, isNull, isNotNull } from 'drizzle-orm';
import { db } from '@/server/db/client';
import {
  users,
  user_profiles,
  entitlements,
  purchases,
  products,
  refund_requests,
  agent_usage,
  agent_messages,
  agent_conversations,
  agent_artifacts,
  contacts,
  pipelines,
  stages,
  opportunities,
  activities,
  companies,
  advisory_sessions,
  admin_audit,
  vss_destravamentos,
  type Stage,
  type Opportunity,
  type Contact,
  type Pipeline,
  type User,
  type Entitlement,
  type Activity,
} from '@/server/db/schema';
import { ulid } from '@/server/lib/ulid';
import { getDefaultTeam } from './crm';
import { refundPurchase } from './payments/refunds';

// ---------------- AUDIT ----------------

export interface LogAuditInput {
  adminId: string;
  action: string;
  targetTable?: string | null;
  targetId?: string | null;
  payload?: Record<string, unknown> | null;
}

export async function logAudit(input: LogAuditInput): Promise<void> {
  await db.insert(admin_audit).values({
    id: ulid(),
    admin_id: input.adminId,
    action: input.action,
    target_table: input.targetTable ?? null,
    target_id: input.targetId ?? null,
    payload: (input.payload as never) ?? null,
  });
}

// ---------------- OVERVIEW ----------------

export interface OverviewStats {
  monthRevenueCents: number;
  activeStudentsCount: number;
  newLeadsCount: number;
  llmCostCentsMonth: number;
  recentActivities: Array<
    Activity & { contactName: string | null; opportunityTitle: string | null }
  >;
  pendingRefundsCount: number;
  overdueAdvisorySessions: Array<{
    id: string;
    title: string;
    scheduledAt: Date | null;
    userName: string | null;
  }>;
}

function startOfMonthUTC(d = new Date()): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1, 0, 0, 0, 0));
}

function periodMonthKey(d = new Date()): string {
  // YYYY-MM
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

export async function getOverviewStats(): Promise<OverviewStats> {
  const monthStart = startOfMonthUTC();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const periodKey = periodMonthKey();

  const [revenueRow] = await db
    .select({
      total: sql<string>`COALESCE(SUM(${purchases.amount_cents}), 0)`,
    })
    .from(purchases)
    .where(and(eq(purchases.status, 'paid'), gte(purchases.paid_at, monthStart)));

  const [studentsRow] = await db
    .select({ count: sql<string>`COUNT(*)` })
    .from(entitlements)
    .where(eq(entitlements.status, 'active'));

  const [leadsRow] = await db
    .select({ count: sql<string>`COUNT(*)` })
    .from(contacts)
    .where(and(gte(contacts.created_at, monthStart), like(contacts.source, 'form_%')));

  const [llmRow] = await db
    .select({ total: sql<string>`COALESCE(SUM(${agent_usage.cost_cents}), 0)` })
    .from(agent_usage)
    .where(eq(agent_usage.period_month, periodKey));

  const recentActivitiesRaw = await db
    .select({
      activity: activities,
      contactName: contacts.name,
      opportunityTitle: opportunities.title,
    })
    .from(activities)
    .leftJoin(contacts, eq(contacts.id, activities.contact_id))
    .leftJoin(opportunities, eq(opportunities.id, activities.opportunity_id))
    .orderBy(desc(activities.created_at))
    .limit(12);

  const [pendingRefundsRow] = await db
    .select({ count: sql<string>`COUNT(*)` })
    .from(refund_requests)
    .where(eq(refund_requests.status, 'pending'));

  const overdueRaw = await db
    .select({
      id: advisory_sessions.id,
      scheduledAt: advisory_sessions.scheduled_at,
      userName: users.name,
      userEmail: users.email,
    })
    .from(advisory_sessions)
    .leftJoin(users, eq(users.id, advisory_sessions.user_id))
    .where(
      and(
        eq(advisory_sessions.status, 'completed'),
        lt(advisory_sessions.scheduled_at, sevenDaysAgo),
        isNull(advisory_sessions.joel_notes_r2_key)
      )
    )
    .limit(10);

  return {
    monthRevenueCents: Number(revenueRow?.total ?? 0),
    activeStudentsCount: Number(studentsRow?.count ?? 0),
    newLeadsCount: Number(leadsRow?.count ?? 0),
    // cost_cents é numeric — multiplicar por 1 já vem string. Convertemos pra inteiro de centavos.
    llmCostCentsMonth: Math.round(Number(llmRow?.total ?? 0)),
    recentActivities: recentActivitiesRaw.map((r) => ({
      ...r.activity,
      contactName: r.contactName,
      opportunityTitle: r.opportunityTitle,
    })),
    pendingRefundsCount: Number(pendingRefundsRow?.count ?? 0),
    overdueAdvisorySessions: overdueRaw.map((r) => ({
      id: r.id,
      title: `Sessão Advisory · ${r.userName ?? r.userEmail ?? 'sem nome'}`,
      scheduledAt: r.scheduledAt,
      userName: r.userName ?? r.userEmail,
    })),
  };
}

// ---------------- KANBAN / OPPORTUNITIES ----------------

export interface PipelineWithStages {
  pipeline: Pipeline;
  stages: Stage[];
}

export async function listPipelinesWithStages(teamId: string): Promise<PipelineWithStages[]> {
  const pl = await db
    .select()
    .from(pipelines)
    .where(eq(pipelines.team_id, teamId))
    .orderBy(asc(pipelines.position));

  if (pl.length === 0) return [];

  const st = await db
    .select()
    .from(stages)
    .where(
      inArray(
        stages.pipeline_id,
        pl.map((p) => p.id)
      )
    )
    .orderBy(asc(stages.position));

  return pl.map((p) => ({ pipeline: p, stages: st.filter((s) => s.pipeline_id === p.id) }));
}

export interface OpportunityCardData {
  opportunity: Opportunity;
  contact: Contact | null;
  productSlug: string | null;
}

export async function listOpenOpportunities(
  teamId: string,
  filters?: { pipelineId?: string; ownerId?: string; query?: string }
): Promise<OpportunityCardData[]> {
  const where = [eq(opportunities.team_id, teamId), eq(opportunities.status, 'open')];
  if (filters?.pipelineId) where.push(eq(opportunities.pipeline_id, filters.pipelineId));
  if (filters?.ownerId) where.push(eq(opportunities.owner_id, filters.ownerId));

  const rows = await db
    .select({
      opportunity: opportunities,
      contact: contacts,
      productSlug: products.slug,
    })
    .from(opportunities)
    .leftJoin(contacts, eq(contacts.id, opportunities.contact_id))
    .leftJoin(products, eq(products.id, opportunities.product_id))
    .where(and(...where))
    .orderBy(asc(opportunities.stage_id), asc(opportunities.kanban_position));

  let filtered = rows;
  if (filters?.query) {
    const q = filters.query.toLowerCase();
    filtered = rows.filter((r) => {
      const c = r.contact;
      if (!c) return false;
      return (
        c.name.toLowerCase().includes(q) ||
        (c.email ?? '').toLowerCase().includes(q) ||
        (c.whatsapp ?? '').toLowerCase().includes(q)
      );
    });
  }

  return filtered.map((r) => ({
    opportunity: r.opportunity,
    contact: r.contact,
    productSlug: r.productSlug,
  }));
}

export async function moveOpportunityStage(
  oppId: string,
  newStageId: string,
  adminId: string
): Promise<void> {
  const [opp] = await db.select().from(opportunities).where(eq(opportunities.id, oppId)).limit(1);
  if (!opp) throw new Error('opportunity_not_found');

  const [newStage] = await db.select().from(stages).where(eq(stages.id, newStageId)).limit(1);
  if (!newStage) throw new Error('stage_not_found');

  if (newStage.pipeline_id !== opp.pipeline_id) {
    throw new Error('stage_pipeline_mismatch');
  }

  // calcula próxima posição (max + 1) na nova stage
  const [maxRow] = await db
    .select({
      max: sql<string>`COALESCE(MAX(${opportunities.kanban_position}), 0)`,
    })
    .from(opportunities)
    .where(eq(opportunities.stage_id, newStageId));
  const nextPos = (Number(maxRow?.max ?? 0) + 1).toString();

  const newStatus =
    newStage.kind === 'won' ? 'won' : newStage.kind === 'lost' ? 'lost' : 'open';

  await db
    .update(opportunities)
    .set({
      stage_id: newStageId,
      status: newStatus,
      kanban_position: nextPos,
      actual_close_at: newStatus !== 'open' ? new Date() : null,
      updated_at: new Date(),
    })
    .where(eq(opportunities.id, oppId));

  await db.insert(activities).values({
    id: ulid(),
    team_id: opp.team_id,
    contact_id: opp.contact_id,
    opportunity_id: opp.id,
    owner_id: adminId,
    type: 'system',
    direction: 'internal',
    subject: `Movido pra stage "${newStage.name}"`,
    body_md: null,
    metadata: {
      previous_stage_id: opp.stage_id,
      new_stage_id: newStageId,
    } as never,
  });

  await logAudit({
    adminId,
    action: 'opportunity.move_stage',
    targetTable: 'opportunities',
    targetId: oppId,
    payload: { from: opp.stage_id, to: newStageId },
  });
}

export async function markOpportunityWon(
  oppId: string,
  adminId: string
): Promise<void> {
  const [opp] = await db.select().from(opportunities).where(eq(opportunities.id, oppId)).limit(1);
  if (!opp) throw new Error('opportunity_not_found');

  const wonStages = await db
    .select()
    .from(stages)
    .where(and(eq(stages.pipeline_id, opp.pipeline_id), eq(stages.kind, 'won')))
    .limit(1);
  const wonStage = wonStages[0];
  if (!wonStage) throw new Error('won_stage_not_found');

  await moveOpportunityStage(oppId, wonStage.id, adminId);
}

export async function markOpportunityLost(
  oppId: string,
  reason: string,
  adminId: string
): Promise<void> {
  const [opp] = await db.select().from(opportunities).where(eq(opportunities.id, oppId)).limit(1);
  if (!opp) throw new Error('opportunity_not_found');

  const lostStages = await db
    .select()
    .from(stages)
    .where(and(eq(stages.pipeline_id, opp.pipeline_id), eq(stages.kind, 'lost')))
    .limit(1);
  const lostStage = lostStages[0];
  if (!lostStage) throw new Error('lost_stage_not_found');

  await db
    .update(opportunities)
    .set({ lost_reason: reason })
    .where(eq(opportunities.id, oppId));
  await moveOpportunityStage(oppId, lostStage.id, adminId);
}

export async function getContactDetail(contactId: string) {
  const [contact] = await db.select().from(contacts).where(eq(contacts.id, contactId)).limit(1);
  if (!contact) return null;
  const acts = await db
    .select()
    .from(activities)
    .where(eq(activities.contact_id, contactId))
    .orderBy(desc(activities.created_at))
    .limit(50);
  const company = contact.company_id
    ? (await db.select().from(companies).where(eq(companies.id, contact.company_id)).limit(1))[0]
    : null;
  return { contact, activities: acts, company: company ?? null };
}

export async function updateContactNotes(
  contactId: string,
  notesMd: string,
  adminId: string
): Promise<void> {
  await db
    .update(contacts)
    .set({ notes_md: notesMd, updated_at: new Date() })
    .where(eq(contacts.id, contactId));
  await logAudit({
    adminId,
    action: 'contact.update_notes',
    targetTable: 'contacts',
    targetId: contactId,
  });
}

// ---------------- USERS ----------------

export interface ListUsersFilters {
  role?: 'admin' | 'user';
  entitlementStatus?: 'active' | 'expired' | 'none';
  query?: string;
}

export interface UserRow {
  user: User;
  entitlementsCount: number;
  activeProductSlugs: string[];
  monthTokensUsed: number;
  monthCostCents: number;
}

export async function listUsers(opts: {
  filters?: ListUsersFilters;
  limit?: number;
  offset?: number;
}): Promise<{ rows: UserRow[]; total: number }> {
  const limit = opts.limit ?? 50;
  const offset = opts.offset ?? 0;
  const periodKey = periodMonthKey();

  const where = [];
  if (opts.filters?.role) where.push(eq(users.role, opts.filters.role));
  if (opts.filters?.query) {
    const q = `%${opts.filters.query.toLowerCase()}%`;
    where.push(
      or(sql`LOWER(${users.email}) LIKE ${q}`, sql`LOWER(COALESCE(${users.name}, '')) LIKE ${q}`)!
    );
  }

  const baseWhere = where.length > 0 ? and(...where) : undefined;

  const [{ count }] = await db
    .select({ count: sql<string>`COUNT(*)` })
    .from(users)
    .where(baseWhere);

  const userRows = await db
    .select()
    .from(users)
    .where(baseWhere)
    .orderBy(desc(users.created_at))
    .limit(limit)
    .offset(offset);

  if (userRows.length === 0) return { rows: [], total: Number(count) };

  const userIds = userRows.map((u) => u.id);

  const ents = await db
    .select({
      userId: entitlements.user_id,
      status: entitlements.status,
      slug: products.slug,
    })
    .from(entitlements)
    .leftJoin(products, eq(products.id, entitlements.product_id))
    .where(inArray(entitlements.user_id, userIds));

  const usage = await db
    .select()
    .from(agent_usage)
    .where(and(inArray(agent_usage.user_id, userIds), eq(agent_usage.period_month, periodKey)));

  const rows: UserRow[] = userRows.map((u) => {
    const userEnts = ents.filter((e) => e.userId === u.id);
    const activeSlugs = userEnts
      .filter((e) => e.status === 'active' && e.slug)
      .map((e) => e.slug as string);
    const u_usage = usage.find((x) => x.user_id === u.id);
    return {
      user: u,
      entitlementsCount: userEnts.length,
      activeProductSlugs: Array.from(new Set(activeSlugs)),
      monthTokensUsed:
        Number(u_usage?.tokens_input ?? 0) + Number(u_usage?.tokens_output ?? 0),
      monthCostCents: Math.round(Number(u_usage?.cost_cents ?? 0)),
    };
  });

  // post-filter by entitlement status (simpler than complex SQL)
  let filtered = rows;
  if (opts.filters?.entitlementStatus) {
    const target = opts.filters.entitlementStatus;
    filtered = rows.filter((r) => {
      if (target === 'active') return r.activeProductSlugs.length > 0;
      if (target === 'none') return r.entitlementsCount === 0;
      if (target === 'expired')
        return r.entitlementsCount > 0 && r.activeProductSlugs.length === 0;
      return true;
    });
  }

  return { rows: filtered, total: Number(count) };
}

export async function getUserDetail(userId: string) {
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) return null;
  const [profile] = await db
    .select()
    .from(user_profiles)
    .where(eq(user_profiles.user_id, userId))
    .limit(1);
  const userPurchases = await db
    .select({
      purchase: purchases,
      productName: products.name,
      productSlug: products.slug,
    })
    .from(purchases)
    .leftJoin(products, eq(products.id, purchases.product_id))
    .where(eq(purchases.user_id, userId))
    .orderBy(desc(purchases.created_at));
  const userEnts = await db
    .select({
      entitlement: entitlements,
      productSlug: products.slug,
      productName: products.name,
    })
    .from(entitlements)
    .leftJoin(products, eq(products.id, entitlements.product_id))
    .where(eq(entitlements.user_id, userId));
  const advisorySess = await db
    .select()
    .from(advisory_sessions)
    .where(eq(advisory_sessions.user_id, userId))
    .orderBy(desc(advisory_sessions.scheduled_at))
    .limit(20);
  const [convCount] = await db
    .select({ count: sql<string>`COUNT(*)` })
    .from(agent_conversations)
    .where(eq(agent_conversations.user_id, userId));

  return {
    user,
    profile: profile ?? null,
    purchases: userPurchases,
    entitlements: userEnts,
    advisorySessions: advisorySess,
    conversationsCount: Number(convCount?.count ?? 0),
  };
}

export async function updateUserRole(
  userId: string,
  role: 'admin' | 'user',
  adminId: string
): Promise<void> {
  await db.update(users).set({ role }).where(eq(users.id, userId));
  await logAudit({
    adminId,
    action: 'user.update_role',
    targetTable: 'users',
    targetId: userId,
    payload: { role },
  });
}

export async function revokeEntitlement(
  entitlementId: string,
  reason: string,
  adminId: string
): Promise<void> {
  await db
    .update(entitlements)
    .set({
      status: 'revoked',
      revoked_at: new Date(),
      revoked_reason: reason,
      updated_at: new Date(),
    })
    .where(eq(entitlements.id, entitlementId));
  await logAudit({
    adminId,
    action: 'entitlement.revoke',
    targetTable: 'entitlements',
    targetId: entitlementId,
    payload: { reason },
  });
}

// ---------------- AGENT USAGE ----------------

export interface AgentUsageStats {
  topConsumers: Array<{
    userId: string;
    userName: string | null;
    userEmail: string;
    tokensTotal: number;
    costCents: number;
    /** Override em entitlements.metadata.token_quota_override (null = sem). */
    quotaOverride: number | null;
    /** Cap default (products.monthly_llm_token_quota do VSS, ou null). */
    quotaDefault: number | null;
  }>;
  costByDestravamento: Array<{
    destravamentoId: string | null;
    destravamentoTitle: string | null;
    costCents: number;
    messagesCount: number;
  }>;
  totals: {
    tokensInput: number;
    tokensOutput: number;
    tokensCached: number;
    costCents: number;
    conversationsCount: number;
  };
  recentArtifacts: Array<{
    id: string;
    title: string;
    kind: string;
    userEmail: string | null;
    createdAt: Date;
  }>;
}

export async function getAgentUsageStats(): Promise<AgentUsageStats> {
  const periodKey = periodMonthKey();
  const monthStart = startOfMonthUTC();

  const consumers = await db
    .select({
      userId: agent_usage.user_id,
      userName: users.name,
      userEmail: users.email,
      tokensInput: agent_usage.tokens_input,
      tokensOutput: agent_usage.tokens_output,
      costCents: agent_usage.cost_cents,
    })
    .from(agent_usage)
    .leftJoin(users, eq(users.id, agent_usage.user_id))
    .where(eq(agent_usage.period_month, periodKey))
    .orderBy(desc(agent_usage.cost_cents))
    .limit(10);

  // Pra cada consumer, busca entitlement VSS ativo pra extrair override + cap default.
  const consumerIds = consumers.map((c) => c.userId);
  const quotaInfo =
    consumerIds.length > 0
      ? await db
          .select({
            userId: entitlements.user_id,
            metadata: entitlements.metadata,
            productCap: products.monthly_llm_token_quota,
            productSlug: products.slug,
          })
          .from(entitlements)
          .innerJoin(products, eq(products.id, entitlements.product_id))
          .where(
            and(
              inArray(entitlements.user_id, consumerIds),
              eq(entitlements.status, 'active'),
              eq(products.slug, 'vss')
            )
          )
      : [];

  // Custo por destravamento — JOIN agent_messages → conversations → destravamentos
  const byDest = await db
    .select({
      destravamentoId: agent_conversations.destravamento_id,
      destravamentoTitle: vss_destravamentos.title,
      costSum: sql<string>`COALESCE(SUM(${agent_messages.cost_cents}), 0)`,
      msgCount: sql<string>`COUNT(${agent_messages.id})`,
    })
    .from(agent_messages)
    .innerJoin(agent_conversations, eq(agent_conversations.id, agent_messages.conversation_id))
    .leftJoin(vss_destravamentos, eq(vss_destravamentos.id, agent_conversations.destravamento_id))
    .where(gte(agent_messages.created_at, monthStart))
    .groupBy(agent_conversations.destravamento_id, vss_destravamentos.title)
    .orderBy(desc(sql`SUM(${agent_messages.cost_cents})`))
    .limit(10);

  const [totalsRow] = await db
    .select({
      tokensInput: sql<string>`COALESCE(SUM(${agent_usage.tokens_input}), 0)`,
      tokensOutput: sql<string>`COALESCE(SUM(${agent_usage.tokens_output}), 0)`,
      tokensCached: sql<string>`COALESCE(SUM(${agent_usage.tokens_cached}), 0)`,
      costCents: sql<string>`COALESCE(SUM(${agent_usage.cost_cents}), 0)`,
      conversationsCount: sql<string>`COALESCE(SUM(${agent_usage.conversation_count}), 0)`,
    })
    .from(agent_usage)
    .where(eq(agent_usage.period_month, periodKey));

  const arts = await db
    .select({
      id: agent_artifacts.id,
      title: agent_artifacts.title,
      kind: agent_artifacts.kind,
      createdAt: agent_artifacts.created_at,
      userEmail: users.email,
    })
    .from(agent_artifacts)
    .leftJoin(users, eq(users.id, agent_artifacts.user_id))
    .orderBy(desc(agent_artifacts.created_at))
    .limit(20);

  return {
    topConsumers: consumers.map((c) => {
      // Pega o cap mais alto se múltiplos entitlements VSS (raro)
      const userQuotas = quotaInfo.filter((q) => q.userId === c.userId);
      let override: number | null = null;
      let cap: number | null = null;
      for (const q of userQuotas) {
        const meta = (q.metadata ?? {}) as { token_quota_override?: number | null };
        if (typeof meta.token_quota_override === 'number') {
          override =
            override == null
              ? meta.token_quota_override
              : Math.max(override, meta.token_quota_override);
        }
        if (q.productCap != null) {
          const n = Number(q.productCap);
          cap = cap == null ? n : Math.max(cap, n);
        }
      }
      return {
        userId: c.userId,
        userName: c.userName,
        userEmail: c.userEmail ?? '—',
        tokensTotal: Number(c.tokensInput ?? 0) + Number(c.tokensOutput ?? 0),
        costCents: Math.round(Number(c.costCents ?? 0)),
        quotaOverride: override,
        quotaDefault: cap,
      };
    }),
    costByDestravamento: byDest.map((b) => ({
      destravamentoId: b.destravamentoId,
      destravamentoTitle: b.destravamentoTitle,
      costCents: Math.round(Number(b.costSum ?? 0)),
      messagesCount: Number(b.msgCount ?? 0),
    })),
    totals: {
      tokensInput: Number(totalsRow?.tokensInput ?? 0),
      tokensOutput: Number(totalsRow?.tokensOutput ?? 0),
      tokensCached: Number(totalsRow?.tokensCached ?? 0),
      costCents: Math.round(Number(totalsRow?.costCents ?? 0)),
      conversationsCount: Number(totalsRow?.conversationsCount ?? 0),
    },
    recentArtifacts: arts.map((a) => ({
      id: a.id,
      title: a.title,
      kind: a.kind,
      userEmail: a.userEmail,
      createdAt: a.createdAt,
    })),
  };
}

// ---------------- REFUNDS ----------------

export interface RefundRow {
  refund: typeof refund_requests.$inferSelect;
  user: { id: string; name: string | null; email: string } | null;
  purchase: {
    id: string;
    amountCents: number;
    currency: string;
    paidAt: Date | null;
    productName: string | null;
    productSlug: string | null;
  } | null;
}

export async function listRefundRequests(): Promise<RefundRow[]> {
  const rows = await db
    .select({
      refund: refund_requests,
      userId: users.id,
      userName: users.name,
      userEmail: users.email,
      purchaseId: purchases.id,
      amountCents: purchases.amount_cents,
      currency: purchases.currency,
      paidAt: purchases.paid_at,
      productName: products.name,
      productSlug: products.slug,
    })
    .from(refund_requests)
    .leftJoin(users, eq(users.id, refund_requests.user_id))
    .leftJoin(purchases, eq(purchases.id, refund_requests.purchase_id))
    .leftJoin(products, eq(products.id, purchases.product_id))
    .orderBy(
      // pending no topo — depois mais recentes primeiro
      sql`CASE WHEN ${refund_requests.status} = 'pending' THEN 0 ELSE 1 END`,
      desc(refund_requests.created_at)
    );

  return rows.map((r) => ({
    refund: r.refund,
    user: r.userId
      ? { id: r.userId, name: r.userName, email: r.userEmail ?? '—' }
      : null,
    purchase: r.purchaseId
      ? {
          id: r.purchaseId,
          amountCents: r.amountCents ?? 0,
          currency: r.currency ?? 'BRL',
          paidAt: r.paidAt,
          productName: r.productName,
          productSlug: r.productSlug,
        }
      : null,
  }));
}

export async function processRefundAction(
  refundId: string,
  action: 'approve' | 'deny' | 'convert',
  adminId: string,
  opts?: { adminNote?: string; deniedReason?: string }
): Promise<void> {
  const [r] = await db
    .select()
    .from(refund_requests)
    .where(eq(refund_requests.id, refundId))
    .limit(1);
  if (!r) throw new Error('refund_not_found');

  const now = new Date();
  const patch: Partial<typeof refund_requests.$inferInsert> = {};
  let gatewayRefundId: string | null = null;
  let gatewayName: string | null = null;
  if (action === 'approve') {
    // Busca purchase + dispara refund real no gateway antes de marcar approved.
    const [purchase] = await db
      .select()
      .from(purchases)
      .where(eq(purchases.id, r.purchase_id))
      .limit(1);
    if (!purchase) throw new Error('purchase_not_found');

    try {
      const result = await refundPurchase(purchase, { reason: 'admin_refund' });
      gatewayRefundId = result.refundId;
      gatewayName = result.gateway;
      patch.status = 'approved';
      patch.approved_at = now;
      const noteParts = [
        opts?.adminNote,
        `Gateway: ${result.gateway} · refund_id=${result.refundId}${result.status ? ` · status=${result.status}` : ''}`,
      ].filter(Boolean);
      patch.admin_note = noteParts.join('\n');
    } catch (err) {
      // Falha do gateway: registra no admin_note e deixa pendente pra retry manual.
      const msg = err instanceof Error ? err.message : 'unknown';
      const failNote = [opts?.adminNote, `Falha gateway: ${msg}`].filter(Boolean).join('\n');
      await db
        .update(refund_requests)
        .set({ admin_note: failNote })
        .where(eq(refund_requests.id, refundId));
      await logAudit({
        adminId,
        action: 'refund.approve_failed',
        targetTable: 'refund_requests',
        targetId: refundId,
        payload: { error: msg },
      });
      throw err;
    }
  } else if (action === 'deny') {
    patch.status = 'denied';
    patch.denied_at = now;
  } else {
    patch.status = 'converted';
    patch.converted_at = now;
  }
  // adminNote: pra approve já foi setado acima (com gateway info). Pra deny/convert, sobrescreve.
  if (action !== 'approve' && opts?.adminNote !== undefined) {
    patch.admin_note = opts.adminNote;
  }
  if (action === 'deny' && opts?.deniedReason) {
    patch.admin_note = [patch.admin_note, `Motivo: ${opts.deniedReason}`].filter(Boolean).join('\n');
  }

  await db.update(refund_requests).set(patch).where(eq(refund_requests.id, refundId));

  await logAudit({
    adminId,
    action: `refund.${action}`,
    targetTable: 'refund_requests',
    targetId: refundId,
    payload: {
      adminNote: opts?.adminNote,
      deniedReason: opts?.deniedReason,
      ...(gatewayRefundId ? { gatewayRefundId, gateway: gatewayName } : {}),
    },
  });
}

export async function updateRefundNote(
  refundId: string,
  note: string,
  adminId: string
): Promise<void> {
  await db
    .update(refund_requests)
    .set({ admin_note: note })
    .where(eq(refund_requests.id, refundId));
  await logAudit({
    adminId,
    action: 'refund.update_note',
    targetTable: 'refund_requests',
    targetId: refundId,
  });
}

// re-export
export { getDefaultTeam };
