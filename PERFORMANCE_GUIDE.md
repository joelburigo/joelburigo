# Guia de Otimizações PageSpeed Insights

## ✅ Já Implementado

1. **Partytown** - Scripts de analytics rodando em Web Worker
2. **Vercel Speed Insights** - Monitoramento de performance
3. **SSR Mode** - Server-Side Rendering para melhor FCP
4. **Sitemap** - SEO otimizado
5. **Compressão HTML** - Minificação automática
6. **CSS Minification** - Lightning CSS
7. **Code Splitting** - Chunks separados para React e Framer Motion
8. **Preconnect** - DNS resolution antecipada
9. **Cache Headers** - Cache agressivo para assets estáticos

## 🚀 Otimizações Principais

### 1. Imagens (Maior Impacto no LCP)

```astro
---
import OptimizedImage from '@/components/ui/OptimizedImage.astro'
---

<!-- Imagem principal (hero) - ALTA PRIORIDADE -->
<OptimizedImage
  src="/images/hero.jpg"
  alt="Descrição"
  width={1200}
  height={600}
  loading="eager"
  fetchpriority="high"
  format="webp"
  quality={80}
  sizes="(max-width: 768px) 100vw, 1200px"
/>

<!-- Imagens secundárias - Lazy loading -->
<OptimizedImage
  src="/images/feature.jpg"
  alt="Descrição"
  width={800}
  height={400}
  loading="lazy"
  format="webp"
  quality={75}
/>
```

**Checklist de Imagens:**
- ✅ Usar formato WebP ou AVIF
- ✅ Definir `width` e `height` (evita CLS)
- ✅ `fetchpriority="high"` na imagem hero
- ✅ `loading="lazy"` em imagens abaixo da dobra
- ✅ Comprimir imagens (quality 75-80)
- ✅ Usar `sizes` para responsive images
- ✅ Considerar usar `blur` placeholder

### 2. Fontes (Reduz FCP e LCP)

```astro
<!-- No <head> -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />

<!-- Se usar fontes locais (MELHOR): -->
<link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossorigin />

<!-- CSS -->
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter-var.woff2') format('woff2-variations');
  font-weight: 100 900;
  font-display: swap; /* Mostra fallback enquanto carrega */
  font-style: normal;
}
```

**Dica:** Baixe as fontes do Google Fonts e sirva localmente:
```bash
# Instalar
npm install -D @fontsource/inter

# Importar no global.css
@import '@fontsource/inter/400.css';
@import '@fontsource/inter/700.css';
```

### 3. Critical CSS (Inline)

```astro
---
// No Layout.astro - extrair CSS crítico
const criticalCSS = `
  body { margin: 0; font-family: system-ui; }
  .hero { min-height: 100vh; }
  /* Apenas estilos above-the-fold */
`
---

<head>
  <style is:inline>{criticalCSS}</style>
  <!-- CSS completo carrega async -->
</head>
```

### 4. JavaScript (Reduzir Bloqueio)

```astro
<!-- Componentes interativos com client directives -->
<MobileMenu client:visible />  <!-- Só carrega quando visível -->
<TestimonialCarousel client:idle />  <!-- Carrega após página interativa -->
<VideoPlayer client:load />  <!-- Carrega imediatamente -->
```

**Estratégias:**
- `client:visible` - Componentes abaixo da dobra
- `client:idle` - Componentes não críticos
- `client:load` - Componentes críticos
- `client:only` - Sem SSR (melhor para heavy components)

### 5. Prefetch (Melhorar Navegação)

```astro
---
// Já configurado em astro.config.mjs
prefetch: {
  prefetchAll: false,
  defaultStrategy: 'hover',
}
---

<!-- Adicionar data-astro-prefetch em links importantes -->
<a href="/services" data-astro-prefetch>Serviços</a>
```

### 6. Third-Party Scripts (Já otimizado com Partytown)

Scripts de analytics já estão no Partytown. Certifique-se de que:
```astro
<!-- GTM, FB Pixel, etc devem usar type="text/partytown" -->
<script type="text/partytown">
  // Analytics code
</script>
```

### 7. Lazy Loading de Componentes Pesados

```astro
---
// Componentes com muita interatividade
---

<!-- Não carregar até ser necessário -->
<div>
  {isOpen && <HeavyModal client:only="react" />}
</div>
```

### 8. Service Worker (PWA - Opcional)

```javascript
// Instalar @astrojs/pwa
npm install -D @astrojs/pwa

// astro.config.mjs
import pwa from '@astrojs/pwa'

export default defineConfig({
  integrations: [
    pwa({
      mode: 'production',
      manifest: {
        name: 'Joel Burigo',
        short_name: 'JB',
        theme_color: '#000000',
      },
      workbox: {
        globPatterns: ['**/*.{css,js,html,svg,png,ico,txt}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 ano
              }
            }
          }
        ]
      }
    })
  ]
})
```

## 📊 Métricas Alvo (Core Web Vitals)

- **LCP** < 2.5s (verde)
- **INP** < 200ms (verde)
- **CLS** < 0.1 (verde)
- **FCP** < 1.8s
- **TTFB** < 800ms

## 🔍 Como Testar

1. **PageSpeed Insights:**
   ```
   https://pagespeed.web.dev/analysis?url=https://joelburigo.com.br
   ```

2. **Chrome DevTools:**
   - Lighthouse (F12 > Lighthouse)
   - Performance tab
   - Network tab (throttling 3G)

3. **WebPageTest:**
   ```
   https://www.webpagetest.org/
   ```

4. **Vercel Analytics:**
   - Dashboard > Analytics > Speed Insights
   - Veja métricas reais de usuários (RUM)

## 🎯 Checklist de Implementação

### Imagens
- [ ] Converter todas para WebP/AVIF
- [ ] Adicionar `width` e `height` em todas
- [ ] `fetchpriority="high"` na hero image
- [ ] `loading="lazy"` nas demais
- [ ] Usar `sizes` attribute
- [ ] Comprimir para < 200KB

### Fontes
- [ ] Migrar para fontes locais (@fontsource)
- [ ] Adicionar `font-display: swap`
- [ ] Preload de fontes críticas
- [ ] Remover fontes não usadas

### CSS
- [ ] Inline critical CSS
- [ ] Remover CSS não usado (PurgeCSS já está no Tailwind)
- [ ] Minificar (Lightning CSS já configurado)

### JavaScript
- [ ] Usar client directives apropriados
- [ ] Code splitting (já configurado)
- [ ] Remover console.logs
- [ ] Tree shaking de imports não usados

### Network
- [ ] Ativar HTTP/2 (Vercel já faz)
- [ ] Brotli compression (Vercel já faz)
- [ ] Cache headers (já configurado)
- [ ] CDN (Vercel já faz)

### HTML
- [ ] Minificar (já configurado)
- [ ] Remover comentários
- [ ] Lazy load iframes: `loading="lazy"`

### Analytics
- [ ] Scripts no Partytown (já configurado)
- [ ] Carregar apenas quando necessário
- [ ] Considerar remover no dev

## 🛠️ Ferramentas Úteis

```bash
# Analisar bundle size
npm install -D @next/bundle-analyzer

# Comprimir imagens
npm install -D sharp
npm install -D imagemin imagemin-webp

# Auditar performance
npm install -g lighthouse-cli
lighthouse https://joelburigo.com.br --view
```

## 📈 Ordem de Prioridade (Maior Impacto)

1. **Otimizar imagens** (especialmente hero/LCP)
2. **Fontes locais** com preload
3. **Inline critical CSS**
4. **Client directives** em componentes pesados
5. **Lazy loading** agressivo
6. **Remover JS não usado**
7. **Cache agressivo**

## 🎨 Dicas Específicas por Componente

### HeroSection
```astro
<OptimizedImage
  src={heroImage}
  alt="Hero"
  width={1920}
  height={1080}
  loading="eager"
  fetchpriority="high"
  quality={85}
/>
```

### TestimonialsSection
```astro
<!-- Carregar apenas quando visível -->
<TestimonialCarousel client:visible />
```

### VideoPlayer
```astro
<!-- Lazy load iframe -->
<iframe loading="lazy" src="..." />

<!-- Ou usar facade pattern -->
<div class="video-facade" onclick="loadVideo()">
  <img src="thumbnail.jpg" loading="lazy" />
</div>
```

## 🚨 Erros Comuns a Evitar

1. ❌ Não definir dimensões de imagens
2. ❌ Carregar fontes do Google sem preconnect
3. ❌ Scripts síncronos no `<head>`
4. ❌ Não usar lazy loading
5. ❌ CSS não usado
6. ❌ Imagens muito grandes
7. ❌ Muitos requests de rede
8. ❌ Layout shifts

## 📱 Otimizações Mobile

```css
/* Otimizar para mobile first */
@media (max-width: 768px) {
  /* Reduzir animações */
  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }
  
  /* Fontes menores */
  html { font-size: 14px; }
  
  /* Ocultar elementos pesados */
  .desktop-only { display: none; }
}
```

## 🔄 Monitoramento Contínuo

1. **Vercel Speed Insights** - Métricas reais
2. **Lighthouse CI** - Em cada deploy
3. **PageSpeed Insights API** - Automatizado
4. **Web Vitals JS** - Tracking customizado

```javascript
// web-vitals tracking
import { getCLS, getFID, getLCP } from 'web-vitals'

getCLS(console.log)
getFID(console.log)
getLCP(console.log)
```

## 🎓 Recursos Adicionais

- [web.dev/vitals](https://web.dev/vitals/)
- [Astro Performance Guide](https://docs.astro.build/en/guides/performance/)
- [Image Optimization Guide](https://web.dev/fast/#optimize-your-images)
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance/)
