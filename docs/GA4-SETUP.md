# Configuração GA4 no Google Tag Manager

## 🎯 Estratégia: GTM First

Este site usa **GTM First** - tudo é configurado no Google Tag Manager, não no código.

## 📋 Checklist de Configuração

### 1. Google Tag Manager (✅ FEITO)
- Container ID: `GTM-TWP4J6N8`
- Instalado no site via `GoogleTagManager.astro`
- DataLayer inicializado corretamente

### 2. Configurar GA4 para Navegação SPA

Você já tem a **Tag do Google** (`G-Z2XMZ448VV`) configurada! 
Agora só precisa adicionar suporte para navegação SPA:

#### Criar Acionador de SPA:
1. No GTM, vá em **Acionadores → Novo**
2. **Configuração do acionador:**
   - Tipo de acionador: `Evento personalizado`
   - Nome do evento: `page_view`
   - Este acionador é disparado em: `Todos os eventos personalizados`
3. Salve como: `Evento personalizado - page_view`

#### Adicionar Acionador na Tag do Google:
1. Abra sua **Tag do Google** existente
2. Em **Acionamento**, clique para adicionar mais acionadores
3. Selecione **ambos**:
   - ✅ `Inicialização - Todas as páginas` (já tem)
   - ✅ `Evento personalizado - page_view` (adicionar agora)
4. Salve

**Pronto!** GA4 agora rastreia:
- ✅ Primeiro pageview automático
- ✅ Navegação SPA (troca de página sem reload)

### 3. Configurar Consent Mode V2 (OPCIONAL - Avançado)

**IMPORTANTE:** O site já gerencia cookies via `CookieConsent.astro` e envia eventos corretos ao GTM.

**Você tem 2 opções:**

#### Opção A: Deixar como está (Mais simples) ✅
O banner de cookies já funciona e envia `cookie_consent_update` ao dataLayer.
GA4 e Meta Pixel só carregam após o usuário aceitar.

**Não precisa fazer nada adicional!**

#### Opção B: Implementar Consent Mode V2 no GTM (Avançado)

**Passo 1 - Tag de Consentimento Padrão (HTML Personalizado):**
1. **Tags → Nova**
2. **Tipo de tag:** `HTML personalizado`
3. Cole este código:
```html
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  
  // Estado padrão (tudo negado)
  gtag('consent', 'default', {
    'ad_storage': 'denied',
    'ad_user_data': 'denied',
    'ad_personalization': 'denied',
    'analytics_storage': 'denied',
    'personalization_storage': 'denied'
  });
</script>
```
4. **Configurações avançadas → Prioridade de disparo:** `999`
5. **Acionamento:** `Todas as páginas`
6. Salve como: `Consent Mode - Default State`

**Passo 2 - Criar Acionador:**
1. **Acionadores → Novo**
2. **Tipo:** `Evento personalizado`
3. **Nome do evento:** `cookie_consent_update`
4. Salve como: `Cookie Consent Update`

**Passo 3 - Tag de Atualização de Consentimento:**
1. **Tags → Nova**
2. **Tipo de tag:** `HTML personalizado`
3. Cole este código:
```html
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  
  // Pega o estado do consentimento do dataLayer
  var consentState = {{dlv - consent_state}};
  
  // Atualiza baseado na escolha do usuário
  if (consentState === 'granted') {
    gtag('consent', 'update', {
      'ad_storage': 'granted',
      'ad_user_data': 'granted',
      'ad_personalization': 'granted',
      'analytics_storage': 'granted',
      'personalization_storage': 'granted'
    });
  }
</script>
```
4. **Acionamento:** `Cookie Consent Update`
5. Salve como: `Consent Mode - Update`

**Passo 4 - Criar Variável:**
1. **Variáveis → Variáveis definidas pelo usuário → Nova**
2. **Tipo:** `Variável da camada de dados`
3. **Nome da variável da camada de dados:** `consent_state`
4. Salve como: `dlv - consent_state`

**Pronto!** Consent Mode V2 configurado.

### 4. Meta Pixel (✅ JÁ CONFIGURADO)

O site já tem Meta Pixel hardcoded (`693646216957142`) via `MetaPixel.astro`.

**Você já tem no GTM:** `Meta Pixel ID 693646216957142` como HTML personalizado.

**Está perfeito assim!** Não precisa mudar nada.

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

### 6. PublicarVisualizar** (Preview)
2. Digite a URL do seu site
3. Navegue pelo site
4. Verifique no painel:
   - ✅ Tags disparando corretamente
   - ✅ Eventos `page_view` em cada navegação
   - ✅ Consentimento sendo respeitado

#### No GA4:
1. Vá em **Relatórios → Tempo real**
2. Navegue no seu site
3. Deve aparecer em tempo real

#### Meta Pixel:
1. Instale **Meta Pixel Helper** (extensão Chrome)
2. Abra seu site
3. Clique no ícone → deve mostrar pixel ativo

### 6. Publicar

Quando tudo estiver funcionando:
1. No GTM, clique em **Enviarret
   META_ACCESS_TOKEN=seu_token
   ```
2. Use `trackEvent(..., { sendToServer: true })` no código

## 📚 Recursos

- [GA4 Setup Guide](https://support.google.com/analytics/answer/9304153)
- [GTM Consent Mode V2](https://support.google.com/tagmanager/answer/10718549)
- [Meta Pixel Setup](https://developers.facebook.com/docs/meta-pixel)
