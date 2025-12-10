# Joel Burigo - Site Setup Guide

## 🚀 Deploy na Vercel

### 1. Conectar Repositório
1. Acesse [vercel.com](https://vercel.com)
2. Clique em "Add New Project"
3. Conecte seu repositório GitHub
4. Framework Preset: **Astro**
5. Build Command: `npm run build`
6. Output Directory: `dist`

### 2. Configurar Variáveis de Ambiente

Na Vercel, adicione as seguintes variáveis de ambiente:

```env
PUBLIC_GTM_ID=GTM-XXXXXXX
PUBLIC_GA4_ID=G-XXXXXXXXXX
PUBLIC_GOOGLE_ADS_ID=AW-XXXXXXXXXX
PUBLIC_META_PIXEL_ID=XXXXXXXXXXXXXXX
PUBLIC_SITE_URL=https://joelburigo.com.br
```

### 3. Domínio Personalizado
1. Em Settings → Domains
2. Adicione `joelburigo.com.br`
3. Configure DNS no seu provedor

---

## 📊 Google Tag Manager

### Setup Inicial
1. Acesse [tagmanager.google.com](https://tagmanager.google.com)
2. Crie uma conta "Joel Burigo"
3. Copie o ID do container (GTM-XXXXXXX)
4. Adicione na variável `PUBLIC_GTM_ID`

### Tags Recomendadas

#### Google Analytics 4
- **Tipo**: Google Analytics: GA4 Configuration
- **Tag ID**: Use `PUBLIC_GA4_ID`
- **Trigger**: All Pages

#### Google Ads Conversion
- **Tipo**: Google Ads Conversion Tracking
- **Conversion ID**: Use `PUBLIC_GOOGLE_ADS_ID`
- **Triggers**: 
  - Formulário enviado
  - Botão "Quero Escalar Vendas" clicado
  - Download de diagnóstico

#### Meta Pixel Events
Eventos customizados já configurados via código:
- PageView (automático)
- Lead (formulários)
- CompleteRegistration (VSS)
- ViewContent (páginas de serviço)

---

## 🎯 Eventos Personalizados (GTM)

### Lead - Formulário de Contato
```javascript
window.dataLayer = window.dataLayer || [];
window.dataLayer.push({
  event: 'generate_lead',
  form_name: 'contato',
  page_location: window.location.href
});
```

### Início de Checkout - VSS
```javascript
window.dataLayer.push({
  event: 'begin_checkout',
  item_name: 'Vendas Sem Segredos',
  value: 997
});
```

### Download - Diagnóstico 6Ps
```javascript
window.dataLayer.push({
  event: 'download',
  file_name: 'diagnostico-6ps',
  page_location: window.location.href
});
```

---

## 🔍 SEO Checklist

### ✅ Configurado
- [x] Sitemap XML automático
- [x] robots.txt
- [x] Meta tags (Open Graph, Twitter)
- [x] Canonical URLs
- [x] Schema.org (JSON-LD)
- [x] Alt text em imagens
- [x] Títulos H1-H6 semânticos
- [x] URLs amigáveis

### 📝 Para Fazer
- [ ] Criar conta Google Search Console
- [ ] Verificar propriedade do site
- [ ] Submeter sitemap
- [ ] Adicionar imagens OG personalizadas
- [ ] Criar blog (futuro)
- [ ] Implementar breadcrumbs

---

## 📈 Analytics Setup

### Google Analytics 4
1. Acesse [analytics.google.com](https://analytics.google.com)
2. Crie propriedade "Joel Burigo"
3. Copie Measurement ID (G-XXXXXXXXXX)
4. Configure no GTM

### Conversões Importantes
- **Lead**: Formulário de contato enviado
- **VSS Interesse**: Clique em "Quero Escalar Vendas"
- **Diagnóstico**: Download do diagnóstico 6Ps
- **Services**: Clique em "Solicitar Diagnóstico"
- **Advisory**: Clique em agendar sessão

---

## 🎨 Meta Pixel (Facebook/Instagram)

### Setup
1. Acesse [business.facebook.com/events_manager](https://business.facebook.com/events_manager)
2. Crie Pixel "Joel Burigo"
3. Copie Pixel ID
4. Adicione em `PUBLIC_META_PIXEL_ID`

### Eventos Customizados
```javascript
// Lead
fbq('track', 'Lead', {
  content_name: 'Contato',
  value: 0
});

// CompleteRegistration
fbq('track', 'CompleteRegistration', {
  content_name: 'VSS',
  value: 997
});

// ViewContent
fbq('track', 'ViewContent', {
  content_name: 'Services',
  content_type: 'product'
});
```

---

## 🚨 Google Ads

### Configuração
1. Crie conta Google Ads
2. Configure Conversion Tracking
3. Copie Conversion ID (AW-XXXXXXXXXX)
4. Configure tags no GTM

### Conversões Recomendadas
- **Lead - Contato**: Formulário enviado
- **VSS - Interesse**: Clique no CTA
- **Services - Discovery**: Solicitação de diagnóstico
- **Advisory - Agendamento**: Click para agendar

---

## ⚡ Performance

### Configurações Vercel (já ativo)
- ✅ Edge Network
- ✅ Web Analytics
- ✅ Speed Insights
- ✅ Compression automática
- ✅ Image Optimization

### Recomendações
- Use imagens WebP/AVIF
- Lazy loading de imagens
- Minimize CSS/JS (automático)
- CDN global (Vercel Edge)

---

## 📱 Pixels de Remarketing

### Google Ads Remarketing
Automaticamente ativo via Google Ads tag

### Meta Remarketing
Automaticamente ativo via Meta Pixel

### Públicos Recomendados
1. Visitantes do site (30 dias)
2. Visitantes de páginas específicas (VSS, Services)
3. Abandonos de formulário
4. Visitantes recorrentes

---

## 🔒 Segurança

### Headers (já configurado)
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin

### HTTPS
Automático na Vercel com certificado SSL

---

## 📞 Integrações Futuras

### CRM
- [ ] Integrar formulários com CRM (RD Station, HubSpot, etc)
- [ ] Webhook para novos leads
- [ ] Automação de follow-up

### Email Marketing
- [ ] Conectar com plataforma de email
- [ ] Automação de nutrição de leads
- [ ] Sequências de boas-vindas

### Chat
- [ ] Considerar WhatsApp Business API
- [ ] Chatbot para qualificação inicial

---

## 🎯 Próximos Passos

1. **Deploy**: Fazer deploy na Vercel
2. **GTM**: Configurar Google Tag Manager
3. **Analytics**: Conectar GA4 e Meta Pixel
4. **Ads**: Configurar Google Ads e Meta Ads
5. **Search Console**: Verificar site
6. **Monitoramento**: Configurar alertas de conversão

---

## 📊 KPIs para Monitorar

### Tráfego
- Visitantes únicos/mês
- Pageviews
- Taxa de rejeição
- Tempo médio no site

### Conversões
- Leads gerados/mês
- Taxa de conversão (visitante → lead)
- Custo por lead (CPL)
- Origem dos leads

### Engajamento
- Páginas mais visitadas
- Eventos mais frequentes
- Sessões por usuário
- Profundidade de scroll

---

Para dúvidas: consulte a documentação oficial
- [Astro](https://astro.build)
- [Vercel](https://vercel.com/docs)
- [GTM](https://tagmanager.google.com)
