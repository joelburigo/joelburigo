import type { NextConfig } from 'next';

const config: NextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  reactStrictMode: true,
  compress: true,

  // Lê do .env via 1Password CLI em prod, .env local em dev.
  // Vars são validadas via src/env.ts antes de chegar aqui.
  env: {},

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'joelburigo.com.br' },
      { protocol: 'https', hostname: 'dev.joelburigo.com.br' },
      // R2 public bucket (quando migrar artifacts/blog images)
      { protocol: 'https', hostname: '*.r2.dev' },
      { protocol: 'https', hostname: '*.r2.cloudflarestorage.com' },
      // CF Stream thumbnails
      { protocol: 'https', hostname: 'videodelivery.net' },
      { protocol: 'https', hostname: 'customer-*.cloudflarestream.com' },
    ],
  },

  async redirects() {
    return [
      { source: '/services', destination: '/vendas-sem-segredos', permanent: true },
      { source: '/agendar-services', destination: '/advisory', permanent: true },
      // Compat com URLs antigas da LP VSS (merge b73521b1)
      { source: '/lp/vss', destination: '/vendas-sem-segredos', permanent: true },
      { source: '/lp/vss/:path*', destination: '/vendas-sem-segredos', permanent: true },
    ];
  },

  async headers() {
    // CSP portada do public/_headers (Cloudflare Pages do Astro). Precisa cobrir GTM,
    // GA, Meta CAPI, fonts.googleapis. Em dev libera mais; em prod restringe.
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google-analytics.com https://www.googletagmanager.com https://googleads.g.doubleclick.net https://connect.facebook.net https://www.gstatic.com https://www.google.com https://challenges.cloudflare.com",
      "script-src-elem 'self' 'unsafe-inline' https://www.google-analytics.com https://www.googletagmanager.com https://googleads.g.doubleclick.net https://connect.facebook.net https://www.gstatic.com https://challenges.cloudflare.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' data: https://fonts.gstatic.com",
      "img-src 'self' data: blob: https:",
      "media-src 'self' https://videodelivery.net https://customer-*.cloudflarestream.com",
      "connect-src 'self' https://www.google-analytics.com https://www.googletagmanager.com https://analytics.google.com https://stats.g.doubleclick.net https://googleads.g.doubleclick.net https://www.google.com https://connect.facebook.net https://api.openai.com https://api.anthropic.com https://api.mercadopago.com https://api.stripe.com",
      "frame-src 'self' https://www.google.com https://td.doubleclick.net https://challenges.cloudflare.com https://iframe.videodelivery.net https://customer-*.cloudflarestream.com",
      "worker-src 'self' blob:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self' https://api.mercadopago.com https://checkout.stripe.com",
    ].join('; ');

    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value:
              'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=()',
          },
        ],
      },
    ];
  },

  serverExternalPackages: ['pg', 'pg-boss', 'postgres'],

  // Cloudflare Tunnel dev — pnpm dev:tunnel expõe a porta 4321 em dev.joelburigo.com.br.
  // Sem isso o Next 15+ avisa "cross-origin request" e pode bloquear HMR websocket.
  allowedDevOrigins: ['dev.joelburigo.com.br'],
};

export default config;
