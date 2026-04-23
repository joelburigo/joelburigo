# Backend Proposal — VSS + Advisory

> **Status:** 🔄 EM DISCUSSÃO — v0.2 · atualizado 2026-04-23
>
> Doc vivo. Edita/comenta onde discordar. Cada decisão fechada vira ✅ e move pro log histórico no fim do doc.
>
> **Legenda:** ✅ fechado · 🔄 em discussão · 📌 proposta minha · ⏳ aguardando resposta · ❓ pergunta aberta

---

## 1. Escopo confirmado

### 1.1 Negócio
- ✅ **Sistema próprio** — nada terceirizado (sem Kiwify/Hotmart/Memberkit). Joel quer controle total.
- ✅ **Personalizado pra VSS + Advisory** — não é plataforma de cursos genérica.
- ✅ **Pagamento:** Stripe (BR — cartão + PIX + boleto + parcelamento 12×).

### 1.2 Infra e arquitetura
- ✅ **Hetzner primeiro** — aproveita stack Docker/Traefik/Watchtower + growth-infra (Postgres, n8n, Brevo, Stalwart) já rodando.
- ✅ **Migra pra Cloudflare depois** quando um gatilho claro disparar (§12).
- ✅ **Híbrido desde dia 1** — usa serviços CF "standalone" (R2, Stream, Turnstile) via API/SDK sem lock-in de runtime.
- ✅ **Monolito Astro** com arquitetura de código em camadas (§11). Separação lógica, não física.
- ✅ **Drizzle ORM** — portabilidade Postgres ↔ D1 garantida desde o início.
- ✅ **Adapter pattern** pra `storage` / `kv` / `queue` — swap de infra sem tocar lógica de negócio.

### 1.3 Conteúdo e mídia
- ✅ **Vídeo das mentorias:** Cloudflare Stream (HLS adaptativo + analytics + DRM).
- ✅ **VSS sem catálogo pesado de vídeo** — é playbook estruturado (15 módulos × 66 destravamentos) + mentorias ao vivo 48/ano.

### 1.4 Features out-of-scope (MVP)
- ❌ **Afiliados** — deixa pra depois. Quando precisar, adiciona tabela + Stripe Connect (+1 semana).
- ❌ **Multi-tenant/SaaS** — sistema é pro Joel, não pra revender.
- ❌ **App mobile** — sem planos por enquanto.

---

## 2. Stack final (Fase A — Hetzner-first)

### 2.1 Camada por camada

| Camada | Tecnologia | Papel |
|---|---|---|
| Runtime | **Astro SSR (Node 22)** no Docker existente | Render páginas + API routes |
| ORM | **Drizzle** (Postgres adapter agora, D1 adapter futuro) | Schema TS único, queries portáveis |
| DB relacional | **Postgres** (growth-infra, nova DB `joelburigo`) | users, purchases, progress, sessions |
| Sessions/KV | **Tabela Postgres** via adapter KV | Cookies JWT, rate-limit, cache hot. Zero infra extra. |
| Queue | **pg-boss** (postgres-based) via adapter Queue | Welcome email, onboarding async. Sem Redis. |
| Blob storage | **Cloudflare R2** via adapter Storage | Playbook MD · replays · assets. S3-compat SDK. |
| Vídeo | **Cloudflare Stream** | Mentorias ao vivo (upload replay + HLS + player embed) |
| CAPTCHA | **Cloudflare Turnstile** | Anti-bot em forms públicos |
| CDN/DNS | **Cloudflare proxied** (free tier) | Cache assets + DDoS protection |
| Pagamento | **Stripe BR** | Checkout + webhooks + Customer Portal |
| Email transacional | **Brevo API** (growth-infra) | Magic link, welcome, recuperação |
| Automação externa | **n8n** (growth-infra) | Slack, GA, fluxos cruzados |
| Agenda Advisory | **Cal.com** embed (free tier) | Reserva de sessão 1:1 |
| Monitoring | **Sentry** (free tier) + logs Docker | Erros + uptime |

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
│  │   /                     /api/stripe/*                  │  │
│  │   /vss · /advisory      /api/progress/*                │  │
│  │   /diagnostico · /blog  /api/forms/*                   │  │
│  │                         /api/mentorias/*               │  │
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
      │ Cloudflare   │    │  Stripe BR  │     │  Brevo API   │
      │ ───────────  │    │  ─────────  │     │  ──────────  │
      │ R2 (blobs)   │    │ Checkout    │     │ Email tx     │
      │ Stream (vid) │    │ Webhooks    │     │ (magic link, │
      │ Turnstile    │    │ Customer    │     │  welcome,    │
      │ CDN/DNS      │    │  Portal     │     │  recovery)   │
      └──────────────┘    └─────────────┘     └──────────────┘
                                   ▲
                                   │
                                   │ (webhooks recebidos em /api/stripe/webhook)
```

### 2.3 Por que híbrido Hetzner + CF standalone

📌 **Benefícios:**
- Zero friction (Astro já tá no Hetzner) — ganha 1-2 dias de setup
- Postgres sério (joins, agregações no admin dashboard) vs SQLite
- n8n/Brevo/Stalwart na mesma rede — latência zero
- R2 pra blobs grandes (mentorias de 90min × 48/ano = bastante GB) — sem egress fee
- Stream pra vídeo profissional (player embed, DRM, analytics) sem construir player
- Turnstile CAPTCHA grátis e simples
- CDN CF na borda reduz latência BR mesmo com backend em FRA

🔄 **Tradeoffs:**
- Retrabalho na migração futura: ~1 sprint extra. Mitigado por Drizzle + adapters.
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
  name TEXT NOT NULL,
  price_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'BRL',
  recurring BOOLEAN NOT NULL DEFAULT FALSE,
  stripe_price_id TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE purchases (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  product_id TEXT NOT NULL REFERENCES products(id),
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  status TEXT NOT NULL,                   -- pending · paid · refunded · chargeback
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL,
  paid_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_purchases_user ON purchases(user_id);
CREATE INDEX idx_purchases_status ON purchases(status);

CREATE TABLE subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  product_id TEXT NOT NULL REFERENCES products(id),
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL,                   -- active · past_due · canceled · ...
  current_period_end TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============ VSS CONTENT & PROGRESS ============
CREATE TABLE vss_phases (                 -- 7 fases
  id TEXT PRIMARY KEY,
  position INTEGER NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT
);

CREATE TABLE vss_modules (                -- 15 módulos
  id TEXT PRIMARY KEY,
  phase_id TEXT NOT NULL REFERENCES vss_phases(id),
  position INTEGER NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT
);

CREATE TABLE vss_destravamentos (         -- 66 destravamentos
  id TEXT PRIMARY KEY,
  module_id TEXT NOT NULL REFERENCES vss_modules(id),
  position INTEGER NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  estimated_minutes INTEGER NOT NULL DEFAULT 20,
  r2_content_key TEXT                     -- ex: vss/f1/m01/d01.md (path em R2)
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
  product_id TEXT NOT NULL,               -- sessao · sprint · conselho
  scheduled_at TIMESTAMPTZ,
  duration_min INTEGER,
  meeting_url TEXT,
  status TEXT NOT NULL,                   -- scheduled · completed · cancelled · no_show
  joel_notes_r2_key TEXT,                 -- path em R2 pro .md das notas do Joel
  client_preparation_md TEXT,             -- o que o cliente preparou antes
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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
- **Foreign keys** com `ON DELETE CASCADE` onde fizer sentido
- **Índices** criados onde query pattern justifica

---

## 4. Fluxos críticos

### 4.1 Compra VSS (R$ 1.997 à vista ou 12× R$ 166,42)

```
/vss → clica CTA → POST /api/checkout/vss
  ↓
- Valida Turnstile (CF)
- Rate-limit via KV adapter (table kv_store)
- Stripe Checkout Session:
    mode: 'payment'
    payment_methods: ['card', 'boleto', 'pix']
    line_items: [{ price: STRIPE_PRICE_VSS }]
    payment_method_options.card.installments.enabled: true
    success_url: /vss/obrigado?sid={CHECKOUT_SESSION_ID}
    cancel_url: /vss?cancelled=1
  ↓
Redirect → checkout.stripe.com
  ↓
Stripe webhook: checkout.session.completed
  ↓
POST /api/stripe/webhook (verifica signature com STRIPE_WEBHOOK_SECRET)
  ├─ upsert user (email + stripe_customer_id)
  ├─ insert purchase (status=paid)
  ├─ insert user_progress rows (todos os 66 destravamentos, completed_at=NULL)
  └─ enqueue via Queue adapter: { job: 'welcome_vss', data: { user_id } }
  ↓
pg-boss worker picks up job:
  ├─ Gera magic_link (15min)
  ├─ Brevo API → email "Bem-vindo ao VSS. Liga a Máquina →{magic_url}"
  ├─ POST webhook n8n (notifica Slack + GA + CRM)
  └─ Atualiza purchase.welcome_sent_at
```

📌 **Parcelamento Stripe BR:** suporta 12× no cartão. Juros do emissor (Stripe não cobra extra). 12× R$ 166,42 = R$ 1.997,04 — alinha com oferta.

### 4.2 Advisory — 3 modalidades

| Produto | Preço | Modo Stripe | Self-service? |
|---|---|---|---|
| Sessão avulsa | R$ 997 | `payment` one-time | ✅ Sim (checkout direto) |
| Sprint 30 dias | R$ 7.500 | `payment` one-time | 🔄 ou manual? (❓ §7.2) |
| Conselho Executivo | R$ 15.000/mês | `subscription` | 📌 Manual (Joel qualifica antes) |

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
  └─ Redirect → /area (se VSS) ou /advisory/dashboard (se Advisory)
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
  ├─ Valida session (user é aluno VSS ativo)
  ├─ Render <iframe src="https://iframe.videodelivery.net/{video_id}">
  └─ Player CF Stream (HLS adaptativo, mobile-friendly)
```

### 4.6 Webhooks Stripe — eventos tratados

| Evento | Ação |
|---|---|
| `checkout.session.completed` | Ativa compra (one-time) ou subscription |
| `customer.subscription.updated` | Atualiza status (active/past_due/canceled) |
| `customer.subscription.deleted` | Marca canceled_at, revoga acesso (grace period 7d) |
| `invoice.payment_failed` | Email "pagamento falhou" + dunning via Stripe |
| `charge.refunded` | Marca refunded, revoga acesso imediato |
| `charge.dispute.created` | Alerta Joel via Slack/email, aguarda resolução |

---

## 5. Stripe BR — métodos, taxas, Portal

### 5.1 Métodos de pagamento

| Método | Disponível | Taxa | Nota |
|---|---|---|---|
| Cartão | ✅ | 3.99% + R$0,39 | Parcelamento até 12× (juros do emissor, Stripe não cobra) |
| PIX | ✅ (nativo desde 2024) | ~1% | Settlement instant |
| Boleto | ✅ (nativo) | 3.45% | Compensa em até 3 dias úteis |

### 5.2 Customer Portal (zero código)

Habilita no dashboard Stripe → gera URL via API por cliente. Cliente gerencia:
- Cancela subscription
- Atualiza método de pagamento
- Baixa faturas/recibos
- Vê histórico de cobranças

### 5.3 Economia vs alternativas (10 vendas VSS/mês · R$ 19.970 volume)

| Gateway | Taxa média | Custo mensal estimado |
|---|---|---|
| Hotmart | 9.9% + R$1,99 | ~R$ 1.980 |
| Kiwify | 5% + R$1,99 | ~R$ 1.015 |
| **Stripe** | ~3-4% (mix) | **~R$ 700-800** |

**Economia vs Hotmart: ~R$ 1.200/mês.** Paga o dev em 1-2 meses.

---

## 6. Custos de infra

### 6.1 Hetzner (compartilhado com growth-infra)
- VPS já existe → **custo marginal zero** pro projeto
- Postgres shared no growth-infra → zero
- Backup já rodando → zero

### 6.2 Cloudflare standalone

| Serviço | Tier grátis | Estimativa mensal |
|---|---|---|
| R2 storage | 10 GB | **$0-5** (playbook MD + assets; mentorias vão pra Stream) |
| R2 operations | 1M class A + 10M class B | **$0** |
| Stream armazenamento | — | ~**$1-2/1000 min** (48 mentorias × 90min = ~$4-8/mês contínuo) |
| Stream views | — | **$5/1000 min assistidos** (variável — 100 alunos assistindo 1h/mês = $50/mês em pico) |
| Turnstile | ilimitado | **$0** |
| CDN/DNS | ilimitado free | **$0** |

**Total CF estimado:** $10-60/mês dependendo de engajamento com mentorias.

### 6.3 Stripe + Brevo

| Item | Custo |
|---|---|
| Stripe | Proporcional ao volume (~3-4% + R$0,39 por transação) |
| Brevo | Free até 300 emails/dia · $25+ se escalar (suficiente no início) |

### 6.4 Total operacional estimado (baseline)

~R$ 50-300/mês no primeiro ano (CF + Brevo se escalar). Taxas Stripe são proporcionais à receita.

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
- ❓ **PERGUNTA CRÍTICA:** é produto **SEPARADO** (SaaS próprio do Joel, já existe) ou parte desse backend?
  - Se SEPARADO: backend só gera credenciais no provisionamento e avisa aluno. Escopo atual.
  - Se MESMO SISTEMA: escopo dobra. Constrói CRM interno (pipeline, leads, automação, landing builder).

### 7.5 Conteúdo dos 66 destravamentos
- ❓ Texto já existe (em `docs/conteudo/partes/04-playbook-vss.md`) ou precisa produzir?
- Arquitetura suporta "libera gradualmente" (lock por data), mas operacionalmente precisa do material.

### 7.6 Migração de dados
- ❓ Tem alunos/clientes atuais em outro sistema pra importar?

### 7.7 Conta Cloudflare + Stripe
- ⏳ Conta CF com account ID? Se não, crio na sessão de setup.
- ⏳ Conta Stripe BR ativada (test + live keys)?

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
- [ ] Drizzle config + schema inicial (users, products, purchases, magic_links, kv_store, form_submissions)
- [ ] Adapters: `src/server/lib/{storage,kv,queue}.ts` com impls Hetzner
- [ ] pg-boss setup (worker no mesmo container via `Astro integration` ou thread)
- [ ] Magic link auth funcional (/entrar · /verificar)
- [ ] Stripe Checkout VSS (payment + parcelamento + webhooks)
- [ ] Forms migrados pra `/api/forms/*` (diagnostico, contato, advisory-aplicacao) + n8n webhook forward
- [ ] Turnstile integrado nos forms públicos
- [ ] R2 configurado + adapter testado (upload/get)
- [ ] Deploy staging + smoke test end-to-end

**Entregável:** site roda em CF Pages? não — continua Hetzner. VSS vende via Stripe. Forms capturam leads. Tudo em Postgres.

#### Sprint 2 — Área do aluno VSS (8-10 dias)
- [ ] Schema vss_phases/modules/destravamentos
- [ ] Populate inicial via seed script (vem de `docs/conteudo/partes/04-playbook-vss.md`)
- [ ] Upload de conteúdo MD pro R2 (script de migração)
- [ ] `/area` — dashboard aluno (progresso agregado, próximo destravamento)
- [ ] `/fase/[N]` — navegação da fase
- [ ] `/destravamento/[slug]` — render MD (remark/rehype) + botão "marcar feito"
- [ ] API `/api/progress/complete`
- [ ] Barra de progresso em tempo real

**Entregável:** aluno paga, acessa área, executa playbook, marca progresso.

#### Sprint 3 — Advisory (5-7 dias)
- [ ] Produtos Advisory em Stripe (3 price IDs)
- [ ] Checkout Sessão (self-service one-time)
- [ ] Checkout Sprint (self-service one-time — a confirmar §7.1)
- [ ] Fluxo Conselho manual (Joel envia link personalizado após qualificar)
- [ ] Webhook subscription.* handling completo
- [ ] `/advisory/dashboard` — cliente vê sessões + histórico
- [ ] Cal.com embed na agenda
- [ ] `/sessao/[id]` — detalhes + notas (se Joel compartilhou)

**Entregável:** Advisory end-to-end (checkout → agenda → sessão → follow-up).

#### Sprint 4 — Mentorias + Admin + Polish (6-8 dias)
- [ ] CRUD de `mentorias` (scheduled → live → recorded)
- [ ] Upload pro Cloudflare Stream (via dashboard inicialmente, API depois)
- [ ] Player Stream embed em `/area/mentoria/[id]` (gate por status VSS)
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

---

## 10. Perguntas bloqueantes pra Sprint 1

Pra começar:

1. ❓ **Growth CRM** é sistema separado ou parte desse backend? (§7.4 — crítico, muda escopo 2×)
2. ❓ **Conteúdo dos 66 destravamentos** existe pronto? (§7.5)
3. ❓ **Conta Stripe BR** ativada? Me passa test + live keys quando começar.
4. ❓ **Conta Cloudflare** ativa? Account ID + criação de R2 bucket + Stream enabled.
5. ❓ **Postgres growth-infra** — me passa acesso pra criar DB `joelburigo` (ou cria você e me dá DATABASE_URL).

Responde 1 e 2 (bloqueiam planejamento). 3-5 precisam só no momento do setup.

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
│   │   ├── stripe.ts          createCheckoutSession, handleWebhook, createPortalUrl
│   │   ├── vss.ts             listDestravamentos, markComplete, getUserProgress
│   │   ├── advisory.ts        listSessions, scheduleSession, addNotes
│   │   ├── mentorias.ts       listUpcoming, getReplay, markAttendance
│   │   ├── forms.ts           saveSubmission, forwardToN8n
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
│   │   ├── stripe/
│   │   │   ├── checkout.ts    POST — chama stripe.createCheckoutSession
│   │   │   └── webhook.ts     POST — verifica sig + roteia pra handler
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
- Migra schema Drizzle Postgres → D1 (quase drop-in)
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

| Componente | Fase A (Hetzner) | Fase B (Cloudflare) | Esforço |
|---|---|---|---|
| Runtime | Docker Node 22 | CF Pages + Workers | 2d (adapter change + test) |
| DB | Postgres shared | D1 (SQLite serverless) | 3d (schema migrate + dump/restore) |
| KV adapter impl | table Postgres | CF KV binding | 0.5d |
| Queue adapter impl | pg-boss | CF Queues | 1d |
| Storage adapter impl | R2-SDK HTTP | R2 binding | 0.5d |
| Secrets | env Docker | Wrangler secrets | 0.5d |
| Deploy | GH Actions → GHCR | Wrangler deploy | 1d |
| DNS | Traefik | CF Pages domain | 0.5d |

**Total estimado:** 1 sprint (5-7 dias) se Fase A foi bem arquitetada com adapters.

### 12.3 O que NÃO muda

- `src/server/services/*` (lógica de negócio)
- `src/components/*` (UI)
- `src/pages/*.astro` (routing)
- Drizzle schemas (só troca driver de pg → d1)
- Stripe/Brevo/n8n integrations
- R2/Stream/Turnstile (já usando)

### 12.4 Riscos da migração

- **D1 limitations** — sem joins pesados, limite de tamanho por row. Testar antes.
- **Worker limits** — 10ms CPU free / 30s paid. Jobs longos precisam ir pra Queues.
- **Cold starts** — edge tem cold start ~20-50ms. Raramente impacta percepção do user.
- **Migração de dados** — downtime curto pra dump → import em D1. Planejar janela.

### 12.5 Plano de migração (quando acontecer)

1. **Prep** — Testa Astro build com adapter CF em dev. Valida bindings.
2. **Schema migrate** — Drizzle migrate pra D1 em staging. Roda testes.
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
3. ❓ Growth CRM separado? (§7.4)
4. ❓ Conteúdo destravamentos existe? (§7.5)
5. ❓ Stripe BR ativo? (§7.7) — só no momento de começar implementar
6. ❓ Acesso Postgres growth-infra? (§10.5) — só no setup

Responde 3 e 4 pra eu refinar o Sprint 1 com números reais. Resto destrava on-the-fly.

**Próxima revisão:** quando você responder. Aí v0.3 do doc.
