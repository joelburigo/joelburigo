import { defineConfig, envField, passthroughImageService } from 'astro/config'
import node from '@astrojs/node'
import sitemap from '@astrojs/sitemap'
import icon from 'astro-icon'

// https://astro.build/config
export default defineConfig({
  site: 'https://joelburigo.com.br',
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),
  redirects: {
    '/services': '/vendas-sem-segredos',
    '/agendar-services': '/advisory',
  },
  image: {
    service: passthroughImageService(),
    remotePatterns: [{ protocol: 'https' }],
  },
  env: {
    schema: {
      PUBLIC_GTM_ID: envField.string({
        context: 'client',
        access: 'public',
        optional: true,
      }),
      PUBLIC_SITE_URL: envField.string({
        context: 'client',
        access: 'public',
        optional: true,
        default: 'https://joelburigo.com.br',
      }),
      PUBLIC_META_PIXEL_ID: envField.string({
        context: 'client',
        access: 'public',
        optional: true,
      }),
      GA4_MEASUREMENT_ID: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
      }),
      GA4_API_SECRET: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
      }),
      META_CAPI_ACCESS_TOKEN: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
      }),
    },
  },
  prefetch: {
    prefetchAll: false,
    defaultStrategy: 'hover',
  },
  integrations: [
    sitemap({
      changefreq: 'weekly',
      filter: (page) => {
        const noIndex = [
          '/design-system',
          '/apresentacao',
          '/lp/',
          '/advisory-aplicacao',
          '/advisory-obrigado',
          '/diagnostico-resultado',
          '/diagnostico-obrigado',
          '/agendamento-sessao',
          '/vss-aguardando-pagamento',
          '/vss-analise-credito',
          '/vss-compra-aprovada',
          '/links',
          '/404',
          '/500',
        ]
        return !noIndex.some((pattern) => page.includes(pattern))
      },
      serialize: (item) => {
        const priorities = {
          '/': 1.0,
          '/vendas-sem-segredos/': 0.9,
          '/advisory/': 0.9,
          '/sobre/': 0.8,
          '/cases/': 0.8,
          '/blog/': 0.8,
          '/diagnostico/': 0.7,
          '/contato/': 0.6,
          '/press-kit/': 0.5,
          '/privacidade/': 0.3,
          '/termos/': 0.3,
        }
        const path = item.url.replace('https://joelburigo.com.br', '')
        return {
          ...item,
          priority: priorities[path] || (path.startsWith('/blog/') ? 0.6 : 0.5),
          changefreq: path.startsWith('/blog/') ? 'monthly' : 'weekly',
        }
      },
    }),
    icon(),
  ],
  compressHTML: true,
  build: {
    inlineStylesheets: 'auto',
    assets: '_astro',
  },
  vite: {
    server: {
      allowedHosts: ['dev.joelburigo.com.br'],
    },
    build: {
      target: 'es2022',
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          manualChunks: undefined,
          inlineDynamicImports: false,
        },
      },
      modulePreload: {
        polyfill: false,
      },
      cssCodeSplit: true,
    },
  },
})
