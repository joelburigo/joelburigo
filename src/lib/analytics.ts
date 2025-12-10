// Modern Analytics with Consent Management and Server-Side Events
// Based on Google Consent Mode v2 and Meta CAPI

interface ConsentState {
  analytics_storage: 'granted' | 'denied'
  ad_storage: 'granted' | 'denied'
  ad_user_data: 'granted' | 'denied'
  ad_personalization: 'granted' | 'denied'
  functionality_storage: 'granted' | 'denied'
  personalization_storage: 'granted' | 'denied'
  security_storage: 'granted' | 'denied'
}

// Initialize consent mode BEFORE any tracking
export const initConsent = () => {
  if (typeof window === 'undefined') return

  // Check for stored consent
  const storedConsent = localStorage.getItem('cookie_consent')
  const hasConsent = storedConsent === 'accepted'

  // Default consent state (denied until user accepts)
  const defaultConsent: ConsentState = {
    analytics_storage: hasConsent ? 'granted' : 'denied',
    ad_storage: hasConsent ? 'granted' : 'denied',
    ad_user_data: hasConsent ? 'granted' : 'denied',
    ad_personalization: hasConsent ? 'granted' : 'denied',
    functionality_storage: 'granted',
    personalization_storage: hasConsent ? 'granted' : 'denied',
    security_storage: 'granted',
  }

  // Google Consent Mode v2
  if (window.gtag) {
    window.gtag('consent', 'default', defaultConsent)
  }

  // Initialize dataLayer if doesn't exist
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({
    event: 'consent_initialized',
    consent_state: defaultConsent,
  })
}

// Update consent when user accepts/rejects
export const updateConsent = (accepted: boolean) => {
  if (typeof window === 'undefined') return

  localStorage.setItem('cookie_consent', accepted ? 'accepted' : 'rejected')

  const consentUpdate: Partial<ConsentState> = {
    analytics_storage: accepted ? 'granted' : 'denied',
    ad_storage: accepted ? 'granted' : 'denied',
    ad_user_data: accepted ? 'granted' : 'denied',
    ad_personalization: accepted ? 'granted' : 'denied',
    personalization_storage: accepted ? 'granted' : 'denied',
  }

  if (window.gtag) {
    window.gtag('consent', 'update', consentUpdate)
  }

  window.dataLayer?.push({
    event: 'consent_updated',
    consent_state: consentUpdate,
  })
}

// Enhanced event tracking with automatic consent check
const canTrack = (): boolean => {
  if (typeof window === 'undefined') return false
  const consent = localStorage.getItem('cookie_consent')
  return consent === 'accepted'
}

// Send event to server-side API (for CAPI/Measurement Protocol)
const sendServerEvent = async (eventData: any) => {
  try {
    await fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...eventData,
        timestamp: Date.now(),
        user_agent: navigator.userAgent,
        url: window.location.href,
        referrer: document.referrer,
      }),
    })
  } catch (error) {
    console.error('Server tracking error:', error)
  }
}

// Modern event tracking with GA4 recommended events
export const trackEvent = (
  eventName: string,
  params?: Record<string, any>,
  options?: { sendToServer?: boolean }
) => {
  if (!canTrack()) return

  const eventData = {
    event: eventName,
    timestamp: new Date().toISOString(),
    page_location: window.location.href,
    page_title: document.title,
    ...params,
  }

  // Google Analytics 4 (via GTM dataLayer)
  if (window.dataLayer) {
    window.dataLayer.push(eventData)
  }

  // Direct GA4 (if gtag is loaded)
  if (window.gtag) {
    window.gtag('event', eventName, params)
  }

  // Meta Pixel
  if (window.fbq) {
    window.fbq('track', eventName, params)
  }

  // Send to server-side (for Conversion APIs)
  if (options?.sendToServer) {
    sendServerEvent(eventData)
  }
}

// GA4 Recommended Events - E-commerce
export const trackBeginCheckout = (params: {
  currency?: string
  value?: number
  items?: Array<{
    item_id: string
    item_name: string
    price: number
    quantity?: number
  }>
}) => {
  trackEvent(
    'begin_checkout',
    {
      currency: 'BRL',
      ...params,
    },
    { sendToServer: true }
  )

  // Meta Pixel equivalent
  if (window.fbq && canTrack()) {
    window.fbq('track', 'InitiateCheckout', {
      value: params.value,
      currency: params.currency || 'BRL',
      contents: params.items,
      content_type: 'product',
    })
  }
}

export const trackPurchase = (params: {
  transaction_id: string
  value: number
  currency?: string
  items?: Array<any>
  coupon?: string
}) => {
  trackEvent(
    'purchase',
    {
      currency: 'BRL',
      ...params,
    },
    { sendToServer: true }
  )

  // Meta Pixel
  if (window.fbq && canTrack()) {
    window.fbq('track', 'Purchase', {
      value: params.value,
      currency: params.currency || 'BRL',
      contents: params.items,
      content_type: 'product',
    })
  }
}

// GA4 Recommended Events - Lead Generation
export const trackGenerateLead = (params: {
  form_name?: string
  form_id?: string
  form_destination?: string
  value?: number
}) => {
  trackEvent(
    'generate_lead',
    {
      currency: 'BRL',
      ...params,
    },
    { sendToServer: true }
  )

  // Meta Pixel
  if (window.fbq && canTrack()) {
    window.fbq('track', 'Lead', {
      content_name: params.form_name || 'Lead Form',
      value: params.value || 0,
      currency: 'BRL',
    })
  }
}

export const trackFormSubmit = (params: {
  form_name: string
  form_id?: string
  form_destination?: string
}) => {
  trackEvent(
    'form_submit',
    params,
    { sendToServer: true }
  )
}

// GA4 Recommended Events - Engagement
export const trackViewItem = (params: {
  item_id: string
  item_name: string
  value?: number
  item_category?: string
}) => {
  trackEvent('view_item', {
    currency: 'BRL',
    ...params,
  })

  // Meta Pixel
  if (window.fbq && canTrack()) {
    window.fbq('track', 'ViewContent', {
      content_name: params.item_name,
      content_ids: [params.item_id],
      content_type: 'product',
      value: params.value,
      currency: 'BRL',
    })
  }
}

export const trackSelectContent = (params: {
  content_type: string
  item_id: string
  content_name?: string
}) => {
  trackEvent('select_content', params)
}

export const trackScroll = (scrollDepth: number) => {
  trackEvent('scroll', {
    scroll_depth: scrollDepth,
    engagement_type: 'scroll',
  })
}

export const trackFileDownload = (params: {
  file_name: string
  file_extension?: string
  link_url?: string
}) => {
  trackEvent(
    'file_download',
    params,
    { sendToServer: true }
  )
}

// Custom Business Events
export const trackVSSInterest = () => {
  trackBeginCheckout({
    currency: 'BRL',
    value: 997,
    items: [
      {
        item_id: 'vss_programa_90_dias',
        item_name: 'Vendas Sem Segredos - Programa 90 Dias',
        price: 997,
        quantity: 1,
      },
    ],
  })

  trackEvent(
    'vss_interest',
    {
      product_name: 'VSS',
      value: 997,
      currency: 'BRL',
    },
    { sendToServer: true }
  )
}

export const trackServicesInterest = (packageName?: string) => {
  const value = packageName === 'fundacao' ? 3000 : packageName === 'aceleracao' ? 6000 : 9000

  trackViewItem({
    item_id: `services_${packageName || 'unknown'}`,
    item_name: `Implementation Services - ${packageName || 'Unknown'}`,
    value,
    item_category: 'services',
  })

  trackEvent(
    'services_interest',
    {
      service_package: packageName,
      value,
      currency: 'BRL',
    },
    { sendToServer: true }
  )
}

export const trackAdvisoryInterest = (format?: string) => {
  const value =
    format === 'avulso' ? 997 : format === 'sprint' ? 7500 : format === 'conselho' ? 15000 : 0

  trackViewItem({
    item_id: `advisory_${format || 'unknown'}`,
    item_name: `Strategic Advisory - ${format || 'Unknown'}`,
    value,
    item_category: 'advisory',
  })

  trackEvent(
    'advisory_interest',
    {
      advisory_format: format,
      value,
      currency: 'BRL',
    },
    { sendToServer: true }
  )
}

export const trackDiagnosticoStart = () => {
  trackEvent('diagnostico_start', {
    tool_name: 'Diagnóstico 6Ps',
    engagement_type: 'tool_interaction',
  })
}

export const trackDiagnosticoComplete = (scores: Record<string, number>) => {
  trackGenerateLead({
    form_name: 'Diagnóstico 6Ps',
    form_id: 'diagnostico_6ps',
    value: 0,
  })

  trackEvent(
    'diagnostico_complete',
    {
      tool_name: 'Diagnóstico 6Ps',
      ...scores,
    },
    { sendToServer: true }
  )
}

export const trackCTAClick = (ctaName: string, ctaLocation: string) => {
  trackSelectContent({
    content_type: 'cta_button',
    item_id: ctaName,
    content_name: ctaLocation,
  })

  trackEvent('cta_click', {
    cta_name: ctaName,
    cta_location: ctaLocation,
  })
}

export const trackOutboundLink = (url: string, linkText?: string) => {
  trackEvent('click', {
    link_domain: new URL(url).hostname,
    link_url: url,
    link_text: linkText,
    outbound: true,
  })
}

export const trackVideoPlay = (videoName: string) => {
  trackEvent('video_start', {
    video_title: videoName,
    engagement_type: 'video_interaction',
  })
}

export const trackVideoComplete = (videoName: string) => {
  trackEvent('video_complete', {
    video_title: videoName,
    engagement_type: 'video_interaction',
  })
}

// Enhanced User Properties
export const setUserProperties = (properties: Record<string, any>) => {
  if (!canTrack()) return

  if (window.gtag) {
    window.gtag('set', 'user_properties', properties)
  }

  window.dataLayer?.push({
    event: 'user_properties_set',
    user_properties: properties,
  })
}

// Page view tracking with enhanced params
export const trackPageView = (additionalParams?: Record<string, any>) => {
  if (!canTrack()) return

  const pageData = {
    page_location: window.location.href,
    page_path: window.location.pathname,
    page_title: document.title,
    page_referrer: document.referrer,
    ...additionalParams,
  }

  if (window.gtag) {
    window.gtag('event', 'page_view', pageData)
  }

  window.dataLayer?.push({
    event: 'page_view',
    ...pageData,
  })

  if (window.fbq) {
    window.fbq('track', 'PageView')
  }
}

// Exception tracking
export const trackException = (error: Error, fatal: boolean = false) => {
  trackEvent('exception', {
    description: error.message,
    fatal,
    error_name: error.name,
    error_stack: error.stack,
  })
}

// Performance tracking
export const trackPerformance = () => {
  if (typeof window === 'undefined' || !window.performance) return

  const perfData = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming

  if (perfData) {
    trackEvent('performance_metrics', {
      dns_time: perfData.domainLookupEnd - perfData.domainLookupStart,
      tcp_time: perfData.connectEnd - perfData.connectStart,
      request_time: perfData.responseStart - perfData.requestStart,
      response_time: perfData.responseEnd - perfData.responseStart,
      dom_load_time: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
      window_load_time: perfData.loadEventEnd - perfData.loadEventStart,
      total_time: perfData.loadEventEnd - perfData.fetchStart,
    })
  }
}

// TypeScript declarations
declare global {
  interface Window {
    dataLayer: any[]
    fbq: (...args: any[]) => void
    gtag: (...args: any[]) => void
  }
}

export {}
