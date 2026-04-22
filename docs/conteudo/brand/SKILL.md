---
name: joel-burigo-design
description: Use this skill to generate well-branded interfaces and assets for Joel Burigo (consultor de vendas escaláveis para MPEs brasileiras, criador do Framework 6Ps das Vendas Escaláveis). Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
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

- **Pronome:** "você" predominante (formal coloquial). "Tu" cirúrgico em momentos de autenticidade/raiz sul-catarinense ("se tua empresa depende de tu, tu não tem empresa — tu tem emprego").
- **Tom:** brasileiro direto, provocador, parceiro. 70% irreverente, 75% acessível, 85% pragmático, 90% próximo.
- **Arquétipos:** O MENTOR (sábio experiente) + O CONSTRUTOR (executor prático que faz junto).
- **Assinaturas obrigatórias:** "Sistema > Improviso" · "Bora pra cima" · "Let's grow" · "Na moral" · "Sem enrolação".
- **Vocabulário proprietário:** **6Ps das Vendas Escaláveis** · **Máquina de Crescimento** (o movimento) · **Ligar a Máquina** (implementar os 6Ps) · **Vendas Escaláveis** (não só vendas — vendas que crescem sem trabalhar 3× mais) · **Da quebrada ao bilhão** (origem/legado).
- **Provas:** 17+ anos · 140+ clientes · ~R$ 1 bilhão em vendas estruturadas · Framework 6Ps testado.
- **Localização:** Ribeirão da Ilha, Florianópolis/SC. Lat. -27.59 · Lng. -48.55.

## Produtos (arquitetura 3 caminhos)

| Nome | Tipo | Público (fat/mês) | Investimento |
|---|---|---|---|
| **VSS — Vendas Sem Segredos** | DIY · programa 6Ps em 90 dias | R$ 10-100k | R$ 1.997 à vista ou 12× R$ 166,42 |
| **Services** | DWY · equipe implementa junto (Fundação · Aceleração · ScaleUp) | R$ 50-300k | R$ 4.500-9.000/mês |
| **Advisory** | Premium · acesso direto ao Joel (Sessão · Sprint 30d · Conselho) | R$ 200k+ | R$ 997-15.000/mês |

## Iconography & tech overlays

- Unicode `★` `→` `▶` `●` `▲ ▼` `//`. Lucide via CDN pra conjunto amplo. Proibido emoji facial.
- Tech overlays: "JB_CORE v3.0", "REV. 2026.04", "SYS ONLINE", coordenadas Floripa, clock ao vivo. Dá densidade e autoridade técnica.

## File map

- `README.md` — guia completo de conteúdo + visual + iconografia (lê primeiro)
- `colors_and_type.css` — todas as CSS vars (`--jb-*`) + elementos semânticos
- `master.html` — referência canônica (composição full-page)
- `homepage.html` — landing institucional
- `ig_posts.html` — 8 posts Instagram (540×540)
- `assets/logo.svg` · `assets/logo-mark.svg` · `assets/logo-mark-acid.svg` — brand marks
- `preview/index.html` — galeria navegável de todos os tokens/componentes
- `preview/*.html` — cards individuais (colors, type, spacing, components-*)

Quando produzir novos artefatos, sempre `<link rel="stylesheet" href="colors_and_type.css">` (ou copia inline) pra herdar o sistema de tokens `--jb-*`.

## Fonte canônica de conteúdo

Textos, cases, histórias e copy oficial vivem em `~/Documents/Dev/joelburigo-site/docs/conteudo/` (13 partes, incluindo P7 branding + P12 banco de copy). Sempre verifica lá antes de inventar copy.
