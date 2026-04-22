import type { APIRoute } from 'astro'
import { PUBLIC_META_PIXEL_ID } from 'astro:env/client'
import { META_CAPI_ACCESS_TOKEN } from 'astro:env/server'
import { sendToMetaCAPI } from '../../lib/tracking-server'

export const prerender = false

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = (await request.json()) as {
      event_name: string
      event_time?: number
      event_source_url?: string
      user_data?: { fbp?: string; fbc?: string }
      custom_data?: Record<string, unknown>
    }

    if (!body.event_name) {
      return new Response(JSON.stringify({ error: 'event_name is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (!PUBLIC_META_PIXEL_ID || !META_CAPI_ACCESS_TOKEN) {
      console.log('Meta CAPI - credenciais ausentes, evento:', body.event_name)
      return new Response(JSON.stringify({ success: true, mode: 'dev' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const response = await sendToMetaCAPI(body, request)
    if (!response) {
      return new Response(JSON.stringify({ error: 'Meta CAPI request failed' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const result = (await response.json()) as Record<string, unknown>

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
      JSON.stringify({
        error: 'Server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
