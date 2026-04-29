# RUNBOOK — joelburigo-site

Operação, comandos e processos do site rodando em Cloudflare Workers + Neon Postgres + R2 + Cron Triggers + Queues. Atualizado pós-migração Hetzner→CF (abril 2026).

## TL;DR pra começar

```bash
# 1. Local dev (aponta pro Neon dev)
pnpm install
pnpm dev                  # http://localhost:4321

# 2. Deploy automático
git push origin main      # → CI roda → deploy-dev → dev.joelburigo.com.br

# 3. Deploy prod (manual + approval)
gh workflow run deploy-prod.yml -f confirm=PROD
```

---

## 1. Stack atual

| Camada              | Tecnologia                                                            |
| ------------------- | --------------------------------------------------------------------- |
| Runtime web         | Cloudflare Workers via `@opennextjs/cloudflare`                       |
| Custom worker entry | `custom-worker.ts` (wrappa OpenNext + adiciona `scheduled`/`queue`)   |
| Framework           | Next.js 16 App Router · React 19 · Turbopack                          |
| Banco               | Neon Postgres (branches `dev` + `production`) via Cloudflare Hyperdrive |
| ORM                 | Drizzle (`postgres` driver — porsager, Workers-safe)                  |
| Storage             | R2 buckets: `joelburigo-artifacts` (uploads) + `joelburigo-next-cache` (ISR) |
| Filas               | Cloudflare Queues `joelburigo-jobs` + DLQ `joelburigo-jobs-dlq`       |
| Cron                | Cloudflare Cron Triggers (4 schedules)                                |
| Vídeo               | Cloudflare Stream (Live Input)                                        |
| Email               | Brevo API                                                             |
| Pagamento           | Mercado Pago BR (default) + Stripe US (fallback cartão internacional) |

## 2. Topologia de ambientes

```
LOCAL (Mac)              GITHUB                       NEON                CLOUDFLARE
───────────              ──────                       ────                ──────────
pnpm dev      ────►   git push (PR)        ─►   dev branch          ─►   ci.yml (typecheck+lint)
                                                                     ─►   PR preview (TBD)

                      merge → main          ─►   dev branch          ─►   dev.joelburigo.com.br
                                                                          (auto via deploy-dev.yml)

                      workflow_dispatch     ─►   production branch   ─►   joelburigo.com.br
                      (input "PROD" + approval)                            (manual via deploy-prod.yml)
```

- **Local nunca toca `production`.** `.env` aponta sempre pro Neon `dev`.
- **`main` = ambiente de homologação** — auto-deploy contínuo.
- **Prod só via GH Actions com approval** (você é reviewer obrigatório do environment `Production`).

## 3. Comandos pnpm

### Dev local

| Comando                | O que faz                                                             |
| ---------------------- | --------------------------------------------------------------------- |
| `pnpm dev`             | `next dev` em http://localhost:4321 contra `DATABASE_URL` (Neon dev)  |
| `pnpm dev:tunnel`      | `pnpm dev` + Cloudflare Tunnel pra testar webhooks externos           |
| `pnpm typecheck`       | `tsc --noEmit`                                                        |
| `pnpm lint`            | ESLint                                                                |
| `pnpm format`          | Prettier write                                                        |

### Banco

| Comando                | O que faz                                                              |
| ---------------------- | ---------------------------------------------------------------------- |
| `pnpm db:push`         | Aplica schema Drizzle em `DATABASE_URL` (interativo; em CI: `--force`) |
| `pnpm db:generate`     | Gera SQL migrations (drizzle-kit)                                      |
| `pnpm db:migrate`      | Aplica migrations versionadas                                          |
| `pnpm db:seed`         | Admin Joel + 4 products + 7 fases VSS + 15 módulos + 66 destravamentos |
| `pnpm db:studio`       | UI Drizzle (browse + edit)                                             |
| `pnpm db:migrate-blog` | Importa posts MD de `docs/blog/*.md` → tabela `blog_posts` (idempotente, upsert por slug) |

### Cloudflare

| Comando                | O que faz                                                              |
| ---------------------- | ---------------------------------------------------------------------- |
| `pnpm cf:build`        | `opennextjs-cloudflare build` → `.open-next/worker.js`                 |
| `pnpm cf:preview`      | `wrangler dev` (testa localmente; **scheduled/queue NÃO rodam** — limitação OpenNext) |
| `pnpm cf:deploy:dev`   | Build + deploy em `joelburigo-site-dev` → `dev.joelburigo.com.br`      |
| `pnpm cf:deploy:prod`  | Build + deploy em `joelburigo-site` → `joelburigo.com.br`              |

> **Cuidado**: `cf:deploy:prod` deployа SEM approval. Em prod, **prefira sempre o workflow GH Actions** (`gh workflow run deploy-prod.yml`) que tem a barreira de review.

### Helper local

| Comando                                            | O que faz                                          |
| -------------------------------------------------- | -------------------------------------------------- |
| `node scripts/cf-secrets-from-env.mjs <dev\|prod>` | Bulk upload do `.env` pros secrets do Worker       |

## 4. Setup de uma máquina nova

```bash
# 1. Clone + deps
git clone git@github.com:joelburigo/joelburigo-site.git
cd joelburigo-site
pnpm install

# 2. .env (recupera do 1Password ou pede pro Joel)
cp .env.tpl .env
# preenche os valores

# 3. Sobe ulimit do macOS (Watchpack estoura senão)
echo 'ulimit -n 65536' >> ~/.zshrc && source ~/.zshrc

# 4. Aplica schema na Neon dev (idempotente)
pnpm db:push

# 5. Seed
pnpm db:seed
pnpm db:migrate-blog

# 6. Roda
pnpm dev
```

## 5. Deploy

### Dev (automático)

```bash
git push origin main
# GH Actions roda ci.yml + deploy-dev.yml em paralelo
# deploy-dev.yml ~= 1m30s
gh run watch  # acompanha live
```

URL: https://dev.joelburigo.com.br

### Prod (manual + approval)

```bash
# 1. Garantir secrets prod no CF (se ainda não setou pra esse env)
node scripts/cf-secrets-from-env.mjs prod

# 2. Disparar workflow
gh workflow run deploy-prod.yml -f confirm=PROD

# 3. GitHub envia notificação → você aprova em Actions → roda
gh run watch
```

URL: https://joelburigo.com.br

### Rollback

```bash
# Ver versões deployadas
npx wrangler@latest deployments list --name joelburigo-site --env prod

# Voltar pra versão anterior (último deploy)
npx wrangler@latest rollback --name joelburigo-site --env prod
```

> Worker rollback é instantâneo (versionamento nativo CF). Não invalida nada que tava em flight.

## 6. Banco de dados

### Conexões

- **Local dev**: `DATABASE_URL` no `.env` aponta pro Neon `dev` direto (com pooler).
- **Workers (dev/prod)**: Hyperdrive binding `HYPERDRIVE` resolve connection string em runtime.
  - Hyperdrive dev:  `d40fdd1fbbf1477381b8b6f77754c308` → Neon `dev`
  - Hyperdrive prod: `23a0dcc0a7224b55b0dc8d3912088aa7` → Neon `production`

### Mudanças de schema

```bash
# 1. Edita src/server/db/schema.ts
# 2. Aplica em dev (interativo)
pnpm db:push

# 3. Quando passar de dev pra prod:
DATABASE_URL='<neon prod url>' pnpm exec drizzle-kit push --force
```

### Backup

Neon faz **point-in-time recovery automático** (até 24h no Free, 7d no Launch). Pra dump manual:

```bash
pg_dump "$DATABASE_URL" > backup-$(date +%Y%m%d).sql
```

Pra restore num branch novo:

```bash
# 1. Cria branch no Neon dashboard
# 2. pega connection string
psql "$NEW_BRANCH_URL" < backup-20260101.sql
```

## 7. Secrets

### Hierarquia

| Onde                          | Pra quê                                                                        |
| ----------------------------- | ------------------------------------------------------------------------------ |
| `.env` (local, gitignored)    | Dev local                                                                      |
| Cloudflare Workers Secrets    | Runtime do Worker (criados via `wrangler secret put` ou bulk script)           |
| GitHub Actions Secrets        | Pra CI fazer deploy                                                            |
| GitHub Environment Secrets    | DATABASE_URL_DEV (env=dev) e DATABASE_URL_PROD (env=Production)                |

### Listar secrets do Worker

```bash
npx wrangler@latest secret list --env dev
npx wrangler@latest secret list --env prod
```

### Adicionar/atualizar secret

```bash
echo "valor" | npx wrangler@latest secret put NOME_DO_SECRET --env dev
```

### Bulk upload (helper) — fontes diferentes por env

```bash
# Lê .env (valores DEV)
node scripts/cf-secrets-from-env.mjs dev

# Lê .env.prod (valores PROD; arquivo gitignored)
node scripts/cf-secrets-from-env.mjs prod
```

> Pula auto: `NODE_ENV`, `PORT`, `DATABASE_URL`, `PUBLIC_SITE_URL`, `LLM_PROVIDER`, `CF_ACCOUNT_ID`, `CF_API_TOKEN`. Esses são `vars` em `wrangler.jsonc` ou bindings.

### Setup inicial do .env.prod

1. Copia o template: `cp .env.prod.example .env.prod`
2. Preenche **só os secrets marcados 🔴 OBRIGATÓRIO** (JWT, MP_*, R2_*)
3. Os marcados 🟢 podem ser cópia do `.env` dev (mesmo valor)
4. Roda: `node scripts/cf-secrets-from-env.mjs prod`

⚠️ **Nunca commita `.env.prod`** — está no `.gitignore`.

### Rotacionar JWT_SECRET

```bash
NEW=$(openssl rand -base64 32)
echo "$NEW" | npx wrangler@latest secret put JWT_SECRET --env dev
echo "$NEW" | npx wrangler@latest secret put JWT_SECRET --env prod
# atualiza .env local com o mesmo valor
```

> ⚠️ Rotacionar JWT_SECRET **invalida todas as sessões ativas**. Faça em janela de baixo tráfego.

### Por que NÃO usamos Cloudflare Secrets Store agora

A Cloudflare lançou o **Secrets Store** em **public beta em abril 2025** ([changelog](https://developers.cloudflare.com/changelog/post/2025-04-09-secrets-store-beta/)). Diferente do `wrangler secret put` (que cria secrets atrelados a UM Worker), o Secrets Store é **conta-level e compartilhável** entre múltiplos Workers.

**Estado atual (abril 2026)**:

- Beta pública (não GA), pricing final ainda não publicado
- Free tier: até **20 secrets/conta**, beta permite até **100**
- Apenas **1 store por conta**
- Bindings: `secrets_store_secrets` em `wrangler.jsonc`
- Acesso via `await env.MEU_SECRET.get()` (assíncrono, **não** é mais `env.JWT_SECRET` síncrono)
- Local dev tem limitação: NÃO acessa secrets de produção (precisa rodar com `--remote`)

**Por que NÃO migrar agora**:

1. **Single Worker setup**: temos 1 Worker (`joelburigo-site`), 2 envs. Workers Secrets já fazem o job sem complexidade extra.
2. **API mudou**: cada acesso vira `await env.X.get()` em vez de `env.X` direto. Refator em ~25 pontos do código sem ganho operacional.
3. **Beta**: pricing não definido. Migrar agora é apostar em estabilidade futura sem benefício imediato.
4. **Local dev quebra**: `wrangler dev` local não acessa Secrets Store de prod (segurança), exigindo `--remote` ou store separada por env.

**Quando vai valer migrar**:

- ✅ Quando GA (com pricing claro)
- ✅ Quando o segundo Worker entrar (housecredi-site, urbancred-site) e começar a haver secrets compartilhados (ex: `OPENAI_API_KEY` usado por todos)
- ✅ Quando precisarmos de auditoria de acesso a secret (Secrets Store loga; Workers Secrets não)

**Plano de upgrade futuro** (quando o gatilho disparar):

```jsonc
// wrangler.jsonc
{
  "secrets_store_secrets": [
    { "binding": "OPENAI_API_KEY", "store_id": "<id>", "secret_name": "openai-api-key" },
    { "binding": "JWT_SECRET", "store_id": "<id>", "secret_name": "jwt-secret-prod" }
    // ...
  ]
}
```

E refator no código:

```ts
// antes
const key = process.env.OPENAI_API_KEY;
// depois
const key = await env.OPENAI_API_KEY.get();
```

Por enquanto, **Workers Secrets é o pragmático**.

## 8. Cron Triggers

Configurados em `wrangler.jsonc[env.<env>.triggers.crons]`. Cada cron expression faz fetch interno em `/api/cron`:

```
0 3 * * *     → handleAgentUsageRollup     (diário 03:00 UTC)
*/15 * * * *  → handlePullGoogleDelta      (sync calendar pull a cada 15min)
0 4 * * *     → handleRenewGoogleWebhook   (diário 04:00 UTC)
*/5 * * * *   → handlePublishDuePosts      (publica posts agendados a cada 5min)
```

### Testar cron manualmente

```bash
# Pega o CRON_SECRET (separado dev/prod)
SECRET=$(npx wrangler@latest secret list --env dev | grep CRON_SECRET)  # só lista nomes; valor não é recuperável depois

# Dispara o handler
/usr/bin/curl -X POST https://dev.joelburigo.com.br/api/cron \
  -H "x-cron-secret: <valor>" \
  -H "content-type: application/json" \
  -d '{"cron":"0 3 * * *","scheduledTime":1730000000000}'
```

### Adicionar novo cron

1. Cria handler em `src/server/jobs/<nome>.ts` (segue padrão de `agent-usage-rollup.ts`)
2. Adiciona case em `src/server/jobs/scheduled.ts`
3. Adiciona expressão em `wrangler.jsonc[env.<env>.triggers.crons]`
4. Deploy

## 9. Queues (jobs assíncronos)

### Producer

```ts
import { queue } from '@/server/lib/queue';
await queue.enqueue('PUSH_CALENDAR_EVENT', { eventId: 'abc' });
```

Em Workers vai pra `env.JOBS_QUEUE.send(...)` que é a CF Queue. Em local dev, vira no-op com log.

### Consumer

`custom-worker.ts` recebe o batch e faz fetch em `/api/queue/dispatch` que chama `dispatchQueueJob` em `src/server/jobs/dispatch.ts`. Cada job mapeia pra um handler.

### Adicionar novo job

1. Cria handler em `src/server/jobs/<nome>.ts` recebendo `Job<T>[]`
2. Adiciona constante em `JobNames` em `src/server/jobs/dispatch.ts`
3. Adiciona case no switch
4. No código que dispara: `queue.enqueue(JobNames.NOVO_JOB, payload)`

### Inspecionar queue

```bash
npx wrangler@latest queues list
npx wrangler@latest queues consumer joelburigo-jobs
# Mensagens em DLQ
npx wrangler@latest queues consumer joelburigo-jobs-dlq
```

### Reprocessar mensagens da DLQ

Não tem comando direto. Padrão: pega mensagens da DLQ, processa manual (script ad-hoc) e ack.

## 10. Imagens (blog)

Migrámos sharp → Cloudflare Image Transformations. Render usa helper:

```ts
import { blogImageUrl, blogImageSrcSet } from '@/lib/blog-image';

// uma URL com largura fixa
<img src={blogImageUrl(post.cover_image_path, { width: 1080, format: 'auto' })} />

// srcset responsivo
<img srcSet={blogImageSrcSet(post.cover_image_path)} sizes="(max-width: 768px) 100vw, 768px" />
```

URL final fica: `https://<zone>/cdn-cgi/image/width=1080,format=auto/<source>`.

> **Pra ativar CIT em prod**: precisa habilitar **Image Resizing** na zona Cloudflare (`dash.cloudflare.com → Speed → Optimization → Image Resizing → Enable`). Inclui no Workers Paid até 5k transformações únicas/mês.

Pra dev (sem CIT), helper devolve URL original (sem resize) e funciona normal.

## 11. Áudio (blog)

Schema tem `blog_posts.audio_path` (text, nullable). Convenção:

- Local: `/audio/blog/<slug>.mp3` (servido por `public/`)
- Remoto: R2 key (futuro)

Geração via `pnpm audio:generate` (OpenAI TTS) — script local, não roda em CI/Workers.

Render no `(marketing)/blog/[slug]/page.tsx` usa `<audio>` HTML5 nativo:

```tsx
{audio && <audio controls src={audio} />}
```

## 12. Workflow GitHub Actions

| Workflow            | Trigger                                | Roda                                                |
| ------------------- | -------------------------------------- | --------------------------------------------------- |
| `ci.yml`            | PR contra main + push em main          | typecheck + lint                                    |
| `deploy-dev.yml`    | push em main + workflow_dispatch       | build + deploy → `dev.joelburigo.com.br`            |
| `deploy-prod.yml`   | workflow_dispatch (com input "PROD")   | build + deploy → `joelburigo.com.br` (após approval) |

### Disparar prod manualmente

```bash
gh workflow run deploy-prod.yml -f confirm=PROD
gh run watch
```

GitHub vai pausar pedindo approval (você é reviewer). Aprova em Actions → continua.

### Cancelar deploy em curso

```bash
gh run list --workflow=deploy-dev.yml -L 1 --json databaseId -q '.[0].databaseId' | xargs gh run cancel
```

## 13. Observabilidade

### Logs do Worker

```bash
npx wrangler@latest tail --env dev    # live tail
npx wrangler@latest tail --env prod
```

Filtros:

```bash
npx wrangler@latest tail --env prod --status error    # só erros
npx wrangler@latest tail --env prod --search "checkout"
```

### Métricas

`observability.enabled: true` no `wrangler.jsonc` → Cloudflare guarda logs estruturados que aparecem em **dash.cloudflare.com → Workers → joelburigo-site → Logs**.

### Sentry

`SENTRY_DSN` está no `.env` (vazio por padrão). Quando ativar, captura erros server-side automaticamente. Sprint 4.

## 14. Troubleshooting comum

### "Could not find compiled Open Next config"

`cf:deploy` não rodou build antes. Use `pnpm cf:deploy:dev` (que chama build+deploy juntos) em vez de `pnpm cf:build` solto.

### "exceeded the uncompressed size limit of 64 MiB"

Worker bundle muito grande. Causas:
- Pacote pesado importado (era o caso de `googleapis` 5MB; trocamos por `@googleapis/calendar`)
- Sharp ou outro nativo (resolvido removendo de `blog-cms.ts`)

Inspecionar:

```bash
pnpm cf:build
ls -lh .open-next/worker.js
# se >50MB, identificar o culpado:
du -sh .open-next/server-functions/default/node_modules/* | sort -h | tail -10
```

### "EMFILE: too many open files" em dev

macOS limit baixo. Já mitigado em `pnpm dev` (faz `ulimit -n 65536`). Se ainda der, adiciona no `~/.zshrc`:

```bash
echo 'ulimit -n 65536' >> ~/.zshrc
```

### "This module cannot be imported from a Client Component"

`server-only` ativo em arquivo que tá sendo bundled pelo wrangler (custom-worker chain). Solução: o arquivo não deve ter `import 'server-only'` se for parte da chain do `custom-worker.ts`.

### Worker novo aponta pro Hyperdrive errado

Confere `wrangler.jsonc[env.<x>.hyperdrive[].id]` está apontando pro ID correto:

```bash
npx wrangler@latest hyperdrive list
```

### Cron não disparou

1. Confere `wrangler.jsonc[env.<x>.triggers.crons]`
2. Confere `Cloudflare dashboard → Workers → joelburigo-site → Triggers → Cron Triggers`
3. Testa manual chamando `/api/cron` com payload válido (ver §8)
4. Confere logs com `wrangler tail --env prod`

### Queue não processa

1. Confere binding `JOBS_QUEUE` no `wrangler.jsonc`
2. `npx wrangler@latest queues consumer joelburigo-jobs` — vê se há consumer
3. Confere DLQ: se tem msgs, é porque deu retry esgotado
4. Logs com `wrangler tail`

## 15. IDs e recursos Cloudflare (registro)

| Recurso                  | ID                                       |
| ------------------------ | ---------------------------------------- |
| Account ID               | `9a7483a31b88e0985db3ad85c685e223`       |
| Hyperdrive dev           | `d40fdd1fbbf1477381b8b6f77754c308`       |
| Hyperdrive prod          | `23a0dcc0a7224b55b0dc8d3912088aa7`       |
| R2 bucket cache          | `joelburigo-next-cache`                  |
| R2 bucket artifacts      | `joelburigo-artifacts`                   |
| Queue dev                | `joelburigo-jobs-dev` + `-dlq`           |
| Queue prod               | `joelburigo-jobs-prod` + `-dlq`          |
| Worker dev               | `joelburigo-site-dev` → dev.joelburigo.com.br |
| Worker prod              | `joelburigo-site` → joelburigo.com.br    |

## 16. Referências externas

- [OpenNext Cloudflare](https://opennext.js.org/cloudflare)
- [Custom worker pattern](https://opennext.js.org/cloudflare/howtos/custom-worker)
- [Cloudflare Hyperdrive](https://developers.cloudflare.com/hyperdrive/)
- [Cloudflare Queues](https://developers.cloudflare.com/queues/)
- [Cloudflare Cron Triggers](https://developers.cloudflare.com/workers/configuration/cron-triggers/)
- [Cloudflare Image Transformations](https://developers.cloudflare.com/images/transform-images/transform-via-url/)
- [Cloudflare Secrets Store](https://developers.cloudflare.com/secrets-store/) (beta — não usamos ainda; ver §7)
- [Neon Postgres](https://neon.com/docs/introduction)
- [Drizzle ORM](https://orm.drizzle.team/)
