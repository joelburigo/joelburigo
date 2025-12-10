# 📚 Guia de Uso - Analytics Modernos

## 🎯 Eventos Recomendados por Página

### Home Page
```typescript
import { trackPageView, trackCTAClick } from '@/lib/analytics'

// Ao carregar a página
trackPageView({ page_type: 'home' })

// Ao clicar no CTA principal
trackCTAClick('Quero Escalar Vendas', 'hero_section')
```

### VSS Page
```typescript
import { trackVSSInterest, trackBeginCheckout, trackCTAClick } from '@/lib/analytics'

// Quando usuário demonstra interesse
trackVSSInterest()

// Ou use o evento GA4 nativo
trackBeginCheckout({
  currency: 'BRL',
  value: 997,
  items: [{
    item_id: 'vss_programa_90_dias',
    item_name: 'Vendas Sem Segredos',
    price: 997,
    quantity: 1
  }]
})

// Ao clicar para comprar
trackCTAClick('Quero Entrar no VSS', 'vss_cta_bottom')
```

### Services Page
```typescript
import { trackServicesInterest, trackViewItem } from '@/lib/analytics'

// Ao visualizar um pacote específico
trackServicesInterest('aceleracao') // fundacao | aceleracao | scaleup

// Ou use o evento GA4 nativo
trackViewItem({
  item_id: 'services_aceleracao',
  item_name: 'Implementation Services - Aceleração',
  value: 6000,
  item_category: 'services'
})
```

### Advisory Page
```typescript
import { trackAdvisoryInterest } from '@/lib/analytics'

// Ao clicar em um formato específico
trackAdvisoryInterest('sprint') // avulso | sprint | conselho
```

### Diagnóstico Page
```typescript
import { 
  trackDiagnosticoStart, 
  trackDiagnosticoComplete,
  trackGenerateLead 
} from '@/lib/analytics'

// Quando usuário inicia o diagnóstico
trackDiagnosticoStart()

// Quando completa o diagnóstico
const scores = {
  posicionamento: 3,
  publico: 2,
  produto: 4,
  programas: 1,
  processos: 2,
  pessoas: 1
}
trackDiagnosticoComplete(scores)

// Lead gerado
trackGenerateLead({
  form_name: 'Diagnóstico 6Ps',
  form_id: 'diagnostico_6ps',
  value: 0
})
```

### Formulário de Contato
```typescript
import { trackFormSubmit, trackGenerateLead } from '@/lib/analytics'

// Ao submeter o formulário
async function handleSubmit(e: Event) {
  e.preventDefault()
  
  const formData = new FormData(e.target as HTMLFormElement)
  
  // Track form submission
  trackFormSubmit({
    form_name: 'Contato',
    form_id: 'contact-form',
    form_destination: '/contato'
  })
  
  // Track lead generation
  trackGenerateLead({
    form_name: 'Contato',
    value: 0
  })
  
  // Submit form...
}
```

---

## 🎬 Eventos de Engajamento

### Scroll Tracking
```typescript
import { trackScroll } from '@/lib/analytics'

let scrollDepth = 0

window.addEventListener('scroll', () => {
  const currentScroll = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100)
  
  if (currentScroll > scrollDepth) {
    scrollDepth = currentScroll
    
    // Track at 25%, 50%, 75%, 100%
    if ([25, 50, 75, 100].includes(currentScroll)) {
      trackScroll(currentScroll)
    }
  }
})
```

### Video Interaction
```typescript
import { trackVideoPlay, trackVideoComplete } from '@/lib/analytics'

const video = document.querySelector('video')

video.addEventListener('play', () => {
  trackVideoPlay('VSS Overview Video')
})

video.addEventListener('ended', () => {
  trackVideoComplete('VSS Overview Video')
})
```

### Link Tracking
```typescript
import { trackOutboundLink } from '@/lib/analytics'

// Links externos (YouTube, LinkedIn, etc)
document.querySelectorAll('a[target="_blank"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const url = (e.currentTarget as HTMLAnchorElement).href
    const text = (e.currentTarget as HTMLAnchorElement).textContent
    trackOutboundLink(url, text)
  })
})
```

### Download Tracking
```typescript
import { trackFileDownload } from '@/lib/analytics'

// Ao baixar PDF, planilha, etc
function handleDownload(fileName: string) {
  trackFileDownload({
    file_name: fileName,
    file_extension: fileName.split('.').pop(),
    link_url: window.location.href
  })
}
```

---

## 💰 Eventos de Conversão (E-commerce)

### Início de Checkout
```typescript
import { trackBeginCheckout } from '@/lib/analytics'

trackBeginCheckout({
  currency: 'BRL',
  value: 997,
  items: [
    {
      item_id: 'vss_programa',
      item_name: 'VSS Programa 90 Dias',
      price: 997,
      quantity: 1
    }
  ]
})
```

### Compra Concluída
```typescript
import { trackPurchase } from '@/lib/analytics'

trackPurchase({
  transaction_id: 'TXN-' + Date.now(),
  value: 997,
  currency: 'BRL',
  items: [
    {
      item_id: 'vss_programa',
      item_name: 'VSS Programa 90 Dias',
      price: 997,
      quantity: 1
    }
  ],
  coupon: 'LANCAMENTO2025' // opcional
})
```

---

## 👤 User Properties

### Definir Propriedades do Usuário
```typescript
import { setUserProperties } from '@/lib/analytics'

// Após identificar usuário
setUserProperties({
  user_type: 'vss_student',
  subscription_level: 'premium',
  lifetime_value: 997,
  acquisition_channel: 'organic_search'
})
```

---

## 🍪 Gerenciamento de Consentimento

### Verificar Status de Consentimento
```typescript
const hasConsent = localStorage.getItem('cookie_consent') === 'accepted'

if (hasConsent) {
  // Executar tracking
}
```

### Atualizar Consentimento Manualmente
```typescript
import { updateConsent } from '@/lib/analytics'

// Usuário aceita cookies
updateConsent(true)

// Usuário rejeita cookies
updateConsent(false)
```

---

## 🎨 Exemplo Completo - Botão com Tracking

### Astro Component
```astro
---
// src/components/ui/CTAButton.astro
interface Props {
  text: string
  location: string
  href?: string
  event?: 'vss' | 'services' | 'advisory'
}

const { text, location, href = '/vss', event = 'vss' } = Astro.props
---

<a href={href} data-cta-button data-event={event} data-location={location}>
  <button class="btn-primary">{text}</button>
</a>

<script>
  import { trackCTAClick, trackVSSInterest } from '@/lib/analytics'
  
  document.querySelectorAll('[data-cta-button]').forEach(button => {
    button.addEventListener('click', (e) => {
      const target = e.currentTarget as HTMLElement
      const event = target.dataset.event
      const location = target.dataset.location
      const text = button.textContent?.trim()
      
      // Track CTA click
      trackCTAClick(text || 'CTA', location || 'unknown')
      
      // Track specific event
      if (event === 'vss') {
        trackVSSInterest()
      }
    })
  })
</script>
```

### Usage
```astro
<CTAButton 
  text="Quero Escalar Vendas" 
  location="hero_section"
  event="vss"
  href="/vss"
/>
```

---

## 🔥 Performance Tracking

### Automatic Page Load Metrics
```typescript
import { trackPerformance } from '@/lib/analytics'

// Call after page load
window.addEventListener('load', () => {
  setTimeout(() => {
    trackPerformance()
  }, 0)
})
```

---

## 🐛 Error Tracking

### Catch JavaScript Errors
```typescript
import { trackException } from '@/lib/analytics'

window.addEventListener('error', (event) => {
  trackException(event.error, true)
})

// Catch Promise rejections
window.addEventListener('unhandledrejection', (event) => {
  trackException(new Error(event.reason), true)
})
```

### Manual Error Tracking
```typescript
try {
  // Código que pode falhar
  riskyOperation()
} catch (error) {
  trackException(error as Error, false)
}
```

---

## 📊 Server-Side Tracking

O endpoint `/api/track` processa automaticamente eventos para:
- ✅ Google Analytics 4 Measurement Protocol
- ✅ Meta Conversions API (CAPI)
- ✅ Dados hasheados (SHA-256) para privacidade
- ✅ IP e User-Agent automáticos

Eventos enviados com `{ sendToServer: true }` são processados server-side para melhor accuracy e bypass de ad-blockers.

---

## 🎯 Checklist de Implementação

- [ ] Configurar variáveis de ambiente (.env)
- [ ] Obter GTM ID
- [ ] Obter Meta Pixel ID
- [ ] Obter GA4 Measurement Protocol Secret
- [ ] Obter Meta CAPI Access Token
- [ ] Adicionar tracking em formulários
- [ ] Adicionar tracking em CTAs principais
- [ ] Configurar scroll tracking
- [ ] Testar consent banner
- [ ] Verificar eventos no GTM Preview
- [ ] Validar eventos no Meta Events Manager
- [ ] Validar eventos no GA4 DebugView
- [ ] Deploy para produção

---

Criado com ❤️ usando **Astro**, **TypeScript** e as melhores práticas de 2024-2025.
