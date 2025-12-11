# Marketing Setup

## Implementado

- Google Tag Manager (via Partytown Web Worker)
- dataLayer para eventos
- Cookie Consent (LGPD/GDPR)
- Vercel Analytics
- `/api/track` para Conversions API (opcional)

---

## Configuração

### 1. Variáveis de Ambiente

```bash
cp .env.example .env
```

**Mínimo obrigatório:**
```env
PUBLIC_GTM_ID=GTM-XXXXXXX
PUBLIC_SITE_URL=https://joelburigo.com.br
```

**Opcional (para `/api/track`):**
```env
GA4_MEASUREMENT_ID=G-XXXXXXXXXX
GA4_API_SECRET=your_secret
META_PIXEL_ID=XXXXXXXXXXXXXXX
META_ACCESS_TOKEN=your_token
```

### 2. Partytown

Já configurado em `astro.config.mjs`:

```javascript
partytown({
  config: {
    forward: ['dataLayer.push', 'fbq'],
  },
}),
```

**Debug:** Use `?partytown=off` na URL para desabilitar temporariamente.

### 3. Google Tag Manager

**Consent Mode v2** - Tag de inicialização (trigger: Consent Initialization):

```javascript
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  
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
  
  gtag('set', 'ads_data_redaction', true);
  gtag('set', 'url_passthrough', true);
</script>
```

**Trigger para consent:**
- Event name: `cookie_consent_update`
- Condition: `consent_state` equals `granted`

**Google Analytics 4:**
- Type: GA4 Configuration
- Measurement ID: Seu ID (configure no GTM)
- Trigger: All Pages
- Consent: `analytics_storage`

**Meta Pixel:**
- Type: Custom HTML
- Código do Pixel
- Trigger: All Pages
- Consent: `ad_storage`, `ad_user_data`, `ad_personalization`

**Google Ads:**
- Type: Google Ads Conversion Tracking
- Conversion ID: Seu ID (configure no GTM)
- Triggers: `generate_lead`, `purchase`, etc
- Consent: `ad_storage`, `ad_user_data`, `ad_personalization`

---

## Eventos Disponíveis

### Código TypeScript

```typescript
import { 
  trackEvent,
  trackGenerateLead,
  trackVSSInterest,
  trackServicesInterest,
  trackCTAClick 
} from '@/lib/analytics'

// Evento genérico
trackEvent('custom_event', {
  custom_param: 'value'
})

// Lead
trackGenerateLead({
  form_name: 'Contato',
  form_id: 'contact_form',
  value: 0
})

// Interesse em produto
trackVSSInterest()
trackServicesInterest('premium')

// CTA click
trackCTAClick('whatsapp_button', 'hero_section')
```

### Lista de Eventos

| Evento | Parâmetros | Quando |
|--------|-----------|---------|
| `vss_interest` | `product_name`, `value`, `currency` | Interesse VSS |
| `services_interest` | `service_package`, `value`, `currency` | Interesse serviços |
| `advisory_interest` | `advisory_format`, `value`, `currency` | Interesse consultoria |
| `diagnostico_start` | `tool_name`, `engagement_type` | Início diagnóstico |
| `diagnostico_complete` | `tool_name`, scores 6Ps | Fim diagnóstico |
| `generate_lead` | `form_name`, `form_id`, `value` | Submit lead |
| `form_submit` | `form_name`, `form_id` | Submit form |
| `cta_click` | `cta_name`, `cta_location` | Click CTA |
| `video_start` | `video_title` | Início vídeo |
| `video_complete` | `video_title` | Vídeo completo |

---

## Testes

### Local

```bash
npm run dev
# Console: window.dataLayer
```

### GTM Preview

```bash
# Adicione ?partytown=off
http://localhost:4321?partytown=off

# GTM → Preview → Cole URL acima
```

### Performance

```bash
# Com Partytown (default)
npm run dev

# Sem Partytown (comparar)
http://localhost:4321?partytown=off

# DevTools → Performance → Verificar Worker thread
```

### Server-side API

```bash
curl -X POST http://localhost:4321/api/track \
  -H "Content-Type: application/json" \
  -d '{"event": "test", "value": 10}'
```

### Produção

- Facebook Pixel Helper (extensão)
- GA4 Realtime reports
- GTM Tag Assistant

---

## Deploy

```bash
vercel --prod
```

**Variáveis Vercel:**
- `PUBLIC_GTM_ID`
- `PUBLIC_SITE_URL`
- Opcionais: `GA4_MEASUREMENT_ID`, `GA4_API_SECRET`, `META_PIXEL_ID`, `META_ACCESS_TOKEN`

---

## Troubleshooting

**GTM não dispara:**
- Verifique `PUBLIC_GTM_ID` no `.env`
- Confirme `dataLayer.push` no `forward` config
- Teste com `?partytown=off`

**Meta Pixel não funciona:**
- Adicione `'fbq'` ao array `forward`
- Configure via GTM Custom HTML
- Verifique Consent Mode

**Performance não melhorou:**
- Confirme Partytown ativo (DevTools)
- Limpe cache
- Use Lighthouse

---

## Referências

- [Astro Partytown](https://docs.astro.build/en/guides/integrations-guide/partytown/)
- [GTM Consent Mode v2](https://developers.google.com/tag-platform/security/guides/consent)
- [GA4 Events](https://developers.google.com/analytics/devguides/collection/ga4/reference/events)
- [Meta Pixel Events](https://developers.facebook.com/docs/meta-pixel/reference)
