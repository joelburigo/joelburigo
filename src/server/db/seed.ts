/**
 * Seed inicial — idempotente (upsert por unique key).
 *
 * Cria:
 *   - users: Joel admin
 *   - teams + team_members: team default `joelburigo`
 *   - products: 4 (vss, advisory-sessao, advisory-sprint, advisory-conselho)
 *   - pipelines + stages: `vss` (default) + `advisory`
 *
 * Rodar: `pnpm db:seed`
 */
import 'dotenv/config';
import { eq, and } from 'drizzle-orm';
import { db } from './client';
import {
  users,
  teams,
  team_members,
  products,
  pipelines,
  stages,
  entitlements,
} from './schema';
import { ulid } from 'ulid';
import { seedVss } from './seed/vss';

// ---------- Constantes ----------

const ADMIN_EMAIL = 'joel@growthmaster.com.br';
const ADMIN_NAME = 'Joel Burigo';

const TEAM_SLUG = 'joelburigo';
const TEAM_NAME = 'Joel Burigo';

// Cores Terminal Growth
const FIRE = '#FF3B0F';
const ACID = '#C6FF00';
const BLACK = '#050505';
const GRAY = '#737373';

// ---------- Helpers ----------

async function ensureUserAdmin(): Promise<string> {
  const [existing] = await db.select().from(users).where(eq(users.email, ADMIN_EMAIL)).limit(1);
  if (existing) {
    if (existing.role !== 'admin' || existing.name !== ADMIN_NAME) {
      await db
        .update(users)
        .set({ role: 'admin', name: ADMIN_NAME })
        .where(eq(users.id, existing.id));
    }
    return existing.id;
  }
  const id = ulid();
  await db.insert(users).values({
    id,
    email: ADMIN_EMAIL,
    name: ADMIN_NAME,
    role: 'admin',
  });
  return id;
}

async function ensureTeam(): Promise<string> {
  const [existing] = await db.select().from(teams).where(eq(teams.slug, TEAM_SLUG)).limit(1);
  if (existing) return existing.id;
  const id = ulid();
  await db.insert(teams).values({ id, slug: TEAM_SLUG, name: TEAM_NAME });
  return id;
}

async function ensureTeamMember(teamId: string, userId: string, role: string): Promise<void> {
  await db
    .insert(team_members)
    .values({ team_id: teamId, user_id: userId, role })
    .onConflictDoNothing();
}

interface ProductSeed {
  slug: string;
  name: string;
  price_cents: number;
  recurring: boolean;
  access_kind: string;
  gateway_default?: string;
  monthly_llm_token_quota?: bigint;
}

async function ensureProduct(p: ProductSeed): Promise<void> {
  const [existing] = await db.select().from(products).where(eq(products.slug, p.slug)).limit(1);
  if (existing) {
    await db
      .update(products)
      .set({
        name: p.name,
        price_cents: p.price_cents,
        recurring: p.recurring,
        access_kind: p.access_kind,
        gateway_default: p.gateway_default ?? 'mercado_pago',
        ...(p.monthly_llm_token_quota !== undefined
          ? { monthly_llm_token_quota: p.monthly_llm_token_quota }
          : {}),
      })
      .where(eq(products.id, existing.id));
    return;
  }
  await db.insert(products).values({
    id: ulid(),
    slug: p.slug,
    name: p.name,
    price_cents: p.price_cents,
    currency: 'BRL',
    recurring: p.recurring,
    access_kind: p.access_kind,
    gateway_default: p.gateway_default ?? 'mercado_pago',
    monthly_llm_token_quota: p.monthly_llm_token_quota ?? null,
  });
}

interface StageSeed {
  slug: string;
  name: string;
  kind: 'open' | 'won' | 'lost';
  color: string;
  probability?: number;
}

interface PipelineSeed {
  slug: string;
  name: string;
  is_default: boolean;
  position: number;
  stages: StageSeed[];
}

async function ensurePipeline(teamId: string, p: PipelineSeed): Promise<void> {
  const [existing] = await db
    .select()
    .from(pipelines)
    .where(and(eq(pipelines.team_id, teamId), eq(pipelines.slug, p.slug)))
    .limit(1);

  let pipelineId: string;
  if (existing) {
    pipelineId = existing.id;
    await db
      .update(pipelines)
      .set({ name: p.name, is_default: p.is_default, position: p.position })
      .where(eq(pipelines.id, existing.id));
  } else {
    pipelineId = ulid();
    await db.insert(pipelines).values({
      id: pipelineId,
      team_id: teamId,
      slug: p.slug,
      name: p.name,
      is_default: p.is_default,
      position: p.position,
    });
  }

  for (let i = 0; i < p.stages.length; i++) {
    const s = p.stages[i]!;
    const [existingStage] = await db
      .select()
      .from(stages)
      .where(and(eq(stages.pipeline_id, pipelineId), eq(stages.slug, s.slug)))
      .limit(1);
    if (existingStage) {
      await db
        .update(stages)
        .set({
          name: s.name,
          kind: s.kind,
          color: s.color,
          position: i,
          probability: s.probability ?? null,
        })
        .where(eq(stages.id, existingStage.id));
    } else {
      await db.insert(stages).values({
        id: ulid(),
        pipeline_id: pipelineId,
        slug: s.slug,
        name: s.name,
        kind: s.kind,
        color: s.color,
        position: i,
        probability: s.probability ?? null,
      });
    }
  }
}

// ---------- Main ----------

async function main(): Promise<void> {
  console.log('[seed] iniciando…');

  console.log('[seed] users…');
  const adminId = await ensureUserAdmin();
  console.log(`[seed]   ✓ admin Joel (${adminId})`);

  console.log('[seed] teams + members…');
  const teamId = await ensureTeam();
  await ensureTeamMember(teamId, adminId, 'admin');
  console.log(`[seed]   ✓ team ${TEAM_SLUG} (${teamId})`);

  console.log('[seed] products…');
  const productList: ProductSeed[] = [
    {
      slug: 'vss',
      name: 'Vendas Sem Segredos',
      price_cents: 199700,
      recurring: false,
      access_kind: 'vss_lifetime',
      gateway_default: 'mercado_pago',
      monthly_llm_token_quota: BigInt(500_000),
    },
    {
      slug: 'advisory-sessao',
      name: 'Advisory · Sessão',
      price_cents: 99700,
      recurring: false,
      access_kind: 'advisory_session',
      gateway_default: 'mercado_pago',
    },
    {
      slug: 'advisory-sprint',
      name: 'Advisory · Sprint 30 dias',
      price_cents: 750000,
      recurring: false,
      access_kind: 'advisory_sprint',
      gateway_default: 'mercado_pago',
    },
    {
      slug: 'advisory-conselho',
      name: 'Advisory · Conselho Executivo',
      price_cents: 1500000,
      recurring: true,
      access_kind: 'advisory_recurring',
      gateway_default: 'manual',
    },
  ];
  for (const p of productList) {
    await ensureProduct(p);
    console.log(`[seed]   ✓ product ${p.slug}`);
  }

  console.log('[seed] pipelines + stages…');
  const pipelineList: PipelineSeed[] = [
    {
      slug: 'vss',
      name: 'VSS',
      is_default: true,
      position: 0,
      stages: [
        { slug: 'novo', name: 'Novo', kind: 'open', color: GRAY, probability: 10 },
        {
          slug: 'qualificado',
          name: 'Qualificado',
          kind: 'open',
          color: ACID,
          probability: 35,
        },
        {
          slug: 'checkout-iniciado',
          name: 'Checkout iniciado',
          kind: 'open',
          color: FIRE,
          probability: 65,
        },
        { slug: 'vendido', name: 'Vendido', kind: 'won', color: ACID, probability: 100 },
        { slug: 'perdido', name: 'Perdido', kind: 'lost', color: BLACK, probability: 0 },
      ],
    },
    {
      slug: 'advisory',
      name: 'Advisory',
      is_default: false,
      position: 1,
      stages: [
        {
          slug: 'aplicacao-recebida',
          name: 'Aplicação recebida',
          kind: 'open',
          color: GRAY,
          probability: 15,
        },
        {
          slug: 'qualificado',
          name: 'Qualificado',
          kind: 'open',
          color: ACID,
          probability: 40,
        },
        {
          slug: 'proposta-enviada',
          name: 'Proposta enviada',
          kind: 'open',
          color: FIRE,
          probability: 70,
        },
        { slug: 'fechado', name: 'Fechado', kind: 'won', color: ACID, probability: 100 },
        { slug: 'perdido', name: 'Perdido', kind: 'lost', color: BLACK, probability: 0 },
      ],
    },
  ];
  for (const p of pipelineList) {
    await ensurePipeline(teamId, p);
    console.log(`[seed]   ✓ pipeline ${p.slug} (${p.stages.length} stages)`);
  }

  console.log('[seed] vss metadata…');
  await seedVss(db);

  // Demo users em dev — botões de quick-login em /entrar dependem desses
  if (process.env.NODE_ENV !== 'production') {
    console.log('[seed] demo users (dev)…');
    const demoVssId = await ensureDemoUser({
      email: 'demo-vss@joelburigo.dev',
      name: 'Demo VSS',
      role: 'user',
    });
    const demoEmptyId = await ensureDemoUser({
      email: 'demo-lead@joelburigo.dev',
      name: 'Demo Lead',
      role: 'user',
    });
    console.log(`[seed]   ✓ user demo-vss (${demoVssId})`);
    console.log(`[seed]   ✓ user demo-lead (${demoEmptyId})`);

    // VSS entitlement pro demo-vss
    const [vssProduct] = await db.select().from(products).where(eq(products.slug, 'vss')).limit(1);
    if (vssProduct) {
      const [existing] = await db
        .select()
        .from(entitlements)
        .where(and(eq(entitlements.user_id, demoVssId), eq(entitlements.product_id, vssProduct.id)))
        .limit(1);
      if (!existing) {
        await db.insert(entitlements).values({
          id: ulid(),
          user_id: demoVssId,
          product_id: vssProduct.id,
          status: 'active',
        });
        console.log('[seed]   ✓ entitlement demo-vss → vss');
      }
    }
  }

  console.log('✓ seed completo');
  process.exit(0);
}

async function ensureDemoUser(opts: {
  email: string;
  name: string;
  role: string;
}): Promise<string> {
  const [existing] = await db.select().from(users).where(eq(users.email, opts.email)).limit(1);
  if (existing) return existing.id;
  const id = ulid();
  await db.insert(users).values({ id, email: opts.email, name: opts.name, role: opts.role });
  return id;
}

main().catch((err) => {
  console.error('[seed] failed:', err);
  process.exit(1);
});
