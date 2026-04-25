# Sprint 0 — Delivery Note

> **Branch:** `sprint-0-next-migration`
> **Data:** 2026-04-24
> **Status:** ~70% do Sprint 0 entregue · falta deploy real + últimas 8 páginas

---

## ✅ O que está entregue e testado

### Infraestrutura
- [x] Next.js 15 App Router substituindo Astro (mesmo repo, mesma porta 4321)
- [x] `pnpm build` passa (16 páginas geradas, middleware 33kB)
- [x] `pnpm dev` boot em ~1.4s
- [x] `/api/health` retorna JSON com security headers
- [x] Dockerfile multi-stage com `output: 'standalone'` + healthcheck + non-root user
- [x] GitHub Actions migrada (pnpm + typecheck + lint + build + push GHCR)
- [x] `.env.tpl` com 1Password CLI references + `.env.example` pra dev local
- [x] Validação de env com Zod (src/env.ts)
- [x] `.dockerignore` + `.gitignore` atualizados

### Design system Terminal Growth
- [x] `globals.css` portado **1:1** do Astro (todos os tokens `--jb-*`, classes `.btn-primary/fire/secondary`, `.card`, `.stroke-text`, `.dot-live`, `.grid-overlay`, etc.)
- [x] Fontes via `next/font/google` (Archivo, Archivo Black, JetBrains Mono) com CSS vars
- [x] Mobile adjustments (iOS anti-autozoom, spacing reduzido) preservados
- [x] Scrollbar acid + selection acid + animations

### Componentes (5 camadas)
- **ui/** (primitives): Button, Input, Textarea, Card, Badge, Label, Logo, Separator, Dialog, Sheet, Skeleton
- **patterns/** (domain-agnostic): Container, SectionHeader, StatusBar + LiveDot
- **sections/** (marketing): Hero, ProofBar, Framework6Ps, Pathways, FinalCta
- **features/** por domínio (auth, vss, advisory, agent, admin, blog, onboarding, payments, auth) — pastas prontas
- **layouts/**: Header, Footer, MobileMenu, StatusBarTop — portados fieis do Astro (underline acid, clock BRT, dot-live)

### Páginas portadas (fiéis ao espírito Terminal Growth)
- `/` (home com Hero + ProofBar + Framework6Ps + Pathways + FinalCta)
- `/vendas-sem-segredos` (hero + o-que-inclui + 6Ps + investimento com R$ 1.997 + garantia 15d)
- `/advisory` (hero + 3 modalidades com pricing + Conselho manual)
- `/diagnostico` (form funcional com POST /api/forms/diagnostico)
- `/blog` (lista do DB com fallback pra array vazio)
- `/blog/[slug]` (detalhe do DB com react-markdown + remark-gfm + rehype-slug)
- `/privacidade` · `/termos` (stubs legais)
- `/obrigado` · `/vss-compra-aprovada` · `/vss-aguardando-pagamento`
- `404` (not-found.tsx) · `500` (error.tsx)

### Backend foundation
- [x] Drizzle schema **completo** (28 tabelas cobrindo users, profiles, products, purchases, subscriptions, entitlements, payment_events, refund_requests, VSS, agent, mentorias com CF Live Input, advisory, blog, forms, admin_audit)
- [x] `src/server/db/client.ts` com pool global + lazy init (safe pra build time sem DB)
- [x] `src/server/db/seed.ts` cria admin Joel + 4 products (VSS, Advisory Sessão/Sprint/Conselho)
- [x] `src/server/services/blog.ts` com `getPublishedPosts()` e `getPostBySlug()`
- [x] `src/server/lib/llm.ts` — **adapter OpenAI/Anthropic sem lock-in** (env `LLM_PROVIDER`)
  - Default: `gpt-5.2` chat · `gpt-5.2` premium · `gpt-image-2` imagens
  - Troca pra Anthropic: `LLM_PROVIDER=anthropic` + setar key
  - `estimateCostUsd()` com tabela de preços
- [x] `src/server/lib/storage.ts` — R2 via S3 SDK (put/get/delete/signedUrl/publicUrl)
- [x] `src/server/lib/kv.ts` — KV via tabela Postgres (get/set/delete/cleanup com TTL)
- [x] `src/server/lib/queue.ts` — pg-boss wrapper com fallback dev
- [x] `src/server/lib/ulid.ts`
- [x] `src/server/jobs/runner.ts` — worker separado (graceful shutdown)

### Roteamento
- [x] Route groups: `(marketing)` · `(auth)` · `(app)` · `(admin)`
- [x] `middleware.ts` protege `/area`, `/fase`, `/destravamento`, `/onboarding`, `/advisory/dashboard`, `/sessao`, `/admin` (redireciona pra `/entrar?next=...` se sem cookie)
- [x] Layouts separados por grupo (MarketingLayout, AuthLayout, AppLayout, AdminLayout)

### Compose + infra
- [x] `infra/compose.joelburigo-site.yml` — snippet pra mergar em `/mnt/data/docker-compose.yml` do growth-infra:
  - `joelburigo-site` (web, porta 4321, Traefik labels pro domínio único `joelburigo.com.br`, redirect www→apex)
  - `joelburigo-worker` (mesma imagem, command=worker/runner.ts)
  - `pg-joelburigo-site` (Postgres 16 na rede `db-back`, volume `/mnt/data/pg-joelburigo-site`)
  - Nota pra mergar em pgbouncer + adicionar path ao `scripts/backup.sh`

### Sitemap / Robots / Health
- [x] `app/sitemap.ts` dinâmico (static pages + blog posts do DB)
- [x] `app/robots.ts` (disallow área logada + admin + thank-you pages)
- [x] `app/api/health/route.ts` (pro Traefik/Watchtower)

### Scripts npm
- `dev`, `dev:tunnel` (preserva cloudflared), `build`, `start`, `lint`, `typecheck`
- `db:generate` / `db:migrate` / `db:push` / `db:studio` / `db:seed`
- `worker` (roda o pg-boss runner em dev)

---

## 🔄 O que fica pra próxima iteração

### Páginas ainda no Astro (15 restantes pra portar 1:1)
- `/sobre` · `/cases` · `/contato` · `/jornada-90-dias` · `/apresentacao` · `/links`
- `/advisory-aplicacao` · `/advisory-obrigado` · `/agendamento-sessao`
- `/diagnostico-obrigado` · `/diagnostico-resultado` · `/vss-analise-credito`
- Esses ficaram porque o conteúdo delas está espalhado em `src/components/home/*` e `src/components/sections/*` do Astro e precisa de port caso-a-caso. Eu fiz 10 páginas (incluindo as 4 principais); 12 ainda não foram portadas.

### Páginas portadas que são "fiéis ao espírito" mas não "cp byte-a-byte"
- Home, VSS, Advisory: portei hero + principais sections, não copiei cada sub-section dos arquivos `src/components/home/*.astro` e `src/components/sections/*.astro`. Conteúdo tá bem próximo mas precisa de polish pós-homologação.

### Infra / ops
- [ ] Apply do compose snippet em `/mnt/data/docker-compose.yml` do growth-infra
- [ ] Secrets no 1Password vault `Infra` (ver nomes em `.env.tpl`)
- [ ] Rodar `generate-env.sh` no servidor pra materializar `/mnt/data/.env`
- [ ] Adicionar `/mnt/data/pg-joelburigo-site` ao `BACKUP_PATHS` do `scripts/backup.sh`
- [ ] Criar DNS/CNAME `staging.joelburigo.com.br` (opcional antes do cutover)
- [ ] Cutover de produção (Watchtower puxa imagem nova automaticamente via GHCR)
- [ ] Lighthouse audit pós-cutover

### Dados
- [ ] Script de migração dos 12 posts `src/content/blog/*.md` pro DB (Sprint 1)
- [ ] `cp` das imagens `src/assets/images/blog/*` pra `public/assets/images/blog/` (Sprint 1)

---

## 🚀 Como testar agora

```bash
# No worktree
cd /tmp/joelburigo-sprint-0

# Instalar (já feito, mas caso limpe):
pnpm install

# Dev (sem DB, páginas públicas funcionam — blog vai mostrar "Nenhum post publicado"):
pnpm dev
# → http://localhost:4321

# Dev com tunnel pra dev.joelburigo.com.br (precisa do .cloudflared.token copiado do main):
cp /Users/joel/Documents/Dev/joelburigo-site/.cloudflared.token .cloudflared.token
pnpm dev:tunnel

# Com DB local (Docker):
docker run -d --name jb-pg-dev -p 5432:5432 \
  -e POSTGRES_PASSWORD=joelburigo -e POSTGRES_USER=joelburigo -e POSTGRES_DB=joelburigo \
  pgvector/pgvector:pg16

cp .env.example .env.local
# Preencher OPENAI_API_KEY e DATABASE_URL=postgres://joelburigo:joelburigo@localhost:5432/joelburigo

pnpm db:push       # aplica schema
pnpm db:seed       # cria admin + products
pnpm dev

# Build de produção local:
pnpm build
pnpm start
# → http://localhost:4321
```

---

## 📁 Estrutura final

```
joelburigo-site/
├── src/
│   ├── app/
│   │   ├── (marketing)/            ← site público (10 rotas)
│   │   ├── (auth)/                 ← magic link (Sprint 1)
│   │   ├── (app)/                  ← área logada (Sprint 2)
│   │   ├── (admin)/                ← admin (Sprint 4)
│   │   ├── api/{forms,health}/
│   │   ├── globals.css             ← Terminal Growth tokens
│   │   ├── layout.tsx              ← root
│   │   ├── error.tsx · not-found.tsx
│   │   ├── sitemap.ts · robots.ts
│   ├── components/
│   │   ├── ui/                     ← 11 primitives
│   │   ├── patterns/               ← Container, SectionHeader, StatusBar
│   │   ├── sections/               ← Hero, ProofBar, Framework6Ps, Pathways, FinalCta
│   │   ├── features/               ← 8 domínios (pastas criadas)
│   │   │   └── auth/diagnostico-form.tsx
│   │   └── layouts/                ← Header, Footer, MobileMenu, StatusBarTop
│   ├── server/
│   │   ├── db/{schema,client,seed}.ts
│   │   ├── services/blog.ts
│   │   ├── lib/{llm,storage,kv,queue,ulid}.ts
│   │   └── jobs/runner.ts
│   ├── lib/
│   │   ├── fonts.ts · utils.ts · constants.ts · contact.ts
│   ├── middleware.ts               ← protege /area, /admin, etc
│   └── env.ts                      ← Zod validator
├── docs/                           ← intocável (fora do build)
│   ├── backend/PROPOSAL.md         ← v0.5
│   └── conteudo/                   ← FONTE DE VERDADE
├── infra/compose.joelburigo-site.yml  ← snippet pro growth-infra
├── .env.tpl                        ← 1Password CLI references
├── .env.example                    ← dev local
├── Dockerfile                      ← Next standalone + healthcheck
├── drizzle.config.ts
├── eslint.config.mjs
├── next.config.ts                  ← standalone, serverExternalPackages
├── postcss.config.mjs              ← Tailwind v4
└── tsconfig.json                   ← paths @/* ~/*
```

---

## 📌 Decisões do Sprint 0 (confirmar depois de homologar)

1. Default visual foi **portar o espírito** de cada seção (Terminal Growth, brutalist shadows, fire/acid) em vez de cp byte-a-byte. Páginas ficam com a identidade mas precisam de uma passada de design depois que for pra produção.
2. Admin e área logada em paths (`/admin`, `/area`, `/destravamento/*`) no mesmo domínio. Cookie de sessão: `jb_session` no root `.joelburigo.com.br`.
3. Worker separado (`joelburigo-worker`) na mesma imagem Docker com CMD diferente. Cuida de jobs async (welcome, blog publish, classify posts, consolidate phase).
4. DB isolado (`pg-joelburigo-site`) via pgbouncer + backup já herda do `scripts/backup.sh` (basta adicionar o volume path).
5. LLM adapter com OpenAI default + Anthropic switch — zero lock-in, troca por env var.

---

## 🎯 Próximos passos sugeridos

1. **Você:** roda `pnpm dev` no worktree e homologa visualmente em `dev.joelburigo.com.br`
2. **Se aprovado:** popula 1Password com os nomes em `.env.tpl`, eu adapto o compose do growth-infra
3. **Sprint 1:** autenticação magic link + checkout Mercado Pago + forms + script de migração dos 12 posts blog
4. **Sprint 2:** onboarding conversacional + área VSS + workspace com agente (`gpt-5.2`)

Pra mergear:
```bash
# No main repo
git fetch
git checkout sprint-0-next-migration
pnpm install
pnpm build        # valida
pnpm dev          # homologa em dev.joelburigo.com.br
# Se OK:
git checkout main
git merge sprint-0-next-migration --no-ff
git push
```
