# Marketing Attribution & Conversões Offline

Captura de UTM/click IDs/Meta cookies + envio de eventos server-side pra Google Ads + Meta CAPI. Atualizado pós Sprint 1+2 (2026-04-30).

## Captura no client (`src/lib/attribution.ts`)

Cookie `__jb_attr` com TTL 90 dias, SameSite=Lax, Secure em https.

**First-touch wins**: UTM/click IDs gravados na primeira visita não são sobrescritos.
**Last-touch atualiza**: `last_landing_page` sempre vira a página atual.

API:
```ts
captureAttribution(): AttributionData  // grava + atualiza
readAttribution(): AttributionData     // só lê (pra forms)
```

Campos capturados:
- URL params: `utm_source/medium/campaign/term/content`, `gclid`, `fbclid`, `msclkid`, `ttclid`
- `document.referrer` (se não-empty e não-própria origem)
- Cookies do Meta Pixel: `_fbp`, `_fbc` (lidos sempre que ponteado, Pixel pode setar tarde)

## Componente `<AttributionFields />`

Drop-in pra qualquer form HTML — injeta hidden inputs auto-preenchidos.

```tsx
<form>
  <AttributionFields />
  {/* outros inputs */}
</form>
```

Forms JSON (POST API) usam `readAttribution()` direto no body em vez de hidden inputs.

## Persistência server-side (`src/server/services/marketing-attribution.ts`)

```ts
extractAttributionFromRequest(req, body) → { attribution, geo, device }
persistAttribution({ attribution, geo, device }) → attribution_id
linkAttributionToContact(attribution_id, contact_id)
```

Server merge:
- Body fields (do `<AttributionFields />` ou `readAttribution()`)
- Headers Cloudflare: `cf-ipcountry`, `cf-region`, `cf-ipcity`
- User-Agent parsing (regex sem libs): device (mobile/tablet/desktop), browser, os

Best-effort: Zod `safeParse` silenciosamente descarta inválidos — nunca quebra request principal.

## Tabela `lead_attribution`

| Coluna | Tipo |
|---|---|
| id | text PK (ULID) |
| contact_id | text FK contacts (nullable) |
| utm_* | text (5 campos) |
| gclid, fbclid, msclkid, ttclid | text |
| referrer, first_landing_page, last_landing_page | text |
| device, browser, os | text |
| country, region, city | text |
| fbp, fbc | text |
| created_at, updated_at | timestamptz |

Indexes: `contact_id`, `gclid` (where not null), `fbclid` (where not null).

## Conversões offline server-side

### Google Ads Enhanced Conversions (`src/server/services/conversions/google-ads.ts`)

REST direto v17 (sem SDK pesado — Workers 64MB limit). OAuth refresh token cached 50min em memória.

```ts
sendGoogleAdsConversion({
  conversionAction,  // 'customers/{id}/conversionActions/{id}'
  gclid?,
  email?, phone?, firstName?, lastName?,  // hashed sha256 antes do envio
  conversionDateTime?,
  conversionValue?, currencyCode?,
  orderId?,
}): Promise<{ ok: boolean; error?: string }>
```

Endpoint: `POST https://googleads.googleapis.com/v17/customers/{customerId}:uploadClickConversions`

Headers:
- `developer-token: {GOOGLE_ADS_DEVELOPER_TOKEN}`
- `Authorization: Bearer {access_token}`
- `login-customer-id: {GOOGLE_ADS_LOGIN_CUSTOMER_ID}` (se manager)

### Meta Conversion API (`src/server/services/conversions/meta-capi.ts`)

```ts
sendMetaCAPI({
  event_name,  // 'Lead' | 'Purchase' | 'CompleteRegistration' | 'InitiateCheckout'
  event_id,    // ULID pra dedup com Pixel client-side
  event_time?, event_source_url?,
  user_data: { email?, phone?, fn?, ln?, fbp?, fbc?, client_ip_address?, client_user_agent?, external_id? },
  custom_data?: { currency?, value?, content_ids?, content_name? },
  action_source?,
}): Promise<{ ok: boolean; error?: string }>
```

Endpoint: `POST https://graph.facebook.com/v22.0/{pixel_id}/events`

Hash sha256 em `email/phone/fn/ln/external_id`. `fbp/fbc/ip/ua` em texto puro (padrão Meta).

`META_CAPI_TEST_EVENT_CODE` opcional → modo testing (Events Manager).

### Helper `fireConversion()` (`src/server/services/conversions/index.ts`)

```ts
fireConversion({
  source: 'lead_diagnostico' | 'lead_doubts' | 'lead_advisory'
        | 'purchase_vss' | 'purchase_advisory' | 'opportunity_won',
  email?, phone?, firstName?, lastName?,
  gclid?, fbclid?, fbp?, fbc?,
  external_id?,
  value?, order_id?,
  event_source_url?,
  client_ip?, client_user_agent?,
}) → { google: {...}, meta: {...} }
```

Mapeia source → Meta event + Google conversionAction (env vars). `Promise.all` paralelo. ULID `event_id` pra dedup com Pixel client-side. **Nunca throws** — sempre retorna shape `{ google, meta }` status.

## Env vars

Todas em `src/env.ts` como `optionalString`. Se faltar credenciais, service faz no-op com `console.warn` — nunca quebra.

```bash
# Google Ads
GOOGLE_ADS_CUSTOMER_ID=
GOOGLE_ADS_LOGIN_CUSTOMER_ID=        # se manager
GOOGLE_ADS_DEVELOPER_TOKEN=
GOOGLE_ADS_OAUTH_CLIENT_ID=
GOOGLE_ADS_OAUTH_CLIENT_SECRET=
GOOGLE_ADS_REFRESH_TOKEN=
GOOGLE_ADS_CONVERSION_ACTION_LEAD=   # resource name
GOOGLE_ADS_CONVERSION_ACTION_PURCHASE=

# Meta CAPI
META_PIXEL_ID=
META_CAPI_ACCESS_TOKEN=              # já existia em .env
META_CAPI_TEST_EVENT_CODE=           # opcional pra testing
```

Setup vars em prod via `node scripts/cf-secrets-from-env.mjs prod` (mergeia `.env` base + `.env.prod` overrides).

## Triggers (não wired ainda — Sprint posterior)

Os services estão prontos. Falta wirelar nos pontos de conversão:

| Trigger | Source | Onde |
|---|---|---|
| Submit `/diagnostico` | `lead_diagnostico` | `/api/forms/diagnostico/route.ts` |
| Submit popup dúvidas | `lead_doubts` | `/api/forms/duvidas/route.ts` |
| Submit Sprint/Conselho aplicação | `lead_advisory` | `/api/forms/advisory-aplicacao/route.ts` |
| Webhook MP success VSS | `purchase_vss` | `/api/payments/webhook/mercado-pago/route.ts` |
| Webhook MP success Advisory Sessão | `purchase_advisory` | mesmo handler |
| Admin marca opportunity Won | `opportunity_won` | `/api/admin/opportunities/[id]/route.ts` |

Padrão: `await fireConversion({ source, ...userData, value })` no try/catch que **não bloqueia** o handler principal. Pode ser via CF Queue pra retry.

## Tests / debug

- **Meta Events Manager**: usa `META_CAPI_TEST_EVENT_CODE` pra ver eventos chegando em modo testing antes de ativar prod.
- **Google Ads**: ver eventos em `Tools & Settings → Measurement → Conversions → Recent uploads`.
- **Logs**: cada chamada loga `[google-ads]` ou `[meta-capi]` com status — `wrangler tail --env prod` pra acompanhar live.

## Por que não pixel client-side só?

- iOS Safari + ITP corta cookies third-party → fbp/fbc com TTL curto, perde matching
- AdBlock bloqueia Pixel/GTM client → conversão perdida
- Server-side via CAPI passa direto pelo CDN/Workers, não tem essas restrições
- Best practice atual (2025+): combinar Pixel client + CAPI server (com `event_id` mesmo nos 2 → dedup)
