import { defineConfig, envField } from 'astro/config'
import cloudflare from '@astrojs/cloudflare'
import tailwind from '@astrojs/tailwind'
import sitemap from '@astrojs/sitemap'
import icon from 'astro-icon'
import { passthroughImageService } from 'astro/config'

// https://astro.build/config
export default defineConfig({
  site: 'https://joelburigo.com.br',
  output: 'server', // SSR mode
  adapter: cloudflare({
    mode: 'directory',
  }),
  // Passthrough: imagens já estão fisicamente otimizadas em WebP
  image: {
    service: passthroughImageService(),
  },
  vite: {
    build: {
      chunkSizeWarningLimit: 600
    }
  },
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
      META_CAPI_ACCESS_TOKEN: envField.string({ 
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
    tailwind(),
    sitemap({
      changefreq: 'weekly',
      lastmod: new Date(),
      filter: (page) => {
        // Páginas que NÃO devem ser indexadas
        const noIndex = [
          '/design-system',
          '/apresentacao',
          '/lp/',              // Todas as landing pages
          '/advisory-aplicacao',
          '/advisory-obrigado',
          '/diagnostico-resultado',
          '/diagnostico-obrigado',
          '/agendamento-sessao',
          '/agendar-services',
          '/vss-aguardando-pagamento',
          '/vss-analise-credito',
          '/vss-compra-aprovada',
          '/links',
          '/404',
          '/500',
        ]
        return !noIndex.some(pattern => page.includes(pattern))
      },
      serialize: (item) => {
        // Prioridades customizadas por página
        const priorities = {
          '/': 1.0,
          '/vendas-sem-segredos/': 0.9,
          '/services/': 0.9,
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
  image: {
    remotePatterns: [{ protocol: 'https' }],
    // Cloudflare Images service for runtime optimization
    service: {
      entrypoint: '@astrojs/cloudflare/image-service',
    },
  },
  compressHTML: true,
  build: {
    inlineStylesheets: 'auto',
    assets: '_astro',
  },
  vite: {
    build: {
      target: 'es2022',
      rollupOptions: {
        output: {
          manualChunks: undefined, // Prevent too many chunks
          inlineDynamicImports: false,
        },
      },
      modulePreload: {
        polyfill: false,
        resolveDependencies: (filename, deps) => {
          // Preload all dependencies eagerly
          return deps
        },
      },
      cssCodeSplit: true,
      chunkSizeWarningLimit: 600,
    },
  },
})
