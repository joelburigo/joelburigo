# 🚀 Joel Burigo - Site Marketing Completo (Versão Moderna)

## ✅ O que foi implementado

### 📊 Analytics & Tracking (Versão 2024-2025)
- ✅ **Google Consent Mode v2** - Compliance com LGPD/GDPR
- ✅ **Google Tag Manager** - Gerenciamento centralizado de tags
- ✅ **Meta Pixel com Advanced Matching** - Auto-detecção de email/telefone
- ✅ **Meta Conversions API (CAPI)** - Tracking server-side
- ✅ **Google Analytics 4 Measurement Protocol** - Server-side tracking
- ✅ **Enhanced Conversions** - Dados hasheados para melhor matching
- ✅ **Partytown** - Scripts de terceiros em Web Worker (performance)
- ✅ **Vercel Analytics** - Analytics nativo Vercel
- ✅ **Vercel Speed Insights** - Core Web Vitals

### 🎯 SEO & Marketing
- ✅ **Sitemap XML** - Gerado automaticamente
- ✅ **robots.txt** - Otimizado
- ✅ **Schema.org/JSON-LD** - Dados estruturados
- ✅ **Open Graph** - Preview em redes sociais
- ✅ **Twitter Cards** - Preview no Twitter
- ✅ **Meta tags** - Title, description, keywords
- ✅ **Canonical URLs** - Evita conteúdo duplicado
- ✅ **Preconnect** - Performance de DNS

### ⚡ Performance & Vercel
- ✅ **Vercel Adapter** - Deploy otimizado
- ✅ **Vercel Web Analytics** - Analytics nativo
- ✅ **Vercel Speed Insights** - Métricas Core Web Vitals
- ✅ **Image Optimization** - Automático
- ✅ **Hybrid Rendering** - SSR + Static
- ✅ **Compress HTML** - Minificação
- ✅ **Inline Stylesheets** - Critical CSS

### 🔐 Privacidade & Compliance
- ✅ **Cookie Consent Banner** - LGPD/GDPR compliant
- ✅ **Consent Management** - LocalStorage persistence
- ✅ **Google Consent Mode v2** - Advanced consent framework
- ✅ **Data Minimization** - Apenas cookies essenciais até consentimento
- ✅ **Hash de Dados** - SHA-256 para email/phone (CAPI)

### 🔒 Segurança
- ✅ **Security Headers** - XSS, Clickjacking, etc
- ✅ **HTTPS** - Automático Vercel
- ✅ **Content Security** - Headers configurados
- ✅ **Referrer Policy** - Privacidade

---

## 📝 Próximos Passos

### 1. Configure as Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

\`\`\`env
PUBLIC_GTM_ID=GTM-XXXXXXX
PUBLIC_GA4_ID=G-XXXXXXXXXX
PUBLIC_GOOGLE_ADS_ID=AW-XXXXXXXXXX
PUBLIC_META_PIXEL_ID=XXXXXXXXXXXXXXX
PUBLIC_SITE_URL=https://joelburigo.com.br
\`\`\`

### 2. Google Tag Manager Setup

1. Acesse [tagmanager.google.com](https://tagmanager.google.com)
2. Crie container "Joel Burigo"
3. Copie o ID (GTM-XXXXXXX)
4. Configure as seguintes tags:

#### Tag: Google Analytics 4
- Tipo: GA4 Configuration
- Measurement ID: {{GA4_ID}}
- Trigger: All Pages

#### Tag: Google Ads Conversion
- Tipo: Google Ads Conversion Tracking
- Conversion ID: {{GOOGLE_ADS_ID}}
- Triggers: Custom events (via dataLayer)

### 3. Meta Pixel Setup

1. Acesse [business.facebook.com/events_manager](https://business.facebook.com/events_manager)
2. Crie Pixel "Joel Burigo"
3. Copie Pixel ID
4. Configure eventos customizados (já prontos no código)

### 4. Deploy na Vercel

\`\`\`bash
# Instale a CLI Vercel
npm i -g vercel

# Deploy
vercel

# Produção
vercel --prod
\`\`\`

Ou conecte o repositório diretamente no painel da Vercel.

### 5. Configure o Domínio

Na Vercel:
1. Settings → Domains
2. Adicione: joelburigo.com.br
3. Configure DNS no provedor

### 6. Google Search Console

1. Acesse [search.google.com/search-console](https://search.google.com/search-console)
2. Adicione propriedade
3. Verifique via DNS ou arquivo HTML
4. Submeta sitemap: `https://joelburigo.com.br/sitemap-index.xml`

---

## 🎯 Eventos de Conversão

### Uso nos Formulários

\`\`\`javascript
import { trackLead, trackVSSInterest } from '../lib/analytics'

// Ao enviar formulário
trackLead('contato')

// Ao clicar no CTA do VSS
trackVSSInterest()
\`\`\`

### Eventos Disponíveis

- **trackLead(formName)** - Lead gerado
- **trackVSSInterest()** - Interesse em VSS
- **trackServicesInterest()** - Interesse em Services
- **trackAdvisoryInterest()** - Interesse em Advisory
- **trackDiagnostico()** - Download diagnóstico

---

## 📊 KPIs Configurados

### Google Analytics
- Pageviews
- Sessions
- Users
- Bounce Rate
- Conversões customizadas

### Meta Pixel
- PageView (automático)
- Lead
- InitiateCheckout
- ViewContent
- CompleteRegistration

### Google Ads
- Conversões de lead
- Conversões de interesse em produtos
- ROI de campanhas

---

## 🛠️ Comandos

\`\`\`bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Preview
npm run preview

# Deploy Vercel
vercel
\`\`\`

---

## 📁 Estrutura de Arquivos Novos

\`\`\`
src/
├── components/
│   ├── analytics/
│   │   ├── GoogleTagManager.astro      # GTM head
│   │   ├── GoogleTagManagerBody.astro  # GTM body
│   │   └── MetaPixel.astro            # Meta Pixel
│   └── seo/
│       └── JsonLd.astro               # Schema.org
├── lib/
│   └── analytics.ts                   # Funções de tracking
└── layouts/
    └── Layout.astro                   # Atualizado com analytics

public/
├── robots.txt                         # SEO
├── _headers                           # Security headers
└── .env.example                       # Template variáveis

vercel.json                            # Config Vercel
SETUP.md                               # Guia detalhado
\`\`\`

---

## 🎨 Otimizações de Marketing

### Landing Pages
- CTAs claros e visíveis
- Formulários otimizados
- Social proof (depoimentos)
- Badges de autoridade
- Urgência e escassez

### Funis de Conversão
1. Tráfego → Página inicial
2. Interesse → VSS/Services/Advisory
3. Lead → Formulário/Diagnóstico
4. Conversão → WhatsApp/Calendário

### A/B Testing (futuro)
- Headlines diferentes
- CTAs variados
- Cores de botão
- Posicionamento de elementos

---

## 📞 Suporte

- Documentação Astro: [astro.build](https://astro.build)
- Vercel Docs: [vercel.com/docs](https://vercel.com/docs)
- GTM: [tagmanager.google.com](https://tagmanager.google.com)

---

Criado com ❤️ usando **Astro**, **React**, **Tailwind CSS** e **Vercel**.
