import 'server-only';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { and, desc, eq } from 'drizzle-orm';
import { requireAdmin } from '@/server/services/session';
import { db } from '@/server/db/client';
import { entitlements, products } from '@/server/db/schema';
import { logAudit } from '@/server/services/admin';

const Body = z.object({
  /** Em tokens. `null` remove o override (volta pro cap padrão do produto). */
  override: z.number().int().min(0).max(100_000_000).nullable(),
  /** Slug do produto (default: 'vss'). */
  productSlug: z.string().min(1).optional(),
});

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
): Promise<Response> {
  const admin = await requireAdmin();
  const { id: userId } = await ctx.params;
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }
  const { override, productSlug = 'vss' } = parsed.data;

  // Busca entitlement ativo do user pro produto (mais recente).
  const [row] = await db
    .select({ entitlement: entitlements, productSlug: products.slug })
    .from(entitlements)
    .innerJoin(products, eq(products.id, entitlements.product_id))
    .where(
      and(
        eq(entitlements.user_id, userId),
        eq(entitlements.status, 'active'),
        eq(products.slug, productSlug)
      )
    )
    .orderBy(desc(entitlements.created_at))
    .limit(1);

  if (!row) {
    return NextResponse.json({ error: 'no_active_entitlement' }, { status: 404 });
  }

  const currentMeta = (row.entitlement.metadata ?? {}) as Record<string, unknown>;
  const newMeta = { ...currentMeta };
  if (override == null) {
    delete newMeta.token_quota_override;
  } else {
    newMeta.token_quota_override = override;
  }

  await db
    .update(entitlements)
    .set({ metadata: newMeta as never, updated_at: new Date() })
    .where(eq(entitlements.id, row.entitlement.id));

  await logAudit({
    adminId: admin.id,
    action: 'entitlement.quota_override',
    targetTable: 'entitlements',
    targetId: row.entitlement.id,
    payload: { userId, productSlug, override },
  });

  return NextResponse.json({ ok: true, override });
}
