# 🚀 Analytics Completo - Configuração Atual

## ✅ O que está configurado (Hardcoded)

### 1. Google Tag Manager
- **ID:** `GTM-TWP4J6N8`
- **Componente:** `GoogleTagManager.astro` + `GoogleTagManagerBody.astro`
- **Uso:** Container centralizado para tags extras/testes

### 2. Google Analytics 4
- **ID:** `G-Z2XMZ448VV`
- **Componente:** `GoogleAnalytics.astro`
- **Tracking SPA:** ✅ Automático

### 3. Google Ads (AdWords)
- **ID:** `AW-17800140385`
- **Componente:** `GoogleAds.astro`
- **Conversions:** Pronto para rastrear

### 4. Meta Pixel (Facebook/Instagram)
- **ID:** `693646216957142`
- **Componente:** `MetaPixel.astro`
- **Tracking SPA:** ✅ Automático

### 5. Vercel Analytics + Speed Insights
- **Configuração:** `astro.config.mjs` + `VercelAnalytics.astro`
- **Status:** ✅ Ativo
- **Acesso:** Painel Vercel → seu projeto → Analytics/Speed Insights

## 📊 Vercel Analytics - Como ver os dados

### Onde ver:
1. Acesse: https://vercel.com/dashboard
2. Selecione seu projeto `joelburigo`
3. Abas disponíveis:
   - **Analytics:** Pageviews, visitantes únicos, top pages
   - **Speed Insights:** Core Web Vitals (LCP, FID, CLS)

### Por que pode não aparecer ainda:
- **Precisa estar em produção** (deploy feito)
- **Dados demoram ~24h** para aparecer após primeiro deploy
- **Domínio customizado precisa estar configurado**

### Verificar se está funcionando:
1. Faça deploy: `vercel --prod`
2. Acesse seu site em produção
3. Abra DevTools → Console
4. Procure por: `[Vercel Analytics]` ou `[Vercel Speed Insights]`

## 🔧 Troubleshooting Vercel

### Analytics não aparece no painel:
```bash
# 1. Verifique se está deployado
vercel ls

# 2. Force novo deploy
vercel --prod --force

# 3. Aguarde 10-15 minutos
```

### Speed Insights não funciona:
- Precisa ter tráfego real
- Só funciona em produção (não em preview)
- Vercel coleta dados de forma amostral

## 🎯 Estratégia Atual: Hybrid

**Hardcoded (Direto no código):**
- ✅ GA4 - tracking principal
- ✅ Google Ads - conversões
- ✅ Meta Pixel - ads
- ✅ Vercel - performance

**GTM (Para testes/tags extras):**
- Você pode adicionar tags extras sem redeploy
- Útil para A/B tests, eventos customizados
- Opcional - tudo já funciona sem ele

## 📝 Comandos úteis

```bash
# Build local para testar
npm run build

# Deploy para produção
vercel --prod

# Preview (teste antes de prod)
vercel

# Ver logs do Vercel
vercel logs
```

## ✅ Checklist de Verificação

- [x] GTM instalado
- [x] GA4 hardcoded com SPA tracking
- [x] Google Ads instalado
- [x] Meta Pixel hardcoded com SPA tracking
- [x] Vercel Analytics configurado no config
- [x] Vercel Speed Insights configurado no config
- [x] Build passando sem erros
- [ ] Deploy em produção feito
- [ ] Aguardar 24h para dados no painel Vercel

## 🔗 Links úteis

- [Painel Vercel](https://vercel.com/dashboard)
- [GA4 Realtime](https://analytics.google.com/analytics/web/#/realtime)
- [Google Ads](https://ads.google.com/)
- [Meta Events Manager](https://business.facebook.com/events_manager2)
- [GTM](https://tagmanager.google.com/)
