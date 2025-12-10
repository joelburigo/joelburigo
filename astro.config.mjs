import { defineConfig } from 'astro/config'
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
  },
  compressHTML: true,
  build: {
    inlineStylesheets: 'auto',
  },
})
