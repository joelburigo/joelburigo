# MIGRATION — Producao `src/` → Terminal Growth

> **✅ EXECUTADA EM 2026-04-22** (branch `feat/terminal-growth-migration`). Commits: `4da2d7ff` (fundação + remoção Services) · `1ae8437b` (blog + robots) · `148c4078` (páginas + slides + LP). Este doc permanece como registro histórico + referência caso migração precise ser repetida.

---

> Checklist executavel pra migrar o site joelburigo.com.br dos tokens legados (royal-blue + lime, Montserrat + Inter, radius suave, soft glows) pro design system **Terminal Growth** (fire + acid, Archivo Black + Archivo + JetBrains Mono, radius 0, brutalist hard-offset shadows). **Estimativa: 3-4h em sessao dedicada.** Nao prometa "migracao sem quebrar" — ha ~78 arquivos tocando lime, 75 tocando font-display, 824 ocorrencias de rounded/shadow-. Risco real de regressao visual em ate 15% das paginas sem validacao manual.

---

## 0. Pre-requisitos

- [ ] Branch dedicado: `git checkout -b feat/terminal-growth-migration`
- [ ] Dev server rodando: `npm run dev` em terminal separado (porta 4321)
- [ ] 1Password SSH agent destravado (commit/push)
- [ ] Abrir em tabs de referencia visual:
  - `/Users/joel/Documents/Dev/joelburigo-site/docs/conteudo/brand/master.html`
  - `/Users/joel/Documents/Dev/joelburigo-site/docs/conteudo/brand/preview/index.html`
- [ ] Ler antes de tocar em qualquer arquivo:
  - `/Users/joel/Documents/Dev/joelburigo-site/docs/conteudo/brand/README.md` (secoes VISUAL FOUNDATIONS + CONTENT FUNDAMENTALS)
  - `/Users/joel/Documents/Dev/joelburigo-site/docs/conteudo/brand/colors_and_type.css` (tokens --jb-*)
  - `/Users/joel/Documents/Dev/joelburigo-site/docs/conteudo/brand/ANTI_DRIFT.md` (regras de copy — nao inventar)
- [ ] Screenshot da homepage atual em mobile (375px) + desktop (1440px) pra comparacao pos-deploy

---

## 1. Estado atual (audit — numeros reais)

### Tokens legados em `src/styles/global.css` (337 linhas)

- `@theme { --color-royal-blue, --color-lime, --color-dark, --color-dark-gray, --color-light-gray, --color-off-white }` (linhas 11-23)
- `@theme { --font-display: Montserrat, --font-sans: Inter }` (linhas 25-26)
- `@theme { --text-display-lg/md/sm, --text-h1..h4, --text-body*, --text-label, --text-caption }` (linhas 28-76)
- `@theme { --spacing-section*, --spacing-content, --spacing-element }` (linhas 78-82)
- `@theme { --animate-bounce-slow, --animate-fade-in, --animate-slide-up }` (linhas 85-87)
- `:root { --color-text-*, --color-bg-*, --color-border, --shadow-* (incluindo --shadow-glow-lime + --shadow-glow-blue), --border-radius-sm..2xl, --transition-fast/base/slow }` (linhas 94-122)
- `@layer components { .text-display-*, .heading-*, .body*, .card, .btn-primary, .btn-secondary, .section, .section-sm }` (linhas 144-269)
- Scrollbar custom com rgba(163,255,63,*) lime (linhas 276-291)
- Keyframes fadeIn/slideUp/slideDown/scaleIn (linhas 297-337)

### Escopo no `src/`

- **731 ocorrencias totais** de `royal-blue | color-lime | font-display`
- **78 arquivos** usando color-lime / text-lime / bg-lime / border-lime
- **75 arquivos** usando font-display
- **13 arquivos** usando royal-blue (menos que o lime — lime era o CTA default)
- **15 arquivos** mencionando Montserrat ou Inter (font links e inline styles)
- **824 ocorrencias** de `rounded*` ou `shadow-*` em `.astro` (precisam auditoria caso-a-caso)

### Inventario de componentes (`src/components/`)

- `ui/` — 15 arquivos: Badge, Button, Card, Container, HighLevelForm, HighLevelFormFacade, Icons, Input, Label, Logo, LogoStacked, OptimizedImage, SearchBar, Textarea, VideoPlayer
- `home/` — 10 secoes: BlogPostsSection, FinalCTASection, FrameworkSection, HeroSection, PathwaysSection, ProblemSection, ProofSocialSection, QuemSouSection, StatsSection, TestimonialsSection
- `lp/` — 1 arquivo + subpasta vazia: LPLayout.astro, vss/ (vazia)
- `pages/` — 7 paginas compostas: AdvisoryPage, DiagnosticoPage, JornadaTimeline, LicoesDosPps, ServicesPage, VerdadesDuras, VSSLandingPage, VSSPage
- `presentation/slides/` — 11 slides genericos + 3 subpastas (vss/4, advisory/4, services/4)
- `blog/` — 1 arquivo: AudioPlayer
- `analytics/` — 5 arquivos (scripts de pixel, provavelmente sem UI): CookieConsent, GoogleAds, GoogleAnalytics, MetaConversionsAPI, MetaPixel
- `seo/` — 2 arquivos: Breadcrumbs, JsonLd
- `layout/` — 3 arquivos: Footer, Header, MobileMenu

### Paginas em `src/pages/` (26 .astro no root + blog/ + lp/ + api/)

- Root: `404, 500, advisory-aplicacao, advisory-obrigado, advisory, agendamento-sessao, agendar-services, apresentacao, cases, contato, design-system, diagnostico-obrigado, diagnostico-resultado, diagnostico, index, jornada-90-dias, links, press-kit, privacidade, services, sobre, termos, vendas-sem-segredos, vss-aguardando-pagamento, vss-analise-credito, vss-compra-aprovada`
- `blog/`: `index.astro` + `[slug].astro`
- `lp/`: `vss.astro`
- `api/`: `meta-conversion.ts`, `track.ts` (sem UI — ignorar na migracao)
- **Nota:** `services.astro` e `agendar-services.astro` correspondem a produto descontinuado. Confirmar com Joel se mantem visualmente ou remove antes da migracao.

### Layout

- `src/layouts/Layout.astro` — unico layout global. Contem `<head>` com font links (provavelmente Montserrat + Inter) + body styles.

---

## 2. Mapeamento tokens antigos → novos

| Antigo | Novo | Notas |
|---|---|---|
| `--color-royal-blue` `#1d4ed8` | `--jb-fire` `#FF3B0F` | urgencia, CTA primario |
| `--color-lime` `#a3ff3f` | `--jb-acid` `#C6FF00` | growth, tech, sucesso |
| `--color-dark` `#020617` | `--jb-ink` `#050505` | base preta pura |
| `--color-dark-gray` `#111827` | `--jb-ink-2` `#0B0B0B` | cards terminal |
| `--color-light-gray` `#e5e7eb` | remover ou `--jb-fg-3` `#A3A3A3` | caso a caso |
| `--color-off-white` `#f9fafb` | `--jb-cream` `#F5F1E8` | foreground quente |
| `--color-text-primary` `#ffffff` | `--jb-cream` `#F5F1E8` | cream e o default |
| `--color-text-secondary` `#d1d5db` | `--jb-fg-2` `#E5E5E5` | |
| `--color-text-tertiary` `#9ca3af` | `--jb-fg-3` `#A3A3A3` | |
| `--color-border` `rgba(255,255,255,0.1)` | `--jb-hair` `rgba(255,255,255,0.08)` | hairline |
| `font-display: Montserrat` | `'Archivo Black', system-ui` | display (weight 900 sempre) |
| `font-sans: Inter` | `'Archivo', system-ui` (400-800) | body/UI |
| (sem mono antes) | `'JetBrains Mono'` (400/500/600/700/800) | ticker, status, terminal |
| `--border-radius-sm` `0.5rem` em diante | `0` default, `2px` raro (chips) | brutalist — cantos duros |
| `--shadow-glow-lime` (soft blur) | `4px 4px 0 var(--jb-fire)` (btn primario) | brutalist hard offset |
| `--shadow-glow-blue` (soft blur) | `6px 6px 0 var(--jb-acid)` (btn fire gigante) | |
| `--shadow-sm/md/lg/xl` | remover em cards; terminal usa `0 40px 80px rgba(0,0,0,0.6)` | |
| classes Tailwind `rounded-xl/2xl/lg/md/sm` | remover ou `rounded-none` | auditoria caso-a-caso |
| `--transition-base: 300ms ease` | `180ms cubic-bezier(0.2, 0.9, 0.2, 1)` | `--jb-dur` + `--jb-ease` |
| `.btn-primary` (lime bg + glow) | acid bg + `4px 4px 0 fire` shadow + hover `translate(-2px,-2px)` | ver `preview/components-buttons.html` |
| `.card` (radius xl + glow hover) | `#0B0B0B` + 1px hair + radius 0 + hover fire offset | ver `preview/components-cards.html` |
| scrollbar lime | scrollbar acid ou hair neutro | |

### Mapeamento de classes Tailwind mais comuns

- `text-white` → manter (cream via body default resolve a maioria) — ou trocar por `text-[color:var(--jb-cream)]`
- `bg-lime` / `bg-color-lime` → `bg-[color:var(--jb-acid)]`
- `text-lime` → `text-[color:var(--jb-acid)]`
- `bg-royal-blue` → `bg-[color:var(--jb-fire)]`
- `font-display` (classe) → `font-[family-name:var(--jb-ff-display)]` ou definir util `.font-display` apontando pra Archivo Black
- Botoes com `rounded-lg` + `shadow-lg` → refatorar pra `.btn-primary`/`btn-fire` do novo sistema (criar em global.css)

---

## 3. Execucao passo a passo

Fases **SEQUENCIAIS**. Cada uma termina com dev server carregando sem erro JS/CSS + check visual rapido. **Nao pular fases.**

### Fase 1 — Tokens (global.css) — ~30min

Arquivo: `/Users/joel/Documents/Dev/joelburigo-site/src/styles/global.css`

- [ ] Backup mental: git commit WIP antes de editar ("wip: pre-migration snapshot")
- [ ] Adicionar no topo do arquivo (apos `@import 'tailwindcss';`) o `@import url(...)` de fontes do `colors_and_type.css` (linha 8 do arquivo de referencia)
- [ ] Substituir bloco `@theme { --color-* }` (linhas 11-23) por novos tokens mapeando pros --jb-*:
  ```
  --color-fire: #FF3B0F;
  --color-fire-hot: #FF6A3D;
  --color-acid: #C6FF00;
  --color-acid-hot: #D6FF3D;
  --color-ink: #050505;
  --color-ink-2: #0B0B0B;
  --color-ink-3: #121212;
  --color-cream: #F5F1E8;
  --color-fg-2: #E5E5E5;
  --color-fg-3: #A3A3A3;
  --color-cyan: #00E0FF;
  ```
- [ ] Substituir `--font-display` e `--font-sans` por tres famiilias (`--font-display: 'Archivo Black'`, `--font-sans: 'Archivo'`, `--font-mono: 'JetBrains Mono'`)
- [ ] Re-balancear `--text-*` sizes pra escala Terminal Growth (`--jb-fs-*`): display-lg vira ~80px (era 56px), heroes podem ir a 120px. **Cuidado**: mudar font-size impacta layout — testar homepage logo apos.
- [ ] Trocar `:root` block: remover `--shadow-glow-*` e `--border-radius-*`; substituir por novos runtime tokens alinhados aos `--jb-*` (espelhar linhas 10-99 do `colors_and_type.css`, prefixando com `--jb-` ou mantendo nomes)
- [ ] Atualizar transicoes: `--transition-base: 180ms cubic-bezier(0.2, 0.9, 0.2, 1)` (era 300ms ease)
- [ ] Re-escrever `@layer components`:
  - `.card` → bg `var(--color-ink-2)` + border 1px `var(--jb-hair)` + radius 0. Hover: border fire + `6px 6px 0 var(--color-fire)`.
  - `.btn-primary` → bg acid + color ink + font Archivo Black uppercase + tracking 0.02em + radius 0 + `4px 4px 0 var(--color-fire)`. Hover: `translate(-2px,-2px)` + sombra 6px.
  - `.btn-secondary` → bg transparent + border 1px cream + uppercase. Hover: bg rgba(cream,0.06).
  - Criar `.btn-fire` (acento reverso): bg fire + color ink + `6px 6px 0 var(--color-acid)`.
  - `.heading-*` → font-family Archivo Black, uppercase, tracking tight, weight 900.
- [ ] Atualizar scrollbar: rgba acid 0.15 → 0.35 hover (manter acid pra consistencia)
- [ ] Rodar `npm run dev`. Esperar quebra visual na maioria das paginas — **ESPERADO**. Objetivo aqui: compilar sem erro.

### Fase 2 — Layout + Fonts — ~15min

Arquivo: `/Users/joel/Documents/Dev/joelburigo-site/src/layouts/Layout.astro`

- [ ] Remover `<link>` de Montserrat e Inter do Google Fonts (se existirem)
- [ ] Confirmar que o `@import url(...)` no global.css esta carregando Archivo Black + Archivo + JetBrains Mono (caso prefira `<link>` em head por performance, adicionar aqui e remover do CSS)
- [ ] Meta `theme-color` — atualizar para `#050505`
- [ ] Verificar body classes — remover legacy que forcava `bg-dark text-white`, deixar body default do global.css cuidar

### Fase 3 — Componentes UI base (`src/components/ui/`) — ~45min

Cada arquivo, na ordem. Usa o `preview/components-*.html` como referencia visual:

- [ ] **Logo.astro** — substituir Montserrat 800 → Archivo Black. Usar SVG `brand/assets/logo.svg` se aplicavel.
- [ ] **LogoStacked.astro** — idem
- [ ] **Button.astro** — remover `rounded-lg`, trocar bg lime → acid, adicionar shadow brutalist `4px 4px 0 fire`, uppercase + tracking wide. Ver `preview/components-buttons.html`.
- [ ] **Badge.astro** — substituir royal-blue/lime → fire/acid. Uppercase mono (`--font-mono`) tracking 0.22em. Ver `preview/components-badges.html`.
- [ ] **Card.astro** — radius 0, border 1px `var(--jb-hair)`, bg `var(--color-ink-2)`. Variante feat: gradient `linear-gradient(180deg, rgba(198,255,0,0.06), #0B0B0B)` + border acid. Ver `preview/components-cards.html`.
- [ ] **Container.astro** — verificar max-width; brand usa 1360px (`--jb-container-max`)
- [ ] **Input.astro / Textarea.astro / Label.astro** — radius 0, border 1px hair, focus ring acid. Font base 16px (iOS anti-zoom). Ver `preview/components-inputs.html`.
- [ ] **HighLevelForm.astro / HighLevelFormFacade.astro** — tocar apenas o wrapper visual; **NAO** alterar logica de submit/iframe HL. Ajustar cores do loading/fallback.
- [ ] **Icons.astro** — auditar: se pinta `fill="lime"` hardcoded, trocar pra `currentColor` ou acid.
- [ ] **SearchBar.astro** — radius 0, bg ink-2, border hair, placeholder fg-3
- [ ] **VideoPlayer.astro** — font-display na legenda → Archivo Black; controles em acid
- [ ] **OptimizedImage.astro** — provavel sem cor hardcoded, mas verificar placeholder bg

Check visual: rodar `/design-system` page (`src/pages/design-system.astro`) — mostra varios componentes juntos.

### Fase 4 — Layout global (`src/components/layout/`) — ~20min

- [ ] **Header.astro** — nav links uppercase mono tracking 0.22em + hover underline acid expandindo 0→100% em 180ms. Logo no topo esquerdo. Status bar opcional 11px com dot acid pulsante (copiar de `preview/components-statusbar.html`).
- [ ] **Footer.astro** — footer escuro ink, divisores hair, mono para creditos/coordenadas Floripa
- [ ] **MobileMenu.astro** — full-screen preto, menu links huge uppercase Archivo Black, close `×` fire

### Fase 5 — Home + paginas de produto principais — ~45min

Prioridade comercial — testar visualmente cada uma em dev:

- [ ] `src/components/home/HeroSection.astro` — h1 Archivo Black uppercase, stroke-text em parte do titulo, ticker fogo com KPIs, CTA acid com sombra fire. Copiar estrutura do hero do `master.html`.
- [ ] `src/components/home/ProblemSection.astro` — numeros gigantes em fire, body cream
- [ ] `src/components/home/FrameworkSection.astro` — 6Ps em grid com borda externa 1px cream + divisores 1px hair, sem gap (ver `preview/components-6ps.html`)
- [ ] `src/components/home/PathwaysSection.astro` — VSS + Advisory como 2 tiers. Advisory destaque: borda acid + gradient bg
- [ ] `src/components/home/StatsSection.astro` — 17+ / 140+ / ~R$ 1BI em `--jb-fs-4xl` fire ou acid
- [ ] `src/components/home/ProofSocialSection.astro` — logos em grid hair
- [ ] `src/components/home/TestimonialsSection.astro` — depoimento em card ink-2, quote mark acid gigante
- [ ] `src/components/home/QuemSouSection.astro` — foto b&w alto contraste overlay scanline
- [ ] `src/components/home/BlogPostsSection.astro` — cards sem radius, data em mono
- [ ] `src/components/home/FinalCTASection.astro` — fundo fire + CTA ink em `.btn-secondary` invertido
- [ ] `src/pages/index.astro` — conectar tudo, testar em 375px + 1440px
- [ ] `src/components/pages/VSSPage.astro` + `VSSLandingPage.astro`
- [ ] `src/pages/vendas-sem-segredos.astro` + `src/pages/lp/vss.astro`
- [ ] `src/components/pages/AdvisoryPage.astro` + `src/pages/advisory.astro`

### Fase 6 — Paginas secundarias — ~30min

- [ ] `src/pages/sobre.astro` — usar `partes/01-marca.md` como referencia de copy
- [ ] `src/pages/cases.astro`
- [ ] `src/pages/contato.astro` — form com tokens novos
- [ ] `src/pages/diagnostico.astro` + `src/components/pages/DiagnosticoPage.astro` + `diagnostico-obrigado.astro` + `diagnostico-resultado.astro`
- [ ] `src/pages/jornada-90-dias.astro` + `src/components/pages/JornadaTimeline.astro`
- [ ] `src/pages/press-kit.astro`
- [ ] `src/pages/links.astro`
- [ ] `src/pages/advisory-aplicacao.astro` + `advisory-obrigado.astro` + `agendamento-sessao.astro`
- [ ] `src/pages/vss-aguardando-pagamento.astro` + `vss-analise-credito.astro` + `vss-compra-aprovada.astro`
- [ ] `src/pages/apresentacao.astro` + slides em `src/components/presentation/slides/` (11 genericos + 4 VSS + 4 Advisory + 4 Services)
- [ ] `src/pages/services.astro` + `src/components/pages/ServicesPage.astro` + `agendar-services.astro` — **decidir com Joel**: manter com aviso "descontinuado" ou redirect 301 pra VSS
- [ ] `src/pages/404.astro` + `500.astro` — aplicar tokens, adicionar humor marca ("404: sistema off")
- [ ] `src/pages/privacidade.astro` + `termos.astro` — body cream + heading Archivo Black, o resto e prose normal
- [ ] `src/pages/design-system.astro` — atualizar pra refletir novo sistema (ou remover e linkar `brand/preview/index.html`)
- [ ] `src/pages/blog/index.astro` + `[slug].astro` — cards brutalist + prose com headings Archivo Black
- [ ] `src/components/blog/AudioPlayer.astro` — controles acid
- [ ] `src/components/lp/LPLayout.astro` — layout especifico de LP
- [ ] `src/components/pages/LicoesDosPps.astro` + `VerdadesDuras.astro`

### Fase 7 — Componentes tecnicos (geralmente nao visuais) — ~10min

- [ ] `src/components/seo/Breadcrumbs.astro` — se visivel, aplicar hair + mono
- [ ] `src/components/seo/JsonLd.astro` — sem UI
- [ ] `src/components/analytics/*` — 5 arquivos, todos scripts de pixel. Nao mexer salvo se emitirem markup visivel (CookieConsent banner sim: atualizar pra tokens novos).

### Fase 8 — Responsividade mobile — ~25min

- [ ] Abrir devtools em 375px (iPhone SE), 414px (iPhone Plus), 768px (iPad) e navegar pelas 5 paginas principais: home, VSS, advisory, sobre, contato
- [ ] Touch targets >= 44px em todos botoes e links nav
- [ ] Font-size minimo 16px em `<input>` / `<textarea>` (impede iOS autozoom)
- [ ] Headings gigantes (`--jb-fs-4xl` 80px+) quebram em mobile — usar `clamp(40px, 10vw, 80px)` ou media queries
- [ ] Ticker horizontal: verificar overflow-x hidden no wrapper
- [ ] Grid 6Ps em mobile: seguir `MOBILE.md` — 1 coluna até `sm`, 2 colunas `md`–`lg`, 3 colunas `lg+`, ou 6×1 em desktop `xl+` quando houver respiro
- [ ] Menu mobile funciona + tem lock scroll quando aberto
- [ ] Ver `docs/conteudo/brand/MOBILE.md`

### Fase 9 — Validacao — ~20min

- [ ] `npm run build` sem warn/erro — se erro, ler output e corrigir
- [ ] `npm run preview` e navegar pelas 26 paginas (ignorar api/*)
- [ ] Lighthouse (Chrome devtools) na home: perf >= 90, a11y >= 90, SEO >= 95
- [ ] Contraste WCAG (https://webaim.org/resources/contrastchecker/):
  - cream `#F5F1E8` sobre ink `#050505` — esperado AAA
  - fire `#FF3B0F` sobre ink — esperado AA normal, AAA large
  - acid `#C6FF00` sobre ink — esperado AAA
  - ink sobre fire (texto em CTA fire) — esperado AA normal / AAA large
  - fg-3 `#A3A3A3` sobre ink — ~7.3, AA normal. Se cair abaixo, trocar muted pra `--jb-fg-2`.
- [ ] Visual regression: comparar `docs/conteudo/brand/master.html` lado a lado com homepage renderizada. Esperamos parecer irmaos, nao gemeos.
- [ ] Formularios: submeter diagnostico + contato e confirmar que dados chegam (HL iframe intocado; se quebrar, rollback do Form.astro)
- [ ] Grep final de residuos: `grep -rn "royal-blue\|color-lime\|Montserrat\|Inter\b\|shadow-glow" /Users/joel/Documents/Dev/joelburigo-site/src/` — deve retornar 0 ou quase 0

### Fase 10 — Deploy — ~15min

- [ ] `git add src/ docs/conteudo/brand/MIGRATION.md` (se marcou checklist)
- [ ] Commit: `feat(design): migrate production to Terminal Growth design system`
- [ ] Merge pra main: `git checkout main && git merge feat/terminal-growth-migration --no-ff`
- [ ] `git push main` — GH Actions builda e publica `ghcr.io/joelburigo/joelburigo-site:latest`
- [ ] Aguardar Watchtower puxar em <=60s
- [ ] Validar https://joelburigo.com.br em mobile real + desktop + checar console browser por erros
- [ ] Monitorar logs: `ssh joel@prod-01 && sudo docker compose -f /mnt/data/docker-compose.yml logs -f joelburigo-site` por 5min

---

## 4. Rollback plan

Se producao quebrar (erro de build, pagina branca, form quebrado):

1. **Revert rapido:** `git revert HEAD && git push main` — Watchtower restaura em <=60s
2. **Imagem anterior direto:** `ssh joel@prod-01 && sudo restore-app.sh joelburigo-site <sha-anterior>` (ver tags em GHCR)
3. **Parcial:** se apenas uma pagina quebrou, revert o arquivo especifico em branch dedicada

Versao da imagem anterior sempre disponivel: `ghcr.io/joelburigo/joelburigo-site:<sha-antigo>`

---

## 5. Armadilhas conhecidas

- **Tailwind v4 `@theme`** usa sintaxe diferente do v3. Nao cair em exemplos antigos (`tailwind.config.js` nao e mais autoridade). Tokens `@theme { --color-* }` geram utilities automaticas (`bg-fire`, `text-acid` etc).
- **Archivo Black so tem weight 900.** Se componente pedir `font-weight: 700`, nao herdar Archivo Black — usar Archivo 700. Nunca misturar.
- **JetBrains Mono** precisa weights 400/500/600/700/800 — conferir que o @import puxa todos esses (ja esta certo no colors_and_type.css linha 8).
- **Classes Tailwind arbitrary value** pra shadows brutalist: `shadow-[4px_4px_0_var(--color-fire)]` (underscores no lugar de espacos, sintaxe v4).
- **CSS vars em Astro `<style>` scoped**: referenciar com `var(--color-fire)` direto; em Tailwind via `bg-[color:var(--color-fire)]`.
- **`.btn-primary` legacy e usado em 30+ lugares.** Manter o nome da classe mas trocar o conteudo em global.css economiza refactor massivo.
- **Forms HighLevel** (HighLevelForm.astro/HighLevelFormFacade.astro) usam iframe — NAO tentar estilizar conteudo interno, apenas wrapper.
- **Analytics components** (MetaPixel, GoogleAnalytics, etc) sao puros `<script>` — nao mexer.
- **`apresentacao.astro` + slides** sao pesadas (23 componentes de slide). Podem levar 30min sozinhas. Priorizar se for apresentar pra cliente nas proximas 2 semanas; senao, delegar pra fase 2.
- **`services.astro` e correlatos** referem produto descontinuado. Decidir ANTES de migrar: manter visual ou redirect 301 em `astro.config.mjs`.
- **Hero headings gigantes em mobile** quebram layout. Sempre `clamp()` ou media query — testar obrigatoriamente em 375px.
- **Glitch effect e stroke-text** sao assinatura visual, mas caros em perf. Usar cirurgicamente (1 palavra por pagina), nunca em loop.
- **Scrollbar custom** existe em `global.css` (linhas 276-291). Se remover pra simplificar, aceitar scrollbar default do browser — nao quebra o site.

---

## 6. Post-migracao

- [ ] Remover qualquer codigo morto no `global.css` (tokens legados nao usados, keyframes soltos)
- [ ] Atualizar `/Users/joel/Documents/Dev/joelburigo-site/docs/conteudo/brand/README.md` removendo nota "producao ainda usa tokens antigos" (nao existe exatamente essa string hoje, mas checar linhas 1-10)
- [ ] Atualizar `/Users/joel/Documents/Dev/joelburigo-site/CLAUDE.md` secao "Direcao atual" — trocar "Producao ainda usa tokens antigos" por "Producao em Terminal Growth desde YYYY-MM-DD"
- [ ] Atualizar `src/pages/design-system.astro` pra espelhar o novo sistema (ou remover + redirect pra `/brand-preview`)
- [ ] Criar screenshots de referencia em `docs/conteudo/brand/screenshots/` (opcional mas recomendado):
  - `home-desktop-1440.png`, `home-mobile-375.png`
  - `vss-desktop.png`, `advisory-desktop.png`
  - cole no `README.md` da brand como prova de paridade com `master.html`
- [ ] Deletar esta MIGRATION.md (ou mover pra `_archive/`) — o doc cumpriu funcao

---

## Apendice — comandos uteis durante a migracao

```bash
# Contar ocorrencias restantes de tokens legados
grep -rn "royal-blue\|color-lime\|font-display\|Montserrat\|Inter\b" /Users/joel/Documents/Dev/joelburigo-site/src/ | wc -l

# Listar arquivos que ainda tocam lime
grep -rln "color-lime\|text-lime\|bg-lime\|border-lime" /Users/joel/Documents/Dev/joelburigo-site/src/

# Buscar shadows soft legacy
grep -rn "shadow-glow\|shadow-lg\|shadow-xl" /Users/joel/Documents/Dev/joelburigo-site/src/ --include="*.astro"

# Buscar radius legacy
grep -rn "rounded-xl\|rounded-2xl\|rounded-lg\|rounded-md" /Users/joel/Documents/Dev/joelburigo-site/src/ --include="*.astro"

# Dev server + build + preview
cd /Users/joel/Documents/Dev/joelburigo-site && npm run dev
cd /Users/joel/Documents/Dev/joelburigo-site && npm run build
cd /Users/joel/Documents/Dev/joelburigo-site && npm run preview

# Logs producao
ssh joel@prod-01 "sudo docker compose -f /mnt/data/docker-compose.yml logs --tail=200 joelburigo-site"

# Rollback producao
ssh joel@prod-01 "sudo restore-app.sh joelburigo-site latest"
```
