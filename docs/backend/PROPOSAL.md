# Backend Proposal — VSS + Advisory

> **Status:** 🔄 EM DISCUSSÃO — v0.5 · atualizado 2026-04-24
>
> Doc vivo. Edita/comenta onde discordar. Cada decisão fechada vira ✅ e move pro log histórico no fim do doc.
>
> **Legenda:** ✅ fechado · 🔄 em discussão · 📌 proposta minha · ⏳ aguardando resposta · ❓ pergunta aberta
>
> **Mudanças v0.3 → v0.4:**
>
> - Stack migrou de Astro para **Next.js App Router monolito** (Opção C fechada)
> - **Mercado Pago BR** virou default; Stripe US vira fallback pra cartão internacional
> - VSS deixa de ser "MD + checkbox" e passa a ser **workspace com agente IA (Nível 2→3)** que ajuda o aluno a aplicar os 6Ps e gera artifacts
> - Postgres **dedicado** (novo container no compose), não mais shared com growth-infra
> - Conselho Executivo sai de Stripe subscription e vira cobrança manual (PIX/boleto + NF)
> - Adicionado Sprint 0: migração Astro → Next + design system em 5 camadas
> - Webhook MP com HMAC `x-signature` explícito
> - Worker pg-boss em **processo separado** (mesma imagem, CMD diferente)
> - **Blog integrado ao sistema**: posts gerenciados em DB via CMS admin. 12 posts atuais em `src/content/blog/*.md` migrados via script. Imagens dos posts migradas pra R2.

---

## 1. Escopo confirmado

### 1.1 Negócio

- ✅ **Sistema próprio** — nada terceirizado (sem Kiwify/Hotmart/Memberkit). Joel quer controle total.
- ✅ **Personalizado pra VSS + Advisory** — não é plataforma de cursos genérica.
- ✅ **Pagamento default:** Mercado Pago BR (Checkout Pro) — parcelamento local, PIX, boleto, cartão BR. Stripe US (LLC) entra como fallback pra cartão internacional e eventuais clientes fora do Brasil.
- ✅ **VSS = workspace guiado por agente IA** — aluno acessa cada destravamento com copiloto (Nível 2→3) que faz perguntas dos 6Ps, desafia, gera artifacts (ICP, cadência, scripts, pricing, plano) que o aluno edita/exporta e aplica. Não é chat genérico — é um fluxo estruturado por destravamento.

### 1.2 Infra e arquitetura

- ✅ **Hetzner primeiro** — aproveita stack Docker/Traefik/Watchtower + growth-infra (n8n, Brevo, Stalwart) já rodando. Adicionamos um **Postgres dedicado** no mesmo compose.
- ✅ **Migra pra Cloudflare depois** quando um gatilho claro disparar (§12).
- ✅ **Híbrido desde dia 1** — usa serviços CF "standalone" (R2, Stream, Turnstile) via API/SDK sem lock-in de runtime.
- ✅ **Monolito Next.js App Router (Node 22)** — site público + área logada + API routes na mesma base de código. `output: 'standalone'` pra Docker enxuto.
- ✅ **Drizzle ORM** — portabilidade planejada Postgres ↔ D1, com compatibilidade testada por adapter e migração dedicada.
- ✅ **Adapter pattern** pra `storage` / `kv` / `queue` / `llm` — swap de infra/provider sem tocar lógica de negócio.
- ✅ **Worker pg-boss em processo separado** (mesma imagem Docker, serviço `joelburigo-worker` no compose com CMD dedicado) — deploy/escala separados do HTTP.

### 1.3 Conteúdo e mídia

- 🚨 **`docs/conteudo/` é INTOCÁVEL na migração e permanente** — estratégia, copy, marca, marketing, templates. Fonte única de verdade humana. Fica fora do build Docker (já tá em `.dockerignore`) e fora do pacote Next. Qualquer referência a tom, vocabulário, cases ou copy **consulta aqui**, nunca reinventa (regra já no CLAUDE.md). Migração Astro → Next faz **cp** de strings 1:1 do Astro atual, não reescreve nada.
- ✅ **Vídeo das mentorias:** Cloudflare Stream (HLS adaptativo + analytics + signed URLs/allowed origins).
- ✅ **Flows dos destravamentos VSS no repo** — `src/content/vss/[slug].ts` com metadados + system prompts + tool defs + output schema. Derivados manualmente de `docs/conteudo/partes/04-playbook-vss.md`. O runtime nunca lê `docs/`; quem traduz `docs` → `src/content/vss` somos nós (humanos + agente), com revisão por diff no git.
- ✅ **Artifacts do aluno em R2** — outputs de cada destravamento (ICPs, cadências, planos) ficam em R2 com versionamento. Exports CSV/PDF também.
- ✅ **Blog gerenciado no DB** — posts, imagens de capa, tags, revisões e SEO geridos via admin CMS. Migração inicial: **cp literal** dos 12 posts MD pro DB (sem reescrita) + **cp literal** das imagens de `src/assets/images/blog/` pra `public/assets/images/blog/` (mesmas URLs relativas, zero alteração no conteúdo MD). R2 entra depois se volume justificar.

### 1.4 Features out-of-scope (MVP)

- ❌ **Afiliados** — deixa pra depois. Quando precisar, adiciona tabela + Stripe Connect/MP marketplace (+1 semana).
- ❌ **Multi-tenant/SaaS** — sistema é pro Joel, não pra revender.
- ❌ **App mobile** — sem planos por enquanto. Next PWA resolve no navegador mobile.

---

## 2. Stack final (Fase A — Hetzner-first)

### 2.1 Camada por camada

| Camada                 | Tecnologia                                                                                                                     | Papel                                                                                                              |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| Runtime                | **Next.js 15 App Router** (Node 22) em Docker                                                                                  | Render páginas (RSC + streaming) + route handlers + server actions                                                 |
| LLM SDK                | **Vercel AI SDK v5** (multi-provider)                                                                                          | Streaming, tool calls, structured outputs, generative UI                                                           |
| LLM provider default   | **OpenAI** (`@ai-sdk/openai`) — key já disponível                                                                              | `gpt-4o` ou `gpt-4.1` (a confirmar) pro chat/coach                                                                 |
| LLM provider opcional  | **Anthropic** (`@ai-sdk/anthropic`)                                                                                            | Troca via env `LLM_PROVIDER=anthropic` — zero reescrita de código                                                  |
| Model router           | Adapter próprio em `server/lib/llm.ts` + provider select                                                                       | Abstração fina pra trocar provider/modelo por flow                                                                 |
| ORM                    | **Drizzle** (Postgres adapter agora, D1 adapter futuro)                                                                        | Schema TS único, queries portáveis                                                                                 |
| DB relacional          | **Postgres 16 per-project** (container `pg-joelburigo-site` no growth-infra compose, rede `db-back` + pgbouncer em `db-front`) | users, purchases, entitlements, progress, sessions, agent state                                                    |
| Sessions/KV            | **Tabela Postgres** via adapter KV                                                                                             | Cookies JWT, rate-limit, cache hot. Zero infra extra.                                                              |
| Queue                  | **pg-boss** em processo separado via adapter Queue                                                                             | Welcome email, onboarding async, agent jobs longos. Sem Redis.                                                     |
| Blob storage           | **Cloudflare R2** via adapter Storage                                                                                          | Artifacts do aluno · replays processados · exports CSV/PDF                                                         |
| Vídeo ao vivo + replay | **Cloudflare Stream Live Input**                                                                                               | OBS → RTMP do CF → HLS ao vivo na plataforma → **replay automático** disponível ao fim da live (sem upload manual) |
| CAPTCHA                | **Cloudflare Turnstile**                                                                                                       | Anti-bot em forms públicos                                                                                         |
| CDN/DNS                | **Cloudflare proxied** (free tier)                                                                                             | Cache assets + DDoS protection                                                                                     |
| Pagamento default      | **Mercado Pago BR** (Checkout Pro)                                                                                             | Parcelamento local, PIX, boleto, cartão BR                                                                         |
| Pagamento fallback     | **Stripe US** (LLC)                                                                                                            | Cartão internacional, clientes fora do Brasil                                                                      |
| Email transacional     | **Brevo API** (growth-infra)                                                                                                   | Magic link, welcome, recuperação, notificações                                                                     |
| Automação externa      | **n8n** (growth-infra)                                                                                                         | Slack, GA, fluxos cruzados, provisionamento Growth CRM                                                             |
| Agenda Advisory        | **Cal.com** embed (free tier)                                                                                                  | Reserva de sessão 1:1                                                                                              |
| Monitoring             | **Sentry** (free tier) + logs Docker                                                                                           | Erros + uptime + traces de agente                                                                                  |
| Styling                | **Tailwind v4** + design tokens `--jb-*` (Terminal Growth)                                                                     | Mesmos tokens do Astro atual, 100% portáveis                                                                       |
| UI primitives          | **shadcn/ui** customizado pra Terminal Growth                                                                                  | Radius 0, brutalist shadows, fire/acid overrides                                                                   |

### 2.2 Diagrama de alto nível

```
┌──────────────────────────────────────────────────────────────────┐
│  Hetzner VPS (Docker compose · Traefik · Watchtower)             │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  joelburigo-site (Next.js 15 · Node 22 · standalone)       │  │
│  │                                                            │  │
│  │  Public (SSG/RSC):         API routes:                     │  │
│  │   /                         /api/auth/*                    │  │
│  │   /vendas-sem-segredos      /api/payments/*                │  │
│  │   /advisory                 /api/agent/*  (streaming)      │  │
│  │   /diagnostico · /blog      /api/progress/*                │  │
│  │                             /api/mentorias/*               │  │
│  │  Auth:                      /api/forms/*                   │  │
│  │   /entrar · /verificar      /api/admin/*                   │  │
│  │                                                            │  │
│  │  App VSS (protected):                                      │  │
│  │   /area · /fase/[slug]                                     │  │
│  │   /destravamento/[slug]   ← workspace com agente           │  │
│  │                                                            │  │
│  │  App Advisory (protected):                                 │  │
│  │   /advisory/dashboard · /sessao/[id]                       │  │
│  │                                                            │  │
│  │  Admin (role=admin):                                       │  │
│  │   /admin (receita · alunos · leads · agente usage)         │  │
│  └────────────────────────────────────────────────────────────┘  │
│                      │                                           │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  joelburigo-worker (mesma imagem · CMD=node jobs/runner)   │  │
│  │    - pg-boss consume                                       │  │
│  │    - welcome_vss · welcome_advisory · forward_form_n8n     │  │
│  │    - agent_long_task · reminder_mentoria                   │  │
│  └────────────────────────────────────────────────────────────┘  │
│                      │                                           │
│                      ▼                                           │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  joelburigo-pg (Postgres 16 · volume dedicado)             │  │
│  │    - Drizzle schemas                                       │  │
│  │    - pg-boss jobs table                                    │  │
│  │    - KV-like table (sessions, rate-limit)                  │  │
│  │    - Agent conversations/messages/artifacts/usage          │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘

         │                  │                    │                  │
         ▼                  ▼                    ▼                  ▼
  ┌─────────────┐   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
  │ Cloudflare  │   │  Pagamentos  │   │  Anthropic   │   │  Brevo API   │
  │ ───────────│   │  ─────────── │   │  API         │   │  ──────────  │
  │ R2 (blobs)  │   │ MP BR (def)  │   │  ──────────  │   │ Email tx     │
  │ Stream (vid)│   │ Stripe US    │   │ Sonnet 4.6   │   │ (magic link, │
  │ Turnstile   │   │ (fallback)   │   │ Opus 4.7     │   │  welcome,    │
  │ CDN/DNS     │   │ Webhooks     │   │ streaming    │   │  notify)     │
  └─────────────┘   └──────────────┘   └──────────────┘   └──────────────┘
```

### 2.3 Por que híbrido Hetzner + CF standalone + Next monolito

📌 **Benefícios:**

- **Monolito TS único** — backend + frontend + agente IA no mesmo deploy, sem CORS ou duplicação de types.
- **RSC + streaming** — contexto do aluno (6Ps + histórico) carrega no server component e flui pra UI que stream-conversa com Claude via AI SDK. UX top sem montar SPA.
- **Postgres sério** (joins, agregações, admin dashboard, agente history) vs SQLite.
- **n8n/Brevo/Stalwart na mesma rede** — latência zero.
- **R2 pra artifacts** — cada aluno gera ICP/cadência/plano; R2 é o storage natural pra isso (sem egress fee, S3-compat).
- **Stream pra vídeo profissional** (player embed, HLS, analytics, signed URLs) sem construir player.
- **Turnstile CAPTCHA** grátis e simples.
- **CDN CF na borda** reduz latência BR mesmo com backend em FRA.

🔄 **Tradeoffs:**

- **Migração Astro → Next** custa 10-14 dias (Sprint 0, §8). É o preço de entrada pra ter 1 stack só pelos próximos anos.
- Retrabalho na migração futura pra CF: ~1 sprint extra. Mitigado por Drizzle + adapters, mas ainda exige ajuste de tipos Postgres → SQLite/D1.
- Hetzner é 1 container web + 1 worker → escala vertical apenas. OK até ~500 alunos ativos concorrentes com agente.
- Upload de artifacts usa rede Hetzner→CF R2 (aceita via SDK). Latência de upload maior que se estivesse no mesmo rack.
- **Custo variável de LLM** — ver §6. Precisa de budget por aluno/mês pra não virar buraco.

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

-- Perfil 6P do aluno — contexto pro agente
CREATE TABLE user_profiles (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  empresa_nome TEXT,
  segmento TEXT,
  faturamento_atual_cents BIGINT,
  meta_12m_cents BIGINT,
  ticket_medio_cents BIGINT,
  gargalo_principal TEXT,
  -- Os 6 Ps consolidados (md renderizável)
  produto_md TEXT,
  pessoas_md TEXT,
  precificacao_md TEXT,
  processos_md TEXT,
  performance_md TEXT,
  propaganda_md TEXT,
  raw_data JSONB NOT NULL DEFAULT '{}'::jsonb,  -- campos estruturados extras
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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

-- ============ PRODUCTS & PURCHASES ============
CREATE TABLE products (
  id TEXT PRIMARY KEY,                    -- 'vss' · 'advisory_sessao' · ...
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  price_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'BRL',
  recurring BOOLEAN NOT NULL DEFAULT FALSE,
  access_kind TEXT NOT NULL,              -- lifetime · one_time · subscription · external
  gateway_default TEXT NOT NULL DEFAULT 'mercado_pago', -- mercado_pago · stripe · manual
  stripe_price_id TEXT,
  mercado_pago_item_id TEXT,
  -- Budget LLM por entitlement ativo (null = padrão global)
  monthly_llm_token_quota BIGINT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE purchases (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  product_id TEXT NOT NULL REFERENCES products(id),
  gateway TEXT NOT NULL,                  -- mercado_pago · stripe · manual
  gateway_checkout_id TEXT,               -- MP preference · Stripe checkout session
  gateway_payment_id TEXT,                -- MP payment · Stripe payment_intent
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
  gateway TEXT NOT NULL,
  gateway_subscription_id TEXT UNIQUE NOT NULL,
  gateway_customer_id TEXT,
  status TEXT NOT NULL,
  current_period_end TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

CREATE TABLE entitlements (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES products(id),
  source_purchase_id TEXT REFERENCES purchases(id),
  source_subscription_id TEXT REFERENCES subscriptions(id),
  status TEXT NOT NULL,                   -- active · grace · expired · revoked
  starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ends_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  revoked_reason TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_entitlements_user ON entitlements(user_id);
CREATE INDEX idx_entitlements_product ON entitlements(product_id);
CREATE INDEX idx_entitlements_status ON entitlements(status);
CREATE UNIQUE INDEX idx_entitlements_active_unique ON entitlements(user_id, product_id) WHERE status IN ('active', 'grace');

CREATE TABLE payment_events (
  id TEXT PRIMARY KEY,
  gateway TEXT NOT NULL,                  -- mercado_pago · stripe
  gateway_event_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  object_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
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
  code TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT
);

CREATE TABLE vss_modules (                -- 15 módulos
  id TEXT PRIMARY KEY,
  phase_id TEXT NOT NULL REFERENCES vss_phases(id),
  position INTEGER NOT NULL,
  code TEXT UNIQUE NOT NULL,
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
  -- Conteúdo + flow definido em TS no repo (src/content/vss/<slug>.ts)
  flow_kind TEXT NOT NULL DEFAULT 'agent_guided',  -- agent_guided · self_paced · hybrid
  content_version TEXT NOT NULL,                   -- ex: 2026-04-24.1
  available_from TIMESTAMPTZ,
  published_at TIMESTAMPTZ
);

CREATE TABLE user_progress (
  user_id TEXT NOT NULL REFERENCES users(id),
  destravamento_id TEXT NOT NULL REFERENCES vss_destravamentos(id),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  last_artifact_id TEXT,                  -- referência ao artifact "oficial" do destravamento
  minutes_spent INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, destravamento_id)
);

-- ============ AGENT (LLM) ============
CREATE TABLE agent_conversations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  destravamento_id TEXT REFERENCES vss_destravamentos(id),
  topic TEXT,
  status TEXT NOT NULL DEFAULT 'active',  -- active · completed · archived
  context_snapshot JSONB,                  -- snapshot do user_profile no momento
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_agent_conversations_user ON agent_conversations(user_id);
CREATE INDEX idx_agent_conversations_destravamento ON agent_conversations(destravamento_id);

CREATE TABLE agent_messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL REFERENCES agent_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL,                      -- user · assistant · tool · system
  content JSONB NOT NULL,                  -- formato AI SDK (text + tool_calls + tool_results)
  tokens_input INTEGER,
  tokens_output INTEGER,
  tokens_cached INTEGER,
  model TEXT,
  cost_cents NUMERIC(10, 4),               -- fração de centavo por chamada
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_agent_messages_conversation ON agent_messages(conversation_id);
CREATE INDEX idx_agent_messages_created ON agent_messages(created_at);

CREATE TABLE agent_artifacts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  conversation_id TEXT REFERENCES agent_conversations(id) ON DELETE SET NULL,
  destravamento_id TEXT REFERENCES vss_destravamentos(id),
  kind TEXT NOT NULL,                      -- icp · cadencia · script · pricing · plan · ...
  title TEXT NOT NULL,
  content_md TEXT,
  r2_export_key TEXT,                      -- export opcional (csv, pdf, xlsx)
  version INTEGER NOT NULL DEFAULT 1,
  parent_artifact_id TEXT REFERENCES agent_artifacts(id),
  is_current BOOLEAN NOT NULL DEFAULT TRUE,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_agent_artifacts_user ON agent_artifacts(user_id);
CREATE INDEX idx_agent_artifacts_destravamento ON agent_artifacts(destravamento_id);
CREATE INDEX idx_agent_artifacts_current ON agent_artifacts(user_id, destravamento_id) WHERE is_current;

-- Agregado mensal de uso pra controle de quota e custo
CREATE TABLE agent_usage (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  period_month TEXT NOT NULL,              -- '2026-04'
  tokens_input BIGINT NOT NULL DEFAULT 0,
  tokens_output BIGINT NOT NULL DEFAULT 0,
  tokens_cached BIGINT NOT NULL DEFAULT 0,
  cost_cents NUMERIC(10, 2) NOT NULL DEFAULT 0,
  conversation_count INTEGER NOT NULL DEFAULT 0,
  UNIQUE (user_id, period_month)
);

-- ============ BLOG ============
CREATE TABLE blog_posts (
  id TEXT PRIMARY KEY,                    -- ulid
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  excerpt TEXT,
  content_md TEXT NOT NULL,               -- markdown bruto (fonte de verdade)
  cover_image_path TEXT,                  -- path agnóstico (ex: /assets/images/blog/<slug>.webp ou r2://...)
  cover_image_alt TEXT,
  author_id TEXT REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'draft',   -- draft · scheduled · published · archived
  published_at TIMESTAMPTZ,
  scheduled_for TIMESTAMPTZ,
  reading_minutes INTEGER,
  seo_title TEXT,
  seo_description TEXT,
  og_image_path TEXT,
  view_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_status ON blog_posts(status);
CREATE INDEX idx_blog_posts_published ON blog_posts(published_at DESC) WHERE status = 'published';

CREATE TABLE blog_tags (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT
);

CREATE TABLE blog_post_tags (
  post_id TEXT NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  tag_id TEXT NOT NULL REFERENCES blog_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- Histórico de revisões pra rollback editorial
CREATE TABLE blog_revisions (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  title TEXT,
  content_md TEXT,
  saved_by TEXT REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_blog_revisions_post ON blog_revisions(post_id, created_at DESC);

-- Imagens inline do post (além da capa) — múltiplos tamanhos responsivos
CREATE TABLE blog_images (
  id TEXT PRIMARY KEY,
  post_id TEXT REFERENCES blog_posts(id) ON DELETE CASCADE,
  path TEXT NOT NULL,                     -- /assets/images/blog/... ou r2://blog/images/...
  alt TEXT,
  width INTEGER,
  height INTEGER,
  size_bytes INTEGER,
  variant TEXT,                           -- original · 480w · 720w · 1080w · 1920w
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_blog_images_post ON blog_images(post_id);

-- ============ MENTORIAS AO VIVO (VSS) ============
CREATE TABLE mentorias (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  topic TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_min INTEGER NOT NULL DEFAULT 90,
  -- Cloudflare Stream Live Input (OBS publica via RTMP, replay automático)
  cf_live_input_id TEXT,                   -- UID do live input no CF
  cf_playback_id TEXT,                     -- UID pra player HLS público (signed)
  rtmp_url TEXT,                           -- rtmp://live.cloudflare.com:1935/live/ (sensível, só admin)
  rtmp_stream_key TEXT,                    -- stream key (sensível, só admin)
  live_status TEXT NOT NULL DEFAULT 'idle',-- idle · live · ended · recording_ready
  recording_ready_at TIMESTAMPTZ,
  transcript_r2_key TEXT,
  status TEXT NOT NULL,                    -- scheduled · live · recorded · archived
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
  product_id TEXT NOT NULL REFERENCES products(id),
  scheduled_at TIMESTAMPTZ,
  duration_min INTEGER,
  meeting_url TEXT,
  status TEXT NOT NULL,                    -- scheduled · completed · cancelled · no_show
  joel_notes_r2_key TEXT,
  client_preparation_md TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE external_provisioning (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES products(id),
  entitlement_id TEXT REFERENCES entitlements(id),
  provider TEXT NOT NULL,                  -- growth_crm
  status TEXT NOT NULL,                    -- pending · provisioned · failed · revoked
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
  type TEXT NOT NULL,                      -- diagnostico · contato · advisory_aplicacao
  data JSONB NOT NULL,
  user_id TEXT REFERENCES users(id),
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

-- pg-boss cria suas tabelas sozinho no schema 'pgboss'
```

📌 **Decisões de schema:**

- **IDs em ULID** (text, 26 chars, sortable por tempo)
- **Timestamps TIMESTAMPTZ** (timezone-aware)
- **JSONB** pra payloads flexíveis (forms, audit, agent content, profile raw_data)
- **Entitlements** como fonte de verdade de acesso
- **payment_events** com unique `(gateway, gateway_event_id)` pra idempotência
- **Gateway-agnostic** (MP + Stripe sem duplicar lógica)
- **user_profiles** é o contexto principal do agente (cached no system prompt, não reenviado a cada turno)
- **agent_artifacts** versionados (parent_artifact_id + is_current) — aluno pode revisitar histórico
- **agent_usage** agregado mensal — base pra quota e billing insight
- **Growth CRM externo** provisionado via `external_provisioning`, sem expor fornecedor na UI pública

---

## 4. Fluxos críticos

### 4.1 Compra VSS (R$ 1.997, parcelado ou PIX via Mercado Pago)

```
/vendas-sem-segredos → clica CTA → POST /api/payments/checkout
  ↓
- Valida Turnstile (CF)
- Rate-limit via KV adapter
- Escolhe gateway (default MP; Stripe se usuário optar cartão internacional)
- Cria preference MP:
    external_reference: purchase_id
    items: VSS R$ 1997
    back_urls: { success: /vss-compra-aprovada?sid=..., failure: ..., pending: ... }
    auto_return: approved
    notification_url: /api/payments/mercado-pago/webhook
  ↓
Redirect → Checkout Pro (MP)
  ↓
Webhook MP: notification.payment
  ↓
POST /api/payments/mercado-pago/webhook
  ├─ Verifica HMAC x-signature (obrigatório em 2026)
  ├─ Claim payment_event (unique gateway_event_id)
  ├─ Fetch payment completo via MP API (idempotent)
  ├─ upsert user (email + mercado_pago_customer_id)
  ├─ upsert purchase (status=paid)
  ├─ upsert entitlement (product_id='vss', status=active, ends_at=NULL)
  ├─ insert user_progress rows (66 destravamentos, started=NULL)
  ├─ INSERT user_profile stub (campos null, aluno preenche no onboarding)
  └─ enqueue via Queue adapter: { job: 'welcome_vss', data: { user_id } }
  ↓
Worker pg-boss (processo separado):
  ├─ Gera magic_link (15min)
  ├─ Brevo API → email "Bem-vindo ao VSS. Liga a Máquina →{magic_url}"
  ├─ Cria external_provisioning pending para Growth CRM
  ├─ POST webhook n8n (notifica Slack + GA + provisionamento privado)
  └─ Atualiza purchase.welcome_sent_at
```

### 4.2 Advisory — 3 modalidades

| Produto            | Preço         | Gateway default     | Modo                | Self-service?                    |
| ------------------ | ------------- | ------------------- | ------------------- | -------------------------------- |
| Sessão avulsa      | R$ 997        | Mercado Pago BR     | `payment` one-time  | ✅ Sim (checkout direto)         |
| Sprint 30 dias     | R$ 7.500      | Mercado Pago BR     | `payment` one-time  | ✅ Sim (confirmado §7.1)         |
| Conselho Executivo | R$ 15.000/mês | **Manual (PIX/NF)** | Cobrança off-system | 📌 Manual (Joel qualifica antes) |

Conselho **sai de subscription Stripe** por 3 motivos (discussão v0.3):

- Cliente PJ BR de R$15k/mês exige NFS-e mensal (Stripe US não emite)
- R$15k recorrente em USD flutua com FX
- Cartão BR corporativo rejeita cobrança recorrente em USD com frequência

Conselho = Joel envia boleto/PIX mensal + emite NFS-e no sistema dele. Backend só registra purchase com `gateway='manual'` e mantém entitlement ativo.

### 4.3 Login (magic link — sem senha)

```
/entrar → input email → POST /api/auth/request
  ├─ Valida Turnstile
  ├─ Rate-limit por IP via KV
  ├─ Lookup user por email (silent se não existe)
  ├─ insert magic_links (token, expires=NOW()+15min)
  └─ Brevo API → "Clica pra entrar → /verificar?t={token}"
  ↓
GET /verificar?t={token}
  ├─ Query magic_links WHERE token=? AND used_at IS NULL AND expires_at > NOW()
  ├─ UPDATE magic_links SET used_at=NOW()
  ├─ Gera session JWT
  ├─ INSERT kv_store (key='session:<jwt_id>', value={user_id}, expires_at=NOW()+30d)
  ├─ Set-Cookie: jb_session=<jwt>; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000
  └─ Redirect → /area (VSS ativo) · /advisory/dashboard (Advisory) · /onboarding (se user_profile vazio)
```

### 4.4 Jornada do aluno VSS (fluxo principal)

Princípio: **aluno nunca encara textarea vazia**. Tudo é conversa com agente que já conhece o contexto do aluno (6Ps declarados + artifacts anteriores).

#### 4.4.a Onboarding — primeiro login

```
Primeiro login → redireciona /onboarding (user_profile.updated_at IS NULL)

/onboarding (Server Component)
  ├─ Carrega: dados do purchase (nome, email)
  ├─ Renderiza <OnboardingChat> (Client Component)
  └─ System prompt:
        "Você é o copiloto VSS acolhendo o {nome} no primeiro dia.
         Faça 8-12 perguntas calmas, numa conversa leve (não questionário).
         Mapeie: empresa, oferta, operação, números, gargalo, 6Ps rascunho.
         Use updateProfile() a cada campo aprendido, não espere ter tudo.
         Ao final, resuma o que entendeu e pergunta se tá certo."

Turnos típicos (~10-15 min):
  Agente: "Prazer, {nome}. Bora começar me contando: qual a sua empresa e
           o que vocês vendem?"
  Aluno:  "É a AcmeSales, consultoria de vendas pra SaaS B2B..."
  → updateProfile({empresa_nome: "AcmeSales", segmento: "consultoria..."})

  Agente: "Legal. Faz quanto tempo? Quantas pessoas no time?"
  Aluno:  "Abri em 2022, somos eu + 3 SDRs."
  → updateProfile({...})

  Agente: "E hoje, como vocês conseguem clientes? Mais prospecção ativa,
           inbound, indicação?"
  ... etc.

  Agente: "Faturamento do ano passado, por alto? Meta pros próximos 12?"
  → updateProfile({faturamento_atual_cents, meta_12m_cents})

  Agente: "Se eu te perguntasse agora qual o maior gargalo — o que mais
           te tira o sono — qual você escolheria?"
  → updateProfile({gargalo_principal})

  [6Ps resumo]: "Me conta em 2-3 frases cada: seu Produto, Pessoas,
                 Precificação, Processos, Performance, Propaganda."
  → updateProfile({produto_md, pessoas_md, ...})

Final do onboarding:
  ├─ Agente exibe "Resumo da sua empresa" (lê user_profile)
  ├─ Aluno revisa/edita inline qualquer campo
  ├─ Confirma → Redirect /area
  └─ Tempo total: 10-15 min
```

Se aluno prefere pular, tem botão "preencher manualmente" que abre form clássico mapeado pros mesmos campos. Agente fica disponível pra enriquecer depois.

#### 4.4.b Dashboard /area

```
/area (Server Component)
  ├─ Valida session + entitlement VSS ativo
  ├─ Carrega: user_profile, progresso agregado, artifacts recentes
  ├─ Calcula: próximo destravamento recomendado baseado em gargalo_principal
  └─ Renderiza:
        - Saudação com nome + empresa
        - Próximo passo em destaque ("Atacar {gargalo}: comece por {destravamento}")
        - Progresso visual 7 fases (barras segmentadas)
        - Grid de artifacts gerados (ICP, cadência, plano...) editáveis
        - Link pra perfil (revisar 6Ps)
        - Próxima mentoria agendada
```

#### 4.4.c Workspace do destravamento

```
/destravamento/[slug] (Server Component)
  ├─ Valida session + entitlement VSS ativo (middleware)
  ├─ Carrega no server:
  │     - destravamento metadata (title, flow, tools)
  │     - user_profile (6Ps atuais + empresa + números)
  │     - conversations anteriores desse destravamento
  │     - artifacts anteriores do mesmo kind
  │     - quota restante do mês (agent_usage)
  ├─ Renderiza shell: header contextual, chat pane, artifact pane lateral
  └─ Passa contextSnapshot pro Client Component <AgentChat>

<AgentChat> (Client Component com useChat do AI SDK)
  ├─ Primeira mensagem do agente já referencia o contexto:
  │     "Pelo que você me contou, a AcmeSales vende pra SaaS B2B e o gargalo
  │      é prospecção. Bora afiar o ICP. Começa me contando os 3 melhores
  │      clientes que você já teve e o que eles tinham em comum?"
  ├─ Conversa fluida (5-20 turnos dependendo do destravamento)
  └─ Stream em tempo real via AI SDK

POST /api/agent/chat (route handler)
  ├─ Valida session + entitlement + quota (soft + hard limit)
  ├─ Monta prompt:
  │     - System prompt do flow (src/content/vss/[slug].ts)
  │     - Cached: manifesto dos 6Ps + perfil do aluno (prompt cache 5min TTL)
  │     - Artifacts anteriores relevantes (ex: ICP aparece em "Cadência")
  │     - Histórico da conversation (últimos N turnos)
  │     - Ferramentas disponíveis (tools):
  │         · saveArtifact(kind, title, content_md)
  │         · updateProfile(field, content_md)
  │         · markDestravamentoComplete()
  │         · requestHumanReview() → cria form_submission pra Joel
  ├─ Chama streamText do AI SDK com model selecionado
  ├─ Stream pro cliente + persist incremental em agent_messages
  ├─ Tool calls executam server-side (saveArtifact cria row + upload R2 se exportável)
  └─ Atualiza agent_usage + cost_cents

UI mostra:
  ├─ Stream de resposta em MessageBubble
  ├─ ArtifactPreview lateral atualiza quando saveArtifact é chamada
  ├─ Aluno pode editar artifact inline e salvar nova versão
  ├─ Progresso visual: fase → módulo → destravamento → completo
  └─ Barra de quota: "47k / 100k tokens este mês"

Conclusão:
  ├─ Agente chama markDestravamentoComplete() quando critério atendido
  ├─ UPDATE user_progress SET completed_at=NOW(), last_artifact_id=...
  └─ Sugere próximo destravamento baseado na ordem da fase
```

#### 4.4.d Consolidação de fase (ao completar última destravamento de uma fase)

```
Trigger: user_progress.completed_at preenchido pra último destravamento da fase
  ↓
Enqueue: { job: 'consolidate_phase', user_id, phase_id }
  ↓
Worker (usando Claude Opus 4.7 pra esta etapa):
  ├─ Carrega todos artifacts da fase do aluno
  ├─ Prompt: "Você é o Joel consolidando a Fase {X} do aluno {nome}.
              Com base nestes artifacts, monte o 'Plano da Fase' final:
              decisões tomadas, próximos passos, riscos, métricas a acompanhar."
  ├─ Gera consolidated_artifact (kind='phase_plan')
  ├─ Upload R2 (versão PDF + MD)
  └─ Notifica aluno via email + destaca no /area

Next: aluno pode exportar, compartilhar com time, revisitar.
```

### 4.5 Mentoria ao vivo (OBS → CF Stream Live Input → replay automático)

**Setup uma vez por mentoria:**

```
Admin /admin/mentorias → "Nova mentoria"
  ├─ Joel preenche: title, topic, scheduled_at, duration
  ├─ Backend chama POST https://api.cloudflare.com/.../stream/live_inputs
  │     → CF retorna { uid, rtmps.url, rtmps.streamKey, playbackId }
  ├─ Persist em `mentorias`: cf_live_input_id, rtmp_url, rtmp_stream_key, cf_playback_id
  └─ Admin vê box com rtmp_url + stream_key prontos pra colar no OBS
```

**No dia da live:**

```
Joel abre OBS:
  ├─ Settings → Stream → Service: Custom
  │     Server: rtmp://live.cloudflare.com:1935/live/
  │     Stream key: <rtmp_stream_key>
  └─ Start Streaming
       ↓
Cloudflare recebe RTMP, transcoda pra HLS multi-bitrate
       ↓
Webhook CF → /api/mentorias/cf-webhook
  ├─ Verifica signature
  └─ Updates mentoria.live_status = 'live'
       ↓
Aluno acessa /area/mentorias/[id]
  ├─ Valida session + entitlement VSS ativo
  ├─ Vê banner "AO VIVO AGORA" + player HLS
  └─ Renderiza <iframe src="https://iframe.videodelivery.net/{cf_playback_id}">
       (signed URL com TTL curto pra prevenir share público)
       ↓
Joel encerra OBS:
  ├─ CF processa replay automático (~30s-2min depois)
  ├─ Webhook CF → /api/mentorias/cf-webhook
  └─ Updates mentoria.live_status = 'recording_ready', recording_ready_at = NOW()
       ↓
Aluno volta em /area/mentorias/[id]
  └─ Mesmo iframe agora serve VOD (replay) automaticamente
```

📌 **Vantagens vs upload manual:**

- Zero passo manual pós-live (sem upload de MP4)
- Aluno pode assistir replay 1 min depois de Joel encerrar
- Mesmo player URL serve live e VOD (transparente pro aluno)
- CF gerencia transcoding, storage, CDN

📌 **Custo CF Stream Live Input:**

- $1 / 1.000 min armazenados (replay)
- $1 / 1.000 min entregues (delivery)
- Live encoding incluído

### 4.6 Webhooks de pagamento — eventos tratados

| Gateway      | Evento                          | Ação                                                        |
| ------------ | ------------------------------- | ----------------------------------------------------------- |
| Mercado Pago | `payment` aprovado              | Marca purchase paid, cria entitlement VSS                   |
| Mercado Pago | `payment` pending/in_process    | Mantém purchase pending; mostra `/vss-aguardando-pagamento` |
| Mercado Pago | `payment` rejected/cancelled    | Marca purchase failed, não cria entitlement                 |
| Mercado Pago | `payment` refunded/charged_back | Revoga entitlement imediato, notifica Joel                  |
| Stripe       | `checkout.session.completed`    | Ativa compra one-time (fallback cartão internacional)       |
| Stripe       | `charge.refunded`               | Marca refunded, revoga entitlement imediato                 |
| Stripe       | `charge.dispute.created`        | Alerta Joel via Slack/email, entitlement em revisão         |

**Segurança webhook MP (2026):** verificação obrigatória do header `x-signature` via HMAC-SHA256 com secret do painel. IP whitelist não basta. Exemplo:

```ts
// src/server/services/mercado-pago.ts
const xSig = req.headers['x-signature']; // ts=...,v1=...
const xReqId = req.headers['x-request-id'];
const parts = Object.fromEntries(xSig.split(',').map((p) => p.split('=')));
const signed = `id:${dataId};request-id:${xReqId};ts:${parts.ts};`;
const hmac = createHmac('sha256', MP_WEBHOOK_SECRET).update(signed).digest('hex');
if (hmac !== parts.v1) return new Response('invalid signature', { status: 401 });
```

Todo webhook faz claim em `payment_events` antes de qualquer mutação. Evento `processed` não reprocessa; evento `failed` pode ser reprocessado com `attempts` e log.

### 4.7 Blog — publicação pelo admin

```
Admin /admin/blog
  ├─ Lista de posts com filtro (status, tag, data)
  └─ Clica "Novo post" ou edita existente
       ↓
Editor /admin/blog/[id]
  ├─ Campos: title, slug (auto-gerado editável), subtitle, excerpt
  ├─ Editor markdown com preview side-by-side (MDEditor ou Tiptap)
  ├─ Upload de cover image → R2 (drag/drop, resize múltiplos tamanhos)
  ├─ Upload de imagens inline via / toolbar → R2 + insert markdown
  ├─ Tags (multi-select, cria on-the-fly)
  ├─ SEO pane: title, description, OG image
  ├─ Status: draft · scheduled (picker data) · published
  └─ Ao salvar: UPDATE blog_posts + INSERT blog_revisions (auto-save a cada 30s)
       ↓
GET /blog (marketing)
  ├─ Server Component: query published posts ORDER BY published_at DESC
  ├─ ISR revalidate=60s (ou on-demand revalidate após publish)
  └─ Lista com PostCard (cover + title + excerpt + reading_minutes)
       ↓
GET /blog/[slug]
  ├─ Server Component: SELECT * FROM blog_posts WHERE slug=? AND status='published'
  ├─ Render content_md via remark/rehype (syntax highlight, link target, TOC)
  ├─ Incrementa view_count (fire-and-forget, não bloqueia render)
  ├─ ISR revalidate=300s
  └─ Structured data + OG tags
```

📌 **Job `publish_scheduled_posts`** (pg-boss cron a cada 5min):

- Encontra posts com `status='scheduled' AND scheduled_for <= NOW()`
- Atualiza pra `status='published'`, seta `published_at=scheduled_for`
- Triggera on-demand revalidate de `/blog` e `/blog/[slug]`

### 4.8 Agente IA — detalhamento do flow

Cada destravamento tem um arquivo em `src/content/vss/[slug].ts`:

```ts
// Exemplo: src/content/vss/definir-icp.ts
import { defineDestravamento } from '~/server/agent/define';

export default defineDestravamento({
  slug: 'definir-icp',
  code: '04.M2.A1',
  title: 'Definir o ICP',
  phase: 'propaganda',
  module: 'prospeccao',
  estimatedMinutes: 30,
  flowKind: 'agent_guided',
  systemPrompt: `
    Você é o copiloto VSS ajudando o aluno a definir o ICP da empresa dele.
    Use os dados do perfil (segmento, faturamento, ticket) pra contextualizar.
    Guie por perguntas do framework 6P. Desafie respostas genéricas.
    Ao final, gere um artifact "icp" estruturado em markdown com:
      - Empresa-alvo (porte, faturamento, setor)
      - Persona decisora (cargo, dores, jornada)
      - Critérios de desqualificação
      - 10 empresas exemplo
  `,
  tools: ['saveArtifact', 'updateProfile', 'markComplete'],
  outputArtifactKind: 'icp',
  completionCriteria: 'aluno confirma artifact ICP gerado',
  model: 'claude-sonnet-4-6', // Opus 4.7 só em flows de consolidação
});
```

Vantagens de modelar em TS:

- Type-safe
- Review por diff no git (não shadow-uploads num CMS)
- Um flow pode ser testado unit (mock LLM)
- Fácil versionar + rollback

---

## 5. Pagamentos — Mercado Pago BR default + Stripe US fallback

### 5.1 Estratégia

| Necessidade                                              | Gateway             | Motivo                                                                 |
| -------------------------------------------------------- | ------------------- | ---------------------------------------------------------------------- |
| Checkout principal BR, parcelamento, PIX, boleto, cartão | **Mercado Pago BR** | Default de todo checkout. Parcelamento 12x resolve conversão VSS       |
| Cartão internacional / cliente fora do Brasil            | **Stripe US**       | Fallback quando usuário escolhe "pagar em USD" ou IP/cartão não-BR     |
| Conselho Executivo R$ 15k/mês                            | **Manual**          | Joel cobra por PIX/boleto + emite NFS-e. Sem subscription automatizada |

### 5.2 Mercado Pago BR — Checkout Pro

- SDK: `mercadopago` npm (oficial)
- Criar Preference com `external_reference = purchase_id`
- `back_urls` + `auto_return: approved`
- Webhook em `/api/payments/mercado-pago/webhook` com HMAC `x-signature`
- Customer no MP é criado automaticamente no primeiro pagamento

### 5.3 Stripe US — fallback

- Usado só quando cliente opta explícito por cartão internacional
- Checkout Session `mode: 'payment'` (one-time)
- Customer Portal pro cliente gerenciar métodos se quiser
- Nunca usar pra subscription recorrente em público BR

### 5.4 Comparativo de custo (ticket VSS R$ 1.997, 10 vendas/mês)

| Gateway                 | Taxa típica BR                 | Custo mensal estimado |
| ----------------------- | ------------------------------ | --------------------- |
| Hotmart (marketplace)   | 9.9% + R$1,99                  | ~R$ 1.980             |
| Kiwify (marketplace)    | 5% + R$1,99                    | ~R$ 1.015             |
| **Mercado Pago BR**     | ~4.99% à vista · até 6% parcel | ~R$ 800-1.200         |
| Stripe US (cartão int.) | 2.9% + $0.30 (USD)             | depende do mix        |

Mercado Pago ganha em custo vs marketplace e em conversão vs Stripe US puro (parcelamento resolve objeção).

### 5.5 Fontes oficiais

- Mercado Pago Checkout Pro: https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/overview
- MP webhook signature: https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks
- Stripe US pricing: https://stripe.com/us/pricing

---

## 6. Custos de infra e operação

### 6.1 Hetzner (compose compartilhado com growth-infra)

- VPS já existe → **custo marginal zero** pro projeto
- **Postgres dedicado** → volume novo no disco existente, sem custo extra
- Backup off-site (S3/R2/B2) → **$1-3/mês** pelo tráfego/storage do dump diário

### 6.2 Cloudflare standalone

| Serviço              | Tier grátis              | Estimativa mensal                                                             |
| -------------------- | ------------------------ | ----------------------------------------------------------------------------- |
| R2 storage           | 10 GB                    | **$0-5** (artifacts do aluno + replays processados)                           |
| R2 operations        | 1M class A + 10M class B | **$0**                                                                        |
| Stream armazenamento | —                        | **$5/1000 min armazenados** (48 mentorias × 90min/ano ≈ $21,60/ano acumulado) |
| Stream delivery      | —                        | **$1/1000 min entregues** (100 alunos × 1h/mês ≈ $6/mês)                      |
| Turnstile            | ilimitado                | **$0**                                                                        |
| CDN/DNS              | ilimitado free           | **$0**                                                                        |

**Total CF estimado:** $5-30/mês no início.

### 6.3 LLM (Anthropic API) — novo custo variável importante

Tabela hipotética pra Sonnet 4.6 default. Opus 4.7 usado em ~10% das chamadas (flows de consolidação).

| Cenário                         | Tokens/aluno/mês   | Custo/aluno/mês |
| ------------------------------- | ------------------ | --------------- |
| Aluno light (3 destravamentos)  | ~50k in / 10k out  | ~$0,30          |
| Aluno médio (10 destravamentos) | ~150k in / 30k out | ~$0,90          |
| Aluno heavy (20 destravamentos) | ~300k in / 60k out | ~$1,80          |

Com **prompt caching** no system + perfil (5min TTL), input cai ~70-90% em cache hit. Estimativa realista: **$2-5/aluno/mês em média**.

**Budget estratégia:**

- Soft quota: **150k tokens output/mês por aluno** (equivale a ~$2,25 Sonnet)
- Hard quota: **500k tokens output/mês** (pede confirmação pro Joel revisar)
- Admin vê top consumidores em tempo real
- Artifacts finais usam Opus 4.7 só quando flow explicitamente pede

**Economia vs custo:** VSS ticket R$ 1.997 · custo lifetime LLM estimado R$ 50-150/aluno. Margem intacta. Mas sem controle, aluno curioso queima R$ 500 num mês — precisa da quota.

### 6.4 Brevo

| Item          | Custo                                           |
| ------------- | ----------------------------------------------- |
| Brevo free    | 300 emails/dia (suficiente nos primeiros meses) |
| Brevo Starter | ~$25/mês se escalar (10-20k emails/mês)         |

### 6.5 Total operacional estimado (baseline)

- Sem LLM: ~R$ 50-150/mês (CF + Brevo)
- **Com LLM a 50 alunos ativos:** ~R$ 650-1.400/mês (LLM é o dominante)
- **Com LLM a 200 alunos ativos:** ~R$ 2.200-5.500/mês

Taxas MP/Stripe são proporcionais à receita.

Fontes oficiais:

- Stream pricing: https://developers.cloudflare.com/stream/pricing/
- R2 pricing: https://developers.cloudflare.com/r2/pricing/
- Anthropic pricing: https://www.anthropic.com/pricing

---

## 7. Pontos em aberto 🔄

### 7.1 Advisory Sprint 30d — self-service ✅

Fechado v0.4: self-service com Mercado Pago (ticket R$ 7.5k parcelável).

### 7.2 Agendamento Advisory

- 📌 **Cal.com embed** (free tier resolve). Economiza 1 semana.
- 🔄 Alternativa: agenda custom com slots próprios.
- ❓ Confirma Cal.com?

### 7.3 Emissão de Nota Fiscal

- 📌 **Manual no MVP** (Joel emite no sistema dele). Automatiza via eNotas/Nfe.io quando volume passar ~20 vendas/mês.
- ❓ Confirma manual?

### 7.4 Growth CRM (incluído 12 meses no VSS)

- ✅ **Decisão:** sistema separado por enquanto.
- Backend VSS só registra/provisiona acesso via `external_provisioning` e dispara fluxo privado de onboarding via n8n.
- Não expor fornecedor publicamente. Copy pública fala apenas "Growth CRM".

### 7.5 Modelagem dos 66 destravamentos como flows de agente

- ✅ Conteúdo base em `docs/conteudo/partes/04-playbook-vss.md`.
- 📌 **Plano:** cada destravamento vira um arquivo em `src/content/vss/[slug].ts` (system prompt + tools + output schema + model selection). Ver exemplo em §4.7.
- Trabalho incremental: Sprint 2 foca nos **destravamentos-âncora** (ICP, precificação, cadência, plano 90d — ~10 destravamentos), resto vai em sprints seguintes.
- Conteúdo atual do MD vira base de prompt do sistema.

### 7.6 Migração de dados ✅

- ✅ **Zero alunos legados.** Primeiro lançamento acontece quando essa plataforma estiver pronta. Seed do Sprint 1 só cria o admin Joel.

### 7.7 Contas externas

- ⏳ Conta Mercado Pago BR ativa? Credenciais (access_token + public_key + webhook secret).
- ⏳ Conta Stripe US da LLC (test + live keys) — fallback.
- ⏳ Conta Anthropic API ativa? API key com budget mensal definido no painel.
- ⏳ Conta Cloudflare com account ID? R2 bucket + Stream enabled + Turnstile siteKey.

### 7.8 Admin area — escopo do MVP

- 📌 **Proposta MVP admin:**
  - Dashboard: receita do mês, alunos ativos, leads recentes, custo LLM mês corrente
  - Tabela `form_submissions` com filtro + export CSV
  - Tabela `users` (alunos + Advisory) com status + quota LLM usada
  - Tabela `advisory_sessions` (próximas + passadas)
  - CRUD `mentorias` (scheduled → recorded)
  - **Agent usage:** top consumidores de LLM, custo por destravamento, quota overrides
  - **Artifacts browser:** ver o que os alunos geraram (Joel pode auditar qualidade do agente)
- ❓ Confirma escopo?

### 7.9 Budget LLM por aluno

- 📌 Quota soft 150k output tokens/mês · hard 500k (§6.3).
- ❓ Confirma números ou prefere outro limite?

### 7.10 Escolha de modelo por flow

- 📌 **OpenAI default** (key já existe no `.env`):
  - **Chat/coach:** `gpt-4o` ou `gpt-4.1` (a confirmar — `gpt-4o` é mais rápido/barato, `gpt-4.1` mais capaz)
  - **Consolidação de fase:** `gpt-4.1` (ou `o1` se Joel topar custo)
- 🔄 **Anthropic** disponível via env switch sem reescrita.
- ❓ Confirma `gpt-4o` como chat default ou prefere `gpt-4.1`?

### 7.11 Backup off-site Postgres ✅

- ✅ **Já existe** no growth-infra (`scripts/backup.sh`):
  - Daily 00:00 BRT (retenção 7 dias) + monthly dia 1 (retenção 6 meses)
  - Encriptado com `age` (chave pública no servidor, privada no 1P vault)
  - Sync pra Google Drive via rclone + Hetzner snapshots
- Sprint 1: só adicionar `/mnt/data/pg-joelburigo-site` aos paths validados do script. Restore via `restore-app.sh joelburigo-site <YYYY-MM-DD>`.

### 7.12 Editor do blog ✅

- ✅ **Tiptap + extensão `tiptap-markdown`**.
- Source of truth: `content_md` (markdown) — tanto humano quanto agente escrevem/leem markdown.
- Humano edita em WYSIWYG rico (Tiptap renderiza o MD); salva de volta em MD via `tiptap-markdown.getMarkdown()`.
- Agente gera MD direto via `saveArtifact` / `createDraft`. Tiptap mostra pro humano editar.
- Benefícios: agente simples (MD), humano confortável (WYSIWYG), zero perda de fidelidade.

### 7.13 Migração dos 12 posts atuais ✅ (parcial)

- ✅ Script de migração em Sprint 1 (§8):
  1. Lê frontmatter + conteúdo de `src/content/blog/*.md`
  2. INSERT `blog_posts` preservando slug 1:1 (crítico pra SEO)
  3. Upload imagens de `src/assets/images/blog/` pra R2 com mesmo nome + variantes (480w/720w/1080w/1920w/.avif)
  4. Reescreve referências de imagem no markdown pra URLs públicas R2
  5. **Sem tags inicialmente**
- ✅ **Classificação de tags pelo agente:** job one-shot `classify-blog-posts` roda após migração. Claude Opus 4.7 lê os 12 posts num único prompt (~36k tokens input + 2k output ≈ $0,10), sugere tags consistentes, UPSERT em `blog_tags` + vincula via `blog_post_tags`. Joel revisa/ajusta no CMS depois.
- ✅ **Slugs preservados 1:1** a partir do filename MD.

---

## 8. Plano de implementação (roadmap)

### Sprint 0 — Migração Astro → Next.js + Design System (10-14 dias)

**Objetivo:** substituir Astro pelo Next.js mantendo o site público em paridade visual e performance, **sem reescrever copy** (cp 1:1 do Astro). Setup do design system em camadas.

- [ ] Scaffold Next.js 15 App Router (TypeScript, ESLint, Prettier)
- [ ] Tailwind v4 + migração de tokens `--jb-*` (Terminal Growth) → `app/globals.css` (cp do `src/styles/global.css` atual)
- [ ] Fontes via `next/font/google`: Archivo, Archivo Black, JetBrains Mono
- [ ] shadcn/ui init + customização Terminal Growth (radius 0, brutalist shadows, fire/acid)
- [ ] Estrutura `src/components/` em 5 camadas (ver §11)
- [ ] Portar páginas públicas (cp 1:1 da copy): `/`, `/vendas-sem-segredos`, `/advisory`, `/diagnostico`
- [ ] **Blog shell lendo do DB** (não MDX): `/blog` lista + `/blog/[slug]` detalhe via Drizzle → Postgres (fica stub até migração dos posts em Sprint 1)
- [ ] Sitemap + robots + OG images + structured data
- [ ] **Dockerfile multi-stage Next** com `output: 'standalone'` — substitui o Dockerfile Astro atual
- [ ] **Compose updates no growth-infra** (`/mnt/data/docker-compose.yml`): atualiza `joelburigo-site` (Next standalone), adiciona `joelburigo-worker` (mesma imagem, CMD diferente), adiciona `pg-joelburigo-site` (rede `db-back`), pgbouncer route em `db-front`
- [ ] **`.env.tpl` no repo + 1P vault Infra** (Joel popula): `DATABASE_URL`, `OPENAI_API_KEY` (já existe), `MP_*`, `STRIPE_*`, `CF_*`, `BREVO_*`, `JWT_SECRET`, etc.
- [ ] **Tunnel dev preservado**: `pnpm dev:tunnel` continua usando `.cloudflared.token` existente, agora rodando `next dev` na porta 4321 (mesma do Astro). Zero mudança no DNS / Cloudflare Tunnel.
- [ ] GitHub Actions adaptado: type-check Next + build standalone + push GHCR `ghcr.io/joelburigo/joelburigo-site:latest`
- [ ] Redirects 301 (zero esperado — slugs preservados)
- [ ] Lighthouse audit: paridade ou melhor que Astro atual
- [ ] Backup script: adicionar `/mnt/data/pg-joelburigo-site` aos paths validados
- [ ] Deploy staging (`staging.joelburigo.com.br`) → smoke test → swap produção via Watchtower

**Entregável:** site público em Next.js, zero regressão visual/SEO/copy, infra Postgres/worker/staging tudo em paridade pronto pra Sprint 1.

### Sprint 1 — Foundation + Pagamento + Forms (8-10 dias)

**Objetivo:** desbloquear captura de leads + venda VSS via Mercado Pago.

- [ ] Postgres container dedicado `joelburigo-pg` no compose
- [ ] Drizzle config + schema inicial (users, user_profiles, products, purchases, entitlements, payment_events, magic_links, kv_store, form_submissions, **blog_posts, blog_tags, blog_post_tags, blog_revisions, blog_images**)
- [ ] Adapters: `src/server/lib/{storage,kv,queue,llm}.ts`
- [ ] **Worker separado** (`joelburigo-worker`) no compose com CMD dedicado
- [ ] pg-boss setup (worker consume jobs)
- [ ] Magic link auth funcional (/entrar · /verificar) + middleware de proteção
- [ ] Payment router + **Mercado Pago Checkout Pro** (preference + webhook com HMAC x-signature) + Stripe fallback
- [ ] Forms migrados pra `/api/forms/*` + n8n webhook forward
- [ ] Turnstile integrado nos forms públicos
- [ ] R2 bucket + adapter testado (upload/get)
- [ ] Backup off-site Postgres (dump diário → R2, retenção 30d)
- [ ] Sentry integrado
- [ ] **Migração dos 12 posts de blog (`cp` literal, zero reescrita):**
  - Script lê `src/content/blog/*.md` com `gray-matter` (separa frontmatter do conteúdo bruto)
  - INSERT `blog_posts` com `content_md` **byte-idêntico** ao original (sem normalização, sem reflow, sem mudar URLs)
  - `cp -R src/assets/images/blog/* → public/assets/images/blog/` (Next serve de `/public`)
  - `cover_image_path` guarda string literal que já está no frontmatter (ex: `/assets/images/blog/6ps-vendas-escalaveis-hero-1080w.webp`)
  - Slugs preservados 1:1 a partir do filename
  - Autor default = user do Joel (cria seed de `users` com role=admin)
  - R2 opcional em futuro — schema já aceita `r2://` path quando migrar
- [ ] Deploy staging + smoke test end-to-end

**Entregável:** VSS vende via MP. Forms capturam leads. Blog renderiza os 12 posts a partir do DB. Backup off-site rodando.

### Sprint 2 — Área do aluno VSS + Agente IA (14-18 dias)

**Objetivo:** aluno loga, faz onboarding de perfil 6P, executa destravamentos-âncora com agente.

- [ ] Schema vss*phases/modules/destravamentos + agent*\* tables
- [ ] Seed script (7 fases, 15 módulos, 66 destravamentos — metadados; flows implementados incrementalmente)
- [ ] `/onboarding` — formulário guiado pelo agente que preenche `user_profiles` (6Ps iniciais)
- [ ] `/area` — dashboard aluno (progresso, próximo destravamento, artifacts recentes)
- [ ] `/fase/[slug]` — navegação da fase
- [ ] `/destravamento/[slug]` — workspace:
  - Server component carrega contexto completo
  - Client component `<AgentChat>` com Vercel AI SDK (streamText + useChat)
  - Painel lateral de artifacts (preview + versões)
  - Barra de progresso + quota LLM visível
- [ ] Route handler `/api/agent/chat` com streaming, tool calls, persist messages
- [ ] Tools implementadas: `saveArtifact`, `updateProfile`, `markComplete`, `requestHumanReview`
- [ ] Prompt caching configurado (system + perfil no cache, histórico fora)
- [ ] Quota enforcement (soft + hard limits)
- [ ] `agent_usage` agregado via trigger ou job noturno
- [ ] **Destravamentos-âncora implementados:** ICP, Precificação, Cadência de prospecção, Script de vendas, Plano 90d (~10 destravamentos)
- [ ] Testes: flow do agente com mocks (sem queimar tokens na CI)

**Entregável:** aluno paga, loga, onboarding 6P, executa destravamentos-âncora com agente, gera artifacts.

### Sprint 3 — Advisory (5-7 dias)

- [ ] Produtos Advisory em MP + Stripe (2 products self-service)
- [ ] Checkout Sessão avulsa (R$ 997 · self-service)
- [ ] Checkout Sprint 30d (R$ 7.5k · self-service)
- [ ] Fluxo Conselho manual (Joel envia link de pagamento personalizado após qualificar + marca `gateway='manual'`)
- [ ] `/advisory/dashboard` — cliente vê sessões + histórico + artifacts compartilhados
- [ ] Cal.com embed na agenda
- [ ] `/sessao/[id]` — detalhes + preparação do cliente + notas do Joel (se compartilhadas)

**Entregável:** Advisory end-to-end.

### Sprint 4 — Mentorias + Admin + Blog CMS + Polish (8-10 dias)

- [ ] CRUD de `mentorias` (scheduled → live → recorded)
- [ ] Upload pro Cloudflare Stream (via dashboard inicialmente)
- [ ] Player Stream embed em `/area/mentoria/[id]` (gate por entitlement + signed URL)
- [ ] `/admin` — dashboard Joel (MVP §7.8)
- [ ] Tabelas com filtro + export CSV
- [ ] Agent usage dashboard (top consumidores, custo por destravamento, audit de artifacts)
- [ ] **Blog CMS no admin:**
  - [ ] Lista de posts (`/admin/blog`) com filtro (status, tag)
  - [ ] Editor (`/admin/blog/[id]`) com markdown + preview, auto-save via `blog_revisions`
  - [ ] Upload de cover/inline image → R2 com resize multi-tamanho (sharp)
  - [ ] Tags CRUD + multi-select
  - [ ] Scheduled publish (pg-boss cron `publish_scheduled_posts`)
  - [ ] On-demand revalidate após publish (Next `revalidatePath`)
- [ ] Lighthouse/perf audit final
- [ ] Runbook operacional (incident response, rollback, secret rotation, quota override manual)

**Entregável:** sistema completo em produção. Joel operacional.

### Sprints 5+ — Resto dos destravamentos

Os outros ~56 destravamentos são implementados incrementalmente, ~8-10 por sprint. Modelo repetível: pick destravamento → escrever flow em TS → testar com user real → refinar → liberar via `available_from`.

**Total Fase A:** ~9-12 semanas focadas (Sprint 0 até Sprint 4). Resto dos destravamentos é trilha contínua depois do MVP.

### Fase B — Migração pra Cloudflare (futuro, quando gatilho disparar)

Ver §12.

---

## 9. Decisões tomadas (log histórico)

_Append-only. Toda decisão fechada sobe pra cá com data._

- **2026-04-23** — ✅ Sistema próprio, sem terceirização de área de membros.
- **2026-04-23** — ✅ Pagamento: gateway direto.
- **2026-04-23** — ✅ Infra Fase A: Hetzner (aproveita growth-infra).
- **2026-04-23** — ✅ Infra Fase B: migra pra Cloudflare quando gatilho (§12) disparar.
- **2026-04-23** — ✅ Híbrido desde dia 1: R2 + Stream + Turnstile standalone.
- **2026-04-23** — ✅ Drizzle ORM (portável Postgres ↔ D1).
- **2026-04-23** — ✅ Adapter pattern pra storage/kv/queue.
- **2026-04-23** — ✅ Auth: magic link sem senha.
- **2026-04-23** — ✅ IDs: ULID.
- **2026-04-23** — ✅ Vídeo mentorias: Cloudflare Stream.
- **2026-04-23** — ✅ Queue: pg-boss (sem Redis).
- **2026-04-23** — ✅ KV: tabela Postgres via adapter.
- **2026-04-23** — ✅ Afiliados: out-of-scope MVP.
- **2026-04-24** — ✅ Rota canônica VSS: `/vendas-sem-segredos`.
- **2026-04-24** — ✅ Growth CRM: sistema separado; backend apenas provisiona acesso privado.
- **2026-04-24** — ✅ Acesso por `entitlements`, não por consulta direta em compras/assinaturas.
- **2026-04-24** — ✅ Webhooks idempotentes via `payment_events`.
- **2026-04-24** — ✅ Conteúdo VSS base existe em `docs/conteudo/partes/04-playbook-vss.md`.
- **2026-04-24 (v0.4)** — ✅ Stack monolito: **Next.js 15 App Router** (migra do Astro).
- **2026-04-24 (v0.4)** — ✅ Componentes organizados em 5 camadas: ui · patterns · sections · features · layouts (§11).
- **2026-04-24 (v0.4)** — ✅ Pagamento default: **Mercado Pago BR**; Stripe US como fallback pra cartão internacional.
- **2026-04-24 (v0.4)** — ✅ Conselho Executivo: cobrança **manual** (PIX/boleto + NFS-e), não subscription.
- **2026-04-24 (v0.4)** — ✅ Postgres **dedicado** (novo container `joelburigo-pg`), não shared com growth-infra.
- **2026-04-24 (v0.4)** — ✅ Worker pg-boss em **processo separado** (mesma imagem, CMD dedicado).
- **2026-04-24 (v0.4)** — ✅ VSS = **workspace com agente IA Nível 2→3**. Destravamentos modelados como flows em TS (`src/content/vss/[slug].ts`).
- **2026-04-24 (v0.4)** — ✅ Model default: **Claude Sonnet 4.6**; premium: **Opus 4.7** em flows de consolidação.
- **2026-04-24 (v0.4)** — ✅ Webhook MP: verificação HMAC `x-signature` obrigatória.
- **2026-04-24 (v0.4)** — ✅ Artifacts do aluno em **R2**; conteúdo base de destravamentos no **repo** (não R2).
- **2026-04-24 (v0.4)** — ✅ **Blog gerenciado no DB** via CMS admin. Posts como rows em `blog_posts`, imagens em R2, revisões em `blog_revisions`. 12 posts MD atuais migrados via script no Sprint 1.
- **2026-04-24 (v0.4)** — ✅ **Editor blog:** Tiptap + `tiptap-markdown`. Source of truth em MD; humano edita em WYSIWYG, agente gera MD.
- **2026-04-24 (v0.4)** — ✅ **Classificação de tags** dos 12 posts migrados via job one-shot `classify-blog-posts` (Opus 4.7). Joel revisa no CMS.
- **2026-04-24 (v0.4)** — ✅ **Onboarding conversacional** como Day 1 do aluno VSS: agente faz 8-12 perguntas, preenche `user_profiles` via `updateProfile`, leva 10-15 min.
- **2026-04-24 (v0.4)** — ✅ **Consolidação de fase** automática (Opus 4.7) ao completar última destravamento de cada fase — gera "Plano da Fase" exportável.
- **2026-04-24 (v0.4)** — ✅ **`docs/conteudo/` é INTOCÁVEL e permanente** — fonte única de verdade de estratégia/copy/marca. Fica fora do build Docker. Não migrar, não reescrever, só **consultar**.
- **2026-04-24 (v0.4)** — ✅ **Migração é `cp` literal** — portar copy 1:1 do Astro pro Next (zero reescrita), posts MD byte-idênticos no DB, imagens blog em `public/assets/images/blog/` (mesmas URLs relativas).
- **2026-04-24 (v0.4)** — ✅ **Slugs do blog preservados 1:1**; nomes de arquivos MD viram slugs sem transformação.
- **2026-04-24 (v0.5)** — ✅ **LLM provider default: OpenAI** (`@ai-sdk/openai`) — key `OPENAI_API_KEY` já existe no `.env` atual. Adapter `server/lib/llm.ts` permite trocar via `LLM_PROVIDER=anthropic` sem reescrita.
- **2026-04-24 (v0.5)** — ✅ **Mentorias ao vivo: Cloudflare Stream Live Input.** OBS publica RTMP → CF entrega HLS ao vivo na plataforma → replay automático disponível ao fim. Schema `mentorias` ganha `cf_live_input_id`, `cf_playback_id`, `rtmp_url`, `rtmp_stream_key`, `live_status`.
- **2026-04-24 (v0.5)** — ✅ **Postgres como serviço no growth-infra compose** (não no repo do site). Container `pg-joelburigo-site` na rede `db-back` + pgbouncer em `db-front`. Sigue padrão `pg-housecredi-painel` etc.
- **2026-04-24 (v0.5)** — ✅ **Backup off-site já existe** no growth-infra (`scripts/backup.sh` com age encrypt + rclone gdrive + Hetzner snapshots). Só adicionar path do novo volume.
- **2026-04-24 (v0.5)** — ✅ **Secrets via 1Password CLI** — template `.env.tpl` no repo, `op inject` popula em prod via `/etc/op-token`. Sigue padrão growth-infra.
- **2026-04-24 (v0.5)** — ✅ **Tunnel dev preservado**: mesmo `.cloudflared.token` aponta pra `dev.joelburigo.com.br`. `pnpm dev:tunnel` adaptado pra Next dev na porta 4321.
- **2026-04-24 (v0.5)** — ✅ **Sem alunos legados** (primeiro lançamento pós-MVP). Seed cria só o admin Joel.

---

## 10. Perguntas bloqueantes pra Sprint 0/1

1. ❓ **Conta Mercado Pago BR** ativa? Access token + public key + webhook secret.
2. ❓ **Conta Anthropic API** ativa? API key + limite mensal configurado no dashboard.
3. ❓ **Conta Cloudflare** ativa? Account ID + R2 bucket + Stream enabled + Turnstile siteKey.
4. ❓ **Conta Stripe US LLC** ativa? (só pra fallback — não bloqueia Sprint 1)
5. ❓ **Backup off-site growth-infra** — já existe ou precisa ser criado no Sprint 1?

Perguntas §7.2, 7.3, 7.6, 7.8, 7.9, 7.10 destravam no meio do caminho — não impedem começar Sprint 0.

---

## 11. Arquitetura de código (Next.js App Router)

Monolito Next.js com separação lógica clara. Design system em **5 camadas** de componentes (pragmático, não Atomic Design puro).

```
joelburigo-site/
├── src/
│   ├── app/                         Next.js App Router
│   │   ├── (marketing)/             route group público
│   │   │   ├── layout.tsx           MarketingLayout (Header/Footer)
│   │   │   ├── page.tsx             Home
│   │   │   ├── vendas-sem-segredos/page.tsx
│   │   │   ├── advisory/page.tsx
│   │   │   ├── diagnostico/page.tsx
│   │   │   └── blog/
│   │   │       ├── page.tsx         SELECT published ORDER BY published_at DESC
│   │   │       ├── [slug]/page.tsx  SELECT by slug + render content_md
│   │   │       └── tag/[slug]/page.tsx
│   │   ├── (auth)/
│   │   │   ├── entrar/page.tsx
│   │   │   └── verificar/page.tsx
│   │   ├── (app)/                   area logada (middleware protected)
│   │   │   ├── layout.tsx           AppLayout
│   │   │   ├── onboarding/page.tsx
│   │   │   ├── area/page.tsx        dashboard aluno
│   │   │   ├── fase/[slug]/page.tsx
│   │   │   ├── destravamento/[slug]/page.tsx  ← workspace com agente
│   │   │   └── advisory/
│   │   │       ├── dashboard/page.tsx
│   │   │       └── sessao/[id]/page.tsx
│   │   ├── (admin)/                 role-protected
│   │   │   └── admin/
│   │   │       ├── page.tsx
│   │   │       ├── leads/page.tsx
│   │   │       ├── users/page.tsx
│   │   │       ├── mentorias/page.tsx
│   │   │       ├── agent-usage/page.tsx
│   │   │       └── blog/
│   │   │           ├── page.tsx     lista + filtros
│   │   │           ├── new/page.tsx
│   │   │           └── [id]/page.tsx editor com auto-save
│   │   ├── api/                     Route handlers (backend)
│   │   │   ├── auth/
│   │   │   │   ├── request/route.ts
│   │   │   │   └── logout/route.ts
│   │   │   ├── payments/
│   │   │   │   ├── checkout/route.ts
│   │   │   │   ├── mercado-pago/webhook/route.ts
│   │   │   │   └── stripe/webhook/route.ts
│   │   │   ├── agent/
│   │   │   │   ├── chat/route.ts    streaming com AI SDK
│   │   │   │   └── artifact/route.ts
│   │   │   ├── progress/complete/route.ts
│   │   │   ├── forms/
│   │   │   │   ├── diagnostico/route.ts
│   │   │   │   ├── contato/route.ts
│   │   │   │   └── advisory/route.ts
│   │   │   ├── admin/
│   │   │   │   ├── stats/route.ts
│   │   │   │   ├── export/route.ts
│   │   │   │   └── blog/
│   │   │   │       ├── route.ts            GET list · POST create
│   │   │   │       ├── [id]/route.ts       GET · PATCH · DELETE
│   │   │   │       ├── [id]/publish/route.ts
│   │   │   │       └── upload/route.ts     cover + inline image upload pra R2
│   │   │   └── revalidate/route.ts         on-demand revalidate (protegido)
│   │   ├── globals.css              Tailwind v4 + tokens --jb-*
│   │   ├── layout.tsx               Root layout
│   │   ├── robots.ts
│   │   └── sitemap.ts
│   │
│   ├── components/                  ← DESIGN SYSTEM EM 5 CAMADAS
│   │   │
│   │   ├── ui/                      [1] PRIMITIVES (shadcn customizado)
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── card.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── sheet.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── select.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── tooltip.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── switch.tsx
│   │   │   ├── checkbox.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── scroll-area.tsx
│   │   │   ├── command.tsx
│   │   │   └── logo.tsx
│   │   │
│   │   ├── patterns/                [2] COMPOSTOS domain-agnostic
│   │   │   ├── form-field.tsx
│   │   │   ├── data-table.tsx
│   │   │   ├── empty-state.tsx
│   │   │   ├── page-header.tsx
│   │   │   ├── section-header.tsx
│   │   │   ├── stat-card.tsx
│   │   │   ├── key-value.tsx
│   │   │   ├── copy-button.tsx
│   │   │   ├── pagination.tsx
│   │   │   ├── breadcrumbs.tsx
│   │   │   ├── markdown-render.tsx
│   │   │   └── code-block.tsx
│   │   │
│   │   ├── sections/                [3] PEDAÇÕES de landing (marketing)
│   │   │   ├── hero.tsx
│   │   │   ├── feature-grid.tsx
│   │   │   ├── pricing.tsx
│   │   │   ├── faq.tsx
│   │   │   ├── cta-section.tsx
│   │   │   ├── testimonial-grid.tsx
│   │   │   ├── comparison.tsx
│   │   │   ├── step-list.tsx
│   │   │   └── proof-bar.tsx
│   │   │
│   │   ├── features/                [4] UI por DOMÍNIO
│   │   │   ├── vss/
│   │   │   │   ├── progress-bar.tsx
│   │   │   │   ├── destravamento-card.tsx
│   │   │   │   ├── fase-nav.tsx
│   │   │   │   ├── mentoria-card.tsx
│   │   │   │   └── replay-player.tsx
│   │   │   ├── blog/
│   │   │   │   ├── post-card.tsx
│   │   │   │   ├── post-list.tsx
│   │   │   │   ├── post-body.tsx         render markdown + TOC + syntax highlight
│   │   │   │   ├── tag-badge.tsx
│   │   │   │   ├── author-byline.tsx
│   │   │   │   ├── related-posts.tsx
│   │   │   │   └── blog-editor.tsx       Tiptap + tiptap-markdown (WYSIWYG ↔ MD)
│   │   │   ├── onboarding/
│   │   │   │   ├── onboarding-chat.tsx   agente faz 8-12 perguntas
│   │   │   │   ├── profile-summary.tsx   resumo editável ao fim
│   │   │   │   └── manual-form.tsx       fallback pra quem prefere não conversar
│   │   │   ├── advisory/
│   │   │   │   ├── session-card.tsx
│   │   │   │   ├── booking-embed.tsx
│   │   │   │   └── session-notes.tsx
│   │   │   ├── auth/
│   │   │   │   ├── magic-link-form.tsx
│   │   │   │   └── verifying-state.tsx
│   │   │   ├── admin/
│   │   │   │   ├── stats-grid.tsx
│   │   │   │   ├── revenue-chart.tsx
│   │   │   │   ├── leads-table.tsx
│   │   │   │   ├── users-table.tsx
│   │   │   │   ├── sessions-table.tsx
│   │   │   │   ├── agent-usage-panel.tsx
│   │   │   │   ├── blog-post-list.tsx
│   │   │   │   └── image-uploader.tsx    drop zone com resize client-side
│   │   │   ├── agent/               ← UI do copiloto
│   │   │   │   ├── chat-window.tsx
│   │   │   │   ├── message-bubble.tsx
│   │   │   │   ├── artifact-preview.tsx
│   │   │   │   ├── artifact-diff.tsx
│   │   │   │   ├── artifact-export.tsx
│   │   │   │   ├── tool-call-block.tsx
│   │   │   │   ├── usage-badge.tsx
│   │   │   │   └── completion-gate.tsx
│   │   │   └── payments/
│   │   │       ├── checkout-button.tsx
│   │   │       ├── payment-status.tsx
│   │   │       └── portal-link.tsx
│   │   │
│   │   └── layouts/                 [5] SHELLS de página
│   │       ├── marketing-layout.tsx
│   │       ├── app-layout.tsx
│   │       ├── admin-layout.tsx
│   │       └── auth-layout.tsx
│   │
│   ├── content/                     Só VSS flows (blog saiu daqui — foi pra DB)
│   │   └── vss/
│   │       ├── index.ts             Exporta manifest dos 66 destravamentos
│   │       ├── definir-icp.ts       Flow TS
│   │       ├── precificacao.ts
│   │       ├── cadencia-prospeccao.ts
│   │       └── ...
│   │
│   ├── server/                      Backend puro (import 'server-only')
│   │   ├── db/
│   │   │   ├── schema.ts            Drizzle schema
│   │   │   ├── client.ts
│   │   │   └── seed.ts
│   │   ├── services/                Lógica de negócio
│   │   │   ├── auth.ts
│   │   │   ├── users.ts
│   │   │   ├── profile.ts           user_profiles CRUD
│   │   │   ├── payments.ts
│   │   │   ├── mercado-pago.ts
│   │   │   ├── stripe.ts
│   │   │   ├── entitlements.ts
│   │   │   ├── vss.ts
│   │   │   ├── blog.ts              CRUD posts/tags/revisões · publish · revalidate
│   │   │   ├── agent.ts             orchestração LLM
│   │   │   ├── artifacts.ts
│   │   │   ├── advisory.ts
│   │   │   ├── mentorias.ts
│   │   │   ├── forms.ts
│   │   │   ├── external.ts          Growth CRM privado
│   │   │   ├── admin.ts
│   │   │   └── email.ts             Brevo
│   │   ├── agent/                   Infra do agente
│   │   │   ├── define.ts            defineDestravamento helper
│   │   │   ├── tools.ts             saveArtifact, updateProfile, markComplete...
│   │   │   ├── prompts.ts           system prompts base + helpers
│   │   │   └── quota.ts             soft/hard limit enforcement
│   │   ├── jobs/                    Queue handlers (pg-boss worker)
│   │   │   ├── runner.ts            entry point do worker
│   │   │   ├── welcome-vss.ts
│   │   │   ├── welcome-advisory.ts
│   │   │   ├── forward-form-n8n.ts
│   │   │   ├── aggregate-agent-usage.ts
│   │   │   ├── publish-scheduled-posts.ts   cron 5min
│   │   │   ├── process-blog-image.ts        resize multi-variant com sharp
│   │   │   ├── classify-blog-posts.ts       one-shot: classifica tags dos 12 posts migrados
│   │   │   ├── consolidate-phase.ts         Opus 4.7 ao completar fase → phase_plan
│   │   │   └── reminder-mentoria.ts
│   │   └── lib/                     Adapters + utils server-only
│   │       ├── storage.ts           Interface + impl R2 (S3 SDK)
│   │       ├── kv.ts                Interface + impl Postgres
│   │       ├── queue.ts             Interface + impl pg-boss
│   │       ├── llm.ts               Interface + impl Anthropic via AI SDK
│   │       ├── ulid.ts
│   │       ├── hash.ts
│   │       └── turnstile.ts
│   │
│   ├── lib/                         Utils compartilhados client+server
│   │   ├── utils.ts                 cn (tailwind-merge), formatters
│   │   ├── constants.ts
│   │   └── hooks/
│   │       ├── use-agent-chat.ts
│   │       └── use-toast.ts
│   │
│   ├── styles/
│   │   └── tokens.css               Terminal Growth tokens centralizados
│   │
│   ├── middleware.ts                sessionGuard + roleGuard
│   └── env.ts                       Env validation (zod)
│
├── public/
├── docs/                            fora do build (dockerignore)
├── Dockerfile
├── docker-compose.yml               (joelburigo-site, joelburigo-worker, joelburigo-pg)
├── next.config.ts
├── tailwind.config.ts
├── drizzle.config.ts
└── package.json
```

### Regras das 5 camadas de componentes

**[1] `ui/` — Primitives**

- Átomos do design system. Zero conhecimento de domínio.
- Base: shadcn/ui customizado com tokens Terminal Growth.
- Regras: não importa de `patterns/`, `sections/`, `features/`, `server/`.
- Exemplo válido: `Button`, `Card`, `Dialog`.
- Exemplo inválido aqui: `LoginButton` (conhece domínio auth → vai pra `features/auth/`).

**[2] `patterns/` — Compostos domain-agnostic**

- Combinações reutilizáveis de `ui/`. Ainda sem lógica de negócio.
- Pode importar de `ui/`. Não importa de `features/` ou `sections/`.
- Exemplo válido: `DataTable`, `FormField`, `EmptyState`, `PageHeader`.
- Exemplo inválido aqui: `LeadsTable` (específico de admin → vai pra `features/admin/`).

**[3] `sections/` — Pedaços grandes de landing**

- Composições de marketing: Hero, Pricing, FAQ, Comparison.
- Pode importar de `ui/` e `patterns/`.
- Usado principalmente em `app/(marketing)/*`.

**[4] `features/<domínio>/` — UI por domínio**

- UI que conhece um domínio: vss, advisory, agent, admin, auth, payments.
- Pode importar de `ui/`, `patterns/`, `sections/` (raramente).
- Server components aqui podem importar de `server/services/*`.
- Client components buscam via route handlers ou server actions.

**[5] `layouts/` — Shells de página**

- MarketingLayout, AppLayout, AdminLayout, AuthLayout.
- Define chrome (header/nav/footer) + providers (theme, toast, session).

### Regras de dependência entre camadas

```
app/*          → pode importar QUALQUER camada
layouts/       → ui, patterns, features (limitado)
features/*     → ui, patterns, sections (raro), server/services (RSC only)
sections/      → ui, patterns
patterns/      → ui
ui/            → nada interno
```

### Regras backend/frontend

1. **`server/`** importa só de si mesmo + libs externas. Protegido com `import 'server-only'`.
2. **`components/`** nunca importa de `server/` exceto em Server Components explícitos.
3. **Route handlers em `app/api/`** são thin — validam Zod, chamam `server/services/*`.
4. **Server Actions** podem ficar colocalizados em `app/(app)/**/actions.ts` — mesmo padrão (valida → service).

### Testabilidade

- `server/services/*` unit-testable (mock DB, Anthropic, providers)
- `server/agent/*` testável sem queimar tokens (mock LLM adapter)
- `server/jobs/*` unit-testable (fake queue)
- `components/*` testável via Playwright (e2e nas rotas principais)

### Portabilidade pra Fase B (CF)

Quando migrar:

- Next 15 roda em CF via `@opennextjs/cloudflare` (output standalone → Workers)
- Troca `src/server/lib/storage.ts` impl de R2-SDK pra R2-binding direto
- Troca `src/server/lib/kv.ts` impl de Postgres pra CF KV binding
- Troca `src/server/lib/queue.ts` impl de pg-boss pra CF Queues
- Migra schema Drizzle Postgres → D1
- `server/services/*`, `components/*`, `app/*` **não mudam**

---

## 12. Fase B — Migração futura pra Cloudflare

### 12.1 Gatilhos pra disparar migração

Migra **apenas quando** um desses acontecer:

- 🚨 **Performance** — latência consistente > 300ms TTFB pra user BR (raro, CDN CF já ajuda)
- 🚨 **Escala** — > 500 alunos ativos concorrentes OU lançamento que derruba container
- 🚨 **Custo** — Hetzner + LLM começa a pesar vs edge/workers pricing
- 🚨 **Manutenção** — Joel/equipe não quer mais gerenciar VPS
- 🚨 **Expansão** — edge global vira requisito

### 12.2 O que muda (se migrar)

| Componente           | Fase A (Hetzner)              | Fase B (Cloudflare)              | Esforço                |
| -------------------- | ----------------------------- | -------------------------------- | ---------------------- |
| Runtime              | Docker Next standalone Node22 | CF Workers via @opennextjs/cf    | 2-3d (adapter + test)  |
| DB                   | Postgres 16 dedicado          | D1 (SQLite serverless)           | 5-7d (type map + data) |
| KV adapter impl      | table Postgres                | CF KV binding                    | 0.5d                   |
| Queue adapter impl   | pg-boss                       | CF Queues                        | 1d                     |
| Storage adapter impl | R2-SDK HTTP                   | R2 binding                       | 0.5d                   |
| LLM adapter impl     | Anthropic via AI SDK          | Idem (funciona igual em Workers) | 0d                     |
| Secrets              | env Docker                    | Wrangler secrets                 | 0.5d                   |
| Deploy               | GH Actions → GHCR             | Wrangler deploy                  | 1d                     |
| DNS                  | Traefik                       | CF Workers custom domain         | 0.5d                   |

**Total estimado:** 1-2 sprints (8-14 dias) se Fase A foi bem arquitetada.

### 12.3 O que NÃO muda

- `src/server/services/*` (lógica de negócio)
- `src/server/agent/*` (flows + tools)
- `src/components/*` (UI em 5 camadas)
- `src/app/*` (routing, pages, layouts)
- Stripe/MP/Brevo/n8n/Anthropic integrations
- R2/Stream/Turnstile (já usando)

### 12.4 Riscos da migração

- **D1 limits** — SQLite, limites de row/string/BLOB, bound parameters, throughput single-writer. Testar com volume real antes.
- **Worker limits** — 10ms CPU free / 30s paid. Jobs longos de agente já deveriam estar em Queues.
- **Cold starts** — edge tem cold start ~20-50ms. Raramente impacta percepção.
- **Migração de dados** — downtime curto pra dump → import em D1. Planejar janela.

Fonte oficial D1: https://developers.cloudflare.com/d1/platform/limits/

### 12.5 Plano de migração (quando acontecer)

1. **Prep** — Testa Next build com `@opennextjs/cloudflare` em dev. Valida bindings.
2. **Schema migrate** — mapear tipos Postgres → SQLite/D1, gerar migrations em staging.
3. **Dump + import** — Exporta Postgres → importa D1. Valida integridade.
4. **DNS freeze** — TTL baixo em DNS (pre-migração).
5. **Cutover** — Deploy CF Workers, muda DNS pra CF, monitora.
6. **Rollback prep** — Hetzner fica readonly por 7 dias, pronto pra voltar se algo quebrar.
7. **Decommission** — Depois de 7 dias ok, desliga Hetzner desse projeto.

---

## 13. Perguntas pra destravar próxima rodada (v0.5)

Pra Sprint 0 começar, preciso:

1. ✅ Stack fechado: Next.js monolito
2. ✅ MP default + Stripe fallback
3. ✅ Postgres dedicado
4. ✅ Agente IA Nível 2-3 no VSS
5. ✅ Design system em 5 camadas
6. ✅ Blog no DB com CMS admin (Tiptap + MD source-of-truth)
7. ✅ VSS fluxo: onboarding conversacional + workspace com agente + consolidação de fase
8. ❓ Confirma Cal.com pra Advisory (§7.2)
9. ❓ Confirma NF manual MVP (§7.3)
10. ❓ Alunos atuais pra importar? (§7.6)
11. ❓ Admin MVP escopo ok? (§7.8)
12. ❓ Quota LLM 150k/500k tokens output/mês por aluno? (§7.9)
13. ❓ Modelo default Sonnet 4.6 + Opus 4.7 premium? (§7.10)
14. ❓ Backup off-site growth-infra existe? (§7.11)
15. ❓ Slugs do blog definitivos? (§7.13)
16. ⏳ Credenciais MP + Anthropic + CF + Stripe (§10)

**Próxima revisão v0.5:** quando fechar 8-15. Sprint 0 pode começar em paralelo à coleta de credenciais.
