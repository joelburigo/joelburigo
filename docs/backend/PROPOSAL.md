# Backend Proposal — VSS + Advisory

> **Status:** 🔄 EM DISCUSSÃO — v0.3 · atualizado 2026-04-24
>
> Doc vivo. Edita/comenta onde discordar. Cada decisão fechada vira ✅ e move pro log histórico no fim do doc.
>
> **Legenda:** ✅ fechado · 🔄 em discussão · 📌 proposta minha · ⏳ aguardando resposta · ❓ pergunta aberta

---

## 1. Escopo confirmado

### 1.1 Negócio

- ✅ **Sistema próprio** — nada terceirizado (sem Kiwify/Hotmart/Memberkit). Joel quer controle total.
- ✅ **Personalizado pra VSS + Advisory** — não é plataforma de cursos genérica.
- ✅ **Pagamento:** Stripe US (conta LLC) como gateway principal + Mercado Pago BR como fallback para parcelamento/PIX/boleto se necessário.

### 1.2 Infra e arquitetura

- ✅ **Hetzner primeiro** — aproveita stack Docker/Traefik/Watchtower + growth-infra (Postgres, n8n, Brevo, Stalwart) já rodando.
- ✅ **Migra pra Cloudflare depois** quando um gatilho claro disparar (§12).
- ✅ **Híbrido desde dia 1** — usa serviços CF "standalone" (R2, Stream, Turnstile) via API/SDK sem lock-in de runtime.
- ✅ **Monolito Astro** com arquitetura de código em camadas (§11). Separação lógica, não física.
- ✅ **Drizzle ORM** — portabilidade planejada Postgres ↔ D1, com compatibilidade testada por adapter e migração dedicada.
- ✅ **Adapter pattern** pra `storage` / `kv` / `queue` — swap de infra sem tocar lógica de negócio.

### 1.3 Conteúdo e mídia

- ✅ **Vídeo das mentorias:** Cloudflare Stream (HLS adaptativo + analytics + signed URLs/allowed origins).
- ✅ **VSS sem catálogo pesado de vídeo** — é playbook estruturado (15 módulos × 66 destravamentos) + mentorias ao vivo 48/ano.

### 1.4 Features out-of-scope (MVP)

- ❌ **Afiliados** — deixa pra depois. Quando precisar, adiciona tabela + Stripe Connect (+1 semana).
- ❌ **Multi-tenant/SaaS** — sistema é pro Joel, não pra revender.
- ❌ **App mobile** — sem planos por enquanto.

---

## 2. Stack final (Fase A — Hetzner-first)

### 2.1 Camada por camada

| Camada             | Tecnologia                                              | Papel                                                                                                      |
| ------------------ | ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Runtime            | **Astro SSR (Node 22)** no Docker existente             | Render páginas + API routes                                                                                |
| ORM                | **Drizzle** (Postgres adapter agora, D1 adapter futuro) | Schema TS único, queries portáveis                                                                         |
| DB relacional      | **Postgres** (growth-infra, nova DB `joelburigo`)       | users, purchases, entitlements, progress, sessions                                                         |
| Sessions/KV        | **Tabela Postgres** via adapter KV                      | Cookies JWT, rate-limit, cache hot. Zero infra extra.                                                      |
| Queue              | **pg-boss** (postgres-based) via adapter Queue          | Welcome email, onboarding async. Sem Redis.                                                                |
| Blob storage       | **Cloudflare R2** via adapter Storage                   | Playbook MD · replays · assets. S3-compat SDK.                                                             |
| Vídeo              | **Cloudflare Stream**                                   | Mentorias ao vivo (upload replay + HLS + player embed protegido por signed URL)                            |
| CAPTCHA            | **Cloudflare Turnstile**                                | Anti-bot em forms públicos                                                                                 |
| CDN/DNS            | **Cloudflare proxied** (free tier)                      | Cache assets + DDoS protection                                                                             |
| Pagamento          | **Stripe US + Mercado Pago BR**                         | Stripe para checkout principal/subscriptions; Mercado Pago para parcelamento local se Stripe US não cobrir |
| Email transacional | **Brevo API** (growth-infra)                            | Magic link, welcome, recuperação                                                                           |
| Automação externa  | **n8n** (growth-infra)                                  | Slack, GA, fluxos cruzados                                                                                 |
| Agenda Advisory    | **Cal.com** embed (free tier)                           | Reserva de sessão 1:1                                                                                      |
| Monitoring         | **Sentry** (free tier) + logs Docker                    | Erros + uptime                                                                                             |

### 2.2 Diagrama de alto nível

```
┌──────────────────────────────────────────────────────────────┐
│  Hetzner VPS (Docker compose · Traefik · Watchtower)         │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  joelburigo-site (Astro SSR · Node 22)                 │  │
│  │                                                        │  │
│  │  Pages                  API routes                     │  │
│  │  ──────                 ──────────                     │  │
│  │  Public:                /api/auth/*                    │  │
│  │   /                     /api/payments/*                │  │
│  │   /vendas-sem-segredos  /api/progress/*                │  │
│  │   /advisory            /api/mentorias/*                │  │
│  │   /diagnostico · /blog  /api/forms/*                   │  │
│  │                                                        │  │
│  │  Auth:                  /api/admin/*                   │  │
│  │   /entrar · /verificar                                 │  │
│  │                                                        │  │
│  │  App VSS:                                              │  │
│  │   /area · /fase/[N]                                    │  │
│  │   /destravamento/[slug]                                │  │
│  │                                                        │  │
│  │  App Advisory:                                         │  │
│  │   /advisory/dashboard                                  │  │
│  │   /sessao/[id]                                         │  │
│  │                                                        │  │
│  │  Admin:                                                │  │
│  │   /admin (leads · alunos · sessões · revenue)          │  │
│  └────────────────────────────────────────────────────────┘  │
│                    │                                         │
│                    ▼                                         │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Postgres (growth-infra, DB "joelburigo")              │  │
│  │    - Drizzle schemas                                   │  │
│  │    - pg-boss jobs table                                │  │
│  │    - KV-like table (sessions, rate-limit)              │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘

             │                    │                   │
             ▼                    ▼                   ▼
      ┌──────────────┐    ┌─────────────┐     ┌──────────────┐
      │ Cloudflare   │    │  Pagamentos │     │  Brevo API   │
      │ ───────────  │    │  ─────────  │     │  ──────────  │
      │ R2 (blobs)   │    │ Stripe US   │     │ Email tx     │
      │ Stream (vid) │    │ Webhooks    │     │ (magic link, │
      │ Turnstile    │    │ Customer    │     │  welcome,    │
      │ CDN/DNS      │    │ Portal + MP │     │  recovery)   │
      └──────────────┘    └─────────────┘     └──────────────┘
                                   ▲
                                   │
                                   │ (webhooks recebidos em /api/payments/*/webhook)
```

### 2.3 Por que híbrido Hetzner + CF standalone

📌 **Benefícios:**

- Zero friction (Astro já tá no Hetzner) — ganha 1-2 dias de setup
- Postgres sério (joins, agregações no admin dashboard) vs SQLite
- n8n/Brevo/Stalwart na mesma rede — latência zero
- R2 pra blobs grandes (playbook, transcrições, assets) — sem egress fee
- Stream pra vídeo profissional (player embed, HLS, analytics, signed URLs) sem construir player
- Turnstile CAPTCHA grátis e simples
- CDN CF na borda reduz latência BR mesmo com backend em FRA

🔄 **Tradeoffs:**

- Retrabalho na migração futura: ~1 sprint extra. Mitigado por Drizzle + adapters, mas ainda exige ajuste de tipos Postgres → SQLite/D1.
- Hetzner é 1 container → 1 instance. Escala vertical apenas. OK até ~500 alunos ativos concorrentes.
- Upload de arquivos grandes usa rede Hetzner→CF (R2 aceita via SDK). Latência de upload maior que se estivesse no mesmo rack.

---

## 3. Schema de dados (Postgres)

```sql
-- ============ USERS & AUTH ============
CREATE TABLE users (
  id TEXT PRIMARY KEY,                    -- ulid
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  whatsapp TEXT,
  stripe_customer_id TEXT UNIQUE,
  mercado_pago_customer_id TEXT UNIQUE,
  role TEXT NOT NULL DEFAULT 'user',      -- user · admin
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);
CREATE INDEX idx_users_email ON users(email);

CREATE TABLE magic_links (
  token TEXT PRIMARY KEY,                 -- random 32 bytes, base64url
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,        -- +15min
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- "KV" table (abstraído pelo adapter, troca por CF KV no futuro)
CREATE TABLE kv_store (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_kv_expires ON kv_store(expires_at) WHERE expires_at IS NOT NULL;
-- ex: session:<jwt_id> → {user_id, expires_at}
--     rate:forms:<ip> → {count, reset_at}

-- ============ PRODUCTS & PURCHASES ============
CREATE TABLE products (
  id TEXT PRIMARY KEY,                    -- 'vss' · 'advisory_sessao' · ...
  slug TEXT UNIQUE NOT NULL,              -- rota/identificador publico
  name TEXT NOT NULL,
  price_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'BRL',
  recurring BOOLEAN NOT NULL DEFAULT FALSE,
  access_kind TEXT NOT NULL,              -- lifetime · one_time · subscription · external
  gateway_default TEXT NOT NULL DEFAULT 'stripe', -- stripe · mercado_pago · manual
  stripe_price_id TEXT,
  mercado_pago_item_id TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE purchases (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  product_id TEXT NOT NULL REFERENCES products(id),
  gateway TEXT NOT NULL,                  -- stripe · mercado_pago · manual
  gateway_checkout_id TEXT,               -- stripe checkout session · mp preference
  gateway_payment_id TEXT,                -- stripe payment_intent · mp payment
  gateway_customer_id TEXT,
  status TEXT NOT NULL,                   -- pending · paid · refunded · chargeback
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL,
  raw_payload JSONB,
  paid_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  welcome_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_purchases_user ON purchases(user_id);
CREATE INDEX idx_purchases_status ON purchases(status);
CREATE UNIQUE INDEX idx_purchases_gateway_checkout ON purchases(gateway, gateway_checkout_id) WHERE gateway_checkout_id IS NOT NULL;
CREATE UNIQUE INDEX idx_purchases_gateway_payment ON purchases(gateway, gateway_payment_id) WHERE gateway_payment_id IS NOT NULL;

CREATE TABLE subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  product_id TEXT NOT NULL REFERENCES products(id),
  gateway TEXT NOT NULL,                  -- stripe · mercado_pago · manual
  gateway_subscription_id TEXT UNIQUE NOT NULL,
  gateway_customer_id TEXT,
  status TEXT NOT NULL,                   -- active · past_due · canceled · ...
  current_period_end TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- Acesso é derivado de compra/assinatura, mas fica materializado aqui.
-- UI e middleware consultam entitlements, não purchases/subscriptions direto.
CREATE TABLE entitlements (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES products(id),
  source_purchase_id TEXT REFERENCES purchases(id),
  source_subscription_id TEXT REFERENCES subscriptions(id),
  status TEXT NOT NULL,                   -- active · grace · expired · revoked
  starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ends_at TIMESTAMPTZ,                    -- null = vitalicio/perpetuo
  revoked_at TIMESTAMPTZ,
  revoked_reason TEXT,                    -- refund · chargeback · admin · subscription_canceled
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_entitlements_user ON entitlements(user_id);
CREATE INDEX idx_entitlements_product ON entitlements(product_id);
CREATE INDEX idx_entitlements_status ON entitlements(status);
CREATE UNIQUE INDEX idx_entitlements_active_unique ON entitlements(user_id, product_id) WHERE status IN ('active', 'grace');

-- Idempotencia de webhooks. Todo evento externo é "claimed" aqui antes de mutar dados.
CREATE TABLE payment_events (
  id TEXT PRIMARY KEY,
  gateway TEXT NOT NULL,                  -- stripe · mercado_pago
  gateway_event_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  object_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending · processing · processed · failed
  attempts INTEGER NOT NULL DEFAULT 0,
  payload JSONB NOT NULL,
  last_attempt_at TIMESTAMPTZ,
  processed_at TIMESTAMPTZ,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (gateway, gateway_event_id)
);
CREATE INDEX idx_payment_events_object ON payment_events(gateway, object_id);

-- ============ VSS CONTENT & PROGRESS ============
CREATE TABLE vss_phases (                 -- 7 fases
  id TEXT PRIMARY KEY,
  position INTEGER NOT NULL,
  code TEXT UNIQUE NOT NULL,              -- F1 · F2 · ...
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT
);

CREATE TABLE vss_modules (                -- 15 módulos
  id TEXT PRIMARY KEY,
  phase_id TEXT NOT NULL REFERENCES vss_phases(id),
  position INTEGER NOT NULL,
  code TEXT UNIQUE NOT NULL,              -- 04.M1 · 04.M2 · ...
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT
);

CREATE TABLE vss_destravamentos (         -- 66 destravamentos
  id TEXT PRIMARY KEY,
  module_id TEXT NOT NULL REFERENCES vss_modules(id),
  position INTEGER NOT NULL,
  code TEXT UNIQUE NOT NULL,              -- 04.M1.A1 · ...
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  estimated_minutes INTEGER NOT NULL DEFAULT 20,
  r2_content_key TEXT,                    -- ex: vss/f1/m01/d01.md (path em R2)
  content_hash TEXT,                      -- checksum do markdown publicado
  content_version TEXT,                   -- ex: 2026-04-24.1
  available_from TIMESTAMPTZ,
  published_at TIMESTAMPTZ
);

CREATE TABLE user_progress (
  user_id TEXT NOT NULL REFERENCES users(id),
  destravamento_id TEXT NOT NULL REFERENCES vss_destravamentos(id),
  completed_at TIMESTAMPTZ,
  notes_md TEXT,
  PRIMARY KEY (user_id, destravamento_id)
);

-- ============ MENTORIAS AO VIVO (VSS) ============
CREATE TABLE mentorias (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  topic TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_min INTEGER NOT NULL DEFAULT 90,
  zoom_url TEXT,
  cf_stream_id TEXT,                      -- Cloudflare Stream video ID
  transcript_r2_key TEXT,                 -- .md da transcrição
  status TEXT NOT NULL,                   -- scheduled · live · recorded · archived
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE mentoria_presencas (
  mentoria_id TEXT REFERENCES mentorias(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  checked_in_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (mentoria_id, user_id)
);

-- ============ ADVISORY ============
CREATE TABLE advisory_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  product_id TEXT NOT NULL REFERENCES products(id), -- sessao · sprint · conselho
  scheduled_at TIMESTAMPTZ,
  duration_min INTEGER,
  meeting_url TEXT,
  status TEXT NOT NULL,                   -- scheduled · completed · cancelled · no_show
  joel_notes_r2_key TEXT,                 -- path em R2 pro .md das notas do Joel
  client_preparation_md TEXT,             -- o que o cliente preparou antes
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Provisionamento de sistemas externos incluídos no produto.
-- Hoje: Growth CRM separado. O fornecedor externo não deve aparecer na UI/copy pública.
CREATE TABLE external_provisioning (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES products(id),
  entitlement_id TEXT REFERENCES entitlements(id),
  provider TEXT NOT NULL,                 -- growth_crm
  status TEXT NOT NULL,                   -- pending · provisioned · failed · revoked
  external_account_id TEXT,
  external_login_url TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  provisioned_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_external_provisioning_user ON external_provisioning(user_id);
CREATE INDEX idx_external_provisioning_status ON external_provisioning(status);

-- ============ FORMS (captura pública) ============
CREATE TABLE form_submissions (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,                     -- diagnostico · contato · advisory_aplicacao
  data JSONB NOT NULL,                    -- payload completo do form
  user_id TEXT REFERENCES users(id),      -- null se submeteu sem login
  email TEXT,
  ip TEXT,
  user_agent TEXT,
  forwarded_to_n8n_at TIMESTAMPTZ,
  notes_admin TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_form_submissions_type ON form_submissions(type);
CREATE INDEX idx_form_submissions_email ON form_submissions(email);

-- ============ ADMIN AUDIT ============
CREATE TABLE admin_audit (
  id TEXT PRIMARY KEY,
  admin_id TEXT NOT NULL REFERENCES users(id),
  action TEXT NOT NULL,
  target_table TEXT,
  target_id TEXT,
  payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============ pg-boss (queue) cria suas tabelas sozinho no schema 'pgboss' ============
-- Não precisa CREATE manual. Controlado pela lib.
```

📌 **Decisões de schema:**

- **IDs em ULID** (text, 26 chars, sortable por tempo)
- **Timestamps TIMESTAMPTZ** (timezone-aware)
- **JSONB** pra payloads flexíveis (forms, audit)
- **Entitlements** como fonte de verdade de acesso (compra/assinatura só alimenta acesso)
- **payment_events** com unique `(gateway, gateway_event_id)` pra idempotência de webhooks
- **Gateway-agnostic** em `purchases`/`subscriptions` (Stripe e Mercado Pago sem duplicar lógica)
- **Growth CRM externo** provisionado via `external_provisioning`, sem expor fornecedor na UI pública
- **Foreign keys** com `ON DELETE CASCADE` onde fizer sentido
- **Índices** criados onde query pattern justifica

---

## 4. Fluxos críticos

### 4.1 Compra VSS (R$ 1.997 à vista ou parcelado quando gateway suportar)

```
/vendas-sem-segredos → clica CTA → POST /api/payments/checkout/vss
  ↓
- Valida Turnstile (CF)
- Rate-limit via KV adapter (table kv_store)
- Escolhe gateway:
    - Stripe US (default): cartão, wallet/Link, subscriptions Advisory
    - Mercado Pago BR (fallback): parcelamento local, PIX, boleto, Checkout Pro
  ↓
- Cria checkout:
    Stripe Checkout Session OU Mercado Pago Preference
    mode: 'payment'
    line_items/items: VSS
    metadata/external_reference: purchase_id
    success_url/back_urls.success: /vss-compra-aprovada?sid={CHECKOUT_ID}
    cancel_url/back_urls.failure: /vendas-sem-segredos?cancelled=1
    pending_url/back_urls.pending: /vss-aguardando-pagamento
  ↓
Redirect → checkout externo
  ↓
Webhook: stripe.checkout.session.completed OU mercado_pago.payment/merchant_order
  ↓
POST /api/payments/{gateway}/webhook
  ├─ verifica signature/origem
  ├─ Claim payment_event (unique gateway_event_id; evento processed duplicado → 200; failed/pending pode retry)
  ├─ upsert user (email + gateway_customer_id)
  ├─ upsert purchase (status=paid)
  ├─ upsert entitlement (product_id='vss', status=active, ends_at=NULL)
  ├─ insert user_progress rows (todos os 66 destravamentos, completed_at=NULL)
  └─ enqueue via Queue adapter: { job: 'welcome_vss', data: { user_id } }
  ↓
pg-boss worker picks up job:
  ├─ Gera magic_link (15min)
  ├─ Brevo API → email "Bem-vindo ao VSS. Liga a Máquina →{magic_url}"
  ├─ Cria external_provisioning pending para Growth CRM
  ├─ POST webhook n8n (notifica Slack + GA + provisionamento privado)
  └─ Atualiza purchase.welcome_sent_at
```

📌 **Parcelamento:** com conta Stripe US, não assumir parcelamento BR nativo. Se a oferta precisar parcelamento local/PIX/boleto, Mercado Pago entra como gateway fallback via Checkout Pro. A copy pública continua falando da condição comercial; o backend decide o gateway.

### 4.2 Advisory — 3 modalidades

| Produto            | Preço         | Gateway default | Modo               | Self-service?                    |
| ------------------ | ------------- | --------------- | ------------------ | -------------------------------- |
| Sessão avulsa      | R$ 997        | Stripe US       | `payment` one-time | ✅ Sim (checkout direto)         |
| Sprint 30 dias     | R$ 7.500      | Stripe US       | `payment` one-time | 🔄 ou manual? (❓ §7.1)          |
| Conselho Executivo | R$ 15.000/mês | Stripe US       | `subscription`     | 📌 Manual (Joel qualifica antes) |

Mercado Pago só entra no Advisory se houver motivo comercial claro (parcelamento local BR, PIX/boleto ou aprovação melhor). Para subscriptions recorrentes, manter Stripe como caminho principal.

### 4.3 Login (magic link — sem senha)

```
/entrar → input email → POST /api/auth/request
  ├─ Valida Turnstile
  ├─ Rate-limit por IP via KV
  ├─ Lookup user por email (silent se não existe pra evitar enumeration)
  ├─ insert magic_links (token, expires=NOW()+15min)
  └─ Brevo API → "Clica pra entrar → /verificar?t={token}"
  ↓
GET /verificar?t={token}
  ├─ Query magic_links WHERE token=? AND used_at IS NULL AND expires_at > NOW()
  ├─ UPDATE magic_links SET used_at=NOW()
  ├─ Gera session JWT
  ├─ INSERT kv_store (key='session:<jwt_id>', value={user_id}, expires_at=NOW()+30d)
  ├─ Set-Cookie: jb_session=<jwt>; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000
  └─ Redirect → /area (se entitlement VSS ativo) ou /advisory/dashboard (se entitlement Advisory ativo)
```

### 4.4 Progresso dos 66 destravamentos

```
/destravamento/[slug]
  ├─ Server fetch: MD content do R2 via Storage adapter
  ├─ Render via remark/rehype (já usado no blog)
  └─ Footer com botão "Marcar como feito"
  ↓
Click → POST /api/progress/complete { destravamento_id }
  ├─ Valida session
  ├─ UPDATE user_progress SET completed_at=NOW() WHERE user_id=? AND destravamento_id=?
  └─ Return: { fase_percent_complete, total_percent_complete }
  ↓
UI atualiza barra via fetch + state update (sem reload)
```

### 4.5 Mentoria ao vivo — replay

```
Joel sobe MP4 pro Cloudflare Stream (dashboard CF ou via tus-js upload)
  → recebe video_id
  ↓
Admin cria registro em `mentorias` com cf_stream_id
  ↓
/area/mentorias/[id]
  ├─ Valida session + entitlement VSS ativo
  ├─ Gera signed token curto para cf_stream_id privado
  ├─ Render <iframe src="https://iframe.videodelivery.net/{signed_token}">
  └─ Player CF Stream (HLS adaptativo, mobile-friendly, allowed origins)
```

### 4.6 Webhooks de pagamento — eventos tratados

| Gateway      | Evento                                             | Ação                                                                  |
| ------------ | -------------------------------------------------- | --------------------------------------------------------------------- |
| Stripe       | `checkout.session.completed`                       | Ativa compra one-time ou cria subscription; cria/atualiza entitlement |
| Stripe       | `customer.subscription.updated`                    | Atualiza subscription + entitlement (active/grace/expired)            |
| Stripe       | `customer.subscription.deleted`                    | Marca canceled_at, revoga ou coloca em grace period 7d                |
| Stripe       | `invoice.payment_failed`                           | Email "pagamento falhou" + dunning via Stripe                         |
| Stripe       | `charge.refunded`                                  | Marca refunded, revoga entitlement imediato                           |
| Stripe       | `charge.dispute.created`                           | Alerta Joel via Slack/email, entitlement em revisão                   |
| Mercado Pago | `payment` aprovado                                 | Marca purchase paid, cria entitlement VSS                             |
| Mercado Pago | `payment` pending/in_process                       | Mantém purchase pending; mostra `/vss-aguardando-pagamento`           |
| Mercado Pago | `payment` rejected/cancelled/refunded/charged_back | Atualiza purchase e revoga entitlement se já existia                  |

Regra: todo webhook faz claim em `payment_events` antes de qualquer mutação. Evento `processed` não reprocessa; evento `failed` pode ser reprocessado com `attempts` e log de erro.

---

## 5. Pagamentos — Stripe US + Mercado Pago BR

### 5.1 Estratégia

| Necessidade                                           | Gateway             | Motivo                                                                       |
| ----------------------------------------------------- | ------------------- | ---------------------------------------------------------------------------- |
| Checkout principal, cartão internacional, wallet/Link | **Stripe US**       | Conta LLC existente, Checkout maduro, Customer Portal, subscriptions fortes  |
| Conselho Executivo recorrente                         | **Stripe US**       | Billing/subscriptions/dunning resolvidos                                     |
| Parcelamento local para público BR                    | **Mercado Pago BR** | Checkout Pro oferece parcelamento e métodos locais para comprador brasileiro |
| PIX/boleto quando necessário                          | **Mercado Pago BR** | Melhor aderência local se a conta Stripe US não oferecer métodos BR          |

📌 Não congelar taxa no doc: Stripe e Mercado Pago mudam pricing por país, moeda, risco e acordo comercial. No setup, conferir taxas oficiais e simular ticket VSS/Advisory antes de publicar condição.

### 5.2 Stripe US — base

Referência operacional:

- Cartões domésticos US: Stripe lista 2.9% + US$0.30 no pricing padrão.
- Cartões internacionais e conversão de moeda têm adicionais.
- Installments no Stripe existem por mercados específicos (ex: Mexico/Japan/Mastercard Installments); com conta US, não assumir parcelamento brasileiro.

### 5.3 Mercado Pago BR — fallback de métodos locais

Checkout Pro pode ser usado como redirecionamento externo para:

- Cartão de crédito/débito
- Parcelamento local
- PIX/boleto/meios offline
- Retorno por `back_urls` + reconciliação via webhooks

Regra de implementação: criar Mercado Pago Preference com `external_reference = purchase_id` e receber webhooks em `/api/payments/mercado-pago/webhook`.

### 5.4 Customer Portal (Stripe)

Habilita no dashboard Stripe → gera URL via API por cliente. Cliente gerencia:

- Cancela subscription
- Atualiza método de pagamento
- Baixa faturas/recibos
- Vê histórico de cobranças

### 5.5 Economia vs alternativas (10 vendas VSS/mês · R$ 19.970 volume)

| Gateway                        | Taxa média     | Custo mensal estimado                         |
| ------------------------------ | -------------- | --------------------------------------------- |
| Hotmart                        | 9.9% + R$1,99  | ~R$ 1.980                                     |
| Kiwify                         | 5% + R$1,99    | ~R$ 1.015                                     |
| **Stripe/Mercado Pago direto** | depende do mix | tende a ser menor, mas precisa simulação real |

**Tese:** gateway direto ainda deve ganhar de marketplace em custo e controle, mas o doc não deve prometer economia fixa sem mix real de cartão internacional, FX, parcelamento, PIX/boleto e chargebacks.

### 5.6 Fontes oficiais a checar no setup

- Stripe US pricing: https://stripe.com/us/pricing
- Stripe installments: https://docs.stripe.com/payments/installments
- Mercado Pago Checkout Pro: https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/overview

---

## 6. Custos de infra

### 6.1 Hetzner (compartilhado com growth-infra)

- VPS já existe → **custo marginal zero** pro projeto
- Postgres shared no growth-infra → zero
- Backup já rodando → zero

### 6.2 Cloudflare standalone

| Serviço              | Tier grátis              | Estimativa mensal                                                                                              |
| -------------------- | ------------------------ | -------------------------------------------------------------------------------------------------------------- |
| R2 storage           | 10 GB                    | **$0-5** (playbook MD + assets; mentorias vão pra Stream)                                                      |
| R2 operations        | 1M class A + 10M class B | **$0**                                                                                                         |
| Stream armazenamento | —                        | **$5/1000 min armazenados** (48 mentorias × 90min/ano = 4.320 min = ~$21,60/ano acumulado se nada for apagado) |
| Stream delivery      | —                        | **$1/1000 min entregues** (100 alunos assistindo 1h/mês = 6.000 min = ~$6/mês)                                 |
| Turnstile            | ilimitado                | **$0**                                                                                                         |
| CDN/DNS              | ilimitado free           | **$0**                                                                                                         |

**Total CF estimado:** $5-30/mês no início, subindo conforme biblioteca de replays e consumo real.

### 6.3 Stripe + Brevo

| Item                | Custo                                                            |
| ------------------- | ---------------------------------------------------------------- |
| Stripe/Mercado Pago | Proporcional ao volume e mix de métodos                          |
| Brevo               | Free até 300 emails/dia · $25+ se escalar (suficiente no início) |

### 6.4 Total operacional estimado (baseline)

~R$ 50-300/mês no primeiro ano (CF + Brevo se escalar). Taxas dos gateways são proporcionais à receita e ao mix de métodos.

Fontes oficiais CF:

- Stream pricing: https://developers.cloudflare.com/stream/pricing/
- R2 pricing: https://developers.cloudflare.com/r2/pricing/

---

## 7. Pontos em aberto 🔄

### 7.1 Advisory Sprint 30d — self-service ou manual?

- 📌 **Minha proposta:** self-service (é mais barato que Conselho, cliente qualificado paga direto).
- ❓ Confirma?

### 7.2 Agendamento Advisory

- 📌 **Cal.com embed** (free tier resolve). Economiza 1 semana.
- 🔄 Alternativa: agenda custom com slots no Stripe.
- ❓ Confirma Cal.com?

### 7.3 Emissão de Nota Fiscal

- 📌 **Manual no MVP** (Joel emite no sistema dele). Automatiza via eNotas/Nfe.io quando volume justificar.
- ❓ Confirma manual?

### 7.4 Growth CRM (incluído 12 meses no VSS)

- ✅ **Decisão:** sistema separado por enquanto.
- Backend VSS só registra/provisiona acesso via `external_provisioning` e dispara fluxo privado de onboarding.
- Importante: não expor publicamente o fornecedor externo. Copy pública fala apenas "Growth CRM".
- Futuro desejado: trazer recursos essenciais para a própria plataforma, depois que VSS/App provar uso real.

### 7.5 Conteúdo dos 66 destravamentos

- ✅ Texto base existe em `docs/conteudo/partes/04-playbook-vss.md`.
- Trabalho técnico: gerar manifest com 7 fases, 15 módulos, 66 destravamentos, slugs, `content_hash` e versão; depois publicar Markdown renderizável em R2.
- Arquitetura suporta "libera gradualmente" por `available_from`.

### 7.6 Migração de dados

- ❓ Tem alunos/clientes atuais em outro sistema pra importar?

### 7.7 Conta Cloudflare + pagamentos

- ⏳ Conta CF com account ID? Se não, crio na sessão de setup.
- ⏳ Conta Stripe US da LLC (test + live keys).
- ⏳ Conta Mercado Pago BR só vira necessária se confirmarmos parcelamento local/PIX/boleto no checkout.

### 7.8 Admin area — escopo do MVP

- 📌 **Minha proposta MVP admin:**
  - Dashboard: receita do mês, MRR, alunos ativos, leads recentes
  - Tabela de `form_submissions` com filtro + export CSV
  - Tabela de `users` (alunos + Advisory) com status
  - Tabela de `advisory_sessions` (próximas + passadas)
  - CRUD simples de `mentorias` (scheduled → recorded)
- 🔄 Features extras (bulk actions, relatórios custom, segmentação) ficam pra v2.
- ❓ Confirma esse escopo ou quer algo a mais?

---

## 8. Plano de implementação (roadmap)

### Fase A — Hetzner (agora)

#### Sprint 1 — Foundation + Forms + Checkout VSS (8-10 dias)

**Objetivo:** desbloqueia captura de leads + venda VSS.

- [ ] Setup Postgres DB `joelburigo` no growth-infra
- [ ] Drizzle config + schema inicial (users, products, purchases, entitlements, payment_events, magic_links, kv_store, form_submissions)
- [ ] Adapters: `src/server/lib/{storage,kv,queue}.ts` com impls Hetzner
- [ ] pg-boss setup (worker no mesmo container via `Astro integration` ou thread)
- [ ] Magic link auth funcional (/entrar · /verificar)
- [ ] Payment router + Stripe Checkout VSS (payment + webhooks idempotentes)
- [ ] Mercado Pago Checkout Pro fallback (parcelamento/PIX/boleto) se condição comercial exigir
- [ ] Forms migrados pra `/api/forms/*` (diagnostico, contato, advisory-aplicacao) + n8n webhook forward
- [ ] Turnstile integrado nos forms públicos
- [ ] R2 configurado + adapter testado (upload/get)
- [ ] Deploy staging + smoke test end-to-end

**Entregável:** site roda em CF Pages? não — continua Hetzner. VSS vende via Stripe. Forms capturam leads. Tudo em Postgres.

#### Sprint 2 — Área do aluno VSS (8-10 dias)

- [ ] Schema vss_phases/modules/destravamentos
- [ ] Populate inicial via seed script (vem de `docs/conteudo/partes/04-playbook-vss.md`)
- [ ] Gerar manifest versionado a partir de `docs/conteudo/partes/04-playbook-vss.md`
- [ ] Upload de conteúdo MD pro R2 (script de migração com `content_hash`)
- [ ] `/area` — dashboard aluno (progresso agregado, próximo destravamento)
- [ ] `/fase/[N]` — navegação da fase
- [ ] `/destravamento/[slug]` — render MD (remark/rehype) + botão "marcar feito"
- [ ] API `/api/progress/complete`
- [ ] Barra de progresso em tempo real

**Entregável:** aluno paga, acessa área, executa playbook, marca progresso.

#### Sprint 3 — Advisory (5-7 dias)

- [ ] Produtos Advisory em Stripe US (3 price IDs)
- [ ] Checkout Sessão (self-service one-time)
- [ ] Checkout Sprint (self-service one-time — a confirmar §7.1)
- [ ] Fluxo Conselho manual (Joel envia link personalizado após qualificar)
- [ ] Webhook subscription.\* handling completo + atualização de entitlements
- [ ] `/advisory/dashboard` — cliente vê sessões + histórico
- [ ] Cal.com embed na agenda
- [ ] `/sessao/[id]` — detalhes + notas (se Joel compartilhou)

**Entregável:** Advisory end-to-end (checkout → agenda → sessão → follow-up).

#### Sprint 4 — Mentorias + Admin + Polish (6-8 dias)

- [ ] CRUD de `mentorias` (scheduled → live → recorded)
- [ ] Upload pro Cloudflare Stream (via dashboard inicialmente, API depois)
- [ ] Player Stream embed em `/area/mentoria/[id]` (gate por entitlement VSS + signed URL)
- [ ] `/admin` — dashboard Joel (MVP §7.8)
- [ ] Tabelas com filtro + export CSV
- [ ] Sentry integrado
- [ ] Backup Postgres + rotação (via growth-infra)
- [ ] Lighthouse/perf audit final
- [ ] Runbook operacional (incident response, rollback, secret rotation)

**Entregável:** sistema completo em produção. Joel operacional.

**Total Fase A:** ~5-6 semanas focadas.

### Fase B — Migração pra Cloudflare (futuro, quando gatilho disparar)

Ver §12.

---

## 9. Decisões tomadas (log histórico)

_Append-only. Toda decisão fechada sobe pra cá com data._

- **2026-04-23** — ✅ Sistema próprio, sem terceirização de área de membros.
- **2026-04-23** — ✅ Pagamento: Stripe.
- **2026-04-23** — ✅ Infra Fase A: Hetzner (aproveita growth-infra).
- **2026-04-23** — ✅ Infra Fase B: migra pra Cloudflare quando gatilho (§12) disparar.
- **2026-04-23** — ✅ Híbrido desde dia 1: R2 + Stream + Turnstile standalone.
- **2026-04-23** — ✅ Monolito Astro com arquitetura em camadas (§11).
- **2026-04-23** — ✅ Drizzle ORM (portável Postgres ↔ D1).
- **2026-04-23** — ✅ Adapter pattern pra storage/kv/queue.
- **2026-04-23** — ✅ Auth: magic link sem senha.
- **2026-04-23** — ✅ IDs: ULID.
- **2026-04-23** — ✅ Vídeo mentorias: Cloudflare Stream.
- **2026-04-23** — ✅ DB: Postgres (growth-infra, nova DB `joelburigo`).
- **2026-04-23** — ✅ Queue: pg-boss (sem Redis).
- **2026-04-23** — ✅ KV: tabela Postgres via adapter.
- **2026-04-23** — ✅ Afiliados: out-of-scope MVP.
- **2026-04-24** — ✅ Rota canônica VSS: `/vendas-sem-segredos`.
- **2026-04-24** — ✅ Pagamentos: Stripe US (LLC) default; Mercado Pago BR fallback para parcelamento/PIX/boleto se necessário.
- **2026-04-24** — ✅ Growth CRM: sistema separado; backend apenas provisiona acesso privado, sem expor fornecedor externo.
- **2026-04-24** — ✅ Acesso por `entitlements`, não por consulta direta em compras/assinaturas.
- **2026-04-24** — ✅ Webhooks idempotentes via `payment_events`.
- **2026-04-24** — ✅ Conteúdo VSS base existe em `docs/conteudo/partes/04-playbook-vss.md`.

---

## 10. Perguntas bloqueantes pra Sprint 1

Pra começar:

1. ✅ **Growth CRM** separado por enquanto; provisionamento privado.
2. ✅ **Conteúdo dos 66 destravamentos** existe como base em `docs/conteudo/partes/04-playbook-vss.md`.
3. ❓ **Stripe US LLC** ativo? Me passa test + live keys quando começar.
4. ❓ **Mercado Pago BR** vai ser usado no MVP? Só precisa se parcelamento/PIX/boleto forem obrigatórios no checkout inicial.
5. ❓ **Conta Cloudflare** ativa? Account ID + criação de R2 bucket + Stream enabled.
6. ❓ **Postgres growth-infra** — me passa acesso pra criar DB `joelburigo` (ou cria você e me dá DATABASE_URL).

Agora os bloqueios principais são acesso a Stripe/CF/Postgres e a decisão comercial sobre Mercado Pago no MVP.

Outras perguntas (7.1, 7.2, 7.3, 7.6, 7.8) dá pra destravar no meio do caminho — não impedem começar.

---

## 11. Arquitetura de código em camadas

Monolito Astro com separação lógica. Organização de `src/`:

```
src/
├── server/                    ← backend puro (zero imports de UI/Astro components)
│   ├── db/
│   │   ├── schema.ts          Drizzle schema (exporta tipos)
│   │   ├── client.ts          drizzle(postgres)
│   │   └── seed.ts            Popular dados iniciais (products, vss_phases, etc)
│   │
│   ├── services/              Lógica de negócio
│   │   ├── auth.ts            requestMagicLink, verifyMagicLink, createSession, revokeSession
│   │   ├── users.ts           upsertUserByEmail, getUserById, getUserByStripeCustomer
│   │   ├── payments.ts        escolhe gateway, cria purchase, orquestra webhooks
│   │   ├── stripe.ts          createCheckoutSession, handleWebhook, createPortalUrl
│   │   ├── mercado-pago.ts    createPreference, handleWebhook
│   │   ├── entitlements.ts    grantAccess, revokeAccess, hasAccess
│   │   ├── vss.ts             listDestravamentos, markComplete, getUserProgress
│   │   ├── advisory.ts        listSessions, scheduleSession, addNotes
│   │   ├── mentorias.ts       listUpcoming, getReplay, markAttendance
│   │   ├── forms.ts           saveSubmission, forwardToN8n
│   │   ├── external.ts        provision Growth CRM (privado)
│   │   ├── admin.ts           dashboard stats, exportCsv, auditLog
│   │   └── email.ts           sendMagicLink, sendWelcome, sendReceipt (via Brevo API)
│   │
│   ├── jobs/                  Queue handlers (registrados no pg-boss)
│   │   ├── welcome-vss.ts
│   │   ├── welcome-advisory.ts
│   │   ├── forward-form-n8n.ts
│   │   └── reminder-mentoria.ts
│   │
│   └── lib/                   Adapters + utilitários server-only
│       ├── storage.ts         Interface + impl R2 (S3 SDK)
│       ├── kv.ts              Interface + impl Postgres (kv_store table)
│       ├── queue.ts           Interface + impl pg-boss
│       ├── ulid.ts            ULID generation
│       ├── hash.ts            Secure token gen + verify
│       └── turnstile.ts       CAPTCHA validation
│
├── pages/
│   ├── api/                   Thin HTTP layer — validação + chama services
│   │   ├── auth/
│   │   │   ├── request.ts     POST — chama auth.requestMagicLink
│   │   │   └── logout.ts      POST — chama auth.revokeSession
│   │   ├── payments/
│   │   │   ├── checkout.ts    POST — chama payments.createCheckout
│   │   │   ├── stripe/
│   │   │   │   └── webhook.ts POST — verifica sig + roteia pra handler
│   │   │   └── mercado-pago/
│   │   │       └── webhook.ts POST — verifica origem + roteia pra handler
│   │   ├── progress/
│   │   │   └── complete.ts    POST — chama vss.markComplete
│   │   ├── forms/
│   │   │   ├── diagnostico.ts POST
│   │   │   ├── contato.ts     POST
│   │   │   └── advisory.ts    POST (aplicação)
│   │   └── admin/
│   │       ├── stats.ts       GET (protegido por role)
│   │       └── submissions.ts GET (protegido)
│   │
│   ├── verificar.astro        Magic link landing (chama auth.verifyMagicLink server-side)
│   ├── entrar.astro           Form de email
│   ├── area.astro             Dashboard VSS (protegido)
│   ├── fase/[n].astro         Lista destravamentos da fase
│   ├── destravamento/[slug].astro  Render MD + botão complete
│   ├── advisory/
│   │   ├── dashboard.astro    Dashboard Advisory (protegido)
│   │   └── sessao/[id].astro
│   ├── admin/
│   │   └── index.astro        Dashboard admin (protegido por role=admin)
│   └── [resto das pages públicas já existentes...]
│
├── components/                UI (zero imports de server/)
│   ├── ui/                    primitives (Logo, Button, Card, etc — já existem)
│   ├── layout/                Header, Footer, MobileMenu
│   ├── home/                  sections home
│   ├── sections/              features (Advisory, VSS, etc — já existem)
│   └── app/                   🆕 componentes da área logada
│       ├── AppShell.astro     Shell pra pages logadas (nav + content)
│       ├── ProgressBar.astro
│       ├── DestravamentoCard.astro
│       └── SessionCard.astro
│
├── middleware.ts              Astro middleware — sessionGuard pra rotas protegidas
│
└── env.d.ts                   Types dos env vars
```

### Regras de camada

1. **`server/`** nunca importa de `components/` ou `pages/`. É backend puro.
2. **`components/`** nunca importa de `server/`. Só recebe dados via props.
3. **`pages/api/*`** é o único lugar que conecta os dois. Thin HTTP layer:
   - Valida input (Zod)
   - Checa auth (middleware)
   - Chama service (`src/server/services/*`)
   - Retorna JSON/redirect

### Testabilidade

- `server/services/*` testável unit (só mockar DB e APIs externas)
- `server/jobs/*` idem
- `components/*` testável via Playwright (já temos audit.mjs pronto)

### Portabilidade pra Fase B (CF)

Quando migrar:

- Troca `src/server/lib/storage.ts` impl de R2-SDK pra R2-binding direto
- Troca `src/server/lib/kv.ts` impl de Postgres pra CF KV binding
- Troca `src/server/lib/queue.ts` impl de pg-boss pra CF Queues
- Migra schema Drizzle Postgres → D1 com revisão explícita de tipos (`TIMESTAMPTZ`, `JSONB`, partial indexes, defaults)
- `server/services/*` e `components/*` **não mudam**

---

## 12. Fase B — Migração futura pra Cloudflare

### 12.1 Gatilhos pra disparar migração

Migra **apenas quando** um desses acontecer:

- 🚨 **Performance** — latência consistente > 300ms TTFB pra user BR (raro, CDN CF já ajuda)
- 🚨 **Escala** — > 500 alunos ativos concorrentes OU lançamento que derruba container
- 🚨 **Custo** — Hetzner começa a caro vs uso real (improvável no volume atual)
- 🚨 **Manutenção** — Joel/equipe não quer mais gerenciar VPS
- 🚨 **Expansão** — app mobile ou integração que pede edge global

### 12.2 O que muda (se migrar)

| Componente           | Fase A (Hetzner)  | Fase B (Cloudflare)    | Esforço                                             |
| -------------------- | ----------------- | ---------------------- | --------------------------------------------------- |
| Runtime              | Docker Node 22    | CF Pages + Workers     | 2d (adapter change + test)                          |
| DB                   | Postgres shared   | D1 (SQLite serverless) | 4-6d (type mapping + schema migrate + dump/restore) |
| KV adapter impl      | table Postgres    | CF KV binding          | 0.5d                                                |
| Queue adapter impl   | pg-boss           | CF Queues              | 1d                                                  |
| Storage adapter impl | R2-SDK HTTP       | R2 binding             | 0.5d                                                |
| Secrets              | env Docker        | Wrangler secrets       | 0.5d                                                |
| Deploy               | GH Actions → GHCR | Wrangler deploy        | 1d                                                  |
| DNS                  | Traefik           | CF Pages domain        | 0.5d                                                |

**Total estimado:** 1 sprint forte (7-10 dias) se Fase A foi bem arquitetada com adapters e testes de compatibilidade.

### 12.3 O que NÃO muda

- `src/server/services/*` (lógica de negócio)
- `src/components/*` (UI)
- `src/pages/*.astro` (routing)
- Drizzle como camada de query (schema exige migração Postgres → SQLite/D1)
- Stripe/Brevo/n8n integrations
- R2/Stream/Turnstile (já usando)

### 12.4 Riscos da migração

- **D1 limitations** — SQLite, row/string/BLOB limit, bound parameters, throughput single-writer e diferenças de tipo. Testar antes.
- **Worker limits** — 10ms CPU free / 30s paid. Jobs longos precisam ir pra Queues.
- **Cold starts** — edge tem cold start ~20-50ms. Raramente impacta percepção do user.
- **Migração de dados** — downtime curto pra dump → import em D1. Planejar janela.

Fonte oficial: https://developers.cloudflare.com/d1/platform/limits/

### 12.5 Plano de migração (quando acontecer)

1. **Prep** — Testa Astro build com adapter CF em dev. Valida bindings.
2. **Schema migrate** — mapear tipos Postgres → SQLite/D1, gerar migrations em staging e rodar testes.
3. **Dump + import** — Exporta Postgres → importa D1. Valida integridade.
4. **DNS freeze** — TTL baixo em DNS (pre-migração).
5. **Cutover** — Deploy CF Pages, muda DNS pra CF, monitora.
6. **Rollback prep** — Hetzner fica no ar por 7 dias, pronto pra voltar se algo quebrar.
7. **Decommission** — Depois de 7 dias ok, desliga Hetzner desse projeto.

---

## 13. Perguntas pra destravar próxima rodada

Pra Sprint 1 começar, preciso:

1. ✅ Confirmou stack Hetzner-first + CF standalone
2. ✅ Confirmou Stream pra vídeo
3. ✅ Growth CRM separado e privado (§7.4)
4. ✅ Conteúdo destravamentos existe como base (§7.5)
5. ❓ Stripe US LLC ativo? (§7.7) — só no momento de começar implementar
6. ❓ Mercado Pago entra no MVP? Decide pela condição de parcelamento/PIX/boleto (§7.7)
7. ❓ Acesso Postgres growth-infra? (§10.6) — só no setup

Próxima rodada: fechar se o MVP já nasce com Mercado Pago ou se lança só com Stripe US e adiciona MP assim que a copy exigir parcelamento local.

**Próxima revisão:** quando fechar Mercado Pago no MVP. Aí v0.4 do doc.
