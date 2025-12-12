# Configuração GA4 no Google Tag Manager

## 🎯 Estratégia: GTM First

Este site usa **GTM First** - tudo é configurado no Google Tag Manager, não no código.

## 📋 Checklist de Configuração

### 1. Google Tag Manager (✅ FEITO)
- Container ID: `GTM-TWP4J6N8`
- Instalado no site via `GoogleTagManager.astro`
- DataLayer inicializado corretamente

### 2. Configurar GA4 no GTM

#### Passo 1: Criar Tag GA4
1. No GTM, vá em **Tags → New**
2. **Tag Configuration:**
   - Tag Type: `Google Analytics: GA4 Configuration`
   - Measurement ID: Cole seu ID GA4 (formato: `G-XXXXXXXXXX`)
   
3. **Triggering:**
   - Trigger: `Initialization - All Pages`
   
4. Salve como: `GA4 - Configuration`

#### Passo 2: Criar Tag de PageView
1. No GTM, vá em **Tags → New**
2. **Tag Configuration:**
   - Tag Type: `Google Analytics: GA4 Event`
   - Configuration Tag: Selecione `GA4 - Configuration`
   - Event Name: `page_view`
   
3. **Triggering:**
   - Trigger: `Custom Event`
   - Event name: `page_view`
   
4. Salve como: `GA4 - Page View`

#### Passo 3: Criar Trigger para SPA
1. No GTM, vá em **Triggers → New**
2. **Trigger Configuration:**
   - Trigger Type: `Custom Event`
   - Event name: `page_view`
   - This trigger fires on: `All Custom Events`
   
3. Salve como: `Custom Event - page_view`

### 3. Configurar Consent Mode V2 (IMPORTANTE)

#### No GTM:
1. Vá em **Admin → Container Settings**
2. Ative **Enable Consent Overview**

#### Criar Tag de Consent Padrão:
1. **Tags → New**
2. **Tag Configuration:**
   - Tag Type: `Consent Initialization - Google tags`
   - Consent Command: `default`
   - **Consent Settings:**
     ```
     ad_storage: denied
     ad_user_data: denied
     ad_personalization: denied
     analytics_storage: denied
     personalization_storage: denied
     ```
   - Regions: `All regions`
   
3. **Advanced Settings:**
   - Tag firing priority: `999` (maior prioridade)
   
4. **Triggering:** `Consent Initialization - All Pages`
5. Salve como: `Consent - Default State`

#### Criar Trigger para Update de Consent:
1. **Triggers → New**
2. **Trigger Type:** `Custom Event`
3. **Event name:** `cookie_consent_update`
4. Salve como: `Cookie Consent Update`

#### Criar Tag para Atualizar Consent:
1. **Tags → New**
2. **Tag Configuration:**
   - Tag Type: `Consent Initialization - Google tags`
   - Consent Command: `update`
   - **Built-In Variables necessárias:** Ative em `Variables`:
     - `Event`
     - Crie Custom Variables:
       - Name: `dlv - consent_state`
       - Variable Type: `Data Layer Variable`
       - Data Layer Variable Name: `consent_state`
   
3. **Consent Settings (condicionais):**
   ```
   Se dlv - consent_state = "granted":
     ad_storage: granted
     ad_user_data: granted
     ad_personalization: granted
     analytics_storage: granted
     personalization_storage: granted
   ```
   
4. **Triggering:** `Cookie Consent Update`
5. Salve como: `Consent - Update on Accept/Reject`

### 4. Configurar Meta Pixel no GTM (OPCIONAL)

O site já tem Meta Pixel hardcoded (`693646216957142`), mas você pode gerenciar via GTM:

1. **Tags → New**
2. **Tag Configuration:**
   - Tag Type: `Custom HTML`
   - HTML:
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
     fbq('init', '693646216957142');
     fbq('track', 'PageView');
     </script>
     ```
   
3. **Triggering:** `All Pages`
4. Salve como: `Meta Pixel - Base Code`

### 5. Testar Tudo

#### No GTM:
1. Clique em **Preview**
2. Digite a URL do seu site
3. Navegue pelo site
4. Verifique no painel:
   - ✅ Tags disparando corretamente
   - ✅ Eventos `page_view` em cada navegação
   - ✅ Consent sendo respeitado

#### No GA4:
1. Vá em **Reports → Realtime**
2. Navegue no seu site
3. Deve aparecer em tempo real

#### Meta Pixel:
1. Instale **Meta Pixel Helper** (extensão Chrome)
2. Abra seu site
3. Clique no ícone → deve mostrar pixel ativo

### 6. Publicar

Quando tudo estiver funcionando:
1. No GTM, clique em **Submit**
2. Dê um nome à versão (ex: "GA4 + Consent Mode V2 + Meta")
3. Publique

## 🔧 Troubleshooting

### GA4 não rastreia pageviews no SPA?
✅ **RESOLVIDO** - Site agora dispara `page_view` no `dataLayer` a cada troca de página

### Consent Mode não funciona?
- Verifique se criou o trigger `cookie_consent_update`
- Confirme que a tag tem prioridade `999`

### Server-side tracking?
Configurado em `/api/track.ts`. Para ativar:
1. Configure no `.env`:
   ```
   GA4_MEASUREMENT_ID=G-XXXXXXXXXX
   GA4_API_SECRET=seu_api_secret
   META_ACCESS_TOKEN=seu_token
   ```
2. Use `trackEvent(..., { sendToServer: true })` no código

## 📚 Recursos

- [GA4 Setup Guide](https://support.google.com/analytics/answer/9304153)
- [GTM Consent Mode V2](https://support.google.com/tagmanager/answer/10718549)
- [Meta Pixel Setup](https://developers.facebook.com/docs/meta-pixel)
