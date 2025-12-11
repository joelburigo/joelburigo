// Server-side tracking endpoint for Conversion APIs
// Supports: Meta CAPI, Google Ads Enhanced Conversions, GA4 Measurement Protocol

import type { APIRoute } from 'astro'

// Server-side only - estes IDs NÃO vão para o client
const GA4_MEASUREMENT_ID = import.meta.env.GA4_MEASUREMENT_ID
const GA4_API_SECRET = import.meta.env.GA4_API_SECRET
const META_PIXEL_ID = import.meta.env.META_PIXEL_ID
const META_ACCESS_TOKEN = import.meta.env.META_ACCESS_TOKEN

// Hash user data for privacy (SHA-256)
async function hashData(data: string): Promise<string> {
  const encoder = new TextEncoder()
  const dataBuffer = encoder.encode(data)
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

// Send event to GA4 Measurement Protocol
async function sendToGA4(eventData: any) {
  if (!GA4_MEASUREMENT_ID || !GA4_API_SECRET) return

  const clientId = eventData.client_id || `${Date.now()}.${Math.random()}`
  
  const payload = {
    client_id: clientId,
    events: [
      {
        name: eventData.event,
        params: {
          ...eventData,
          engagement_time_msec: eventData.engagement_time_msec || 100,
        },
      },
    ],
    user_properties: eventData.user_properties || {},
  }

  try {
    await fetch(
      `https://www.google-analytics.com/mp/collect?measurement_id=${GA4_MEASUREMENT_ID}&api_secret=${GA4_API_SECRET}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    )
  } catch (error) {
    console.error('GA4 Measurement Protocol error:', error)
  }
}

// Send event to Meta Conversions API
async function sendToMetaCAPI(eventData: any, request: Request) {
  if (!META_PIXEL_ID || !META_ACCESS_TOKEN) return

  const userAgent = request.headers.get('user-agent') || ''
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || ''
  
  // Hash user data
  const emailHash = eventData.email ? await hashData(eventData.email.toLowerCase().trim()) : null
  const phoneHash = eventData.phone ? await hashData(eventData.phone.replace(/\D/g, '')) : null

  const payload = {
    data: [
      {
        event_name: eventData.event,
        event_time: Math.floor(Date.now() / 1000),
        event_source_url: eventData.url,
        action_source: 'website',
        user_data: {
          client_ip_address: ip,
          client_user_agent: userAgent,
          ...(emailHash && { em: [emailHash] }),
          ...(phoneHash && { ph: [phoneHash] }),
          fbc: eventData.fbc || null,
          fbp: eventData.fbp || null,
        },
        custom_data: {
          value: eventData.value,
          currency: eventData.currency || 'BRL',
          content_name: eventData.content_name,
          content_category: eventData.content_category,
        },
      },
    ],
    test_event_code: import.meta.env.DEV ? 'TEST_EVENT_CODE' : undefined,
  }

  try {
    await fetch(`https://graph.facebook.com/v18.0/${META_PIXEL_ID}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...payload,
        access_token: META_ACCESS_TOKEN,
      }),
    })
  } catch (error) {
    console.error('Meta CAPI error:', error)
  }
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const eventData = await request.json()

    // Send to all configured platforms
    await Promise.all([
      sendToGA4(eventData),
      sendToMetaCAPI(eventData, request),
    ])

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  } catch (error) {
    console.error('Server tracking error:', error)
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  }
}

export const prerender = false
