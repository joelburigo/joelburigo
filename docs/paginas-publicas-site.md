# Páginas Públicas - joelburigo.com.br

**Atualização:** 31/01/2026
**URLs Indexáveis:** 25 | **Total de URLs:** 32

---

## Inventário de Páginas

### Páginas Principais (Indexar)

| URL | Arquivo | SEO Priority | Structured Data |
|-----|---------|--------------|-----------------|
| `/` | index.astro | 1.0 | Organization, WebSite |
| `/sobre` | sobre.astro | 0.8 | Person, ProfilePage |
| `/vendas-sem-segredos` | vendas-sem-segredos.astro | 0.9 | Product, Course |
| `/services` | services.astro | 0.9 | Service, Product |
| `/advisory` | advisory.astro | 0.9 | Service, Product |
| `/cases` | cases.astro | 0.8 | ItemList |
| `/blog` | blog/index.astro | 0.8 | Blog |
| `/contato` | contato.astro | 0.6 | ContactPage |
| `/diagnostico` | diagnostico.astro | 0.7 | WebApplication |
| `/jornada-90-dias` | jornada-90-dias.astro | 0.7 | WebPage |

### Blog Posts (Indexar)

| URL | Arquivo | Topic Cluster |
|-----|---------|---------------|
| `/blog/6ps-vendas-escalaveis-guia-completo` | .md | Pilar - 6Ps |
| `/blog/sistema-melhor-que-improviso` | .md | Filosofia |
| `/blog/do-barraco-ao-milhao` | .md | História |
| `/blog/como-estruturar-vendas-do-zero` | .md | Guia Prático |
| `/blog/icp-cliente-ideal-perfil` | .md | P2 - Público |
| `/blog/posicionamento-diferencial-unico` | .md | P1 - Posicionamento |
| `/blog/crm-gratuito-vs-profissional` | .md | P4 - Programas |
| `/blog/metricas-vendas-essenciais` | .md | P5 - Processos |
| `/blog/trafego-pago-vs-prospecao-ativa` | .md | P4 - Atração |
| `/blog/agencia-vs-autonomia` | .md | Comparativo |
| `/blog/de-10k-para-100k-por-mes` | .md | Case/Escala |
| `/blog/17-anos-estruturando-vendas-historia-completa` | .md | História |

### Landing Pages (NÃO Indexar)

| URL | Arquivo | Status |
|-----|---------|--------|
| `/lp/vss` | lp/vss.astro | ✅ noindex + canonical -> `/vendas-sem-segredos` |

### Páginas Legais (Indexar, baixa prioridade)

| URL | Arquivo | Priority |
|-----|---------|----------|
| `/privacidade` | privacidade.astro | 0.3 |
| `/termos` | termos.astro | 0.3 |

### Utilitárias (Avaliar indexação)

| URL | Arquivo | Indexar? | Notas |
|-----|---------|----------|-------|
| `/links` | links.astro | Não | Linktree interno - canonical próprio |
| `/press-kit` | press-kit.astro | Sim | Útil para SEO de marca |

### Páginas que NÃO DEVEM ser indexadas

| URL | Arquivo | Motivo |
|-----|---------|--------|
| `/apresentacao` | apresentacao.astro | Pitch interno/clientes |
| `/advisory-aplicacao` | advisory-aplicacao.astro | Formulário |
| `/advisory-obrigado` | advisory-obrigado.astro | Thank you page |
| `/diagnostico-resultado` | diagnostico-resultado.astro | Resultado privado |
| `/diagnostico-obrigado` | diagnostico-obrigado.astro | Thank you page |
| `/agendamento-sessao` | agendamento-sessao.astro | Redirect/embed |
| `/agendar-services` | agendar-services.astro | Redirect/embed |
| `/vss-aguardando-pagamento` | vss-aguardando-pagamento.astro | Pós-checkout |
| `/vss-analise-credito` | vss-analise-credito.astro | Pós-checkout |
| `/vss-compra-aprovada` | vss-compra-aprovada.astro | Pós-checkout |

### Páginas de Erro (Não indexar)

| URL | Arquivo |
|-----|---------|
| `/404` | 404.astro |
| `/500` | 500.astro |

### APIs (Não públicas)

| Endpoint | Arquivo |
|----------|---------|
| `/api/meta-conversion` | api/meta-conversion.ts |
| `/api/track` | api/track.ts |

---

## Status das Correções

### ✅ Sitemap (CORRIGIDO)

O filtro do sitemap em `astro.config.mjs` foi atualizado para excluir:
- Todas as landing pages (`/lp/`)
- Páginas de formulário e thank you
- Páginas de checkout/status
- Páginas internas e de erro

### ✅ Robots.txt (CORRIGIDO)

Bloqueios implementados para todas as páginas privadas.

### ✅ Landing Pages (SIMPLIFICADO)

- Arquivos `.md` removidos de `/src/pages/lp/`
- Template e roteamento A/B removidos
- Meta `noindex` adicionado em todas as LPs

### ✅ Structured Data (IMPLEMENTADO)

JSON-LD implementado nas páginas principais:
- `/` (Home) - Organization, WebSite, WebPage
- `/vendas-sem-segredos` - Course com ofertas e ratings
- `/services` - Service com catálogo de pacotes
- `/advisory` - Service com modalidades
- `/blog/[slug]` - BlogPosting (já existia)

---

## Próximos Passos

### ✅ 1. noindex nas páginas privadas (CONCLUÍDO)

Todas as páginas privadas agora têm `noIndex={true}` no Layout:
- `/apresentacao` ✅
- `/advisory-aplicacao`, `/advisory-obrigado` ✅
- `/diagnostico-resultado`, `/diagnostico-obrigado` ✅
- `/agendamento-sessao`, `/agendar-services` ✅
- `/vss-aguardando-pagamento`, `/vss-analise-credito`, `/vss-compra-aprovada` ✅
- `/links` ✅
- `/lp/vss` ✅

### ✅ 2. Structured Data (JSON-LD) - IMPLEMENTADO

Implementado em: `/`, `/vendas-sem-segredos`, `/services`, `/advisory`

#### Home (`/`)

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://joelburigo.com.br/#organization",
      "name": "Joel Burigo",
      "url": "https://joelburigo.com.br",
      "logo": "https://joelburigo.com.br/images/logo.png",
      "founder": {
        "@type": "Person",
        "name": "Joel Burigo"
      },
      "sameAs": [
        "https://linkedin.com/in/joelburigo",
        "https://instagram.com/joelburigo"
      ]
    },
    {
      "@type": "WebSite",
      "@id": "https://joelburigo.com.br/#website",
      "url": "https://joelburigo.com.br",
      "name": "Joel Burigo - Vendas Escaláveis",
      "publisher": {"@id": "https://joelburigo.com.br/#organization"}
    }
  ]
}
```

#### VSS (`/vendas-sem-segredos`)

```json
{
  "@context": "https://schema.org",
  "@type": "Course",
  "name": "Vendas Sem Segredos",
  "description": "Programa de 90 dias para estruturar vendas escaláveis com Framework 6Ps",
  "provider": {
    "@type": "Organization",
    "name": "Joel Burigo"
  },
  "offers": {
    "@type": "Offer",
    "price": "1997",
    "priceCurrency": "BRL"
  },
  "hasCourseInstance": {
    "@type": "CourseInstance",
    "courseMode": "online",
    "duration": "P90D"
  }
}
```

#### Services (`/services`)

```json
{
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Implementation Services",
  "description": "Implementação guiada dos 6Ps - Done With You",
  "provider": {
    "@type": "Organization",
    "name": "Joel Burigo"
  },
  "serviceType": "Consultoria de Vendas"
}
```

#### Blog Posts

```json
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "{{title}}",
  "author": {
    "@type": "Person",
    "name": "Joel Burigo"
  },
  "datePublished": "{{date}}",
  "image": "{{image}}",
  "publisher": {
    "@type": "Organization",
    "name": "Joel Burigo"
  }
}
```

### 3. Linkagem Interna

Links internos inseridos no corpo dos 12 posts do blog, com âncoras contextuais entre pilares/satélites e páginas core (VSS, Services, Advisory, Cases, Sobre).

### 4. Breadcrumbs

Breadcrumbs visuais + JSON-LD implementados nas páginas internas indexáveis (core, blog, contato, diagnóstico, jornada-90-dias, press-kit, privacidade e termos).

#### Páginas Core (devem linkar entre si)

```
Home ←→ Sobre ←→ VSS ←→ Services ←→ Advisory ←→ Cases
           ↓
         Blog (hub de conteúdo)
```

#### Topic Clusters no Blog

**Cluster: Framework 6Ps**
- Pilar: `/blog/6ps-vendas-escalaveis-guia-completo`
- Satélites:
  - `/blog/posicionamento-diferencial-unico` (P1)
  - `/blog/icp-cliente-ideal-perfil` (P2)
  - `/blog/crm-gratuito-vs-profissional` (P4)
  - `/blog/metricas-vendas-essenciais` (P5)
  - `/blog/trafego-pago-vs-prospecao-ativa` (P4)

**Cluster: História/Credibilidade**
- `/blog/do-barraco-ao-milhao`
- `/blog/17-anos-estruturando-vendas-historia-completa`
- Links para `/sobre`

**Cluster: Conversão**
- `/blog/sistema-melhor-que-improviso` → `/vendas-sem-segredos`
- `/blog/agencia-vs-autonomia` → `/services`
- `/blog/de-10k-para-100k-por-mes` → `/advisory`

### 4. Meta Tags por Página

| Página | Title (60 chars) | Description (155 chars) |
|--------|------------------|-------------------------|
| `/` | Joel Burigo - Vendas Escaláveis para MPEs | Estruture vendas previsíveis em 90 dias. Framework 6Ps testado em 140+ empresas. DIY, DWY ou Mentoria 1:1. |
| `/vendas-sem-segredos` | VSS: Sistema de Vendas em 90 Dias \| Joel Burigo | Programa completo com CRM, mentorias semanais e Framework 6Ps. De vendas aleatórias para previsíveis. R$ 1.997. |
| `/services` | Implementation Services \| Joel Burigo | Implementação guiada dos 6Ps. Minha equipe faz junto com você. 4-6 meses para sistema completo. |
| `/advisory` | Advisory 1:1 \| Joel Burigo | Mentoria estratégica direto comigo. Sessões mensais + WhatsApp para decisões críticas. |
| `/sobre` | Sobre Joel Burigo \| 17 Anos Estruturando Vendas | De barraco em 2012 a 140+ clientes. Conheça a história e o Framework 6Ps. |
| `/cases` | Cases de Sucesso \| Joel Burigo | Resultados reais: R$ 160k → R$ 1M/mês. Veja como empresas estruturaram vendas. |
| `/blog` | Blog \| Vendas Escaláveis \| Joel Burigo | Artigos práticos sobre vendas, marketing e crescimento para MPEs. |

---

## Checklist de Implementação

### Imediato (Crítico) - ✅ CONCLUÍDO

- [x] Atualizar filter do sitemap em `astro.config.mjs`
- [x] Atualizar `public/robots.txt`
- [x] Adicionar `<meta name="robots" content="noindex">` nas LPs
- [x] Remover arquivos `.md` em `/lp/` que geravam páginas fantasma

### Curto Prazo (SEO) - ✅ CONCLUÍDO

- [x] Criar componente `JsonLd.astro` reutilizável
- [x] Implementar JSON-LD na Home
- [x] Implementar JSON-LD nas páginas de produto (VSS, Services, Advisory)
- [x] Implementar JSON-LD nos posts do blog (já existia)

### Médio Prazo (Conteúdo)

- [x] Revisar meta descriptions de todas as páginas
- [x] Implementar linkagem interna nos posts do blog
- [x] Criar breadcrumbs nas páginas internas
- [x] Adicionar canonical tags nas LPs

### Monitoramento

- [ ] Configurar Google Search Console
- [ ] Verificar indexação após deploy
- [ ] Monitorar Core Web Vitals
- [ ] Acompanhar posições das palavras-chave principais

---

## Palavras-chave Alvo

| Keyword | Volume | Página Alvo |
|---------|--------|-------------|
| vendas escaláveis | médio | Home, VSS |
| estruturar vendas | médio | VSS, Blog |
| consultoria de vendas | alto | Services |
| mentoria de vendas | médio | Advisory |
| framework 6ps | baixo (branded) | Blog pilar |
| crm para pequenas empresas | alto | Blog |
| como aumentar vendas | alto | Blog |

---

**Documento:** Inventário de Páginas Públicas
**Versão:** 2.0
**Próxima revisão:** Após implementação do checklist
