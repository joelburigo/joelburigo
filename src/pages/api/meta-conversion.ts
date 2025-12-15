import type { APIRoute } from 'astro'

const META_PIXEL_ID = '693646216957142'
const META_ACCESS_TOKEN = import.meta.env.META_CAPI_ACCESS_TOKEN

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json() as {
      event_name: string
      event_time?: number
      event_source_url?: string
      user_data?: { fbp?: string; fbc?: string }
      custom_data?: Record<string, unknown>
    }
    const { event_name, event_time, event_source_url, user_data, custom_data } = body

    // Validação básica
    if (!event_name) {
      return new Response(JSON.stringify({ error: 'event_name is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Se não tiver access token, apenas loga e retorna sucesso (desenvolvimento)
    if (!META_ACCESS_TOKEN) {
      console.log('Meta CAPI - No access token, event:', event_name)
      return new Response(JSON.stringify({ success: true, mode: 'dev' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Preparar payload para Meta Conversions API
    const payload = {
      data: [
        {
          event_name,
          event_time: event_time || Math.floor(Date.now() / 1000),
          event_source_url: event_source_url || request.headers.get('referer'),
          action_source: 'website',
          user_data: {
            client_ip_address: request.headers.get('x-forwarded-for') || request.headers.get('cf-connecting-ip'),
            client_user_agent: request.headers.get('user-agent'),
            fbc: user_data?.fbc || undefined,
            fbp: user_data?.fbp || undefined,
          },
          custom_data: custom_data || {},
        },
      ],
    }

    // Enviar para Meta Graph API
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${META_PIXEL_ID}/events?access_token=${META_ACCESS_TOKEN}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    )

    const result = await response.json() as Record<string, unknown>

    if (!response.ok) {
      console.error('Meta CAPI error:', result)
      return new Response(JSON.stringify({ error: 'Meta API error', details: result }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ success: true, result }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Meta CAPI server error:', error)
    return new Response(
      JSON.stringify({ error: 'Server error', message: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
