// Simplified Analytics Library - Direct Tracking Approach
// All tracking uses dataLayer pattern for consistency
// Google Analytics, Google Ads, and Meta API handle tracking

/**
 * Check if we can track (user consent)
 * All analytics scripts respect this consent state
 */
const canTrack = (): boolean => {
  if (typeof window === 'undefined') return false
  const consent = localStorage.getItem('cookie_consent')
  return consent === 'accepted'
}

/**
 * Send event to server-side API (optional for enhanced tracking)
 * Used for Conversions API, Measurement Protocol, etc.
 */
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

/**
 * Core tracking function - pushes to dataLayer for consistency
 * Google Analytics and other scripts consume dataLayer events
 */
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

  // Push to dataLayer - Google Analytics listens to these events
  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || []
    window.dataLayer.push(eventData)
  }

  // Optional server-side tracking for enhanced conversion tracking
  if (options?.sendToServer) {
    sendServerEvent(eventData)
  }
}

// ==========================================
// GA4 Standard Events - E-commerce
// ==========================================

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
}

// ==========================================
// GA4 Standard Events - Lead Generation
// ==========================================

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
}

export const trackFormSubmit = (params: {
  form_name: string
  form_id?: string
  form_destination?: string
}) => {
  trackEvent('form_submit', params, { sendToServer: true })
}

// ==========================================
// GA4 Standard Events - Engagement
// ==========================================

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
  trackEvent('file_download', params, { sendToServer: true })
}

// ==========================================
// Custom Business Events
// ==========================================
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

  trackEvent('diagnostico_complete', {
    tool_name: 'Diagnóstico 6Ps',
    ...scores,
  }, { sendToServer: true })
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

// ==========================================
// User Properties & Page Tracking
// ==========================================

export const setUserProperties = (properties: Record<string, any>) => {
  if (!canTrack()) return

  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || []
    window.dataLayer.push({
      event: 'user_properties_set',
      user_properties: properties,
    })
  }
}

export const trackPageView = (additionalParams?: Record<string, any>) => {
  if (!canTrack()) return

  const pageData = {
    event: 'page_view',
    page_location: window.location.href,
    page_path: window.location.pathname,
    page_title: document.title,
    page_referrer: document.referrer,
    ...additionalParams,
  }

  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || []
    window.dataLayer.push(pageData)
  }
}

// ==========================================
// Diagnostics & Performance
// ==========================================

export const trackException = (error: Error, fatal: boolean = false) => {
  trackEvent('exception', {
    description: error.message,
    fatal,
    error_name: error.name,
    error_stack: error.stack,
  })
}

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

// ==========================================
// TypeScript Declarations
// ==========================================

declare global {
  interface Window {
    dataLayer: any[]
  }
}

export {}
