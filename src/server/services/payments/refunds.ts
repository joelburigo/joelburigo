import 'server-only';
import Stripe from 'stripe';
import { and, eq } from 'drizzle-orm';
import { db } from '@/server/db/client';
import { entitlements, purchases, type Purchase } from '@/server/db/schema';
import { env } from '@/env';

/**
 * Refund de gateway (Mercado Pago + Stripe) + revogação de entitlements.
 *
 * Em DEV (sem creds) loga e retorna mock pra não bloquear /admin/refunds.
 * Refund parcial é suportado via `amountCents` opcional — sem UI hoje (TODO).
 */

export interface RefundResult {
  ok: boolean;
  refundId: string;
  status?: string;
  gateway: string;
}

let _stripe: Stripe | null = null;
function stripeClient(): Stripe {
  if (!_stripe) {
    if (!env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY não configurado.');
    _stripe = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2026-04-22.dahlia' });
  }
  return _stripe;
}

interface RefundMpInput {
  paymentId: string;
  /** Em centavos. Se omitido, refund total. */
  amountCents?: number;
}

export async function refundMercadoPago(input: RefundMpInput): Promise<RefundResult> {
  if (!env.MP_ACCESS_TOKEN) {
    if (env.NODE_ENV === 'development') {
      console.warn('[refund/mp] sem MP_ACCESS_TOKEN — mock');
      return { ok: true, refundId: 'dev-mock-mp', status: 'approved', gateway: 'mercado_pago' };
    }
    throw new Error('MP_ACCESS_TOKEN não configurado.');
  }

  const body: Record<string, unknown> = {};
  if (input.amountCents != null) body.amount = Number((input.amountCents / 100).toFixed(2));

  const res = await fetch(
    `https://api.mercadopago.com/v1/payments/${input.paymentId}/refunds`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.MP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        // MP exige idempotency-key em refunds
        'X-Idempotency-Key': `refund-${input.paymentId}-${Date.now()}`,
      },
      body: Object.keys(body).length > 0 ? JSON.stringify(body) : undefined,
      cache: 'no-store',
    }
  );

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`refundMercadoPago ${res.status}: ${text.slice(0, 300)}`);
  }

  const json = (await res.json()) as { id?: number | string; status?: string };
  return {
    ok: true,
    refundId: String(json.id ?? ''),
    status: json.status ?? 'approved',
    gateway: 'mercado_pago',
  };
}

interface RefundStripeInput {
  /** Charge ID `ch_...` OU PaymentIntent `pi_...`. PI tem prioridade. */
  chargeId?: string | null;
  paymentIntentId?: string | null;
  amountCents?: number;
}

export async function refundStripe(input: RefundStripeInput): Promise<RefundResult> {
  if (!env.STRIPE_SECRET_KEY) {
    if (env.NODE_ENV === 'development') {
      console.warn('[refund/stripe] sem STRIPE_SECRET_KEY — mock');
      return { ok: true, refundId: 'dev-mock-stripe', status: 'succeeded', gateway: 'stripe' };
    }
    throw new Error('STRIPE_SECRET_KEY não configurado.');
  }

  if (!input.paymentIntentId && !input.chargeId) {
    throw new Error('refundStripe: precisa de paymentIntentId ou chargeId');
  }

  const params: Stripe.RefundCreateParams = {
    ...(input.paymentIntentId
      ? { payment_intent: input.paymentIntentId }
      : { charge: input.chargeId as string }),
    ...(input.amountCents != null ? { amount: input.amountCents } : {}),
  };

  const refund = await stripeClient().refunds.create(params);
  return {
    ok: refund.status === 'succeeded' || refund.status === 'pending',
    refundId: refund.id,
    status: refund.status ?? 'unknown',
    gateway: 'stripe',
  };
}

/**
 * Refund de uma `Purchase` do banco — roteia por gateway, atualiza purchase
 * + revoga entitlements ligados via `source_purchase_id`.
 */
export async function refundPurchase(
  purchase: Purchase,
  opts?: { amountCents?: number; reason?: string }
): Promise<RefundResult> {
  if (!purchase.gateway_payment_id && purchase.gateway === 'mercado_pago') {
    throw new Error('purchase.gateway_payment_id ausente — não dá pra refund');
  }

  let result: RefundResult;
  if (purchase.gateway === 'mercado_pago') {
    result = await refundMercadoPago({
      paymentId: purchase.gateway_payment_id as string,
      amountCents: opts?.amountCents,
    });
  } else if (purchase.gateway === 'stripe') {
    result = await refundStripe({
      paymentIntentId: purchase.gateway_payment_id,
      amountCents: opts?.amountCents,
    });
  } else {
    throw new Error(`gateway desconhecido: ${purchase.gateway}`);
  }

  // Atualiza purchase. Refund parcial não muda status final — só registra refunded_at
  // se for total. Hoje só fazemos full (UI ainda não expõe partial).
  const isFullRefund = !opts?.amountCents || opts.amountCents >= purchase.amount_cents;
  await db
    .update(purchases)
    .set({
      ...(isFullRefund ? { status: 'refunded', refunded_at: new Date() } : {}),
    })
    .where(eq(purchases.id, purchase.id));

  // Revoga entitlements do source_purchase_id (se full refund).
  if (isFullRefund) {
    await db
      .update(entitlements)
      .set({
        status: 'revoked',
        revoked_at: new Date(),
        revoked_reason: opts?.reason ?? 'refund',
        updated_at: new Date(),
      })
      .where(
        and(
          eq(entitlements.source_purchase_id, purchase.id),
          eq(entitlements.status, 'active')
        )
      );
  }

  return result;
}
