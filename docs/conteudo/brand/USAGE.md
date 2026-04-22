# USAGE — Qual template/fonte usar pra cada pedido

> Consulta rápida pra Claude Code decidir o que abrir quando o usuário pede uma peça. Não substitui `ANTI_DRIFT.md` (regras) nem `README.md` (tokens) — complementa.

## Workflow obrigatório (sempre, em qualquer pedido)

1. Ler `ANTI_DRIFT.md` — regras de proibição, provas de autoridade exatas, vocabulário permitido/banido
2. Ler `README.md` — tokens visuais (`--jb-*`), voz, iconografia, tipografia (Archivo Black + JetBrains Mono)
3. Puxar copy de `../recursos/copy-bank.md` + `../partes/01-marca.md` (manifesto, 7 inimigos, voz) + `../partes/02-oferta.md` (VSS / Advisory — só esses 2 produtos; Services foi arquivado)
4. Escolher template pela tabela abaixo
5. Copiar template → editar copy (nunca editar o arquivo `templates/` original — duplicar em `marketing/posts/` ou onde for entregar) → entregar
6. Se número, case, nicho ou resultado pedido não está nas provas oficiais de `ANTI_DRIFT.md §4` ou `copy-bank.md`, **PERGUNTAR antes de inventar**. Nunca fabricar métrica.

## Tabela de decisão

| Pedido do usuário | Template/arquivo | Fonte de copy | Canvas |
|---|---|---|---|
| "post IG manifesto / tese" | `templates/ig-feed.html` variante 1 (manifesto) | `copy-bank.md §manifesto` + `partes/01-marca.md` | 1080×1080 |
| "post IG com número / estatística / mega-stat" | `templates/ig-feed.html` variante 2 (mega-número) | `copy-bank.md §provas` + `ANTI_DRIFT.md §4` (provas exatas) | 1080×1080 |
| "post IG antes/depois / transformação" | `templates/ig-feed.html` variante 3 (split) | `copy-bank.md §casos` + `ANTI_DRIFT.md §4` | 1080×1080 |
| "post IG citação / frase de impacto" | `templates/ig-feed.html` variante 4 (quote) | `copy-bank.md §frases-canônicas` | 1080×1080 |
| "post IG dos 6 Ps / metodologia" | `preview/card-6ps.html` como base OU `templates/ig-feed.html` + bloco 6P | `partes/01-marca.md §6Ps` | 1080×1080 |
| "post IG depoimento / social proof" | `templates/ig-feed.html` (layout depoimento do `ig_posts.html`) | `ANTI_DRIFT.md §4` — usar depoimentos nomeados; nunca inventar cliente | 1080×1080 |
| "carrossel IG" (sem especificar slides) | `templates/ig-carrossel.html` — perguntar se 5, 7 ou 10 slides; default 7 (capa + 5 conteúdo + CTA) | `copy-bank.md` + `scripts-videos.md` (estruturas de hook) | 1080×1350 |
| "carrossel completo sobre [tema]" | `templates/ig-carrossel.html` 7 slides: capa / dor / tese / 3 passos (3 slides) / CTA | `copy-bank.md` + `partes/01-marca.md` + `partes/02-oferta.md` | 1080×1350 |
| "story IG teaser / pergunta" | `templates/ig-story.html` variante 1 (pergunta) | `copy-bank.md §hooks` | 1080×1920 |
| "story IG com stat / dado" | `templates/ig-story.html` variante 2 (stat) | `copy-bank.md §provas` + `ANTI_DRIFT.md §4` | 1080×1920 |
| "story IG bastidor / dia a dia" | `templates/ig-story.html` variante 3 (bastidor) | tom coloquial de `partes/01-marca.md §voz`; sem claim métrico | 1080×1920 |
| "story com enquete / CTA swipe" | `templates/ig-story.html` variante 1 (adaptar CTA) | `copy-bank.md §CTAs` | 1080×1920 |
| "post LinkedIn reflexão / ensaio curto" | `templates/linkedin.html` (layout reflexão) | `partes/01-marca.md` + `copy-bank.md §ensaios` | 1200×1200 |
| "post LinkedIn case / resultado cliente" | `templates/linkedin.html` (layout case-slab — ver `preview/card-case-slab.html`) | `ANTI_DRIFT.md §4` provas — só cases nomeados/aprovados | 1200×1200 |
| "post LinkedIn anúncio Advisory" | `templates/linkedin.html` (layout CTA) | `partes/02-oferta.md §advisory` + `copy-bank.md §CTAs` | 1200×1200 |
| "email de nurture / lista fria" | `templates/email.html` (layout texto longo) | `copy-bank.md §nurture` + `scripts-videos.md` (adaptação texto) | 620px |
| "email de pitch VSS / venda direta" | `templates/email.html` (layout CTA forte) | `partes/02-oferta.md §vss` + `copy-bank.md §objeções` + `§urgência` | 620px |
| "email de reativação / winback" | `templates/email.html` (layout curto + CTA) | `copy-bank.md §reativação` | 620px |
| "slide de apresentação" (sem especificar) | `templates/slide-apresentacao.html` — perguntar qual dos 5 layouts: capa / stat / 6P / case / CTA | dependendo do layout, ver linhas específicas desta tabela | 1920×1080 |
| "slide capa de apresentação" | `templates/slide-apresentacao.html` layout 1 (capa) | `partes/01-marca.md` título + subtítulo | 1920×1080 |
| "slide com mega número / KPI" | `templates/slide-apresentacao.html` layout 2 (stat) | `ANTI_DRIFT.md §4` | 1920×1080 |
| "slide dos 6 Ps" | `templates/slide-apresentacao.html` layout 3 (6P) | `partes/01-marca.md §6Ps` | 1920×1080 |
| "slide de case / cliente X" | `templates/slide-apresentacao.html` layout 4 (case) | `ANTI_DRIFT.md §4` — só cases autorizados | 1920×1080 |
| "slide CTA / próximo passo" | `templates/slide-apresentacao.html` layout 5 (CTA) | `partes/02-oferta.md` + `copy-bank.md §CTAs` | 1920×1080 |
| "thumbnail YouTube" | `templates/yt-thumb.html` | `scripts-videos.md` (título do vídeo) + `copy-bank.md §hooks` | 1280×720 |
| "anúncio Meta VSS (feed)" | `templates/ad-meta.html` formato 1080×1080 | `partes/02-oferta.md §vss` + `copy-bank.md §ads` | 1080×1080 |
| "anúncio Meta VSS (story/reels)" | `templates/ad-meta.html` formato 1080×1920 | `partes/02-oferta.md §vss` + `copy-bank.md §ads` | 1080×1920 |
| "anúncio Meta Advisory" | `templates/ad-meta.html` (qualquer formato, tom premium) | `partes/02-oferta.md §advisory` — sempre qualificar (não é pra todo mundo) | 1080×1080 ou 1080×1920 |
| "editar landing / homepage / seção do site" | `src/pages/*.astro` + `src/components/*.astro` | **ver seção "Workflow pra editar landing" abaixo** | — |
| "criar nova peça para calendário editorial" | consultar `../marketing/calendario.md` pra saber o slot/tema; depois escolher template acima | dependendo da peça | — |
| "algo igual ao post X que já saiu" | `../marketing/posts/` — procurar referência e replicar estrutura, trocar copy | herdar fontes da peça original | idem original |

## Cheatsheet de dimensões

| Peça | Dimensão | Aspect |
|---|---|---|
| IG feed | 1080×1080 | 1:1 |
| IG carrossel | 1080×1350 | 4:5 |
| IG story / reels cover | 1080×1920 | 9:16 |
| LinkedIn feed | 1200×1200 | 1:1 (1200×627 se link, mas preferir quadrado) |
| Email (largura corpo) | 620px | responsivo até 100% mobile |
| Slide apresentação | 1920×1080 | 16:9 |
| YouTube thumb | 1280×720 | 16:9 |
| Ad Meta feed | 1080×1080 | 1:1 |
| Ad Meta story/reels | 1080×1920 | 9:16 |

Referência canônica full-bleed: `master.html`. Landing institucional: `homepage.html`. Grid de 25 componentes: `preview/index.html`.

## Regras de copy (resumo — detalhe em `ANTI_DRIFT.md`)

- **Produtos ativos:** apenas VSS (R$ 1.997, DIY perpétuo) e Advisory (1:1). Nunca mencionar Services.
- **Provas / números / cases:** só os listados em `ANTI_DRIFT.md §4`. Se pedido foge disso → perguntar, não inventar.
- **Voz:** direta, sem eufemismo, sem palavra motivacional vazia (ver lista de proibidas em `ANTI_DRIFT.md`).
- **Vocabulário canônico:** "vendas sem segredos", "6 Ps", "método", "previsibilidade", "escalar com saúde" — ver `partes/01-marca.md §voz`.
- **Nunca inventar:** nome de cliente, nicho de case, métrica percentual, tempo de resultado, faturamento.

## Quando usuário pede algo que não está nessa tabela

Antes de executar, perguntar em 1 mensagem curta:

1. **Canal/formato:** IG feed? story? LinkedIn? email? print? outro?
2. **Dimensão/contexto:** onde vai rodar? (feed orgânico, ad pago, deck de venda, email pra lista)
3. **Referência:** tem peça anterior que serve de base? link/caminho.
4. **Copy-base:** tem texto já escrito ou precisa gerar do zero a partir das fontes?
5. **Provas específicas:** vai citar número/case? qual? (se não está em `ANTI_DRIFT.md §4`, não usar)

Só depois abrir template. Não chutar formato.

## Workflow pra editar landing (produção Astro)

O site em `src/` é produção — servido em `joelburigo.com.br`. Regras:

- Seguir `CLAUDE.md` da raiz do projeto (Astro SSR + Tailwind v4, Node 22).
- **O design system `brand/` ainda NÃO foi migrado pro `src/styles/global.css`.** Produção ainda usa tokens antigos (royal-blue + lime, Montserrat + Inter). Migração pro Terminal Growth (fire `#FF3B0F` + acid `#C6FF00`, Archivo Black + JetBrains Mono) está pendente.
- Se pedido de landing envolve "aplicar o novo visual", confirmar escopo (migração parcial seção por seção) antes de mexer em `global.css`.
- Dados canônicos em `src/data/cases.ts`, `src/data/contact.ts`, `src/data/testimonials.ts` — editar lá, não hardcodar em componente.
- Deploy automático: `git push main` → GH Actions → GHCR → Watchtower em ≤60s. Não precisa rodar script de deploy.

## Localização dos arquivos (absoluto)

- Brand: `/Users/joel/Documents/Dev/joelburigo-site/docs/conteudo/brand/`
- Templates (a criar): `/Users/joel/Documents/Dev/joelburigo-site/docs/conteudo/brand/templates/`
- Preview components: `/Users/joel/Documents/Dev/joelburigo-site/docs/conteudo/brand/preview/`
- Copy-bank: `/Users/joel/Documents/Dev/joelburigo-site/docs/conteudo/recursos/copy-bank.md`
- Scripts de vídeo: `/Users/joel/Documents/Dev/joelburigo-site/docs/conteudo/recursos/scripts-videos.md`
- Calendário editorial: `/Users/joel/Documents/Dev/joelburigo-site/docs/conteudo/marketing/calendario.md`
- Posts já publicados: `/Users/joel/Documents/Dev/joelburigo-site/docs/conteudo/marketing/posts/`
- Marca (manifesto, voz, 7 inimigos, 6Ps): `/Users/joel/Documents/Dev/joelburigo-site/docs/conteudo/partes/01-marca.md`
- Oferta (VSS + Advisory): `/Users/joel/Documents/Dev/joelburigo-site/docs/conteudo/partes/02-oferta.md`
- Produção Astro: `/Users/joel/Documents/Dev/joelburigo-site/src/`
