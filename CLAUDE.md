# CLAUDE.md — joelburigo-site

Site pessoal do Joel Burigo (Astro SSR). Categoria: **interno**.

## Resumo

| Item | Valor |
|---|---|
| Cliente | Joel Burigo (proprio) |
| Producao | https://joelburigo.com.br |
| Stack | Astro SSR (Node 22) + Tailwind v4 |
| GitHub repo | `joelburigo/joelburigo-site` |
| Imagem Docker | `ghcr.io/joelburigo/joelburigo-site:latest` |
| Container no compose | `joelburigo-site` (porta 4321) |
| Banco | nao usa |
| Email | Stalwart Mail + Brevo relay |

## Estrutura do repo — 2 camadas

```
joelburigo-site/
├── docs/conteudo/     ← Fonte única: estratégia, copy, marca, marketing
│   ├── partes/        4 partes núcleo:
│   │                  01-marca · 02-oferta · 03-programa-vss · 04-playbook-vss
│   ├── recursos/      copy-bank · templates · scripts-videos
│   ├── brand/         Direção visual (Terminal Growth)
│   │                  HTML/CSS puro, tokens --jb-*, preview/index.html navegável
│   ├── marketing/     Produção de peças (posts IG, emails, apresentações)
│   │                  calendario.md + posts/
│   └── _archive/      Desativados reversíveis (ex: Services, GTM lançamento)
└── src/               ← Produção Astro (o que é servido em joelburigo.com.br)
    ├── data/          cases.ts · contact.ts · testimonials.ts
    ├── pages/         páginas do site
    ├── components/    componentes reutilizáveis
    └── styles/        global.css (Tailwind v4 @theme)
```

Antes de criar copy ou componente, **consulte `docs/conteudo/README.md`** (índice único de conteúdo + marca). Não invente tom, vocabulário ou cases.

## Produtos ativos

- **VSS — Vendas Sem Segredos** (DIY perpétuo, R$ 1.997) — principal
- **Advisory** (1:1 com Joel) — exclusivo

Services foi descontinuado (arquivado em `docs/conteudo/_archive/parte9-services.md`).

## Direção atual

- **Visual:** Terminal Growth — fire `#FF3B0F` + acid `#C6FF00` sobre preto `#050505`, Archivo Black + JetBrains Mono. Ver `docs/conteudo/brand/README.md`.
- **Produção ainda usa tokens antigos** (royal-blue + lime, Montserrat + Inter). Migração do `src/styles/global.css` pro Terminal Growth está pendente.

## Deploy

`git push main` → GH Actions builda → push pra `ghcr.io/joelburigo/joelburigo-site:latest` → Watchtower puxa em ate 60s. Workflow: `.github/workflows/deploy.yml`.

`docs/` fica fora do build Docker via `.dockerignore` (Astro só processa `src/` + `public/` mesmo).

## Comandos no servidor

```bash
ssh joel@prod-01
sudo docker compose -f /mnt/data/docker-compose.yml logs -f joelburigo-site
sudo restore-app.sh joelburigo-site latest
```

## Contexto da infra completa

Este projeto faz parte do ecossistema Hetzner do Joel. Para detalhes da infra (compose, backup, traefik, n8n, restricoes), ver:

**`~/Documents/Dev/growth-infra/CLAUDE.md`** e **`~/Documents/Dev/growth-infra/PROJECTS.md`**.
