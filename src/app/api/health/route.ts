import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Health check pra Traefik + Watchtower + uptime monitor.
 * Retorna 200 com info básica. Não toca DB pra não falhar health por coisa transitória.
 */
export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      service: 'joelburigo-site',
      timestamp: new Date().toISOString(),
      version: process.env.NEXT_PUBLIC_VERSION || 'dev',
    },
    { status: 200 }
  );
}
