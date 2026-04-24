---
name: joel-burigo-design
description: Use this skill to generate well-branded interfaces and assets for Joel Burigo (consultor de vendas escaláveis para MPEs brasileiras, criador dos 6Ps das Vendas Escaláveis). Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

## Quick reference

- **Direction:** Terminal Growth — tech/growth/sales brutalismo.
- **Palette — 5 tokens-core:** `#050505` ink · `#0B0B0B` ink-2 · `#F5F1E8` cream · `#FF3B0F` fire (urgência, alerta, CTA) · `#C6FF00` acid (growth, sucesso, tech). Terciário `#00E0FF` cyan pra dados ao vivo. Mute `#6B7280`.
- **Sistema bicolor de acento:** fogo pra urgência, acid pra growth. Nunca 3 acentos no mesmo viewport — fire + acid é o par.
- **Type:** Archivo Black (display, UPPERCASE, -0.035 a -0.045em tracking) · Archivo 400–800 (body/UI) · JetBrains Mono (ticker, byline, status, terminal code).
- **Corners:** 0 por padrão (cantos duros = assinatura). 2px raríssimo em chips. Nunca 4px+.
- **Shadows:** só offset duros sem blur — `4px 4px 0 fire` (CTA primário), `6px 6px 0 acid` (CTA fire gigante), `6px 6px 0 fire` (tier hover). Soft glow apenas em dot pulse.
- **Backgrounds:** preto planos + grid overlay 80px fixo (opacidade 0.35). Noise 6% opcional.

## Voz

- **Pronome:** "você" predominante (formal coloquial). "Tu" cirúrgico em momentos de autenticidade/raiz sul-catarinense ("se tua empresa depende de ti, tu não tem empresa — tu tem emprego").
- **Tom:** brasileiro direto, provocador, parceiro. 70% irreverente, 75% acessível, 85% pragmático, 90% próximo.
- **Arquétipos:** O MENTOR (sábio experiente) + O CONSTRUTOR (executor prático que faz junto).
- **Assinaturas obrigatórias:** "Sistema > Improviso" · "Bora pra cima" · "Let's grow" · "Na moral" · "Sem enrolação".
- **Vocabulário proprietário:** **6Ps das Vendas Escaláveis** (nome oficial; **6Ps** pode ser usado como abreviação) · **Máquina de Crescimento** (o movimento) · **Ligar a Máquina** (implementar os 6Ps) · **Vendas Escaláveis** (não só vendas — vendas que crescem sem trabalhar 3× mais) · **Da quebrada ao bilhão** (origem/legado).
- **Provas:** 17+ anos · 140+ clientes · ~R$ 1 bilhão em vendas estruturadas ao longo de 17+ anos (estimativa agregada, não número auditado) · base dos 6Ps aplicada antes do nome formal.
- **Localização:** Ribeirão da Ilha, Florianópolis/SC. Lat. -27.59 · Lng. -48.55.

## Produtos (arquitetura 2 caminhos)

| Nome | Tipo | Público (fat/mês) | Investimento |
|---|---|---|---|
| **VSS — Vendas Sem Segredos** ★ principal | DIY · programa 6Ps em 90 dias · perpétuo | R$ 10–100k | R$ 1.997 à vista ou 12× R$ 166,42 |
| **Advisory** · exclusivo | Premium 1:1 com Joel (Sessão · Sprint 30d · Conselho) · convite | R$ 200k+ | R$ 997–15.000/mês |

Services (DWY) foi descontinuado.

## Iconography & tech overlays

- Unicode `★` `→` `▶` `●` `▲ ▼` `//`. Lucide via CDN pra conjunto amplo. Proibido emoji facial.
- Tech overlays: "@joelburigo", "EXP. 2004" (experiência pessoal), "GROWTH EST. 2008" (CNPJ/empresa), "SYS ONLINE", coordenadas Floripa, clock ao vivo. Dá densidade e autoridade técnica.

## File map

**Guias operacionais (ler nesta ordem antes de produzir peça):**
- `ANTI_DRIFT.md` — regras duras: palavras proibidas, provas de autoridade exatas, assinaturas canônicas, vocabulário
- `USAGE.md` — decision tree "pediu X → usa Y + copy fonte Z"
- `EXAMPLES.md` — 8 pares BAD vs GOOD comentados
- `MOBILE.md` — safe zones, breakpoints, adaptações por device
- `MIGRATION.md` — checklist pra migrar produção `src/` (sessão dedicada)
- `README.md` — guia completo de conteúdo + visual + iconografia + escalas (cores, type, spacing, contraste)

**Templates copiáveis (`templates/`):**
- `templates/ig-feed.html` — IG feed 1080×1080 (4 variantes)
- `templates/ig-story.html` — IG story 1080×1920 (4 variantes)
- `templates/ig-carrossel.html` — IG carrossel 1080×1350 (8 slides com P1–P6)
- `templates/linkedin.html` — LinkedIn 1200×1200 (3 variantes)
- `templates/email.html` — Email 620px dark-safe (3 variantes)
- `templates/slide-apresentacao.html` — Deck 1920×1080 (5 layouts)
- `templates/yt-thumb.html` — YouTube 1280×720 (3 variantes)
- `templates/ad-meta.html` — Meta Ads (2 VSS + 2 Advisory, feed + story)

**Referências visuais e tokens:**
- `colors_and_type.css` — todas as CSS vars (`--jb-*`) + elementos semânticos
- `master.html` — referência canônica (composição full-page)
- `homepage.html` — landing institucional
- `ig_posts.html` — galeria de 8 posts Instagram 540×540 (referência histórica)
- `assets/logo.svg` · `assets/logo-mark.svg` · `assets/logo-mark-acid.svg` — brand marks
- `preview/index.html` — galeria navegável dos 25 cards do DS
- `preview/*.html` — cards individuais (colors, type, spacing, components-*)

Quando produzir novos artefatos, sempre `<link rel="stylesheet" href="colors_and_type.css">` (ou copia inline) pra herdar o sistema de tokens `--jb-*`.

## Fonte canônica de conteúdo

Textos, cases, histórias e copy oficial vivem em `docs/conteudo/` (4 partes núcleo + recursos). Antes de escrever qualquer peça, leia obrigatoriamente:

1. `partes/01-marca.md` — voz, manifesto, vocabulário proprietário, 7 inimigos
2. `recursos/copy-bank.md` — frases canônicas, objeções, transformações, urgência
3. `brand/ANTI_DRIFT.md` — o que Claude Code NÃO pode fazer (palavras proibidas, invenção de cases, etc.)
4. `brand/USAGE.md` — qual template usar pra cada tipo de pedido
5. `brand/EXAMPLES.md` — 5-7 exemplos de output bom vs ruim

Nunca inventar número, case, cliente, nicho ou frase de assinatura que não esteja nessas fontes.
