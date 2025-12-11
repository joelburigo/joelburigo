import { defineConfig, envField } from 'astro/config'
import react from '@astrojs/react'
import tailwind from '@astrojs/tailwind'
import sitemap from '@astrojs/sitemap'
import vercel from '@astrojs/vercel'
import partytown from '@astrojs/partytown'

// https://astro.build/config
export default defineConfig({
  site: 'https://joelburigo.com.br',
  output: 'server', // SSR mode
  adapter: vercel({
    webAnalytics: true,
    speedInsights: true,
  }),
  env: {
    schema: {
      // GTM FIRST: Site só precisa do GTM ID
      PUBLIC_GTM_ID: envField.string({ 
        context: 'client', 
        access: 'public',
        optional: true 
      }),
      PUBLIC_SITE_URL: envField.string({ 
        context: 'client', 
        access: 'public',
        optional: true,
        default: 'https://joelburigo.com.br'
      }),
      // Server-side APIs (OPCIONAL - apenas para /api/track)
      GA4_MEASUREMENT_ID: envField.string({ 
        context: 'server', 
        access: 'secret',
        optional: true 
      }),
      GA4_API_SECRET: envField.string({ 
        context: 'server', 
        access: 'secret',
        optional: true 
      }),
      META_PIXEL_ID: envField.string({ 
        context: 'server', 
        access: 'secret',
        optional: true 
      }),
      META_ACCESS_TOKEN: envField.string({ 
        context: 'server', 
        access: 'secret',
        optional: true 
      }),
    }
  },
  prefetch: {
    prefetchAll: false,
    defaultStrategy: 'hover',
  },
  integrations: [
    react(),
    tailwind(),
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
      filter: (page) => !page.includes('/design-system'),
    }),
    partytown({
      config: {
        forward: ['dataLayer.push', 'fbq'],
      },
    }),
  ],
  image: {
    remotePatterns: [{ protocol: 'https' }],
    service: {
      entrypoint: 'astro/assets/services/sharp',
      config: {
        limitInputPixels: false,
      },
    },
  },
  compressHTML: true,
  build: {
    inlineStylesheets: 'auto',
    assets: '_astro',
  },
  vite: {
    build: {
      cssMinify: 'lightningcss',
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'motion-vendor': ['framer-motion'],
          },
        },
      },
    },
  },
})
