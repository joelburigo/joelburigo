# 🚀 Joel Burigo - Marketing Otimizado (GTM First)

## 📋 Filosofia: GTM Centralizado + Partytown

Este projeto adota uma abordagem **GTM First + Astro Best Practices**, onde:
- ✅ Todo tracking passa pelo **dataLayer**
- ✅ GTM gerencia todos os pixels e tags (GA4, Meta Pixel, Google Ads)
- ✅ **Partytown** move scripts para Web Worker (performance otimizada)
- ✅ Consent Mode v2 configurado no GTM
- ✅ Zero dependência de scripts externos no código
- ✅ Performance otimizada e manutenção simplificada

### 🤔 Por que GTM e não pixels diretos?

Você pode instalar pixels diretamente no site (hard-coded):
```astro
<!-- Opção 1: GA4 direto -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXX"></script>

<!-- Opção 2: Meta Pixel direto -->
<script>
  !function(f,b,e,v,n,t,s){...}
  fbq('init', 'PIXEL_ID');
</script>
```

**Mas GTM é superior:**

| Critério | Pixels Diretos | GTM (nossa escolha) |
|----------|----------------|---------------------|
| **Mudanças** | Precisa deploy do site | Mudanças instantâneas no GTM |
| **Testes** | Deploy → Testar ao vivo | GTM Preview antes de publicar |
| **Múltiplos pixels** | Código espalhado no site | Tudo centralizado no GTM |
| **Dependência dev** | Alta - toda mudança = código | Baixa - marketer muda sozinho |
| **Versioning** | Git (site inteiro) | GTM versiona tags separado |
| **Rollback** | Reverter deploy | 1 clique no GTM |
| **Debug** | Console.log manual | GTM Preview + Tag Assistant |
| **Consent Mode v2** | Implementar no código | Configurar no GTM |
| **Enhanced Conversions** | Código extra no site | Template no GTM |
| **Performance** | Múltiplos scripts bloqueiam | GTM + Partytown = Web Worker |
| **Escala** | Adicionar TikTok = código | Adicionar TikTok = tag GTM |

### ✅ Vantagens GTM para Joel Burigo:

1. **Agilidade de Marketing** - Testar campanhas sem esperar dev
2. **Manutenção Zero** - Código do site não muda, só GTM
3. **Redesign-proof** - Trocar Astro por Next.js? GTM continua igual
4. **Compliance LGPD** - Consent Mode no GTM, não no código
5. **Performance** - Partytown move tudo para Web Worker
6. **Futuro-proof** - Adicionar LinkedIn Pixel = 5min no GTM

### 📊 Casos onde pixels diretos PODEM fazer sentido:

❌ **Site estático minimalista** - 1 página, só GA4, nunca muda
❌ **Performance extrema** - Cada KB conta (raro, GTM é leve)
❌ **Zero marketing** - Não vai rodar ads, só analytics básico

**Para Joel Burigo:** Você vai rodar Meta Ads, Google Ads, testar campanhas, adicionar remarketing → **GTM é obrigatório**

---

## 🚀 Nossa Stack: GTM + Partytown + dataLayer

```
Browser (Main Thread):
├─ Astro SSR (rápido)
├─ dataLayer.push() (instantâneo)
└─ Partytown Proxy (intercepta)

Web Worker (Thread separado):
├─ GTM Container
├─ GA4 Tag
├─ Meta Pixel Tag
├─ Google Ads Tag
└─ Consent Mode v2
```

**Resultado:** Main thread livre → LCP < 2.5s → Core Web Vitals ótimos

---

## 📋 Filosofia: GTM Centralizado + Partytown (continuação)

### Vantagens dessa abordagem:
1. **Performance excepcional** - Partytown move GTM para Web Worker, liberando main thread
2. **Menor bundle size** - Sem scripts de tracking no build
3. **Manutenção centralizada** - Mudanças via GTM sem deploy
4. **Debugging facilitado** - GTM Preview Mode
5. **Compliance automático** - Consent Mode no GTM
6. **Versioning** - Histórico de mudanças no GTM
7. **Core Web Vitals** - Não bloqueia renderização
8. **Escalabilidade** - Adicionar pixels = 5min no GTM vs horas de dev
9. **Independência** - Marketer não depende de dev para testes
10. **Segurança** - Rollback instantâneo se algo quebrar

### 🎯 Decisão de Arquitetura: Por que essa stack?

**Contexto:** Site de consultoria que vai rodar Meta Ads, Google Ads, testar campanhas, remarketing, etc.

**Opções avaliadas:**
1. ❌ **Pixels diretos hard-coded** - Rígido, depende de dev, sem teste
2. ❌ **ENV vars para cada pixel** - Configuração espalhada, ainda precisa deploy
3. ✅ **GTM + Partytown + dataLayer** - Flexível, performance, independência

**Por que GTM First venceu:**
- Campaigns mudam semanalmente → GTM permite testes sem deploy
- LGPD exige Consent Mode v2 → GTM tem template pronto
- Core Web Vitals impacta SEO → Partytown otimiza automaticamente
- Adicionar TikTok Pixel no futuro → 5min no GTM vs PR no código
- Redesign do site → GTM sobrevive intacto

**Fontes da decisão:**
- [Analytics Mania: GTM Best Practices](https://www.analyticsmania.com/post/google-tag-manager-best-practices/)
- [MeasureSchool: Meta Pixel vs GA4](https://measureschool.com/meta-pixel-vs-google-analytics-4/)
- [Astro Docs: Partytown Integration](https://docs.astro.build/en/guides/integrations-guide/partytown/)

### O que é Partytown?
[Partytown](https://partytown.builder.io/) é uma biblioteca que move scripts de terceiros para um Web Worker, mantendo a thread principal livre para o seu código. Isso melhora significativamente as métricas de performance (LCP, FID, TBT).

---

## ✅ O que está implementado

### 📊 Tracking & Analytics
- ✅ **Google Tag Manager** - Container base (único script no site)
- ✅ **Partytown** - GTM roda em Web Worker (performance otimizada)
- ✅ **dataLayer** - Todos eventos vão para o dataLayer
- ✅ **Cookie Consent** - Banner que atualiza consent via dataLayer
- ✅ **Vercel Analytics** - Analytics nativo Vercel
- ✅ **Vercel Speed Insights** - Core Web Vitals
- ✅ **Server-side API** - `/api/track` para Conversions API

### 🎯 SEO & Marketing
- ✅ **Sitemap XML** - Gerado automaticamente
- ✅ **robots.txt** - Otimizado
- ✅ **Schema.org/JSON-LD** - Dados estruturados
- ✅ **Open Graph** - Preview em redes sociais
- ✅ **Twitter Cards** - Preview no Twitter
- ✅ **Meta tags** - Title, description, keywords
- ✅ **Canonical URLs** - Evita conteúdo duplicado

### ⚡ Performance & Vercel
- ✅ **Vercel Adapter** - Deploy otimizado
- ✅ **Vercel Web Analytics** - Analytics nativo
- ✅ **Vercel Speed Insights** - Métricas Core Web Vitals
- ✅ **Image Optimization** - Automático
- ✅ **Hybrid Rendering** - SSR + Static

### 🔐 Privacidade & Compliance
- ✅ **Cookie Consent Banner** - LGPD/GDPR compliant
- ✅ **Consent Management** - LocalStorage persistence
- ✅ **Google Consent Mode v2** - Configurado no GTM
- ✅ **Data Minimization** - Apenas essencial até consentimento

---

## ✅ Status das Configurações

### 🎯 Configuração Mínima (PRONTO)
| Item | Status | Arquivo |
|------|--------|---------|
| GTM Container | ✅ Configurado | `GoogleTagManager.astro` |
| Partytown Web Worker | ✅ Ativo | `astro.config.mjs` |
| dataLayer | ✅ Funcionando | `analytics.ts` |
| Cookie Consent | ✅ LGPD compliant | `CookieConsent.astro` |
| Variáveis de Ambiente | ✅ Type-safe | `astro.config.mjs` |

**Com apenas `PUBLIC_GTM_ID`, você já pode:**
- ✅ Rastrear eventos via dataLayer
- ✅ Configurar GA4, Meta Pixel, Google Ads no GTM
- ✅ Usar Consent Mode v2
- ✅ Ver todos os eventos no GTM Preview

### 🚀 APIs Server-side (OPCIONAL)

As APIs server-side melhoram a precisão de tracking, especialmente com:
- 🛡️ **Ad blockers** - Bypass de bloqueadores
- 🔐 **iOS 14+** - Contornar limitações do ATT
- 📊 **Deduplicação** - Eventos server + client são combinados
- 🎯 **Conversões offline** - Integração com CRM

| API | Variáveis (server-only) | Status | Onde configurar |
|-----|----------|--------|---------|
| GA4 Measurement Protocol | `GA4_MEASUREMENT_ID` + `GA4_API_SECRET` | ⚙️ Opcional | `/api/track.ts` |
| Meta Conversions API | `META_PIXEL_ID` + `META_ACCESS_TOKEN` | ⚙️ Opcional | `/api/track.ts` |
| Google Ads (via GTM) | Nenhuma | ✅ No GTM | GTM Tag |

**Endpoint disponível:** `POST /api/track`

**🎯 Importante:** 
- IDs como `G-XXXXXXXXXX`, `PIXEL-ID`, `AW-XXXXXXXXXX` são configurados **NO GTM**, não no .env
- Server-side APIs só precisam dos **secrets** (server-only) e IDs (também server-only)
- Nenhum ID de tracking vai para o client-side (segurança + GTM First)

**Como obter os secrets:**
1. **GA4 API Secret:** GA4 Admin → Data Streams → Measurement Protocol API secrets
2. **Meta Access Token:** Meta Events Manager → Conversions API → Generate Access Token

### 🧪 Como Testar se Está Tudo OK

**1. Teste Local (GTM + dataLayer):**
```bash
npm run dev
# Abra http://localhost:4321
# Console: window.dataLayer
# Deve mostrar array com eventos
```

**2. Teste GTM Preview:**
```bash
# Adicione ?partytown=off para debugar
http://localhost:4321?partytown=off

# No GTM:
# 1. Clique em "Preview"
# 2. Digite a URL acima
# 3. Veja eventos disparando
```

**3. Teste Server-side API (se configurado):**
```bash
curl -X POST http://localhost:4321/api/track \
  -H "Content-Type: application/json" \
  -d '{
    "event": "test_event",
    "value": 10,
    "currency": "BRL"
  }'
```

**4. Verificar em Produção:**
- Facebook Pixel Helper → Ver eventos
- GA4 Realtime → Ver usuários ativos
- GTM Tag Assistant → Verificar tags disparando

---

## 📝 Configuração do Google Tag Manager

### 1. Variáveis de Ambiente

As variáveis já estão configuradas no `astro.config.mjs` com type-safety:

```javascript
env: {
  schema: {
    // GTM FIRST: Site só precisa do GTM ID
    PUBLIC_GTM_ID: envField.string({ context: 'client', access: 'public' }),
    PUBLIC_SITE_URL: envField.string({ context: 'client', access: 'public' }),
    
    // Server-side APIs (OPCIONAL - apenas para /api/track)
    GA4_MEASUREMENT_ID: envField.string({ context: 'server', access: 'secret' }),
    GA4_API_SECRET: envField.string({ context: 'server', access: 'secret' }),
    META_PIXEL_ID: envField.string({ context: 'server', access: 'secret' }),
    META_ACCESS_TOKEN: envField.string({ context: 'server', access: 'secret' }),
  }
}
```

**Copie o `.env.example` e configure:**

```bash
cp .env.example .env
```

**✅ Configuração Mínima (OBRIGATÓRIA):**
```env
# O site SÓ precisa destes dois:
PUBLIC_GTM_ID=GTM-XXXXXXX
PUBLIC_SITE_URL=https://joelburigo.com.br
```

**🚀 Server-side APIs (OPCIONAL):**
```env
# Apenas se quiser usar /api/track para bypass de ad blockers
GA4_MEASUREMENT_ID=G-XXXXXXXXXX
GA4_API_SECRET=your_secret_here

META_PIXEL_ID=XXXXXXXXXXXXXXX
META_ACCESS_TOKEN=your_token_here
```

**🎯 Onde configurar GA4, Meta Pixel, Google Ads:**
- ❌ **NÃO no .env** (filosofia GTM First)
- ✅ **NO GOOGLE TAG MANAGER** (seção abaixo)

**Importante:**
- **GTM gerencia tudo** - GA4 ID, Meta Pixel ID, Google Ads ID são configurados NO GTM
- **Server-side é opcional** - Melhora precisão mas GTM já funciona perfeitamente sozinho
- **Secrets são server-only** - Nunca vão para o client-side (segurança)

### 2. Partytown Configuration

O Partytown já está configurado no `astro.config.mjs`:

```javascript
partytown({
  config: {
    forward: ['dataLayer.push', 'fbq'], // Forward events to main thread
  },
}),
```

**Como funciona:**
- GTM é carregado em um Web Worker separado
- `dataLayer.push` é interceptado e funciona normalmente
- Meta Pixel (`fbq`) também é configurado para funcionar via Partytown
- Main thread fica livre para interações do usuário

**Importante:** Para debugar, use `?partytown=off` na URL (ex: `localhost:4321?partytown=off`)

### 3. Estrutura do GTM

#### A. Consent Mode v2 (Tag de Inicialização)

Crie uma tag **Consent Initialization** que dispara em **Consent Initialization - All Pages**:

```javascript
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  
  // Default consent state (denied until user accepts)
  gtag('consent', 'default', {
    'analytics_storage': 'denied',
    'ad_storage': 'denied',
    'ad_user_data': 'denied',
    'ad_personalization': 'denied',
    'functionality_storage': 'granted',
    'personalization_storage': 'denied',
    'security_storage': 'granted',
    'wait_for_update': 500
  });
  
  // Additional consent settings for Brazil/EEA
  gtag('set', 'ads_data_redaction', true);
  gtag('set', 'url_passthrough', true);
</script>
```

#### B. Trigger de Consent Update

Crie um **Custom Event Trigger**:
- Event name: `cookie_consent_update`
- Condition: `consent_state` equals `granted`

#### C. Google Analytics 4

**Tag:** GA4 Configuration
- **Type:** Google Analytics: GA4 Configuration
- **Measurement ID:** `G-XXXXXXXXXX` (configure no GTM)
- **Trigger:** All Pages (consent-aware)
- **Consent Settings:**
  - Require additional consent: `analytics_storage`

#### D. Meta Pixel

**Tag:** Meta Pixel Base Code
- **Type:** Custom HTML
- **HTML:**
```html
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');

fbq('init', 'YOUR_PIXEL_ID');
fbq('track', 'PageView');
</script>
```
- **Trigger:** All Pages (consent-aware)
- **Consent Settings:**
  - Require additional consent: `ad_storage`, `ad_user_data`, `ad_personalization`

#### E. Google Ads Conversion

**Tag:** Google Ads Conversion Tracking
- **Type:** Google Ads Conversion Tracking
- **Conversion ID:** `AW-XXXXXXXXXX`
- **Triggers:** Custom events (ex: `generate_lead`, `purchase`)
- **Consent Settings:**
  - Require additional consent: `ad_storage`, `ad_user_data`, `ad_personalization`

### 3. Variáveis Úteis no GTM

Configure estas **User-Defined Variables**:

| Variável | Tipo | Configuração |
|----------|------|--------------|
| Consent State | Data Layer Variable | `consent_state` |
| Cookie Consent | 1st Party Cookie | `cookie_consent` |
| Event Name | Data Layer Variable | `event` |
| Page Location | Built-in | Page URL |
| Page Title | Built-in | Page Title |

### 4. Triggers Importantes

| Trigger | Tipo | Condição |
|---------|------|----------|
| All Pages | Page View | All Pages |
| Consent Granted | Custom Event | `cookie_consent_update` + `consent_state` = `granted` |
| Generate Lead | Custom Event | `event` = `generate_lead` |
| Begin Checkout | Custom Event | `event` = `begin_checkout` |
| Purchase | Custom Event | `event` = `purchase` |
| Form Submit | Custom Event | `event` = `form_submit` |

---

## 🧪 Como Testar

### 1. Testar Performance com Partytown

**Com Partytown (default):**
```
npm run dev
# Abra Chrome DevTools → Performance
# Grave e veja GTM rodando no Worker thread
```

**Sem Partytown (para comparar):**
```
http://localhost:4321?partytown=off
# GTM roda na main thread (mais lento)
```

**Métricas esperadas:**
- **TBT (Total Blocking Time):** Redução de 30-50%
- **FID (First Input Delay):** < 100ms
- **LCP (Largest Contentful Paint):** < 2.5s

### 2. GTM Preview Mode

**Importante:** GTM Preview pode não funcionar com Partytown ativo. Para debugar:

1. Adicione `?partytown=off` à URL
2. No GTM, clique em **Preview**
3. Digite a URL do site (com `?partytown=off`)
4. Navegue pelo site e veja os eventos
5. Verifique se consent é respeitado

### 3. dataLayer no Console

**Com Partytown ativo:**
```javascript
// dataLayer ainda funciona normalmente
console.table(dataLayer)

// Ver último evento
dataLayer[dataLayer.length - 1]

// Simular evento (funciona via proxy)
dataLayer.push({
  event: 'test_event',
  test_param: 'test_value'
})
```

**Nota:** O Partytown cria um proxy transparente. O código funciona igual, mas roda no Worker.

### 4. Verificar Partytown no DevTools

1. Abra DevTools → **Network**
2. Procure por `partytown` - verá o service worker
3. No **Console**, digite:
```javascript
// Verificar se Partytown está ativo
navigator.serviceWorker.controller ? 'Partytown ativo' : 'Partytown off'
```

### 5. Facebook Pixel Helper

1. Instale a extensão [Facebook Pixel Helper](https://chrome.google.com/webstore/detail/facebook-pixel-helper/)
2. Navegue pelo site
3. Verifique eventos disparando

### 6. Google Tag Assistant

**Para usar com Partytown:**
1. Adicione `?partytown=off` à URL temporariamente
2. Instale [Google Tag Assistant](https://tagassistant.google.com/)
3. Conecte ao site
4. Verifique tags disparando corretamente

---

## ⚡ Performance: Comparação

### Sem Partytown (abordagem tradicional):
```
Main Thread:
████████████████████████░░░░  GTM loading (blocking)
                        ████  User interaction delayed
```

### Com Partytown (nossa implementação):
```
Main Thread:
██░░░░░░░░░░░░░░░░░░░░░░░░  Instant user interaction
Web Worker:
  ████████████████████████  GTM loading (non-blocking)
```

**Resultado:** 
- ✅ Melhor experiência do usuário
- ✅ Core Web Vitals otimizados
- ✅ SEO mantido (bots veem o conteúdo rápido)

---

## 📊 Eventos Personalizados

### Eventos já configurados no código:

| Evento | Parâmetros | Quando dispara |
|--------|-----------|----------------|
| `vss_interest` | `product_name`, `value`, `currency` | Interesse no programa VSS |
| `services_interest` | `service_package`, `value`, `currency` | Interesse em serviços |
| `advisory_interest` | `advisory_format`, `value`, `currency` | Interesse em consultoria |
| `diagnostico_start` | `tool_name`, `engagement_type` | Início do diagnóstico |
| `diagnostico_complete` | `tool_name`, scores dos 6Ps | Conclusão do diagnóstico |
| `generate_lead` | `form_name`, `form_id`, `value` | Submit de formulário lead |
| `form_submit` | `form_name`, `form_id` | Submit de qualquer form |
| `cta_click` | `cta_name`, `cta_location` | Clique em CTA |
| `video_start` | `video_title` | Início de vídeo |
| `video_complete` | `video_title` | Vídeo assistido completo |

### Como usar no código:

```typescript
import { 
  trackEvent,
  trackGenerateLead,
  trackVSSInterest,
  trackServicesInterest,
  trackCTAClick 
} from '@/lib/analytics'

// Evento simples
trackEvent('custom_event', {
  custom_param: 'value'
})

// Lead generation
trackGenerateLead({
  form_name: 'Contato',
  form_id: 'contact_form',
  value: 0
})

// Interesse em produto
trackVSSInterest()

// CTA click
trackCTAClick('whatsapp_button', 'hero_section')
```

---

## 🚀 Deploy

### Vercel

```bash
# Deploy automático via GitHub
git push origin main

# Ou via CLI
vercel --prod
```

### Variáveis de Ambiente na Vercel

No dashboard da Vercel, configure:

1. `PUBLIC_GTM_ID` - ID do Google Tag Manager
2. `PUBLIC_SITE_URL` - URL do site em produção

---

## 📈 Próximos Passos

### Configurações Adicionais no GTM:

1. **Enhanced Conversions** - Adicionar dados hasheados de email/telefone
2. **Remarketing Lists** - Criar audiences personalizadas
3. **Cross-domain Tracking** - Se tiver múltiplos domínios
4. **Server-side Tagging** - Para tracking mais preciso
5. **BigQuery Export** - Para análises avançadas (GA4)

### Server-side API (`/api/track`)

Configure integrações server-side:
- Meta Conversions API
- Google Ads Enhanced Conversions
- GA4 Measurement Protocol

```typescript
// Exemplo de uso
trackEvent('purchase', {
  transaction_id: '12345',
  value: 997,
  currency: 'BRL'
}, { sendToServer: true })
```

### Melhorias de Performance

**Partytown Debug Mode (desenvolvimento):**
```javascript
// astro.config.mjs
partytown({
  config: {
    debug: true, // Ativa logs detalhados
    forward: ['dataLayer.push', 'fbq'],
  },
}),
```

**Troubleshooting Partytown:**
- Se um script não funcionar, adicione a função ao `forward` array
- Use `?partytown=off` para isolar problemas
- Verifique o console para erros de CORS

---

## 🔧 Troubleshooting

### Problema: GTM não dispara eventos

**Solução:**
1. Verifique se `PUBLIC_GTM_ID` está definido no `.env`
2. Confirme que `dataLayer.push` está no `forward` config
3. Teste com `?partytown=off` para isolar

### Problema: Meta Pixel não funciona

**Solução:**
1. Adicione `'fbq'` ao array `forward` do Partytown
2. Configure o Pixel via GTM (não direto no código)
3. Verifique consent mode está correto

### Problema: Performance não melhorou

**Solução:**
1. Confirme Partytown está ativo (veja DevTools)
2. Limpe cache do navegador
3. Teste em modo anônimo
4. Use Lighthouse para métricas objetivas

---

## 📚 Referências

### Documentação Oficial:
- [Astro Scripts Guide](https://docs.astro.build/en/guides/client-side-scripts/)
- [Astro Partytown Integration](https://docs.astro.build/en/guides/integrations-guide/partytown/)
- [Partytown Official Docs](https://partytown.builder.io/)
- [Google Tag Manager](https://tagmanager.google.com)
- [Google Consent Mode v2](https://developers.google.com/tag-platform/security/guides/consent)
- [GA4 Events](https://developers.google.com/analytics/devguides/collection/ga4/reference/events)
- [Meta Pixel Events](https://developers.facebook.com/docs/meta-pixel/reference)
- [GTM Best Practices](https://developers.google.com/tag-platform/tag-manager/web/best-practices)

### Artigos Úteis:
- [Implementing GTM with Partytown in Astro](https://medium.com/@tagperfect/implementing-google-tag-manager-with-partytown-js-in-astro-my-modest-experience-983388907b35)
- [Optimize Google Analytics using Partytown](https://ricostacruz.com/posts/google-analytics-in-astro)

---

## 🔧 Suporte

Para dúvidas ou problemas:
1. Verifique o GTM Preview Mode
2. Consulte o console do navegador (erros de dataLayer)
3. Use as extensões de debug (Pixel Helper, Tag Assistant)
4. Revise a documentação dos eventos em `/src/lib/analytics.ts`
