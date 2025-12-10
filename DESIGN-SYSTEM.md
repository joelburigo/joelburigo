# 🎨 Design System - Joel Burigo

Sistema de design padronizado para manter consistência visual em todo o site.

## 📐 Hierarquia Tipográfica

### Fontes

- **Display/Brand**: `Montserrat` - Títulos, CTAs, elementos de marca
- **Body/Content**: `Inter` - Textos corridos, descrições, conteúdo geral

### Escalas de Texto

#### Display (Hero Titles)
```html
<!-- Extra Large - Hero principal -->
<h1 class="font-display text-display-lg">
  Transforme Vendas Aleatórias em Previsíveis
</h1>

<!-- Medium - Sub-heroes -->
<h1 class="font-display text-display-md">
  Framework dos 6Ps
</h1>

<!-- Small - Section heroes -->
<h2 class="font-display text-display-sm">
  Comece Agora
</h2>
```

#### Headings (Section Titles)
```html
<!-- H1 - Títulos principais de seção -->
<h2 class="font-display text-h1">
  O Problema Que 80% das MPEs Enfrentam
</h2>

<!-- H2 - Subtítulos de seção -->
<h3 class="font-display text-h2">
  Como Funciona
</h3>

<!-- H3 - Títulos de cards -->
<h4 class="font-display text-h3">
  Vendas Sem Segredos
</h4>

<!-- H4 - Subtítulos menores -->
<h5 class="font-display text-h4">
  Posicionamento
</h5>
```

#### Body Text (Content)
```html
<!-- Large - Introduções, destaque -->
<p class="font-sans text-body-lg">
  Metodologia validada por 500+ empresas
</p>

<!-- Regular - Texto padrão -->
<p class="font-sans text-body">
  Sistema completo de vendas escaláveis
</p>

<!-- Small - Legendas, notas -->
<p class="font-sans text-body-sm">
  *Garantia de 30 dias
</p>
```

## 🎨 Paleta de Cores

### Cores da Marca
```css
--color-royal-blue: #1d4ed8  /* Azul institucional */
--color-lime: #a3ff3f         /* Verde destaque/CTAs */
```

### Cores de Fundo
```css
--color-dark: #020617         /* Fundo principal */
--color-dark-gray: #111827    /* Fundo secundário */
```

### Cores de Texto
```css
--color-text-primary: #ffffff      /* Títulos, texto principal */
--color-text-secondary: #d1d5db    /* Subtextos, descrições */
--color-text-tertiary: #9ca3af     /* Labels, legendas */
```

### Uso Prático
```html
<!-- Títulos -->
<h2 class="text-white">Título Principal</h2>

<!-- Descrições -->
<p class="text-gray-300">Descrição do conteúdo</p>

<!-- Labels/Legendas -->
<span class="text-gray-400">Pequena nota</span>

<!-- Destaques -->
<span class="text-lime">Quer aprender a fazer?</span>
<span class="text-royal-blue">Framework 6Ps</span>
```

## 📏 Espaçamento Padronizado

### Spacing Scale
```css
--space-section: 6rem     /* 96px - Entre seções principais */
--space-section-sm: 4rem  /* 64px - Entre subseções */
--space-content: 2rem     /* 32px - Entre blocos de conteúdo */
--space-element: 1rem     /* 16px - Entre elementos relacionados */
```

### Uso com Tailwind
```html
<!-- Seções principais -->
<section class="py-section">...</section>
<!-- ou -->
<section class="py-24">...</section>

<!-- Subseções -->
<div class="py-section-sm">...</div>
<!-- ou -->
<div class="py-16">...</div>

<!-- Conteúdo -->
<div class="mb-content">...</div>
<!-- ou -->
<div class="mb-8">...</div>

<!-- Elementos -->
<div class="gap-element">...</div>
<!-- ou -->
<div class="gap-4">...</div>
```

## 🔘 Componentes Padrão

### Botões

#### Primary (CTA Principal)
```html
<button class="btn-primary">
  Começar Agora
</button>

<!-- ou com Tailwind -->
<button class="bg-lime text-dark font-display font-bold px-8 py-4 rounded-lg hover:scale-105 transition-all shadow-lg shadow-lime/20">
  Começar Agora
</button>
```

#### Secondary (CTA Secundário)
```html
<button class="btn-secondary">
  Saiba Mais
</button>

<!-- ou com Tailwind -->
<button class="border-2 border-white text-white font-display font-semibold px-8 py-4 rounded-lg hover:bg-white/10 hover:scale-105 transition-all">
  Saiba Mais
</button>
```

### Cards

#### Card Padrão
```html
<div class="card">
  <!-- Conteúdo -->
</div>

<!-- ou com Tailwind -->
<div class="rounded-2xl border-2 border-white/10 bg-dark-gray/50 p-8 transition-all hover:border-lime/50 hover:shadow-lg hover:shadow-lime/20">
  <!-- Conteúdo -->
</div>
```

#### Card com Gradiente
```html
<div class="rounded-2xl border-2 border-white/10 bg-gradient-to-br from-dark via-dark-gray to-dark p-8 backdrop-blur-sm transition-all hover:border-lime/50">
  <!-- Conteúdo -->
</div>
```

### Badges

```html
<!-- Badge destaque -->
<span class="inline-block rounded-full bg-lime/20 px-4 py-1 text-sm font-display font-bold text-lime">
  MAIS POPULAR
</span>

<!-- Badge info -->
<span class="inline-block rounded-full bg-royal-blue/20 px-4 py-1 text-sm font-display font-semibold text-royal-blue">
  NOVO
</span>
```

## 🎭 Backgrounds & Gradientes

### Gradiente Padrão (Seções)
```html
<section class="bg-gradient-to-b from-dark via-dark-gray to-dark py-24">
  <!-- Conteúdo -->
</section>

<!-- ou usando a classe utilitária -->
<section class="bg-gradient-dark section">
  <!-- Conteúdo -->
</section>
```

### Decorações de Fundo
```html
<!-- Background orbs (efeito glow) -->
<div class="absolute left-0 top-0 h-96 w-96 rounded-full bg-lime/5 blur-3xl"></div>
<div class="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-royal-blue/5 blur-3xl"></div>
```

## ✨ Efeitos & Animações

### Hover Effects
```html
<!-- Scale up on hover -->
<div class="transition-all hover:scale-105">...</div>

<!-- Glow effect on hover -->
<div class="transition-all hover:shadow-lg hover:shadow-lime/20">...</div>

<!-- Border highlight on hover -->
<div class="border-2 border-white/10 transition-all hover:border-lime/50">...</div>
```

### Animações de Entrada
```html
<!-- Fade in -->
<div class="animate-fade-in">...</div>

<!-- Slide up -->
<div class="animate-slide-up">...</div>

<!-- Com delay (para sequência) -->
<div class="animate-slide-up" style="animation-delay: 0.1s">...</div>
<div class="animate-slide-up" style="animation-delay: 0.2s">...</div>
```

## 📱 Responsividade

### Breakpoints Tailwind
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

### Padrões Responsivos
```html
<!-- Texto responsivo -->
<h1 class="text-3xl md:text-4xl lg:text-display-md">
  Título Responsivo
</h1>

<!-- Grid responsivo -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
  <!-- Cards -->
</div>

<!-- Padding responsivo -->
<section class="py-16 md:py-24 lg:py-section">
  <!-- Conteúdo -->
</section>
```

## 🎯 Exemplos de Uso

### Hero Section
```html
<section class="relative min-h-screen bg-gradient-to-b from-dark via-dark-gray to-dark">
  <div class="absolute inset-0 overflow-hidden">
    <div class="absolute left-0 top-0 h-96 w-96 rounded-full bg-lime/10 blur-3xl"></div>
  </div>
  
  <div class="relative z-10 container mx-auto px-4 pt-24 pb-24">
    <h1 class="font-display text-display-lg text-white mb-6">
      Transforme Vendas Aleatórias em Previsíveis
    </h1>
    <p class="font-sans text-body-lg text-gray-300 max-w-2xl">
      Sistema completo de vendas escaláveis para MPEs
    </p>
    <button class="btn-primary mt-8">
      Começar Agora
    </button>
  </div>
</section>
```

### Card Section
```html
<section class="section bg-gradient-dark">
  <div class="container mx-auto px-4">
    <h2 class="font-display text-h1 text-white text-center mb-16">
      Como Funciona
    </h2>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div class="card">
        <h3 class="font-display text-h3 text-white mb-4">
          Passo 1
        </h3>
        <p class="font-sans text-body text-gray-300">
          Descrição do primeiro passo
        </p>
      </div>
    </div>
  </div>
</section>
```

## 📋 Checklist de Padronização

Ao criar novos componentes, verifique:

- [ ] Títulos usam `font-display` (Montserrat)
- [ ] Textos corridos usam `font-sans` (Inter)
- [ ] Tamanhos de texto seguem a escala (`text-display-*`, `text-h*`, `text-body-*`)
- [ ] Cores seguem a paleta (lime, royal-blue, white, gray-*)
- [ ] Espaçamentos usam múltiplos de 4px (gap-4, p-8, etc.)
- [ ] Seções têm `py-24` ou `py-section`
- [ ] Backgrounds escuros têm gradiente (`bg-gradient-to-b from-dark via-dark-gray to-dark`)
- [ ] Borders usam `border-white/10` por padrão
- [ ] Hover effects incluem `transition-all`
- [ ] CTAs principais usam `bg-lime text-dark`
- [ ] Borders arredondados usam `rounded-xl` ou `rounded-2xl`

## 🚀 Próximos Passos

Para aplicar este design system em componentes existentes:

1. Substituir classes de texto genéricas por classes semânticas
2. Padronizar todos os botões com as classes `.btn-primary` e `.btn-secondary`
3. Aplicar gradientes consistentes em todas as seções
4. Revisar e padronizar espaçamentos
5. Garantir que todos os títulos usem Montserrat e textos usem Inter

---

**Última atualização**: 9 de dezembro de 2025
