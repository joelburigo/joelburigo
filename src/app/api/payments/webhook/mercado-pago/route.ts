import { NextResponse } from 'next/server';
import { and, desc, eq } from 'drizzle-orm';
import { db } from '@/server/db/client';
import {
  products,
  purchases,
  entitlements,
  payment_events,
  contacts,
  opportunities,
  type Product,
  type Purchase,
} from '@/server/db/schema';
import { ulid } from '@/server/lib/ulid';
import { ensureUserByEmail } from '@/server/services/auth';
import {
  getDefaultTeam,
  upsertContact,
  logActivity,
  markOpportunityWon,
} from '@/server/services/crm';
import { sendEmail } from '@/server/services/email';
import {
  fetchPaymentDetails,
  mapMpStatus,
  verifyWebhookSignature,
  type MpPaymentPayload,
  type MpInternalStatus,
} from '@/server/services/payments/mercado-pago';

export const runtime = 'nodejs';

interface MpWebhookBody {
  action?: string;
  type?: string;
  data?: { id?: string | number };
  date_created?: string;
  user_id?: string | number;
  api_version?: string;
  live_mode?: boolean;
}

function pickEntitlementEnd(productAccessKind: string): Date | null {
  // VSS: lifetime → ends_at = null
  // advisory_sessao: 30d (validade pra agendar a sessão)
  // advisory_sprint: 30d
  // outros recurring lidam com subscription separada
  switch (productAccessKind) {
    case 'lifetime':
      return null;
    case 'one_time':
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    default:
      return null;
  }
}

function welcomeEmailHtml(productName: string, accessKind: string): {
  subject: string;
  html: string;
} {
  const isAdvisory = accessKind === 'one_time';
  const subject = isAdvisory
    ? `Sessão Advisory confirmada · ${productName}`
    : `Bem-vindo ao ${productName}`;

  const headline = isAdvisory ? 'Sessão Advisory confirmada' : `Bem-vindo ao ${productName}`;
  const cta = isAdvisory ? 'Agendar sessão' : 'Acessar área';
  const ctaPath = isAdvisory ? '/agendamento-sessao' : '/area';

  const html = `<!doctype html>
<html lang="pt-BR">
  <body style="margin:0;padding:32px;background:#050505;color:#f5f5f5;font-family:Archivo,Arial,sans-serif;">
    <div style="max-width:520px;margin:0 auto;background:#0a0a0a;border:1px solid #1a1a1a;padding:32px;">
      <h1 style="font-family:'Archivo Black',Arial,sans-serif;font-size:24px;letter-spacing:0.02em;text-transform:uppercase;color:#FF3B0F;margin:0 0 16px;">
        ${headline}
      </h1>
      <p style="font-size:15px;line-height:1.6;color:#d4d4d4;margin:0 0 24px;">
        Pagamento aprovado. Próximo passo abaixo.
      </p>
      <p style="margin:0 0 24px;">
        <a href="https://joelburigo.com.br${ctaPath}" style="display:inline-block;background:#C6FF00;color:#050505;font-family:'Archivo Black',Arial,sans-serif;text-transform:uppercase;letter-spacing:0.05em;font-size:14px;padding:14px 24px;text-decoration:none;border:2px solid #050505;box-shadow:4px 4px 0 #FF3B0F;">
          ${cta}
        </a>
      </p>
      <p style="font-size:12px;color:#525252;margin:24px 0 0;">
        Joel Burigo · Vendas Sem Segredos
      </p>
    </div>
  </body>
</html>`;

  return { subject, html };
}

async function resolveProduct(payload: MpPaymentPayload): Promise<Product | null> {
  // 1. external_reference == product.id
  const extRef = payload.external_reference;
  if (extRef) {
    const [p] = await db.select().from(products).where(eq(products.id, extRef)).limit(1);
    if (p) return p;
  }
  // 2. metadata.product_id ou metadata.product_slug
  const meta = (payload.metadata ?? {}) as Record<string, unknown>;
  const pid = typeof meta.product_id === 'string' ? meta.product_id : null;
  if (pid) {
    const [p] = await db.select().from(products).where(eq(products.id, pid)).limit(1);
    if (p) return p;
  }
  const pslug = typeof meta.product_slug === 'string' ? meta.product_slug : null;
  if (pslug) {
    const [p] = await db.select().from(products).where(eq(products.slug, pslug)).limit(1);
    if (p) return p;
  }
  return null;
}

function fullPayerName(payload: MpPaymentPayload): string | null {
  const p = payload.payer;
  if (!p) return null;
  const parts = [p.first_name, p.last_name].filter(Boolean);
  return parts.length ? parts.join(' ') : null;
}

function payerWhatsapp(payload: MpPaymentPayload): string | null {
  const phone = payload.payer?.phone;
  if (!phone) return null;
  const ac = phone.area_code ?? '';
  const num = phone.number ?? '';
  const merged = `${ac}${num}`.replace(/\D/g, '');
  return merged || null;
}

/**
 * Processa pagamento approved: cria purchase + entitlement + atualiza CRM + email welcome.
 * Idempotente em si: se purchase já existir pra esse gateway_payment_id, retorna existente.
 */
async function processApprovedPayment(
  payload: MpPaymentPayload,
  product: Product
): Promise<Purchase> {
  const paymentId = String(payload.id);

  // Já processado?
  const [existing] = await db
    .select()
    .from(purchases)
    .where(
      and(eq(purchases.gateway, 'mercado_pago'), eq(purchases.gateway_payment_id, paymentId))
    )
    .limit(1);
  if (existing && existing.status === 'paid') {
    console.log(`[payments/webhook] approved id=${paymentId} purchase já existe`);
    return existing;
  }

  const email = payload.payer?.email?.trim().toLowerCase();
  if (!email) {
    throw new Error(`payment ${paymentId} aprovado sem payer.email`);
  }

  const user = await ensureUserByEmail({
    email,
    name: fullPayerName(payload),
    whatsapp: payerWhatsapp(payload),
  });

  const amountCents = Math.round((payload.transaction_amount ?? product.price_cents / 100) * 100);
  const paidAt = payload.date_approved ? new Date(payload.date_approved) : new Date();
  const purchaseId = ulid();

  let purchase: Purchase;
  if (existing) {
    const [updated] = await db
      .update(purchases)
      .set({
        status: 'paid',
        amount_cents: amountCents,
        currency: payload.currency_id ?? 'BRL',
        raw_payload: payload as unknown as Record<string, unknown>,
        paid_at: paidAt,
      })
      .where(eq(purchases.id, existing.id))
      .returning();
    if (!updated) throw new Error('failed to update purchase');
    purchase = updated;
  } else {
    const [created] = await db
      .insert(purchases)
      .values({
        id: purchaseId,
        user_id: user.id,
        product_id: product.id,
        gateway: 'mercado_pago',
        gateway_payment_id: paymentId,
        gateway_customer_id: payload.payer?.id ?? null,
        status: 'paid',
        amount_cents: amountCents,
        currency: payload.currency_id ?? 'BRL',
        raw_payload: payload as unknown as Record<string, unknown>,
        paid_at: paidAt,
      })
      .returning();
    if (!created) throw new Error('failed to create purchase');
    purchase = created;
  }

  // Entitlement (idempotente: se já tem ativo p/ esse user+product+source, não duplica)
  const [existingEnt] = await db
    .select()
    .from(entitlements)
    .where(
      and(
        eq(entitlements.user_id, user.id),
        eq(entitlements.product_id, product.id),
        eq(entitlements.source_purchase_id, purchase.id)
      )
    )
    .limit(1);

  if (!existingEnt) {
    await db.insert(entitlements).values({
      id: ulid(),
      user_id: user.id,
      product_id: product.id,
      source_purchase_id: purchase.id,
      status: 'active',
      starts_at: paidAt,
      ends_at: pickEntitlementEnd(product.access_kind),
      metadata: {},
    });
  }

  // CRM: garantir contact + marcar opportunity ganha
  try {
    const team = await getDefaultTeam();
    const contact = await upsertContact({
      teamId: team.id,
      name: fullPayerName(payload) ?? email.split('@')[0],
      email,
      whatsapp: payerWhatsapp(payload),
      source: 'purchase',
      produto_interesse: product.slug.startsWith('advisory') ? 'advisory' : 'vss',
      lifecycle_stage: 'cliente',
    });

    // Atualiza lifecycle pra cliente
    if (contact.lifecycle_stage !== 'cliente') {
      await db
        .update(contacts)
        .set({ lifecycle_stage: 'cliente', updated_at: new Date() })
        .where(eq(contacts.id, contact.id));
    }

    // Resolve opportunity_id: 1) metadata.opportunity_id 2) opp aberta (contact, product)
    const meta = (payload.metadata ?? {}) as Record<string, unknown>;
    let oppId: string | null =
      typeof meta.opportunity_id === 'string' ? meta.opportunity_id : null;

    if (!oppId) {
      const [openOpp] = await db
        .select()
        .from(opportunities)
        .where(
          and(
            eq(opportunities.contact_id, contact.id),
            eq(opportunities.product_id, product.id),
            eq(opportunities.status, 'open')
          )
        )
        .orderBy(desc(opportunities.created_at))
        .limit(1);
      if (openOpp) oppId = openOpp.id;
    }

    if (oppId) {
      try {
        await markOpportunityWon(oppId, purchase.id);
      } catch (e) {
        console.warn('[payments/webhook] markOpportunityWon falhou', e);
      }
    } else {
      console.log(
        `[payments/webhook] approved id=${paymentId} sem opp pra marcar (contact=${contact.id})`
      );
    }

    await logActivity({
      teamId: team.id,
      contactId: contact.id,
      opportunityId: oppId,
      type: 'payment',
      direction: 'inbound',
      subject: `Pagamento aprovado · ${product.name}`,
      metadata: {
        payment_id: paymentId,
        amount_cents: amountCents,
        purchase_id: purchase.id,
        gateway: 'mercado_pago',
      },
    });
  } catch (crmErr) {
    console.error('[payments/webhook] crm error', crmErr);
  }

  // Welcome email (uma vez só)
  if (!purchase.welcome_sent_at) {
    try {
      const { subject, html } = welcomeEmailHtml(product.name, product.access_kind);
      await sendEmail({
        to: email,
        toName: fullPayerName(payload) ?? undefined,
        subject,
        html,
      });
      await db
        .update(purchases)
        .set({ welcome_sent_at: new Date() })
        .where(eq(purchases.id, purchase.id));
    } catch (mailErr) {
      console.error('[payments/webhook] welcome email error', mailErr);
    }
  }

  return purchase;
}

async function processRefundOrChargeback(
  payload: MpPaymentPayload,
  status: MpInternalStatus
): Promise<void> {
  const paymentId = String(payload.id);
  const [purchase] = await db
    .select()
    .from(purchases)
    .where(
      and(eq(purchases.gateway, 'mercado_pago'), eq(purchases.gateway_payment_id, paymentId))
    )
    .limit(1);

  if (!purchase) {
    console.warn(`[payments/webhook] ${status} id=${paymentId} sem purchase prévio`);
    return;
  }

  await db
    .update(purchases)
    .set({
      status: status === 'refunded' ? 'refunded' : 'charged_back',
      refunded_at: new Date(),
      raw_payload: payload as unknown as Record<string, unknown>,
    })
    .where(eq(purchases.id, purchase.id));

  await db
    .update(entitlements)
    .set({
      status: 'revoked',
      revoked_at: new Date(),
      revoked_reason: status,
      updated_at: new Date(),
    })
    .where(eq(entitlements.source_purchase_id, purchase.id));

  console.log(`[payments/webhook] ${status} id=${paymentId} purchase=${purchase.id} revogado`);
}

// =====================================================================
// POST handler
// =====================================================================

export async function POST(req: Request) {
  let raw = '';
  try {
    raw = await req.text();
  } catch {
    return NextResponse.json({ ok: false, error: 'cannot read body' }, { status: 400 });
  }

  let body: MpWebhookBody;
  try {
    body = JSON.parse(raw) as MpWebhookBody;
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid json' }, { status: 400 });
  }

  const dataId = body.data?.id ? String(body.data.id) : '';
  const action = body.action ?? body.type ?? 'unknown';

  // Verifica assinatura (em dev sem secret, libera com warn)
  const sig = verifyWebhookSignature(req, dataId);
  if (!sig.valid) {
    console.warn(`[payments/webhook] signature invalid: ${sig.reason}`);
    return NextResponse.json({ ok: false, error: 'invalid_signature' }, { status: 401 });
  }

  // Só processamos eventos de pagamento
  if (body.type && body.type !== 'payment') {
    console.log(`[payments/webhook] ignorando type=${body.type}`);
    return NextResponse.json({ ok: true, ignored: true });
  }
  if (!dataId) {
    return NextResponse.json({ ok: false, error: 'missing data.id' }, { status: 400 });
  }

  // Idempotência: gateway_event_id estável.
  // Preferência: x-request-id (único por entrega MP). Senão `${dataId}-${action}`.
  const requestId = req.headers.get('x-request-id') ?? '';
  const gatewayEventId = requestId || `${dataId}-${action}`;
  const eventRowId = ulid();

  const inserted = await db
    .insert(payment_events)
    .values({
      id: eventRowId,
      gateway: 'mercado_pago',
      gateway_event_id: gatewayEventId,
      event_type: action,
      object_id: dataId,
      status: 'received',
      attempts: 1,
      payload: { headers: { 'x-request-id': requestId }, body } as unknown as Record<
        string,
        unknown
      >,
      last_attempt_at: new Date(),
    })
    .onConflictDoNothing({
      target: [payment_events.gateway, payment_events.gateway_event_id],
    })
    .returning({ id: payment_events.id });

  if (inserted.length === 0) {
    // Já processado em entrega anterior — MP reentrega com freq.
    console.log(`[payments/webhook] dedup id=${dataId} eventId=${gatewayEventId}`);
    return NextResponse.json({ ok: true, deduped: true });
  }

  const eventId = inserted[0].id;

  try {
    const detail = await fetchPaymentDetails(dataId);
    const internalStatus = mapMpStatus(detail.status, detail.status_detail);
    console.log(`[payments/webhook] ${internalStatus} id=${dataId}`);

    if (internalStatus === 'approved') {
      const product = await resolveProduct(detail);
      if (!product) {
        throw new Error(`produto não resolvido (external_reference=${detail.external_reference})`);
      }
      await processApprovedPayment(detail, product);
    } else if (internalStatus === 'refunded' || internalStatus === 'charged_back') {
      await processRefundOrChargeback(detail, internalStatus);
    } else {
      console.log(`[payments/webhook] no-op status=${internalStatus} id=${dataId}`);
    }

    await db
      .update(payment_events)
      .set({
        status: 'processed',
        processed_at: new Date(),
        payload: {
          headers: { 'x-request-id': requestId },
          body,
          payment: detail,
        } as unknown as Record<string, unknown>,
      })
      .where(eq(payment_events.id, eventId));

    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown error';
    console.error(`[payments/webhook] erro id=${dataId}`, err);
    await db
      .update(payment_events)
      .set({
        status: 'error',
        error: msg,
        last_attempt_at: new Date(),
      })
      .where(eq(payment_events.id, eventId));
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
