import type { APIRoute } from 'astro'
import { sendToGA4, sendToMetaCAPI } from '../../lib/tracking-server'

export const prerender = false

export const POST: APIRoute = async ({ request }) => {
  try {
    const eventData = await request.json() as Record<string, any>

    await Promise.all([
      sendToGA4(eventData),
      sendToMetaCAPI(
        {
          event_name: eventData.event,
          event_source_url: eventData.url,
          user_data: {
            email: eventData.email,
            phone: eventData.phone,
            fbc: eventData.fbc,
            fbp: eventData.fbp,
          },
          custom_data: {
            value: eventData.value,
            currency: eventData.currency || 'BRL',
            content_name: eventData.content_name,
            content_category: eventData.content_category,
          },
        },
        request
      ),
    ])

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Server tracking error:', error)
    return new Response(JSON.stringify({ success: false, error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
