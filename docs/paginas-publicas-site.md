# Páginas Públicas do Site Joel Burigo

**Última atualização:** 24 de janeiro de 2026  
**Total:** 29 páginas + 11 posts de blog = **40 URLs públicas**

---

## PÁGINAS PRINCIPAIS

| # | URL | Arquivo | Descrição |
|---|-----|---------|-----------|
| 1 | `/` | [index.astro](../src/pages/index.astro) | Home |
| 2 | `/sobre` | [sobre.astro](../src/pages/sobre.astro) | Sobre Joel Burigo |
| 3 | `/services` | [services.astro](../src/pages/services.astro) | Services (DWY) |
| 4 | `/advisory` | [advisory.astro](../src/pages/advisory.astro) | Advisory 1:1 |
| 5 | `/vendas-sem-segredos` | [vendas-sem-segredos.astro](../src/pages/vendas-sem-segredos.astro) | VSS (DIY) |
| 6 | `/cases` | [cases.astro](../src/pages/cases.astro) | Cases de Sucesso |
| 7 | `/apresentacao` | [apresentacao.astro](../src/pages/apresentacao.astro) | Apresentação/Pitch |

---

## UTILITÁRIAS

| # | URL | Arquivo | Descrição |
|---|-----|---------|-----------|
| 8 | `/contato` | [contato.astro](../src/pages/contato.astro) | Formulário de Contato |
| 9 | `/links` | [links.astro](../src/pages/links.astro) | Links Úteis (Linktree) |
| 10 | `/press-kit` | [press-kit.astro](../src/pages/press-kit.astro) | Press Kit |
| 11 | `/design-system` | [design-system.astro](../src/pages/design-system.astro) | Design System (interno) |

---

## LEGAIS

| # | URL | Arquivo | Descrição |
|---|-----|---------|-----------|
| 12 | `/privacidade` | [privacidade.astro](../src/pages/privacidade.astro) | Política de Privacidade |
| 13 | `/termos` | [termos.astro](../src/pages/termos.astro) | Termos de Uso |

---

## DIAGNÓSTICO/ADVISORY

| # | URL | Arquivo | Descrição |
|---|-----|---------|-----------|
| 14 | `/diagnostico` | [diagnostico.astro](../src/pages/diagnostico.astro) | Formulário Diagnóstico |
| 15 | `/diagnostico-resultado` | [diagnostico-resultado.astro](../src/pages/diagnostico-resultado.astro) | Resultado Diagnóstico |
| 16 | `/diagnostico-obrigado` | [diagnostico-obrigado.astro](../src/pages/diagnostico-obrigado.astro) | Obrigado Diagnóstico |
| 17 | `/advisory-aplicacao` | [advisory-aplicacao.astro](../src/pages/advisory-aplicacao.astro) | Aplicação Advisory |
| 18 | `/advisory-obrigado` | [advisory-obrigado.astro](../src/pages/advisory-obrigado.astro) | Obrigado Advisory |

---

## AGENDAMENTOS

| # | URL | Arquivo | Descrição |
|---|-----|---------|-----------|
| 19 | `/agendamento-sessao` | [agendamento-sessao.astro](../src/pages/agendamento-sessao.astro) | Agendar Sessão |
| 20 | `/agendar-services` | [agendar-services.astro](../src/pages/agendar-services.astro) | Agendar Services |

---

## VSS - CHECKOUT/OBRIGADO

| # | URL | Arquivo | Descrição |
|---|-----|---------|-----------|
| 21 | `/vss-aguardando-pagamento` | [vss-aguardando-pagamento.astro](../src/pages/vss-aguardando-pagamento.astro) | Aguardando Pagamento VSS |
| 22 | `/vss-analise-credito` | [vss-analise-credito.astro](../src/pages/vss-analise-credito.astro) | Análise de Crédito VSS |
| 23 | `/vss-compra-aprovada` | [vss-compra-aprovada.astro](../src/pages/vss-compra-aprovada.astro) | Compra Aprovada VSS |

---

## BLOG

| # | URL | Arquivo | Descrição |
|---|-----|---------|-----------|
| 24 | `/blog` | [blog/index.astro](../src/pages/blog/index.astro) | Listagem de Posts |
| 25 | `/blog/[slug]` | [blog/[slug].astro](../src/pages/blog/[slug].astro) | Template Post Individual |

### Posts Publicados (11)

1. `/blog/6ps-vendas-escalaveis-guia-completo` - Framework dos 6Ps completo
2. `/blog/agencia-vs-autonomia` - Comparativo agência vs sistema próprio
3. `/blog/como-estruturar-vendas-do-zero` - Guia prático estruturação vendas
4. `/blog/crm-gratuito-vs-profissional` - Comparativo CRMs
5. `/blog/de-10k-para-100k-por-mes` - Escalando faturamento
6. `/blog/do-barraco-ao-milhao` - História completa Joel Burigo
7. `/blog/icp-cliente-ideal-perfil` - Definindo ICP
8. `/blog/metricas-vendas-essenciais` - Métricas que importam
9. `/blog/posicionamento-diferencial-unico` - Como se posicionar
10. `/blog/sistema-melhor-que-improviso` - Filosofia sistema vs improviso
11. `/blog/trafego-pago-vs-prospecao-ativa` - Comparativo estratégias atração

---

## LANDING PAGES

| # | URL | Arquivo | Descrição |
|---|-----|---------|-----------|
| 26 | `/lp/vss` | [lp/vss/index.astro](../src/pages/lp/vss/index.astro) | LP VSS Principal |
| 27 | `/lp/vss/1` | [lp/vss/1.astro](../src/pages/lp/vss/1.astro) | LP VSS Variante A |

---

## PÁGINAS DE ERRO

| # | URL | Arquivo | Descrição |
|---|-----|---------|-----------|
| 28 | `/404` | [404.astro](../src/pages/404.astro) | Página Não Encontrada |
| 29 | `/500` | [500.astro](../src/pages/500.astro) | Erro do Servidor |

---

## APIS (Não Públicas)

- `/api/meta-conversion` - [api/meta-conversion.ts](../src/pages/api/meta-conversion.ts) - Meta Conversions API
- `/api/track` - [api/track.ts](../src/pages/api/track.ts) - Tracking interno

---

## Hierarquia de Navegação

### Funil Principal
```
Home (/) 
├── Sobre (/sobre)
├── Services (/services) → Agendar (/agendar-services)
├── Advisory (/advisory) → Aplicação (/advisory-aplicacao) → Obrigado (/advisory-obrigado)
├── VSS (/vendas-sem-segredos) → Checkout Hotmart → Status
│   ├── /vss-aguardando-pagamento
│   ├── /vss-analise-credito
│   └── /vss-compra-aprovada
├── Cases (/cases)
├── Blog (/blog)
└── Contato (/contato)
```

### Ferramentas Auxiliares
```
Diagnóstico (/diagnostico)
├── Resultado (/diagnostico-resultado)
└── Obrigado (/diagnostico-obrigado)

Apresentação (/apresentacao) - Slides para pitches

Press Kit (/press-kit) - Materiais de imprensa

Links (/links) - Linktree
```

### Landing Pages
```
/lp/vss/ - Landing pages VSS
├── index.astro - Versão principal
└── 1.astro - Variante A (testes)
```

---

## Notas de Manutenção

### Páginas Revisadas para Congruência (24/01/2026)

✅ **Revisão Completa:**
- Todas as páginas principais
- Todos os componentes home/pages/presentation
- 2 posts de blog (do-barraco-ao-milhao.md, como-estruturar-vendas-do-zero.md)
- Landing pages (via VSSLandingPage.astro)

📊 **Dados Padronizados:**
- Experiência: `17+ anos`
- Clientes: `140+`
- Faturamento: `~R$ 1 bilhão` ou `~R$1bi`
- História: `25 anos em março de 2012`

### Páginas que Precisam de SEO Review
- [ ] /design-system (página interna, adicionar noindex?)
- [ ] /links (avaliar se precisa canonical)
- [ ] Páginas de status VSS (noindex confirmado?)

### Próximas Ações Sugeridas
- [ ] Revisar restante dos posts de blog para consistência de dados
- [ ] Adicionar sitemap.xml automático
- [ ] Revisar robots.txt
- [ ] Adicionar structured data (JSON-LD) em todas as páginas principais
