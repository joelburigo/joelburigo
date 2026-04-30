# CRM & Pipeline — joelburigo-site

Modelo de CRM all-in-one. Atualizado pós Sprint 4 (2026-04-30).

## Visão geral

Todo lead que entra no site é capturado, atribuído a um pipeline e vira **opportunity** trabalhável no kanban admin. Marketing tracking (UTM/clids) é gravado em `lead_attribution` separado e linkado ao contact.

```
LANDING → FORM → /api/forms/* → upsertContact + persistAttribution
                              → linkAttributionToContact
                              → createOpportunity (pipeline + stage)
                              → logActivity
                              → fire conversion offline (Google Ads + Meta CAPI)
                              → email admin + email lead
```

## Tabelas principais

| Tabela | Função |
|---|---|
| `contacts` | pessoa única identificada por email · ICP fields · lifecycle_stage |
| `companies` | empresa do contact (opcional) |
| `pipelines` | pipeline (vss · advisory) |
| `stages` | colunas do kanban (kind: open/won/lost · color · probability) |
| `opportunities` | card no kanban — 1:N pra contact |
| `activities` | timeline de eventos (note/task/call/email/whatsapp/meeting/form/payment/system) |
| `lead_attribution` | UTM/clids/Meta cookies/geo/device — FK opcional pra contact |
| `diagnostico_submissions` | wizard 6Ps (estruturado) |
| `lead_doubts` | popup "Ainda tem dúvidas?" |
| `advisory_applications` | form Sprint/Conselho com qualificação ICP |

## Pipelines + stages (seed.ts)

### VSS (`slug: 'vss'`)

| Stage slug | Kind | Position | Probability % | Cor | Uso |
|---|---|---|---|---|---|
| `lead-frio` | open | 1 | 10 | cinza | popup dúvidas, contato genérico |
| `diagnostico-feito` | open | 2 | 25 | verde claro | submit /diagnostico |
| `em-conversa` | open | 3 | 45 | amarelo | admin moveu manualmente |
| `proposta-enviada` | open | 4 | 70 | laranja | admin enviou proposta |
| `comprado` | won | 5 | 100 | verde | webhook MP success |
| `perdido` | lost | 6 | 0 | vermelho | admin marcou lost |

**Legacy preservados** (forms antigos ainda escrevem): `novo`, `qualificado`, `checkout-iniciado`, `vendido`.

### Advisory (`slug: 'advisory'`)

| Stage slug | Kind | Position | Prob % | Uso |
|---|---|---|---|---|
| `aplicacao-aguardando` | open | 1 | 20 | submit `/advisory-aplicacao` |
| `em-triagem` | open | 2 | 40 | admin começou triagem |
| `aprovado` | open | 3 | 70 | aprovado, aguardando agendamento |
| `sessao-marcada` | open | 4 | 85 | sessão agendada |
| `em-execucao` | open | 5 | 95 | sprint/conselho rodando |
| `concluido` | won | 6 | 100 | entrega finalizada |
| `lost` | lost | 7 | 0 | desistiu/rejeitado |

**Legacy preservados**: `aplicacao-recebida`, `qualificado`, `proposta-enviada`, `fechado`, `perdido`.

## Auto-criação de opportunity por fonte

| Source | Pipeline | Stage inicial | Owner | Activity |
|---|---|---|---|---|
| `/api/forms/diagnostico` | vss | `qualificado` (legacy — todo migrar pra `diagnostico-feito`) | default Joel | type=form |
| `/api/forms/duvidas` | vss/advisory | `novo`/`aplicacao-recebida` (primeiro stage open) | default Joel | type=form |
| `/api/forms/advisory-aplicacao` | advisory | `aplicacao-recebida` | default Joel | type=form |
| Webhook MP success | vss/advisory | `vendido`/`fechado` (legacy) | default Joel | type=payment |

## Atribuição de marketing (lead_attribution)

Capturado no client via cookie `__jb_attr` (90d, first-touch wins) + server merge com CF headers (geo) + UA parsing (device/browser/os).

Campos:
- UTM: `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`
- Click IDs: `gclid` (Google Ads), `fbclid` (Meta), `msclkid` (Bing), `ttclid` (TikTok)
- Page: `referrer`, `first_landing_page`, `last_landing_page`
- Device: `device`, `browser`, `os`
- Geo (CF headers): `country`, `region`, `city`
- Meta CAPI: `fbp`, `fbc` (lidos dos cookies do Pixel)

FK opcional pra `contacts.id` via `linkAttributionToContact()`.

## API endpoints (admin)

Todos com `requireAdmin()` + Zod + audit log.

| Endpoint | Método | Função |
|---|---|---|
| `/api/admin/opportunities` | GET | Lista filtrada (pipeline, owner, source, status, q, from/to) + facets |
| `/api/admin/opportunities/[id]` | GET | Detalhe completo + contact + pipeline + stage + activities timeline + attribution |
| `/api/admin/opportunities/[id]` | PATCH | Update stage_id/status/value/notes — gera system activity |
| `/api/admin/opportunities/[id]/activities` | POST | Cria activity (owner = admin da sessão) |
| `/api/admin/activities/[id]` | PATCH | Update (mark_completed) |
| `/api/admin/activities/[id]` | DELETE | Remove |

## Kanban UI (`/admin/leads`)

- Tabs por pipeline (VSS · Advisory)
- Toolbar: busca debounced + filtros (status, período, source, owner) + counts
- Drag-drop entre stages (HTML5 nativo) com optimistic update + rollback em erro
- Detail panel (drawer direita) ao clicar card:
  - Quick info contact + attribution
  - Stage selector + Won/Lost
  - Timeline activities com markdown
  - Form inline pra adicionar activity (note/task/call/email/whatsapp/meeting)

## Dashboard (`/admin`)

- 8 tiles: Leads 30d · Open Opps · Won 30d · Conversion · Receita 30d · Receita total · Purchases pagos · Diagnósticos
- 2 funnel charts (VSS + Advisory) com barras horizontais por stage + value
- 10 últimas atividades cross-contact

## Testimonials (cases)

Tabela `testimonials` é source única alimentando:
- `/cases` (página pública)
- `<TestimonialCarousel productSlug="vss" featured />` no VSS
- `<TestimonialCarousel productSlug="advisory" featured />` no Advisory

CRUD em `/admin/testimonials` (foto upload R2).

## Config Hub (`/admin/config`)

Source única de tudo editável:
- Pricing: VSS R$ 1997 · Advisory R$ 997/7500/12500-15000
- Offer: garantia 15d · stack R$ 17287
- Email: from_transactional · from_personal · from_name
- Feature: popup_doubts toggle · scroll_threshold · auto_email_admin
- Integration: meta_capi.enabled · google_ads.enabled

Audit log de cada mudança em `app_config_audit`.
