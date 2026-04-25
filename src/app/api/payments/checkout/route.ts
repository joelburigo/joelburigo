import { NextResponse } from 'next/server';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@/server/db/client';
import { products } from '@/server/db/schema';
import { ensureUserByEmail } from '@/server/services/auth';
import {
  getDefaultTeam,
  upsertContact,
  createOpportunity,
  logActivity,
} from '@/server/services/crm';
import { createCheckoutPreference } from '@/server/services/payments/mercado-pago';

export const runtime = 'nodejs';

const bodySchema = z.object({
  productSlug: z.string().min(1),
  payer: z
    .object({
      email: z.string().email().optional(),
      name: z.string().optional(),
      whatsapp: z.string().optional(),
    })
    .optional(),
});

/**
 * Mapeia slug → (pipelineSlug, stageSlug, produto_interesse) pro CRM.
 */
function pipelineForProduct(slug: string): {
  pipelineSlug: 'vss' | 'advisory';
  stageSlug: string;
  produto_interesse: 'vss' | 'advisory';
} {
  if (slug.startsWith('advisory')) {
    return {
      pipelineSlug: 'advisory',
      stageSlug: 'aplicacao-recebida',
      produto_interesse: 'advisory',
    };
  }
  return {
    pipelineSlug: 'vss',
    stageSlug: 'checkout-iniciado',
    produto_interesse: 'vss',
  };
}

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: 'invalid_payload', issues: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { productSlug, payer } = parsed.data;

    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.slug, productSlug))
      .limit(1);

    if (!product || !product.active) {
      return NextResponse.json({ ok: false, error: 'product_not_found' }, { status: 404 });
    }

    if (product.gateway_default !== 'mercado_pago') {
      return NextResponse.json(
        { ok: false, error: 'gateway_mismatch', expected: product.gateway_default },
        { status: 400 }
      );
    }

    // CRM: cria/atualiza contact + opportunity quando temos email
    const extraMetadata: Record<string, string> = {};
    if (payer?.email) {
      try {
        const { pipelineSlug, stageSlug, produto_interesse } = pipelineForProduct(product.slug);
        const team = await getDefaultTeam();

        await ensureUserByEmail({
          email: payer.email,
          name: payer.name ?? null,
          whatsapp: payer.whatsapp ?? null,
        });

        const contact = await upsertContact({
          teamId: team.id,
          name: payer.name?.trim() || payer.email.split('@')[0],
          email: payer.email,
          whatsapp: payer.whatsapp ?? null,
          source: 'checkout',
          produto_interesse,
        });

        const opp = await createOpportunity({
          teamId: team.id,
          contactId: contact.id,
          pipelineSlug,
          stageSlug,
          productId: product.id,
          title: `${product.name} · ${contact.name}`,
          value_cents: product.price_cents,
          metadata: { source: 'checkout', product_slug: product.slug },
        });

        extraMetadata.opportunity_id = opp.id;
        extraMetadata.contact_id = contact.id;

        await logActivity({
          teamId: team.id,
          contactId: contact.id,
          opportunityId: opp.id,
          type: 'system',
          direction: 'internal',
          subject: `Checkout iniciado · ${product.name}`,
          metadata: { product_id: product.id, product_slug: product.slug },
        });
      } catch (crmErr) {
        // CRM nunca deve bloquear o checkout — loga e segue.
        console.error('[payments/checkout] crm error', crmErr);
      }
    }

    const preference = await createCheckoutPreference({
      product,
      payer,
      metadata: extraMetadata,
    });

    return NextResponse.json({
      ok: true,
      checkoutUrl: preference.init_point,
      sandboxCheckoutUrl: preference.sandbox_init_point,
      preferenceId: preference.id,
    });
  } catch (err) {
    console.error('[payments/checkout] error', err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : 'internal_error' },
      { status: 500 }
    );
  }
}
