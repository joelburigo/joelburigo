# Joel Burigo — Design System

**Especialista em vendas escaláveis para MPEs brasileiras. Criador do Framework 6Ps das Vendas Escaláveis.**
Direção: **Terminal Growth** — tech/growth/sales brutalismo. Fogo `#FF3B0F` (urgência) + acid `#C6FF00` (growth) sobre preto puro `#050505` + cream `#F5F1E8`. DNA de terminal de trading encontra empreendedor da quebrada.

---

## Índice

- `master.html` — **referência canônica** (hero com terminal + 6Ps console + growth chart + cases + tiers + manifesto + CTA)
- `homepage.html` — landing institucional
- `ig_posts.html` — 8 posts Instagram (540×540) — manifesto / mega número / case / quote / 6Ps / depoimento / capa carrossel / terminal
- `colors_and_type.css` — todos os tokens (vars CSS `--jb-*`) + elementos semânticos (fogo + acid + cyan + mono)
- `assets/logo.svg` — wordmark `JOEL|BURIGO`
- `assets/logo-mark.svg` — mark "JB" quadrado (fire)
- `assets/logo-mark-acid.svg` — variante mark acid
- `preview/index.html` — galeria navegável de todos os 25 cards
- `preview/` — cards individuais:
  - **Brand:** `brand-logo.html`
  - **Colors:** `colors-core.html` · `colors-accents.html` (fire+acid+cyan) · `colors-neutrals.html`
  - **Type:** `type-display.html` (stroke+glitch) · `type-body.html` · `type-mono.html`
  - **Spacing:** `spacing-scale.html` · `spacing-radii.html` · `spacing-shadows.html`
  - **Components base:** `components-buttons.html` · `components-badges.html` · `components-cards.html` · `components-inputs.html` · `components-6ps.html` · `components-stats.html` · `components-navbar.html`
  - **Components assinatura:** `components-terminal.html` · `components-ticker.html` · `components-statusbar.html` · `components-eyebrow.html` · `components-section-head.html` · `components-case-slab.html` · `components-manifesto.html` · `components-chart.html`

---

## CONTENT FUNDAMENTALS

**Voz:** brasileira direta, provocadora, parceira. Autoridade técnica + raiz de quebrada. Pitada tech/terminal ("executar diagnóstico", "ligar a máquina", "módulo", "pipeline").

**Arquétipos:** MENTOR + CONSTRUTOR — sábio que ensina + executor que implementa junto.

**Casing:**
- Títulos display: **UPPERCASE** (Archivo Black), com pedaços em `outline-stroke` pra criar ritmo.
- Sub-títulos e corpo: frase normal.
- Micro-copy (ticker, eyebrows, bylines, status): UPPERCASE MONO com separadores `·` prefixos `//` e `★`.

**Pronome:** **"você"** predominante (formal coloquial). **"Tu"** cirúrgico pra momento de autenticidade sul-catarinense — especialmente em frases-bandeira como *"se tua empresa depende de tu, tu não tem empresa — tu tem emprego"*. Evitar mistura aleatória no mesmo parágrafo.

**Assinaturas canônicas:**
- "Sistema > Improviso"
- "Bora pra cima"
- "Let's grow" / "Let's grow, CARALHO!" (versão autêntica)
- "Ligar a Máquina" (implementar os 6Ps)
- "Da quebrada ao bilhão"
- "Sem enrolação" · "Na moral"
- "Se tua empresa depende de tu, tu não tem empresa — tu tem emprego"
- "Marketing sem vendas é hobby caro"
- "Improviso mata mais empresa que crise"

**Vocabulário proprietário (caixa-alta apenas em título):**
- **6Ps das Vendas Escaláveis** — a metodologia. P1 Posicionamento · P2 Público · P3 Produto · P4 Programas · P5 Processos · P6 Pessoas.
- **Máquina de Crescimento** — o movimento. Sistema integrado de marketing + vendas + growth.
- **Growth CRM** — plataforma all-in-one proprietária (CRM + funis + automação + landing pages).
- **Vendas Escaláveis** — não "vendas" — vendas que crescem sem você trabalhar 3× mais.

**Produtos (arquitetura 3 caminhos):**
- **VSS — Vendas Sem Segredos** (DIY) · 6Ps em 90 dias · R$ 1.997 à vista ou 12× R$ 166,42 · público R$ 10-100k/mês
- **Services** (DWY) · Fundação · Aceleração · ScaleUp · R$ 4.500-9.000/mês · público R$ 50-300k/mês
- **Advisory** (Premium 1:1) · Sessão · Sprint 30d · Conselho Executivo · R$ 997-15.000/mês · público R$ 200k+/mês

**Provas de autoridade:** 17+ anos · 140+ clientes atendidos · ~R$ 1 bilhão em vendas estruturadas · Framework 6Ps testado em todas.

**Localização canônica:** Ribeirão da Ilha, Florianópolis/SC. Lat. -27.59 · Lng. -48.55.

**Emoji:** só `★`, `▶`, `→`, `●`, `▲ ▼`. Nunca emoji facial.

**Números como elemento gráfico:** `+247%`, `R$1BI`, `17+`, `140+`, `2,3×`, `433%` — sempre GIGANTES, em fogo (alerta) ou acid (growth).

**Tech overlays:** "JB_CORE v3.0", "REV. 2026.04", "SYS ONLINE", coordenadas de Floripa, clock ao vivo. Dá densidade e autoridade técnica.

---

## VISUAL FOUNDATIONS

**Cores** — 5 tokens-core:
- `--jb-ink` `#050505` (base, preto absoluto)
- `--jb-ink-2` `#0B0B0B` (cards/terminal)
- `--jb-cream` `#F5F1E8` (foreground quente)
- `--jb-fire` `#FF3B0F` (cor-sinal · urgência · CTA)
- `--jb-acid` `#C6FF00` (growth · sucesso · highlight tech)

O sistema é **bicolor de acento**: fogo pra urgência/marketing, acid pra growth/sucesso/tech. Cyan `--jb-cyan` `#00E0FF` é reserva pra dados ao vivo. Nunca 3 acentos no mesmo viewport — fogo + acid é o par.

**Tipografia** — Archivo Black (display, condensada brutalista), Archivo 400–800 (body/UI), JetBrains Mono (ticker, byline, status, terminal). Tracking apertado (-0.035 a -0.045em) nos displays. Mono carrega toda a micro-copy técnica — é o "sotaque" do sistema.

**Stroke-text** — pedaços de títulos em `-webkit-text-stroke: 2px cream; color: transparent` pra criar ritmo visual (ver hero do master, manifesto).

**Backgrounds** — preto planos + **grid overlay** 80px fixo (opacidade 0.35) como DNA do sistema. Noise 6% opcional pra texturizar. Sem gradientes chapados; só radial sutil no hero.

**Ticker** — fogo sólido, mono bold, slide infinito 38s. Inclusões em acid destacam KPIs.

**Terminal window** — card com chrome macOS (3 lights: fire/yellow/acid), mono code, cursor piscando em acid. Use pra mostrar diagnóstico, processo, pipeline.

**Status bar topo** — mono 11px, dot acid pulsante, "SYS ONLINE · JB_CORE v3.0 · REV. 2026.04 · FLORIANÓPOLIS/SC · CLOCK".

**Animação** — `180ms` `cubic-bezier(0.2, 0.9, 0.2, 1)`. Ticker 38s. Dot acid pulse 1.6s. Terminal blink 1s. Hover CTA primário: `translate(-2px,-2px)` + sombra offset dura (4/6/8px) em cor oposta (fire→acid, acid→fire). Glitch 3s nos títulos-herói (sutil).

**Hover states** — links: underline acid expande 0→100% em 180ms. Cards 6P: bg `rgba(198,255,0,0.03)` + scanline top 2px acid expandindo + número passa de `rgba(cream,0.12)` pra acid com glow. Cards tier: lift `-2px` + sombra offset 6px em fogo ou acid.

**Borders** — 1px `rgba(255,255,255,0.08)` divisores (`--jb-hair`); acid accent `rgba(198,255,0,0.35)`; fogo accent `rgba(255,59,15,0.35)`. Cards tier em destaque: borda cheia acid + gradient `rgba(acid,0.06)` fundo.

**Shadows (brutalistas)** — só offset duros, sem blur:
- `4px 4px 0 fire` (botão primário)
- `6px 6px 0 acid` (botão fire gigante)
- `6px 6px 0 fire` (card tier no hover)
- `0 40px 80px rgba(0,0,0,0.6)` (terminal)
Nunca softglow exceto dot pulse (`0 0 10px acid`).

**Corner radii** — `0` por padrão (cantos duros = assinatura). `2px` raríssimo em chips.

**Cards** — `#0B0B0B` + 1px `--jb-hair`. Sem radius. Hover: borda fogo + sombra offset 6px. Variante "feat" (o mais pedido): borda acid + gradient bg `linear-gradient(180deg, rgba(198,255,0,0.06), #0B0B0B)`.

**Layout rules** — grids com borda externa 1px e divisores internos 1px (sem gap). `max-width: 1360px` container. Section head: kicker mono acid `// 01_FRAMEWORK` · título H2 gigante · meta mono à direita. Hair-separators de 1px cream-translúcido.

**Glitch** — efeito RGB shift nos heros (clip-path 48% top/bottom, translate ±3px, cores fogo/cyan). Uso cirúrgico — 1 palavra por página. Ver `master.html`.

**Imagery vibe** — quando houver foto do Joel: b&w alto contraste, grain sutil, nunca colorizada. Possível overlay scanline ou grid.

---

## ICONOGRAPHY

**Sistema padrão:** `★` marcador de prestígio · `→` CTAs e direção · `▶` play/vídeo · `●` status live · `▲ ▼` deltas de stats · `//` prefixo mono técnico · `>` em watermarks ("SISTEMA > IMPROVISO").

**Icon font:** Lucide via CDN quando precisar de conjunto amplo (`<script src="https://unpkg.com/lucide@latest"></script>`, stroke 1.5px).

**SVGs do projeto:**
- `assets/logo.svg` — wordmark completo
- `assets/logo-mark.svg` — mark "JB" fogo
- `assets/logo-mark-acid.svg` — variante mark acid

**Emoji:** proibido salvo `★` e `▶` como parte de display type.

---

## Fonte canônica de conteúdo

Copy, cases, histórias e manifesto vivem em `~/Documents/Dev/joelburigo-site/docs/conteudo/` (13 partes):
- P1 Fundamentos · P4 Diferenciação · P7 Branding (história completa + manifesto + tom de voz + vocabulário) · P8 Ecossistema (3 produtos) · P12 Banco de copy · P13 Scripts de vídeos.

Sempre verificar essa fonte antes de inventar copy.
