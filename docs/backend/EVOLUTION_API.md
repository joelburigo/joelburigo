# EvolutionAPI — Adapter WhatsApp

Adapter pra EvolutionAPI (servidor self-hosted no `growth-infra`). Permite enviar mensagens WhatsApp e receber eventos via webhook.

Doc oficial: https://doc.evolution-api.com/v2/api-reference/get-information

## O que faz

- `src/server/services/whatsapp.ts`
  - `sendText({ to, message })` — envia texto via `POST /message/sendText/{instance}`.
  - `sendTemplate({ to, template, variables })` — stub: substitui `{{var}}` no template e delega pra `sendText`.
  - `normalizePhone(raw)` — normaliza pra E.164 sem `+` (ex: `5511987654321`). Aceita formatos BR comuns. Valida regra: celular começa com `9` no DDD.
- `src/app/api/whatsapp/webhook/route.ts`
  - Processa apenas `event: 'messages.upsert'` com `data.key.fromMe === false`.
  - Idempotência por `wa_message_id` em `activities.metadata`.
  - Match de contact por `whatsapp` normalizado nos dois lados.
  - Contact desconhecido → grava em `form_submissions` (type `whatsapp_unknown`) pra triagem manual.
  - Sempre 200 (EvolutionAPI faz retry agressivo em não-2xx).

Hooks já cabeados:
- **Welcome no checkout** — `api/payments/webhook/mercado-pago/route.ts` dispara `sendText` paralelo ao email welcome quando `user.whatsapp` existir. Try/catch isolado.
- **Magic link** — `sendMagicLinkWhatsapp(user, url)` está pronta em `services/auth.ts` mas NÃO é chamada no fluxo atual (`/api/auth/magic-link` continua só email). Plugar quando quiser.

Em dev sem `EVOLUTION_API_URL` ou `EVOLUTION_API_KEY` o adapter loga `[whatsapp] (skipped)` e retorna `{ ok: true, skipped: true }` — não falha nada.

## Como configurar

### 1. Env vars (já validadas em `src/env.ts`)

```bash
EVOLUTION_API_URL=https://evolution.growthmaster.com.br   # base do servidor
EVOLUTION_API_KEY=...                                     # apikey global
EVOLUTION_INSTANCE=joelburigo                             # default
```

### 2. Setup mínimo da instance no painel EvolutionAPI

1. Criar instance `joelburigo` (ou outro nome — ajustar `EVOLUTION_INSTANCE`).
2. Conectar dispositivo escaneando o QR code (instância em estado `open`).
3. Verificar `GET ${EVOLUTION_API_URL}/instance/connectionState/joelburigo` retorna `state: open`.

### 3. Apontar webhook

Na UI EvolutionAPI (ou via API `POST /webhook/set/{instance}`):

- **URL**: `${PUBLIC_SITE_URL}/api/whatsapp/webhook` (em prod: `https://joelburigo.com.br/api/whatsapp/webhook`)
- **Header custom**: `apikey: ${EVOLUTION_API_KEY}` (recomendado pra autenticação simples)
- **Eventos**: marcar apenas `MESSAGES_UPSERT` (resto é ignorado pelo route).
- **webhook_by_events**: `false` (recebe tudo na mesma URL).

Em dev: usar tunnel (`pnpm dev:tunnel`) → `https://dev.joelburigo.com.br/api/whatsapp/webhook`.

## Limitações atuais

- Só texto (`sendText`). Sem mídia, sem templates oficiais (WABA), sem botões/listas.
- Webhook só processa `messages.upsert`. Outros eventos (`connection.update`, `messages.update`) viram `ignored` com 200.
- `sendTemplate` é stub — substituição naive `{{var}}`. Pra templates reais (WABA), trocar implementação quando EvolutionAPI/instância suportar.
- Match de contact por whatsapp faz table-scan filtrado por team (ok pra Joel solo; Sprint 5+ adicionar índice funcional ou normalizar `whatsapp` na escrita).
