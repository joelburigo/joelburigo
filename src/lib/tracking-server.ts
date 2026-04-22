import { GA4_MEASUREMENT_ID, GA4_API_SECRET, META_CAPI_ACCESS_TOKEN } from 'astro:env/server'
import { PUBLIC_META_PIXEL_ID } from 'astro:env/client'

export function getClientIp(request: Request): string | undefined {
  const xff = request.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0]?.trim()
  return request.headers.get('x-real-ip') ?? undefined
}

async function sha256(data: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(data))
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function sendToGA4(eventData: Record<string, any>): Promise<void> {
  if (!GA4_MEASUREMENT_ID || !GA4_API_SECRET) return
  const clientId = eventData.client_id || `${Date.now()}.${Math.random()}`
  const payload = {
    client_id: clientId,
    events: [{ name: eventData.event, params: { ...eventData } }],
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

type MetaUserData = {
  email?: string
  phone?: string
  fbc?: string
  fbp?: string
}

type MetaEventInput = {
  event_name: string
  event_time?: number
  event_source_url?: string
  user_data?: MetaUserData
  custom_data?: Record<string, unknown>
}

export async function sendToMetaCAPI(input: MetaEventInput, request: Request): Promise<Response | null> {
  if (!PUBLIC_META_PIXEL_ID || !META_CAPI_ACCESS_TOKEN) return null

  const emailHash = input.user_data?.email
    ? await sha256(input.user_data.email.toLowerCase().trim())
    : null
  const phoneHash = input.user_data?.phone
    ? await sha256(input.user_data.phone.replace(/\D/g, ''))
    : null

  const payload = {
    data: [
      {
        event_name: input.event_name,
        event_time: input.event_time ?? Math.floor(Date.now() / 1000),
        event_source_url: input.event_source_url ?? request.headers.get('referer') ?? undefined,
        action_source: 'website',
        user_data: {
          client_ip_address: getClientIp(request),
          client_user_agent: request.headers.get('user-agent') ?? undefined,
          ...(emailHash && { em: [emailHash] }),
          ...(phoneHash && { ph: [phoneHash] }),
          ...(input.user_data?.fbc && { fbc: input.user_data.fbc }),
          ...(input.user_data?.fbp && { fbp: input.user_data.fbp }),
        },
        custom_data: input.custom_data ?? {},
      },
    ],
  }

  try {
    return await fetch(
      `https://graph.facebook.com/v18.0/${PUBLIC_META_PIXEL_ID}/events?access_token=${META_CAPI_ACCESS_TOKEN}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    )
  } catch (error) {
    console.error('Meta CAPI error:', error)
    return null
  }
}
