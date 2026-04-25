import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { env } from '@/env';
import type { Product } from '@/server/db/schema';

/**
 * Cliente Mercado Pago + helpers de checkout, webhook e fetch de pagamento.
 *
 * SDK oficial é usado APENAS pra criar preferences (DX melhor).
 * Webhook e fetch de payment usamos `fetch` direto pra ter controle de erros
 * e payload bruto pra persistir em `payment_events.payload`.
 */

let _client: MercadoPagoConfig | null = null;

function getClient(): MercadoPagoConfig {
  if (!_client) {
    if (!env.MP_ACCESS_TOKEN) {
      throw new Error('MP_ACCESS_TOKEN não configurado.');
    }
    _client = new MercadoPagoConfig({
      accessToken: env.MP_ACCESS_TOKEN,
      options: { timeout: 10_000 },
    });
  }
  return _client;
}

// =====================================================================
// Tipos
// =====================================================================

export type MpInternalStatus =
  | 'pending'
  | 'in_process'
  | 'approved'
  | 'rejected'
  | 'refunded'
  | 'charged_back';

export interface CreateCheckoutParams {
  product: Product;
  payer?: {
    email?: string | null;
    name?: string | null;
    whatsapp?: string | null;
  };
  /**
   * Se vier (ex: opportunity criada antes), grudamos no metadata pra
   * o webhook conseguir resolver direto sem buscar opp aberta.
   */
  metadata?: Record<string, string | number>;
}

export interface CheckoutPreferenceResult {
  id: string;
  init_point: string;
  sandbox_init_point: string;
}

export interface MpPayer {
  id?: string;
  email?: string;
  first_name?: string | null;
  last_name?: string | null;
  phone?: { area_code?: string | null; number?: string | null } | null;
  identification?: { type?: string | null; number?: string | null } | null;
}

export interface MpPaymentPayload {
  id: number | string;
  status: string;
  status_detail?: string;
  transaction_amount?: number;
  currency_id?: string;
  date_approved?: string | null;
  date_created?: string | null;
  external_reference?: string | null;
  payer?: MpPayer;
  metadata?: Record<string, unknown>;
  additional_info?: { items?: unknown; payer?: unknown } & Record<string, unknown>;
  // catch-all
  [key: string]: unknown;
}

export interface VerifyWebhookResult {
  valid: boolean;
  dataId: string;
  reason?: string;
}

// =====================================================================
// createCheckoutPreference
// =====================================================================

export async function createCheckoutPreference(
  params: CreateCheckoutParams
): Promise<CheckoutPreferenceResult> {
  const { product, payer, metadata } = params;
  const site = env.PUBLIC_SITE_URL.replace(/\/$/, '');
  const preference = new Preference(getClient());

  const unitPrice = Number((product.price_cents / 100).toFixed(2));

  const fullName = (payer?.name ?? '').trim();
  const [firstName, ...rest] = fullName.split(/\s+/);

  const body = {
    items: [
      {
        id: product.id,
        title: product.name,
        quantity: 1,
        unit_price: unitPrice,
        currency_id: (product.currency || 'BRL') as 'BRL',
      },
    ],
    back_urls: {
      success: `${site}/checkout/sucesso?product=${encodeURIComponent(product.slug)}`,
      failure: `${site}/checkout/erro`,
      pending: `${site}/checkout/pendente`,
    },
    auto_return: 'approved' as const,
    notification_url: `${site}/api/payments/webhook/mercado-pago`,
    external_reference: product.id,
    statement_descriptor: 'JOELBURIGO',
    metadata: {
      product_id: product.id,
      product_slug: product.slug,
      ...(metadata ?? {}),
    },
    ...(payer?.email
      ? {
          payer: {
            email: payer.email,
            ...(firstName ? { name: firstName } : {}),
            ...(rest.length ? { surname: rest.join(' ') } : {}),
            ...(payer.whatsapp
              ? {
                  phone: {
                    area_code: payer.whatsapp.replace(/\D/g, '').slice(0, 2) || undefined,
                    number: payer.whatsapp.replace(/\D/g, '').slice(2) || undefined,
                  },
                }
              : {}),
          },
        }
      : {}),
  };

  const created = await preference.create({ body });

  if (!created.id || !created.init_point) {
    throw new Error('Mercado Pago não retornou preference válida.');
  }

  return {
    id: created.id,
    init_point: created.init_point,
    sandbox_init_point: created.sandbox_init_point ?? created.init_point,
  };
}

// =====================================================================
// verifyWebhookSignature
// =====================================================================

/**
 * Valida assinatura do webhook MP.
 * Header `x-signature` formato: `ts=1700000000,v1=hex...`
 * Manifest assinado: `id:${dataId};request-id:${xRequestId};ts:${ts};`
 *
 * Em dev sem MP_WEBHOOK_SECRET retorna { valid: true } com warn pra desenvolvimento local.
 */
export function verifyWebhookSignature(req: Request, dataId: string): VerifyWebhookResult {
  const signatureHeader = req.headers.get('x-signature');
  const requestId = req.headers.get('x-request-id') ?? '';

  if (!env.MP_WEBHOOK_SECRET) {
    if (env.NODE_ENV === 'development') {
      console.warn('[payments/webhook] MP_WEBHOOK_SECRET ausente — pulando verificação (dev)');
      return { valid: true, dataId };
    }
    return { valid: false, dataId, reason: 'MP_WEBHOOK_SECRET não configurado' };
  }

  if (!signatureHeader) {
    return { valid: false, dataId, reason: 'header x-signature ausente' };
  }

  const parts = Object.fromEntries(
    signatureHeader.split(',').map((kv) => {
      const [k, ...v] = kv.split('=');
      return [k.trim(), v.join('=').trim()];
    })
  );

  const ts = parts.ts;
  const v1 = parts.v1;
  if (!ts || !v1) return { valid: false, dataId, reason: 'x-signature mal formatado' };

  const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;
  const expected = createHmac('sha256', env.MP_WEBHOOK_SECRET).update(manifest).digest('hex');

  let ok = false;
  try {
    const a = Buffer.from(v1, 'hex');
    const b = Buffer.from(expected, 'hex');
    ok = a.length === b.length && timingSafeEqual(a, b);
  } catch {
    ok = false;
  }

  return { valid: ok, dataId, reason: ok ? undefined : 'HMAC inválido' };
}

// =====================================================================
// fetchPaymentDetails
// =====================================================================

export async function fetchPaymentDetails(paymentId: string | number): Promise<MpPaymentPayload> {
  if (!env.MP_ACCESS_TOKEN) throw new Error('MP_ACCESS_TOKEN não configurado.');

  const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${env.MP_ACCESS_TOKEN}`,
      Accept: 'application/json',
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`fetchPaymentDetails ${res.status}: ${body.slice(0, 200)}`);
  }

  return (await res.json()) as MpPaymentPayload;
}

// =====================================================================
// mapMpStatus
// =====================================================================

export function mapMpStatus(status: string, statusDetail?: string): MpInternalStatus {
  switch (status) {
    case 'approved':
      return 'approved';
    case 'authorized':
      return 'approved';
    case 'in_process':
    case 'in_mediation':
      return 'in_process';
    case 'pending':
      return 'pending';
    case 'rejected':
    case 'cancelled':
      return 'rejected';
    case 'refunded':
      return 'refunded';
    case 'charged_back':
      return 'charged_back';
    default:
      // Fallback por status_detail (alguns gateways usam só detail)
      if (statusDetail?.includes('refund')) return 'refunded';
      if (statusDetail?.includes('charged_back')) return 'charged_back';
      return 'pending';
  }
}
