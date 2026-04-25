# CLAUDE.md — joelburigo-site

Site público + plataforma VSS/Advisory do Joel Burigo. **Next.js 16 App Router** (React 19, Node 22). Categoria: **interno**.

## Resumo

| Item                  | Valor                                                                                                                    |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Cliente               | Joel Burigo (próprio)                                                                                                    |
| Produção              | https://joelburigo.com.br                                                                                                |
| Stack                 | Next.js 16 App Router + React 19 + Tailwind v4 + shadcn/ui customizado (`components.json`)                               |
| Banco                 | Postgres 16 dedicado (`pg-joelburigo-site` no growth-infra compose)                                                      |
| ORM                   | Drizzle                                                                                                                  |
| LLM                   | Vercel AI SDK · OpenAI default (`gpt-5.2`, `gpt-image-2`) · adapter pra Anthropic via env                                |
| Storage               | Cloudflare R2 (artifacts, exports) · `public/` pra blog images                                                           |
| Vídeo                 | Cloudflare Stream **Live Input** (OBS → RTMP → HLS + replay automático)                                                  |
| Pagamento             | Mercado Pago BR (default) + Stripe US (fallback cartão internacional)                                                    |
| Email                 | Brevo API (transacional via Stalwart relay no growth-infra)                                                              |
| Imagem Docker         | `ghcr.io/joelburigo/joelburigo-site:latest`                                                                              |
| Containers no compose | `joelburigo-site` (web · 4321) · `joelburigo-worker` (pg-boss · mesma imagem, CMD diferente) · `pg-joelburigo-site` (DB) |
| Tunnel dev            | `pnpm dev:tunnel` → `dev.joelburigo.com.br` (Cloudflare Tunnel + `.cloudflared.token`)                                   |

## Estrutura do repo

```
joelburigo-site/
├── docs/                        ← intocável; fora do build (.dockerignore)
│   ├── conteudo/                FONTE DE VERDADE: estratégia, copy, marca, marketing
│   │   ├── partes/              4 partes núcleo (01-marca · 02-oferta · 03-vss · 04-playbook)
│   │   ├── recursos/            copy-bank · templates · scripts-videos
│   │   ├── brand/               Direção visual Terminal Growth
│   │   ├── marketing/           Produção de peças (posts IG, emails, slides)
│   │   └── _archive/            Desativados reversíveis (ex: Services)
│   └── backend/PROPOSAL.md      Proposta arquitetura (vivo, v0.5)
│
├── src/
│   ├── app/                     Next.js App Router
│   │   ├── (marketing)/         site público (10 rotas)
│   │   ├── (auth)/              magic link (Sprint 1)
│   │   ├── (app)/               área logada (/area, /destravamento, /onboarding) — Sprint 2
│   │   ├── (admin)/             /admin/* role-protected — Sprint 4
│   │   ├── api/                 route handlers (forms, health, payments, agent, admin)
│   │   ├── globals.css          tokens Terminal Growth
│   │   ├── layout.tsx · sitemap.ts · robots.ts · error.tsx · not-found.tsx
│   │
│   ├── components/              5 camadas
│   │   ├── ui/                  primitives shadcn customizados (Button, Card, Dialog, ...)
│   │   ├── patterns/            Container, SectionHeader, StatusBar (domain-agnostic)
│   │   ├── sections/            Hero, ProofBar, Framework6Ps, Pathways, FinalCta
│   │   ├── features/            por domínio (vss/, advisory/, blog/, agent/, admin/, auth/, onboarding/, payments/)
│   │   └── layouts/             Header, Footer, MobileMenu, StatusBarTop
│   │
│   ├── server/                  backend (`import 'server-only'`)
│   │   ├── db/{schema,client,seed}.ts
│   │   ├── services/            blog, payments, auth, vss, agent, ... (incremental por sprint)
│   │   ├── lib/                 adapters: llm (OpenAI/Anthropic) · storage (R2) · kv (pg) · queue (pg-boss)
│   │   └── jobs/runner.ts       worker pg-boss (processo separado no compose)
│   │
│   ├── lib/                     utils client+server safe (cn, fonts, contact, constants)
│   ├── data/                    data estática versionada (cases.ts)
│   ├── content/blog/            posts MD (fonte pra migração Sprint 1 → DB)
│   ├── assets/images/           imagens originais — ver assets/README.md
│   ├── proxy.ts                 Next 16 proxy (antes middleware) protege /area /admin etc
│   └── env.ts                   Zod env validator
│
├── public/                      assets estáticos servidos pelo Next
├── infra/compose.joelburigo-site.yml  ← snippet pro growth-infra `/mnt/data/docker-compose.yml`
├── .env.tpl                     1Password CLI references
├── Dockerfile                   Next standalone multi-stage
└── drizzle.config.ts
```

Antes de criar copy ou componente, **consulte `docs/conteudo/README.md`** (índice único de conteúdo + marca). Não invente tom, vocabulário ou cases. `docs/conteudo/` é fonte de verdade humana — `cp` 1:1 pra qualquer copy nova.

## Produtos ativos

- **VSS — Vendas Sem Segredos** (DIY perpétuo, R$ 1.997) — principal
- **Advisory** (1:1 com Joel) — Sessão R$ 997 · Sprint R$ 7.500 · Conselho R$ 15k/mês (manual)

Services foi descontinuado (arquivado em `docs/conteudo/_archive/parte9-services.md`).

## Direção atual

- **Visual:** Terminal Growth — fire `#FF3B0F` + acid `#C6FF00` sobre preto `#050505`, Archivo Black + Archivo + JetBrains Mono. Radius 0, brutalist shadows offset. Tokens `--jb-*` em `src/app/globals.css` (Tailwind v4 `@theme`). Ver `docs/conteudo/brand/README.md`.
- **Migração Astro → Next concluída em 2026-04-24** (Sprint 0). Páginas pendentes (sobre, cases, contato, jornada-90-dias, apresentação, links, advisory-aplicação, advisory-obrigado, agendamento-sessao, diagnostico-obrigado, diagnostico-resultado, vss-analise-credito) serão portadas incrementalmente — referência visual fica no Astro em produção até cutover.
- **Antes de gerar peça** (post, email, slide, anúncio, landing): ler `docs/conteudo/brand/ANTI_DRIFT.md` + `USAGE.md`. Templates copiáveis em `docs/conteudo/brand/templates/`.

## Stack/comandos

```bash
pnpm dev               # http://localhost:4321
pnpm dev:tunnel        # http://dev.joelburigo.com.br via Cloudflare Tunnel
pnpm build             # Next standalone
pnpm typecheck && pnpm lint
pnpm db:push           # aplica schema Drizzle no Postgres apontado por DATABASE_URL
pnpm db:seed           # cria admin Joel + 4 products
pnpm db:studio         # UI Drizzle
pnpm worker            # roda pg-boss runner (em prod é serviço Docker separado)
```

## Deploy

`git push main` → GH Actions: typecheck + lint + Docker build → push `ghcr.io/joelburigo/joelburigo-site:latest` → Watchtower puxa em até 60s. Workflow: `.github/workflows/deploy.yml`.

`docs/` fica fora do build Docker via `.dockerignore`.

## Comandos no servidor

```bash
ssh joel@prod-01
sudo docker compose -f /mnt/data/docker-compose.yml logs -f joelburigo-site
sudo docker compose -f /mnt/data/docker-compose.yml logs -f joelburigo-worker
sudo restore-app.sh joelburigo-site latest
```

## Contexto da infra completa

Este projeto faz parte do ecossistema Hetzner do Joel. Pra detalhes da infra (compose, backup, traefik, n8n, restrições, padrão de secrets via 1Password CLI), ver:

**`~/Documents/Dev/growth-infra/CLAUDE.md`** e **`~/Documents/Dev/growth-infra/PROJECTS.md`**.

Backup off-site já existente: `growth-infra/scripts/backup.sh` (daily/monthly + age encrypt + rclone gdrive + Hetzner snapshots). Adicionar `/mnt/data/pg-joelburigo-site` aos paths validados quando aplicar o compose.

## Roadmap

Detalhe completo em `docs/backend/PROPOSAL.md` (v0.5). Sprints:

- **Sprint 0** ✅ — Migração Astro → Next + design system + Drizzle + Docker (concluído 2026-04-24, ver `SPRINT-0-DELIVERY.md`)
- **Sprint 1** — Foundation + checkout Mercado Pago + magic link + forms + migração 12 posts blog
- **Sprint 2** — Onboarding conversacional + área VSS + workspace com agente (`gpt-5.2`)
- **Sprint 3** — Advisory (3 modalidades, Cal.com embed)
- **Sprint 4** — Mentorias (CF Stream Live Input via OBS) + admin + blog CMS Tiptap
- **Sprints 5+** — Resto dos 56 destravamentos VSS (incremental)
