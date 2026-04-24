# MOBILE — Regras e adaptações por device

> Toda peça do Joel Burigo é consumida majoritariamente em mobile. Este doc cobre safe zones, breakpoints de produção Astro, adaptações de copy por canvas, e armadilhas comuns. Leia depois de `README.md` (tokens) e `USAGE.md` (decision tree). Complementa — não substitui — `ANTI_DRIFT.md`.

---

## 1. Realidade do consumo

Toda peça nasce com premissa mobile-first. Desktop é caso secundário (exceto deck de venda e landing em fluxo desktop). Estimativas abaixo são internas — marcar `~` quando citar fora daqui.

| Peça | Canal | ~% mobile | Device dominante | Ponto crítico |
|---|---|---|---|---|
| Post IG feed | Instagram | ~98% | iOS > Android (público MPE Sul/SE) | legibilidade em thumb de ~180px wide no grid do perfil |
| Story IG | Instagram | ~100% | iOS e Android equilibrado | UI do IG cobre topo (barra + avatar) e base (CTA + caixa mensagem) |
| Carrossel IG | Instagram | ~97% | iOS | primeiro slide tem que prender — swipe cai se capa é fraca |
| Reels cover | Instagram | ~99% | Android > iOS | título do reel do autor cobre ~200px inferior |
| Post LinkedIn | LinkedIn | ~70% mobile / ~30% desktop | iOS no mobile | primeiros 140 char antes do "…ver mais" |
| Email nurture/pitch | Gmail + Apple Mail | ~75% mobile | iOS Mail + Gmail iOS | preview pane corta em ~90 char no Gmail iOS |
| YouTube thumb | YouTube | ~85% mobile | Android | thumb lido em ~380px wide no feed do YT mobile |
| Ad Meta feed | IG/FB | ~99% | iOS e Android | primeira linha da caption trunca em ~40 char na preview |
| Ad Meta story | IG/FB | ~99% | iOS e Android | CTA nativo sobe a partir de ~1700px Y |
| Landing joelburigo.com.br | Web | ~60–70% mobile | iOS | hero acima da dobra em 360–414px wide |
| Deck apresentação | Keynote/PDF | ~20% mobile | iPad | se lido em iPad, texto de stat < 90px vira ilegível |

**Regra:** se não testou em device real (não DevTools), considere que não testou.

---

## 2. Safe zones por canvas

UI nativa de cada canal cobre pedaços do canvas. Copy e elemento-chave **nunca** encostam nessas zonas.

### IG Feed — 1080×1080 (1:1)

```
┌──────────────────────────┐
│  margem interna 80px     │ ← padding mínimo
│  ┌────────────────────┐  │
│  │                    │  │
│  │   ZONA SEGURA      │  │ 920×920 útil
│  │   920 × 920        │  │
│  │                    │  │
│  └────────────────────┘  │
│  margem interna 80px     │
└──────────────────────────┘
```

- No grid do perfil vira thumb ~360×360 → texto < 40pt no canvas fica ilegível
- Likes/comments aparecem **fora** do post — não é problema de safe zone, é problema de fold: caption trunca em ~125 char

### IG Story — 1080×1920 (9:16)

Canvas nativo cobre:
- **Topo ~180px:** barra de progresso + avatar + "…" + close
- **Topo ~260px (cumulativo):** avatar do autor quando overlay aparece
- **Base ~260–300px:** caixa de mensagem + botão compartilhar + CTA nativo ("arrasta pra cima" / link / sticker)

```
┌──────────────────────────┐
│ ▓▓▓ UI IG (~180px)      │ ← NUNCA copy aqui
│  ┌────────────────────┐  │
│  │                    │  │
│  │  ZONA SEGURA       │  │ 1080 × 1380
│  │  (miolo)           │  │ Y: 200 → 1580
│  │                    │  │
│  │                    │  │
│  └────────────────────┘  │
│ ▓▓▓ UI IG (~260px)      │ ← NUNCA CTA aqui
└──────────────────────────┘
```

- Padding canônico do template: `200px 80px 260px` (top/sides/bottom). Ver `templates/ig-story.html`
- Se tiver CTA "arrasta pra cima" embutido como arte, posicionar em Y ~1500–1650 — acima da zona nativa
- Stickers interativos (enquete, caixinha, link) costumam ocupar ~Y 1300–1700 — **não** competir com conteúdo nessa faixa

### IG Carrossel — 1080×1350 (4:5)

- Dots do carrossel aparecem **fora** do post (abaixo), igual ao feed
- Na visualização, primeiro slide é recortado no preview do feed para 1080×1080 (center crop) — **conteúdo-chave do slide 1 em Y 135–1215** (centro vertical), nunca no topo ou base extrema
- Slide 1 precisa de **indicação visual de carrossel** (setinha `→`, "ARRASTA →", dots no canto)

### IG Reels cover — 1080×1920 (9:16)

- Título do reel (autor escreve na legenda) cobre ~Y 1650–1920 (base)
- Ícones laterais (like/comentar/compartilhar/mais) cobrem ~X 950–1080 nos últimos ~800px verticais
- **Zona segura:** X 60–940, Y 180–1600

### LinkedIn — 1200×1200 (quadrado)

- Preview no feed desktop recorta em ~1:1, mas no mobile o feed do LinkedIn mostra 4:3 no crop inicial — quem não clica pra expandir só vê centro
- **Zona segura crítica:** Y 150–1050 (miolo 1200×900)
- Primeiros 140 char do corpo do post aparecem acima do "…ver mais"

### YouTube thumb — 1280×720 (16:9)

- **Canto inf-direito (X 1100–1280, Y 640–720):** timestamp da duração do vídeo sobreposto — texto nessa região fica ilegível
- No feed mobile o thumb renderiza em ~380px wide → **texto mínimo 120px** no canvas original pra ser legível
- Máximo 3–4 palavras curtas. Mais que isso vira borrão

### Email — 620px de largura

- Gmail mobile (iOS/Android): renderiza com zoom-out se tabela > 600px
- Outlook mobile: respeita 620px mas quebra CSS flexbox — usar tables
- Apple Mail: respeita media queries, melhor ambiente
- Preview pane mostra ~90 char do primeiro texto — **primeira linha tem que vender**
- Dark mode no Gmail inverte cores automáticas — forçar `color` explícito em inline style

---

## 3. Breakpoints (produção Astro)

Site em `src/` usa Tailwind v4 com breakpoints padrão:

| Breakpoint | min-width | Uso canônico Joel Burigo |
|---|---|---|
| (base) | 0px | mobile vertical, smartphones 320–639px |
| `sm` | 640px | smartphones landscape, tablets pequenos |
| `md` | 768px | tablets vertical |
| `lg` | 1024px | tablets landscape + desktop pequeno |
| `xl` | 1280px | desktop padrão |
| `2xl` | 1536px | desktop grande + deck externo |

### Regras de design mobile-first para `src/`

- **Hero:** stack vertical até `md`; side-by-side (texto+visual) a partir de `lg`. Terminal window fullwidth em mobile, 50% em desktop
- **Grid 6Ps:** 1 coluna até `sm`, 2 colunas `md`–`lg`, 3 colunas `lg+` (ou 6×1 linear em desktop xl+)
- **Tabelas de preço (VSS / Advisory):** cards empilhados verticalmente até `md`; side-by-side a partir de `md`. Destaque (acid border + gradient bg) mantém em ambos
- **Ticker:** velocidade `38s` desktop, `28s` mobile (percurso menor) — e diminuir `font-size` de 18px → 14px em `<sm`
- **Status bar topo:** esconder em `<sm` (fica ruído em tela pequena) ou reduzir pra 1 única linha centralizada com só `@joelburigo · SYS ONLINE`
- **Font-sizes display:** usar `clamp()` ancorado em tokens `--jb-fs-*`:
  - H1 hero: `clamp(56px, 9vw, 160px)`
  - H2 section: `clamp(40px, 6vw, 96px)`
  - Mega número: `clamp(96px, 18vw, 320px)`
- **Letter-spacing:** manter `-0.035em` até `md`; afrouxar pra `-0.02em` em `<sm` (evitar títulos gigantes ficarem ilegíveis com tracking apertado em tela pequena)
- **Touch targets:** botões/links tocáveis com **mínimo 44×44px** (Apple HIG). Em mobile, CTA primário canônico `padding: 20px 32px` + `min-height: 56px`
- **Grid overlay 80px:** manter em desktop; em mobile reduzir pra `60px` (ou `40px` em `<sm`) — 80px em tela de 375px de largura vira só 4–5 divisões visíveis, perde o efeito técnico

---

## 4. Adaptações de copy por device

Peças que rodam em múltiplos canvases precisam de copy adaptada — não basta re-exportar. Copy longo de feed não cabe em story vertical.

### Tabela de comprimentos máximos efetivos (mobile)

| Elemento | Limite duro | Limite útil (mobile) | Observação |
|---|---|---|---|
| IG caption (feed) | 2.200 char | **~125 char** antes do "…mais" | primeiras 125 char são críticas — hook + CTA aí |
| IG comment | 2.200 char | ~300 char | comentário próprio ancorado vira thread |
| IG story text overlay | sem limite técnico | 6–10 palavras no hero | mais que isso = texto apertado, ilegível |
| LinkedIn post | 3.000 char | **~140 char** antes do "…ver mais" | abrir com provocação ou número, não com "Vou compartilhar…" |
| Email subject | 998 char | **40–50 char** no Gmail mobile | acima disso trunca. Testar no iPhone 13 mini (375px) |
| Email preheader | — | **60–80 char** | aparece ao lado do subject no inbox |
| Email primeira linha corpo | — | ~90 char visíveis no preview | vale como segundo hook |
| WhatsApp broadcast | 65.536 char | ~350 char antes de "Ler mais" | hook nos primeiros 2 parágrafos |
| YouTube thumb texto | — | **3–4 palavras · 120px+ no canvas** | lido em ~380px na tela do feed YT |
| Push notif (se houver) | — | **40 char title / 90 char body** | iOS trunca antes de Android |
| Ad Meta primary text | 2.200 char | **~40 char** visíveis antes do truncamento | primeiras palavras carregam o peso |
| Ad Meta headline | 40 char | 40 char | já é o limite duro |

### Regras de adaptação entre canvases

- **Headline que cabe em feed (1080×1080) geralmente NÃO cabe em story (1080×1920 vertical).** Espaço útil vertical do story é menor porque o hero precisa respirar. Cortar pra 60–70% do original
- **Story reciclando post de feed:** pegar 1 frase-chave do feed, transformar em título display, jogar CTA "link na bio" no bottom
- **LinkedIn reciclando post IG:** abrir com provocação (140 char), expandir argumento (se IG era 1 frase, LinkedIn vira 3–4 parágrafos), fechar com pergunta
- **Email reciclando post:** nunca copiar-colar. Subject = hook. Preheader = complemento. Corpo = expande com 1 história + CTA
- **YouTube thumb:** nunca repetir o título do vídeo no thumb. Thumb = provocação visual; título = descrição

---

## 5. Tipografia em mobile

- **Body mínimo 16px** em produção (`<input>` principalmente) — iOS Safari faz auto-zoom em inputs `<16px` ao focar, arruína o layout
- **Archivo Black display** fica brutalista em mobile — é o ponto forte. Mas evitar `line-height` muito apertado: mínimo `0.9` no hero mobile (desktop pode ir 0.82)
- **Letter-spacing negativo:** OK até `-0.04em` em mobile. Mais apertado que isso (ex: `-0.06em` que funciona lindo em mega-números desktop) em telas pequenas vira mancha ilegível. No canvas de story/feed (1080px nativo, renderizado em ~375px) o problema é mitigado pelo downscale — mas em produção web `src/` com display real em mobile, respeitar o `-0.04em`
- **JetBrains Mono micro-copy:** mínimo `11px` em ticker/status bar. Menos que isso só entra se for puramente decorativo e não precisar ser lido
- **Stroke-text (`-webkit-text-stroke: 2px cream`)**: em mobile ficar atento ao stroke-width — 2px em tela retina 3× fica fino demais. Considerar 3px em mobile pra manter presença. No canvas nativo (1080px exportado) deixar 4px como já está nos templates
- **Mega números** (tipo `+433%`, `140+`, `~R$ 1 bilhão`): mínimo `96px` no canvas pra funcionar em thumb de feed. No IG story pode ir até `520px` (ver variant 2 do story template) porque a tela inteira absorve. Use apenas provas oficiais de `ANTI_DRIFT.md §4`; `~R$ 1 bilhão` sempre com til e, quando houver espaço, .

---

## 6. Imagens e mídia

### Aspect ratio e canvas

- **IG Story / Reels:** sempre 9:16 vertical (1080×1920). Nunca pegar vídeo horizontal e rotacionar ou adicionar barras — ou refilma vertical ou não posta
- **Carrossel IG:** todos os slides no **mesmo aspect** (1:1 OU 4:5, não misturar) — IG corta pro menor comum denominador se misturar, estraga layout
- **IG Feed:** preferir 1:1 (1080×1080). 4:5 (1080×1350) ocupa mais real estate no feed mobile mas corta no grid do perfil
- **Reels cover:** desenhar 1080×1920 mas conteúdo-chave dentro de 1080×1350 (centro), porque o preview no grid do perfil mostra só o centro 1:1

### Compressão e performance

- **Email:** imagens max **600px wide**, **80–150kb** cada. Alt text obrigatório em todas (Gmail dark mode pode falhar em renderizar — alt text vira fallback visível)
- **Landing mobile:** hero image servida em WebP/AVIF com fallback JPEG. Usar `<picture>` + `srcset` pra servir 1x/2x/3x. Target: LCP <2.5s em 3G simulado
- **IG/carrossel:** export JPG 90% quality, sRGB. IG recomprime ainda mais, mas partir de boa qualidade evita artefato duplo
- **YouTube thumb:** JPG até 2MB, mas mantém < 500kb pra carregar rápido em mobile

### YouTube thumb — regra de ouro

Thumb é lido em ~380px wide na tela do mobile. Texto **tem que** ser gigante no canvas original:
- 3–4 palavras máx
- Cada palavra ≥ 120px altura no canvas 1280×720
- Contraste máximo — fire sobre preto ou acid sobre preto, nunca cream sobre cream
- Rosto do Joel (se houver): ocupa 30–40% do canvas, expressão forte (não sorriso genérico)

---

## 7. Armadilhas comuns

Erros recorrentes que só aparecem em mobile real:

- **Preto sobre fire em mobile com brilho alto:** contraste WCAG passa na teoria mas no sol direto fica borderline. Para CTA em fire, texto preto `#050505` é OK; para parágrafo sobre fire, preferir cream `#F5F1E8`
- **Grid overlay 80px em story 1080×1920:** quando o story renderiza em tela de ~375px, grid de 80px vira 28px visuais — ainda OK. Mas em tela pequena (iPhone SE ~320px) pode apertar. Se for crítico, reduzir pra `60px` em stories específicos ou baixar opacidade de `0.35` pra `0.22`
- **Shadow brutalista 6px offset:** em telas retina de densidade 3× (iPhone Pro), o offset 6px vira `~2px visual` — pode ficar discreto demais. Em story subir pra `8–10px` de offset pra manter a pegada brutalist. Desktop mantém 4–6px
- **Emoji `★` em algumas fontes mobile:** Android às vezes substitui por estrela outline vazada (esquisito). Forçar `font-family: 'JetBrains Mono', monospace` no span que contém o marcador (`★`, `▶`, `→`, `●`) — o mono carrega o glyph correto
- **Safe zone IG Story — CTA colidindo com UI nativa:** CTA (botão, "arrasta pra cima") **nunca** em Y 1700–1920. Subir pra Y 1500–1700. Qualquer coisa abaixo de 1700 é comido pela caixa de mensagem + ícone "compartilhar reação" do IG
- **LinkedIn — primeiros 140 char:** se abrir com "Hoje quero compartilhar com vocês uma reflexão sobre…" mata o hook. Abrir com número, pergunta ou provocação direta. Ex: "R$ 160k → R$ 1MI. 24 meses. Um detalhe muda tudo:" 
- **Email subject com emoji:** Gmail iOS renderiza, Outlook mobile às vezes vira retângulo. Testar ou evitar. `★` e `▶` costumam ser seguros; faciais nunca
- **Tap target em mobile < 44px:** botão com `padding: 8px 16px` vira ~36px de altura — abaixo do mínimo. Subir pra `padding: 16px 24px` (~56px de altura) mínimo no mobile
- **Input sem `font-size: 16px`:** iOS dá zoom automático ao focar, quebra layout. Em `src/components/` conferir todos os `<input>`, `<textarea>`, `<select>`
- **Viewport meta tag:** confirmar `<meta name="viewport" content="width=device-width, initial-scale=1">` no head — sem isso, mobile renderiza com zoom desktop
- **Terminal window em mobile:** em `<sm` a janela terminal quebra horizontalmente se tiver código longo. Reduzir font do `<code>` pra 12px em mobile ou deixar scroll horizontal explícito (`overflow-x: auto` + hint visual)

---

## 8. Checklist pré-publicação (mobile real)

Antes de publicar qualquer peça:

- [ ] **Abriu em mobile real** — iPhone ou Android físico, não só DevTools/responsive mode do browser
- [ ] **Safe zones respeitadas** no canvas nativo do canal (ver §2)
- [ ] **Copy legível** em tela ~320–400px wide (iPhone SE / smartphone básico Android)
- [ ] **Touch targets ≥ 44×44px** em produção (botões, links, ícones clicáveis)
- [ ] **Imagens carregam em 3G simulado** (< 1s por asset crítico; LCP < 2.5s em landing)
- [ ] **Alt text preenchido** em todas as imagens (email + landing)
- [ ] **Dark mode testado** (relevante principalmente em email — Gmail + Apple Mail dark)
- [ ] **Primeira linha / primeiros 125 char** carregam o hook (caption IG, corpo email, LinkedIn post)
- [ ] **Subject line de email** testado no preview do Gmail iOS (≤ 50 char, não trunca)
- [ ] **Thumb YouTube** checado em preview do feed YT mobile (não só como arquivo isolado)
- [ ] **Carrossel IG:** todos slides mesmo aspect ratio; slide 1 tem indicação visual de "arrasta →"
- [ ] **Story IG:** CTA não colide com UI nativa (Y < 1700); `★` e `▶` renderizando correto
- [ ] **Landing `src/`:** rodou `pnpm build` e testou em `http://[ip-local]:4321` via wifi do celular (não localhost do mac)

Se algum item falhou → volta, ajusta, testa de novo. Publicar peça quebrada em mobile = queimar a impressão do primeiro contato. Não tem segunda chance no feed.

---

**Ver também:**
- `README.md` — tokens, tipografia, direção Terminal Growth
- `USAGE.md` — decision tree por tipo de pedido
- `ANTI_DRIFT.md` — regras duras (palavras proibidas, provas exatas)
- `templates/ig-story.html` — padding canônico 200/80/260, referência de safe zones
- `templates/email.html` — layout 620px dark-safe
