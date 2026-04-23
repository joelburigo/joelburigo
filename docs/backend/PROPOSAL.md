# Backend Proposal — VSS + Advisory

> **Status:** 🔄 EM DISCUSSÃO — v0.1 · atualizado 2026-04-23
>
> Doc vivo. Edita/comenta onde discordar. Cada decisão fechada vira ✅ e move pro log histórico no fim do doc.
>
> **Legenda:** ✅ fechado · 🔄 em discussão · 📌 proposta minha · ⏳ aguardando resposta · ❓ pergunta aberta

---

## 1. Escopo confirmado

- ✅ **Sistema próprio** — nada terceirizado (sem Kiwify/Hotmart/Memberkit). Joel quer controle total.
- ✅ **Personalizado pra VSS + Advisory** — não é plataforma de cursos genérica.
- ✅ **Pagamento:** Stripe (BR suporta cartão + PIX + boleto + parcelamento).
- ✅ **Infra:** Cloudflare (Pages + D1 + R2 + KV + Workers + Queues).
- ✅ **Não tem catálogo pesado de vídeos** — VSS é playbook estruturado (15 módulos × 66 destravamentos) + mentorias ao vivo 48/ano.

---

## 2. Arquitetura proposta

### 2.1 Stack

| Camada | Tecnologia | Papel |
|---|---|---|
| Frontend + SSR | **Cloudflare Pages + Astro** | Render public + app + admin. Adapter oficial CF. |
| API routes | **Astro `/api/*` em Workers** | Mesma codebase, rodando no edge. |
| Banco relacional | **Cloudflare D1** (SQLite serverless) | users, purchases, progress, sessions |
| Blob storage | **Cloudflare R2** (S3-compat, sem egress) | Playbook MD · replays mentorias · assets |
| Cache/sessions | **Cloudflare KV** | Cookies JWT, rate-limit, cache hot |
| Async jobs | **Cloudflare Queues** | Welcome email, reminder, onboarding |
| CAPTCHA | **Turnstile** | Anti-bot em forms públicos |
| Pagamento | **Stripe (BR)** | Checkout + webhooks + Customer Portal |
| Email transacional | **Brevo** (já existe no growth-infra) | Magic link, welcome, recuperação |
| Automação externa | **n8n** (growth-infra) | Fluxos cruzando ferramentas (Slack, GA) |

### 2.2 Diagrama de alto nível

```
┌─────────────────────────────────────────────────────────────┐
│  Cloudflare Pages (Astro SSR)                               │
│                                                             │
│  Public:  / · /vss · /advisory · /diagnostico · /blog       │
│  Auth:    /entrar · /verificar (magic link)                 │
│  App VSS: /area · /fase/[N] · /destravamento/[slug]         │
│  App Adv: /advisory/dashboard · /sessao/[id]                │
│  Admin:   /admin (leads · alunos · sessões · revenue)       │
│  API:     /api/auth · /api/stripe · /api/progress · ...     │
└─────────────┬────────────┬────────────┬──────────┬──────────┘
              │            │            │          │
           ┌──▼──┐      ┌──▼──┐      ┌──▼──┐   ┌───▼────┐
           │  D1 │      │ R2  │      │ KV  │   │ Queues │
           │ SQL │      │blob │      │fast │   │ async  │
           └─────┘      └─────┘      └─────┘   └────────┘

                              ▼
                     ┌────────────────┐
                     │   Stripe       │ checkout + webhooks
                     │   Brevo API    │ email transacional
                     │   Turnstile    │ anti-bot
                     │   n8n externo  │ automação cruzada
                     └────────────────┘
```

### 2.3 Por que essa stack

📌 **Benefícios:**
- Edge global (~20ms latência BR)
- Escala automática, zero manutenção de servidor
- Custo baixíssimo (~R$5-30/mês até volume médio vs ~R$150/mês Hetzner)
- Bindings locais entre Pages/Workers/D1/R2/KV — sem latência de rede
- Tudo TypeScript end-to-end (Astro + Workers)
- n8n/Brevo/Stalwart continuam no growth-infra Hetzner pro resto

🔄 **Tradeoffs a considerar:**
- Sai do Hetzner só pra esse projeto (growth-infra continua lá)
- Astro SSR em Workers tem algumas limitações de Node APIs (checar se precisa de alguma específica)
- D1 é SQLite — suficiente pra esse volume, mas se futuro virar SaaS multi-tenant pode precisar migrar pra Postgres

❓ **Pergunta:** você tem conta Cloudflare com account ID? Se sim, me passa. Se não, crio juntos na primeira sessão de implementação.

---

## 3. Schema de dados (D1)

```sql
-- ============ USERS & AUTH ============
users (
  id TEXT PRIMARY KEY,                       -- ulid
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  whatsapp TEXT,
  stripe_customer_id TEXT UNIQUE,
  role TEXT DEFAULT 'user',                  -- user · admin
  created_at INTEGER,
  last_login_at INTEGER
)

magic_links (
  token TEXT PRIMARY KEY,                    -- random 32 bytes
  user_id TEXT REFERENCES users(id),
  expires_at INTEGER,                        -- +15min
  used_at INTEGER
)

-- sessions em KV (key: session:<jwt>, value: user_id, TTL: 30d)

-- ============ PRODUCTS & PURCHASES ============
products (
  id TEXT PRIMARY KEY,                       -- 'vss' · 'advisory_sessao' · ...
  name TEXT NOT NULL,
  price_cents INTEGER,
  currency TEXT DEFAULT 'BRL',
  recurring INTEGER DEFAULT 0,               -- 0=one-time · 1=subscription
  stripe_price_id TEXT,
  active INTEGER DEFAULT 1
)

purchases (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  product_id TEXT REFERENCES products(id),
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  status TEXT,                               -- pending · paid · refunded · chargeback
  amount_cents INTEGER,
  currency TEXT,
  paid_at INTEGER,
  refunded_at INTEGER,
  created_at INTEGER
)

subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  product_id TEXT REFERENCES products(id),
  stripe_subscription_id TEXT UNIQUE,
  status TEXT,                               -- active · past_due · canceled · ...
  current_period_end INTEGER,
  canceled_at INTEGER,
  created_at INTEGER
)

-- ============ VSS CONTENT & PROGRESS ============
vss_phases (                                 -- 7 fases
  id TEXT PRIMARY KEY,
  position INTEGER,
  slug TEXT UNIQUE,
  title TEXT,
  description TEXT
)

vss_modules (                                -- 15 módulos
  id TEXT PRIMARY KEY,
  phase_id TEXT REFERENCES vss_phases(id),
  position INTEGER,
  slug TEXT UNIQUE,
  title TEXT,
  description TEXT
)

vss_destravamentos (                         -- 66 destravamentos
  id TEXT PRIMARY KEY,
  module_id TEXT REFERENCES vss_modules(id),
  position INTEGER,
  slug TEXT UNIQUE,
  title TEXT,
  estimated_minutes INTEGER DEFAULT 20,
  content_r2_key TEXT                        -- ex: vss/f1/m01/d01.md
)

user_progress (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  destravamento_id TEXT REFERENCES vss_destravamentos(id),
  completed_at INTEGER,
  notes_md TEXT,                             -- anotações do aluno
  UNIQUE(user_id, destravamento_id)
)

-- ============ MENTORIAS AO VIVO (VSS) ============
mentorias (
  id TEXT PRIMARY KEY,
  title TEXT,
  topic TEXT,                                -- fase/tema abordado
  scheduled_at INTEGER,
  duration_min INTEGER DEFAULT 90,
  zoom_url TEXT,
  replay_r2_key TEXT,                        -- MP4 depois
  transcript_r2_key TEXT,                    -- .md gerado depois
  status TEXT                                -- scheduled · live · recorded · archived
)

mentoria_presencas (
  mentoria_id TEXT REFERENCES mentorias(id),
  user_id TEXT REFERENCES users(id),
  checked_in_at INTEGER,
  PRIMARY KEY (mentoria_id, user_id)
)

-- ============ ADVISORY ============
advisory_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  product_id TEXT,                           -- sessao · sprint · conselho
  scheduled_at INTEGER,
  duration_min INTEGER,
  meeting_url TEXT,
  status TEXT,                               -- scheduled · completed · cancelled · no_show
  notes_md_r2_key TEXT,                      -- notas do Joel
  created_at INTEGER
)

-- ============ FORMS (captura) ============
form_submissions (
  id TEXT PRIMARY KEY,
  type TEXT,                                 -- diagnostico · contato · advisory_aplicacao
  data_json TEXT,                            -- payload completo
  user_id TEXT,                              -- null se submeteu sem login
  email TEXT,
  created_at INTEGER,
  forwarded_to_n8n_at INTEGER,
  notes_admin TEXT
)

-- ============ ADMIN AUDIT ============
admin_audit (
  id TEXT PRIMARY KEY,
  admin_id TEXT,
  action TEXT,
  target_table TEXT,
  target_id TEXT,
  payload_json TEXT,
  created_at INTEGER
)
```

📌 **Decisão:** IDs em **ULID** (text, sortable, 26 chars) em vez de UUIDs — melhor pra queries com ordenação.

---

## 4. Fluxos críticos

### 4.1 Compra VSS (R$ 1.997 à vista ou 12× R$ 166,42)

```
/vss → clica CTA → /api/checkout/vss
  ↓
- Valida Turnstile + rate-limit em KV
- Cria Stripe Checkout Session:
    mode: 'payment'
    payment_methods: ['card', 'boleto', 'pix']
    line_items: [{ price: STRIPE_PRICE_VSS, quantity: 1 }]
    payment_method_options.card.installments.enabled: true
    success_url: /vss/obrigado?sid={CHECKOUT_SESSION_ID}
    cancel_url: /vss?cancelled=1
  ↓
Redirect → checkout.stripe.com
  ↓
Stripe webhook: checkout.session.completed
  ↓
/api/webhooks/stripe (verifica signature)
  ├─ upsert user (email do Stripe)
  ├─ insert purchase (status=paid)
  ├─ insert user_progress (todos os 66 destravamentos como pending)
  └─ enfileira queue: welcome_vss(user_id)
  ↓
Queue worker:
  ├─ Gera magic link (15min)
  ├─ Envia email via Brevo: "Bem-vindo ao VSS. Liga a Máquina → {link}"
  ├─ Posta no Slack admin (opcional)
  └─ Dispara evento GA + Meta Pixel (via backend)
```

📌 **Nota sobre parcelamento:** Stripe BR suporta parcelamento em até 12× no cartão. Juros são do emissor (Stripe não cobra extra). 12× R$ 166,42 = R$ 1.997,04 — alinha com a oferta.

### 4.2 Advisory Conselho Executivo (subscription R$ 15.000/mês)

```
/advisory → /advisory/aplicacao → Joel aprova manualmente → Joel envia checkout link
  ↓
Stripe Checkout Session mode=subscription
  ↓
Stripe webhook: customer.subscription.created
  ├─ insert subscription (status=active)
  ├─ insert advisory_sessions (scheduled pra proximos meses)
  └─ enfileira queue: welcome_advisory
```

❓ **Pergunta:** Advisory é **self-service checkout** (aplica → aprova auto → paga → entra) ou **manual** (aplica → Joel qualifica → Joel envia link personalizado)? Minha proposta 📌: Sessão/Sprint = self-service; Conselho = manual (qualifica pra garantir fit).

### 4.3 Login (magic link — sem senha)

```
/entrar → input de email → /api/auth/request
  ├─ Valida email + rate-limit
  ├─ Verifica se email existe em users (se não, retorna "email não cadastrado")
  ├─ Cria magic_link (token, expires=+15min)
  └─ Brevo API: "Clica pra entrar → /verificar?t={token}"
  ↓
/verificar?t={token}
  ├─ Valida token não expirou nem foi usado
  ├─ Marca magic_link.used_at
  ├─ Gera JWT (short-lived) + salva session em KV (30d)
  ├─ Set-Cookie: session=<jwt>; HttpOnly; Secure; SameSite=Lax
  └─ Redirect → /area (VSS) ou /advisory/dashboard
```

📌 **Por que magic link:**
- Zero friction (não precisa lembrar senha)
- Zero risco de senha vazada
- Zero código de "esqueci minha senha"
- Padrão de produtos modernos (Linear, Vercel, Notion)

### 4.4 Progresso dos 66 destravamentos

```
/destravamento/[slug] → aluno lê conteúdo (MD renderizado do R2)
  ↓
Clica "Marcar como feito" → POST /api/progress/complete
  ├─ Valida session
  ├─ UPDATE user_progress SET completed_at=now() WHERE user_id=... AND destravamento_id=...
  └─ Retorna novo % de conclusão da fase
  ↓
UI atualiza barra sem reload (fetch + re-render local)
```

### 4.5 Webhooks Stripe — todos os eventos tratados

| Evento | Ação |
|---|---|
| `checkout.session.completed` | Ativa compra (one-time) ou subscription |
| `customer.subscription.updated` | Atualiza status (active/past_due/canceled) |
| `customer.subscription.deleted` | Marca canceled_at, revoga acesso (grace period 7d) |
| `invoice.payment_failed` | Email "pagamento falhou" + tenta de novo em 3d |
| `charge.refunded` | Marca refunded, revoga acesso imediato |
| `charge.dispute.created` | Alerta admin (Slack) + aguarda resolução |

---

## 5. Stripe BR — métodos e custos

### 5.1 Métodos de pagamento

| Método | Disponível | Taxa | Nota |
|---|---|---|---|
| Cartão | ✅ | 3.99% + R$0,39 | Parcelamento até 12× (juros do emissor) |
| PIX | ✅ (nativo desde 2024) | ~1% | Instant settlement |
| Boleto | ✅ (nativo) | 3.45% | Prazo 3 dias úteis |
| Apple/Google Pay | ⚠️ limitado | — | Check em produção |

### 5.2 Customer Portal (built-in)

Cliente gerencia:
- Cancela subscription
- Atualiza método de pagamento
- Baixa faturas
- Vê histórico

**Zero código** — só habilita no dashboard Stripe e gera URL por cliente.

### 5.3 Comparação de taxas (10 vendas VSS/mês, R$ 19.970 volume)

| Gateway | Taxa ~média | Custo mensal estimado |
|---|---|---|
| Hotmart | 9.9% + R$1.99 | ~R$ 1.980 |
| Kiwify | 5% + R$1.99 | ~R$ 1.015 |
| **Stripe** | 3-4% (mix) | **~R$ 700-800** |

Economia vs Hotmart: **~R$ 1.200/mês**. Paga o dev em 1-2 meses.

---

## 6. Custos de infra estimados

### 6.1 Cloudflare (volume inicial-médio)

| Serviço | Tier grátis | Custo excedente | Estimativa mensal |
|---|---|---|---|
| Workers | 100k req/dia | $5/10M req | **$0** |
| D1 | 5M leituras + 100k escritas | $0.75/1M leituras | **$0** |
| R2 storage | 10 GB | $0.015/GB | **$0-2** (playbook + replays) |
| R2 operations | 1M A + 10M B | — | **$0** |
| KV | 100k leituras/dia | — | **$0** |
| Pages | 500 builds/mês | — | **$0** |
| Queues | 1M msg/mês | — | **$0** |
| Turnstile | ilimitado | — | **$0** |
| **Total CF** | | | **~$0-5/mês** |

### 6.2 Outros serviços

| Serviço | Custo |
|---|---|
| Stripe | proporcional ao volume (sem fixo) |
| Brevo | free até 300 emails/dia · pago se escalar |
| Domínio (já tem) | ~R$ 50/ano |
| Monitoramento (Sentry free tier) | $0 |
| **Total operacional fixo** | **< R$ 30/mês até mid-volume** |

---

## 7. Pontos em aberto 🔄

### 7.1 Vídeos das mentorias ao vivo
- 📌 **Minha proposta (início):** MP4 no R2, streaming direto via `<video src>`. Custo: ~R$1-2/mês. Simples.
- 🔄 **Alternativa (maduro):** Cloudflare Stream — HLS adaptativo, DRM, analytics. Custo: $5/1000 min assistidos. Melhor UX.
- ❓ Começa simples (R2) e migra se precisar? Ou já vai de Stream?

### 7.2 Advisory — agendamento
- 📌 **Minha proposta:** **Cal.com** (embed no dashboard). Free tier resolve. Economiza 1 semana de dev.
- 🔄 **Alternativa:** Página própria com slots + Stripe. Controle total mas custo.
- ❓ Qual?

### 7.3 Emissão de Nota Fiscal
- 📌 **Minha proposta:** começa **manual** (Joel emite via sistema dele). Se volume justificar, automatiza via **eNotas** ou **Nfe.io**.
- ❓ Confirma manual OK no MVP?

### 7.4 Growth CRM (incluído 12 meses no VSS)
- ❓ **PERGUNTA CRÍTICA:** é produto **SEPARADO** (SaaS próprio do Joel, já existe) ou parte desse backend?
  - Se **SEPARADO**: backend só gera credenciais e manda pro aluno. Escopo atual.
  - Se **MISMO SISTEMA**: escopo dobra. Precisa construir CRM interno (pipeline, leads, automações, landing pages).

### 7.5 Afiliados
- 📌 **Minha proposta:** **deixar pra depois**. MVP não precisa. Quando precisar, adiciona tabela `affiliates` + split via Stripe Connect. +1 semana.
- ❓ Confirma adiar?

### 7.6 Conteúdo dos 66 destravamentos
- ❓ Já existe texto pronto (em `docs/conteudo/partes/04-playbook-vss.md`) ou precisa produzir?
- A arquitetura suporta "aluno compra e libera gradualmente" — mas operacionalmente precisa ter o material.

### 7.7 Migração de dados
- ❓ Você tem alunos/clientes atuais em outro sistema (Hotmart, planilha, HighLevel)? Precisa importar?

### 7.8 Conta Cloudflare + Stripe
- ⏳ Conta CF com account ID? Se não tem, crio no setup.
- ⏳ Conta Stripe BR ativada? Test + Live keys.

---

## 8. Plano de implementação (roadmap)

### Sprint 1 — Foundation + Forms + Checkout VSS (8-10 dias)
**Objetivo:** sai do Hetzner pro Cloudflare, desbloqueia captura de leads + venda VSS.

- [ ] Setup conta CF + project + bindings (D1, R2, KV, Queues)
- [ ] Migra Astro pro adapter Cloudflare Pages
- [ ] Schema D1 inicial (users, products, purchases, magic_links, form_submissions)
- [ ] Magic link auth funcional (/entrar · /verificar)
- [ ] Stripe Checkout VSS (one-time + parcelado)
- [ ] Webhooks Stripe + welcome flow via Queue
- [ ] Forms migrados pra /api/forms/* (diagnostico, contato, advisory-aplicacao)
- [ ] Deploy staging + smoke test

**Entregável:** site roda em CF, VSS vende via Stripe, forms capturam leads.

### Sprint 2 — Área do aluno VSS (8-10 dias)
- [ ] Schema vss_phases/modules/destravamentos (popular com dados de 04-playbook-vss.md)
- [ ] Upload de conteúdo pro R2 (MD por destravamento)
- [ ] /area — dashboard aluno (progresso, próximo passo)
- [ ] /fase/[N] — navegação da fase
- [ ] /destravamento/[slug] — render MD + botão "marcar feito"
- [ ] API /progress/complete
- [ ] Barra de progresso em tempo real

**Entregável:** aluno paga VSS, acessa área, executa playbook.

### Sprint 3 — Advisory (5-7 dias)
- [ ] Produtos Advisory (Sessão R$997 one-time · Sprint R$7.500 one-time · Conselho R$15k/mês subscription)
- [ ] Checkout Stripe pras 3 modalidades
- [ ] /advisory/dashboard — cliente vê sessões futuras + histórico
- [ ] Integração Cal.com ou agenda custom
- [ ] /sessao/[id] — detalhes + notas do Joel

**Entregável:** Advisory end-to-end (checkout → agenda → sessão → follow-up).

### Sprint 4 — Admin + Mentorias + Polish (5-7 dias)
- [ ] /admin — dashboard Joel (leads, alunos ativos, receita, sessões)
- [ ] Tabelas com filtro/export CSV
- [ ] Mentorias ao vivo — CRUD + upload de replay
- [ ] Monitoring (Sentry) + backups D1
- [ ] Performance audit + SEO final
- [ ] Documentação operacional (runbook)

**Entregável:** sistema completo, Joel tem visão + operação.

**Total estimado:** 5-6 semanas focadas (1 dev full-time).

---

## 9. Decisões tomadas (log histórico)

_Append-only. Toda decisão fechada sobe pra cá com data._

- **2026-04-23** — ✅ Sistema próprio, sem terceirização de área de membros.
- **2026-04-23** — ✅ Pagamento: Stripe.
- **2026-04-23** — ✅ Infra: Cloudflare (Pages + D1 + R2 + KV + Queues).
- **2026-04-23** — ✅ Auth: magic link (sem senha).
- **2026-04-23** — ✅ IDs: ULID.

---

## 10. Perguntas pra destravar próximo passo

Pra começar Sprint 1, preciso de resposta pra:

1. ❓ Conta Cloudflare ativa? Account ID?
2. ❓ Conta Stripe BR ativada? (test + live keys)
3. ❓ Growth CRM é sistema **separado** ou parte desse backend? (§7.4)
4. ❓ Conteúdo dos 66 destravamentos existe pronto ou precisa produzir? (§7.6)
5. ❓ Advisory Conselho: self-service checkout ou manual após qualificação?
6. ❓ Vídeos mentorias: R2 simples ou Cloudflare Stream? (pode decidir depois)
7. ❓ Agendamento Advisory: Cal.com ou custom? (pode decidir depois)
8. ❓ NF emissão: manual no MVP, automatiza depois? (confirma)
9. ❓ Tem alunos/clientes atuais pra migrar de outro sistema?

Responde o que conseguir — 1, 2, 3, 4, 5 são bloqueantes. Resto dá pra destravar ao longo do caminho.

---

**Próxima revisão:** quando você responder as perguntas acima. Aí atualizo o doc com decisões, refino escopo do Sprint 1, e começo setup.
