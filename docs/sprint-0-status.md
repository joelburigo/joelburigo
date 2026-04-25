# Sprint 0 — Status final

**Concluída em 2026-04-25.** Pronta pra Sprint 1.

## ✅ Entregue

### Stack atualizada (versões mais recentes)

| Dep                | Versão  |
| ------------------ | ------- |
| Next.js            | 16.2.4  |
| React              | 19.x    |
| TypeScript         | 5.9.3   |
| Tailwind CSS       | v4.2    |
| shadcn/ui          | new-york (`components.json` configurado) |
| Drizzle ORM        | 0.45.2  |
| drizzle-kit        | 0.31.10 |
| Vercel AI SDK      | 6.0.168 |
| @ai-sdk/openai     | 3.0.53  |
| @ai-sdk/anthropic  | 3.0.71  |
| stripe             | 22.1.0  |
| openai             | 6.34.0  |
| pg-boss            | 12.17.0 |
| jose               | 6.2.2   |
| lucide-react       | 1.11.0  |
| chart.js           | 4.5.1   |

### Migração Astro → Next 16

- 41 rotas portadas (22 páginas + 16 stubs sprint 1-4 + 3 SEO)
- Design system Terminal Growth 100% preservado (tokens `--jb-*`)
- Componentes em 5 camadas: `ui` · `patterns` · `sections` · `features` · `layouts`
- `components.json` shadcn (style new-york, Lucide icons)
- Barrel exports `index.ts` em ui/patterns/sections/home/layouts
- Fontes via `next/font/google` (Archivo, Archivo Black, JetBrains Mono)
- Tunnel dev preservado: `pnpm dev:tunnel` → `dev.joelburigo.com.br`
- `middleware.ts` → `proxy.ts` (Next 16 deprecou middleware)

### Backend foundation

- Drizzle schema completo (28 tabelas cobrindo Sprint 1-4)
- LLM adapter OpenAI/Anthropic via env (`server/lib/llm.ts`)
- Adapters R2 (S3 SDK), KV (pg), Queue (pg-boss)
- pg-boss v12 worker em processo separado
- Form handlers stub (`/api/forms/contato`, `/api/forms/diagnostico`)

### Conteúdo do site

- 8 sections da home byte-fiel (Hero/QuemSou/Problem/Framework/ProofSocial/Pathways/BlogPosts/FinalCta)
- Páginas marketing: home, /vendas-sem-segredos, /advisory, /diagnostico, /sobre, /cases, /contato, /jornada-90-dias, /links, /privacidade, /termos
- Páginas auxiliares: /vss-analise-credito, /vss-compra-aprovada, /vss-aguardando-pagamento, /advisory-aplicacao, /advisory-obrigado, /agendamento-sessao, /diagnostico-obrigado, /diagnostico-resultado, /obrigado
- Standalone: /apresentacao (deck 19 slides com state machine — slides individuais em port incremental), /links (linktree)
- Stubs DevStub: /entrar /verificar /area /onboarding /destravamento/[slug] /fase/[slug] /advisory/dashboard /sessao/[id] /admin /admin/leads /admin/users /admin/mentorias /admin/agent-usage /admin/blog /admin/blog/new /admin/blog/[id]
- Blog shell lendo do DB (`getPublishedPosts` via Drizzle)
- 404, 500, sitemap, robots, JSON-LD Organization/WebSite/Course/Service/BreadcrumbList

### Infra/devops

- Dockerfile multi-stage standalone (web + worker mesma imagem)
- `infra/compose.joelburigo-site.yml` snippet pro growth-infra
- `.env.tpl` com 30 vars (1Password CLI references) + `.env.example` dev
- GitHub Actions: pnpm + lint + typecheck + Docker build → push GHCR
- CSP completa portada do Astro pro `next.config.ts headers()`
- Backup off-site herdado do growth-infra (só adicionar `/mnt/data/pg-joelburigo-site` aos paths)

### Texto/branding

- Status bar simplificada: removido `@joelburigo`, `EXP. 2004`, `GROWTH EST. 2008`
- Mantido apenas `EST. 2008` (no header, footer, rodapés VSS/Diagnostico, brand docs)
- Logo wordmark fiel (`JOEL` cream + `BURIGO` fire, sem dot acid)

### Imagens

- OG image gerada: `public/og-image.jpg` (1200×630, brutalist Terminal Growth)
- Hero Joel: `public/images/joel-burigo-vendas-sem-segredos-2-{480,800,1200}w.webp`
- Script regenerável: `scripts/generate-og-svg.mjs` (SVG vetorial)
- Script alternativo: `scripts/generate-og-image.mjs` (gpt-image-2 via OpenAI API quando key for válida)

### Lint/qualidade

- `pnpm lint` → 0 warnings, 0 errors
- `pnpm typecheck` → OK
- Prettier aplicado em todo o repo (36 arquivos formatados na última passada)
- ESLint flat config nativo (eslint-config-next 16 + typescript-eslint 8)

## 🔄 Handoff infra (depende do servidor/credenciais)

| # | Item                                                                           |
| - | ------------------------------------------------------------------------------ |
| 1 | Apply do compose snippet em `/mnt/data/docker-compose.yml` do growth-infra     |
| 2 | Popular secrets no 1Password vault `Infra` (ver nomes em `.env.tpl`)           |
| 3 | Adicionar `/mnt/data/pg-joelburigo-site` aos paths de `scripts/backup.sh`      |
| 4 | Provisionar Postgres dedicado (`pg-joelburigo-site`) na rede `db-back`         |
| 5 | Lighthouse audit pós-deploy staging                                            |
| 6 | Atualizar `OPENAI_API_KEY` (a atual no .env retornou 401)                      |

## ⚠️ Placeholders conscientes (Sprint 1+)

- 19 slides individuais de `/apresentacao` — deck navegável funciona, conteúdo
  byte-fiel dos slides é uso interno (vendas presenciais), prioridade baixa
- 16 stubs DevStub em `(auth)/(app)/(admin)` — implementação Sprint 1-4 conforme PROPOSAL.md

## Pra rodar

```bash
pnpm dev               # http://localhost:4321
pnpm dev:tunnel        # https://dev.joelburigo.com.br
pnpm build             # standalone Next 16
pnpm lint              # eslint flat config
pnpm typecheck         # tsc --noEmit
pnpm db:push           # aplica schema Drizzle
pnpm db:seed           # admin Joel + 4 products
pnpm worker            # pg-boss runner local
node scripts/generate-og-svg.mjs   # regenera public/og-image.jpg
```
