# Páginas e posts — joelburigo-site

Inventário vivo das rotas do site (Astro SSR) e posts do blog. Atualizado em 2026-04-24.

---

## Páginas (`src/pages/`)

### Institucionais / home

| Rota | Arquivo | Propósito |
|---|---|---|
| `/` | `index.astro` | Homepage — hero + 6Ps + problema + social proof + CTAs |
| `/sobre` | `sobre.astro` | História do Joel, manifesto, cicatrizes, personalidade |
| `/cases` | `cases.astro` | Vitrine de cases (anonimizados) |
| `/contato` | `contato.astro` | Formulário + FAQs + canais |

### Produtos

| Rota | Arquivo | Propósito |
|---|---|---|
| `/vendas-sem-segredos` | `vendas-sem-segredos.astro` | **VSS — produto principal** (institucional + vendas). Hero com preço+checkout, 6Ps, 7 fases, stack, é×não é, objeções, garantia, CTA |
| `/advisory` | `advisory.astro` | Advisory 1:1 (founder R$ 200k+/mês). Hero, filtro, formatos (sessão/sprint/conselho), FAQ, CTA |

### Funis / conversão

| Rota | Arquivo | Propósito |
|---|---|---|
| `/diagnostico` | `diagnostico.astro` | Quiz 6Ps (lead magnet) |
| `/diagnostico-resultado` | `diagnostico-resultado.astro` | Resultado do quiz (scores por P) |
| `/diagnostico-obrigado` | `diagnostico-obrigado.astro` | Confirmação pós-quiz |
| `/advisory-aplicacao` | `advisory-aplicacao.astro` | Formulário de aplicação pra Advisory |
| `/advisory-obrigado` | `advisory-obrigado.astro` | Confirmação pós-aplicação |
| `/agendamento-sessao` | `agendamento-sessao.astro` | Calendário/booking pra sessões |
| `/jornada-90-dias` | `jornada-90-dias.astro` | Landing da jornada VSS de 90 dias |
| `/vss-aguardando-pagamento` | `vss-aguardando-pagamento.astro` | Checkout — aguardando confirmação |
| `/vss-analise-credito` | `vss-analise-credito.astro` | Checkout — análise de crédito |
| `/vss-compra-aprovada` | `vss-compra-aprovada.astro` | Checkout — compra aprovada |

### Editorial

| Rota | Arquivo | Propósito |
|---|---|---|
| `/blog` | `blog/index.astro` | Index do blog |
| `/blog/[slug]` | `blog/[slug].astro` | Post individual (dynamic route) |

### Utilitárias / outras

| Rota | Arquivo | Propósito |
|---|---|---|
| `/apresentacao` | `apresentacao.astro` | Deck de slides (Joel + produtos) |
| `/links` | `links.astro` | Linktree interno |

### Legais

| Rota | Arquivo | Propósito |
|---|---|---|
| `/privacidade` | `privacidade.astro` | Política de privacidade (LGPD) |
| `/termos` | `termos.astro` | Termos de uso |

### Erro

| Rota | Arquivo | Propósito |
|---|---|---|
| `/404` | `404.astro` | Not found |
| `/500` | `500.astro` | Server error |

### API

| Endpoint | Arquivo | Propósito |
|---|---|---|
| `/api/meta-conversion` | `api/meta-conversion.ts` | Meta Conversions API (server-side) |
| `/api/track` | `api/track.ts` | Tracking de eventos genérico |

---

## Posts do blog (`src/content/blog/`)

| Data | Categoria | Slug / Título |
|---|---|---|
| 2026-01-26 | Mentalidade | [`17-anos-estruturando-vendas-historia-completa`](../src/content/blog/17-anos-estruturando-vendas-historia-completa.md) — 17 Anos Estruturando Vendas: Da Quebrada ao Bilhão |
| 2025-12-12 | Framework 6Ps | [`6ps-vendas-escalaveis-guia-completo`](../src/content/blog/6ps-vendas-escalaveis-guia-completo.md) — Os 6Ps das Vendas Escaláveis: O Guia Definitivo |
| 2025-12-08 | Framework 6Ps | [`como-estruturar-vendas-do-zero`](../src/content/blog/como-estruturar-vendas-do-zero.md) — Como Estruturar Vendas do Zero: Guia Completo dos 6Ps |
| 2025-12-07 | Vendas Escaláveis | [`sistema-melhor-que-improviso`](../src/content/blog/sistema-melhor-que-improviso.md) — Sistema > Improviso: Por Que Talento Sem Processo Não Escala |
| 2025-12-06 | Mentalidade | [`agencia-vs-autonomia`](../src/content/blog/agencia-vs-autonomia.md) — Agência vs Autonomia: Por Que Eu Te Ensino a Não Precisar Mais de Mim |
| 2025-12-05 | CRM e Tecnologia | [`crm-gratuito-vs-profissional`](../src/content/blog/crm-gratuito-vs-profissional.md) — CRM Gratuito vs Profissional: Quando Migrar e Por Quê |
| 2025-12-04 | Vendas Escaláveis | [`de-10k-para-100k-por-mes`](../src/content/blog/de-10k-para-100k-por-mes.md) — De R$ 10k Para R$ 100k/Mês: As 8 Mudanças |
| 2025-12-03 | Framework 6Ps | [`posicionamento-diferencial-unico`](../src/content/blog/posicionamento-diferencial-unico.md) — Posicionamento: O P Que 90% das Empresas Ignora |
| 2025-12-02 | Framework 6Ps | [`icp-cliente-ideal-perfil`](../src/content/blog/icp-cliente-ideal-perfil.md) — ICP: Como Definir Seu Cliente Ideal |
| 2025-12-01 | Processos | [`trafego-pago-vs-prospecao-ativa`](../src/content/blog/trafego-pago-vs-prospecao-ativa.md) — Tráfego Pago vs Prospecção Ativa |
| 2025-11-30 | Processos | [`metricas-vendas-essenciais`](../src/content/blog/metricas-vendas-essenciais.md) — As 7 Métricas de Vendas Que Valem Mais Que MBA |
| 2025-11-29 | Mentalidade | [`do-barraco-ao-milhao`](../src/content/blog/do-barraco-ao-milhao.md) — 7 Erros Que Me Quebraram e 7 Princípios Que Me Reconstruíram |

**Totais:** 12 posts · 5 categorias (Framework 6Ps · Mentalidade · Vendas Escaláveis · Processos · CRM e Tecnologia).

---

## Resumo

- **26 páginas** (4 institucionais · 2 produtos · 11 funis/conversão · 2 editoriais · 2 utilitárias · 2 legais · 2 erro · 2 API)
- **12 posts** do blog ativos
- **1 LP externa descontinuada** (`/lp/vss` removida em 2026-04-24 — conteúdo mergeado em `/vendas-sem-segredos`)
