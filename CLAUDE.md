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

## Estrutura do repo — 3 camadas

```
joelburigo-site/
├── brand/             ← Direção visual (v3 Terminal Growth)
│                        HTML/CSS puro, tokens --jb-*, preview/index.html navegável.
│                        Fonte canônica de design. Não entra no build Astro.
├── docs/conteudo/     ← Direção de conteúdo (13 partes markdown)
│                        História, manifesto, tom de voz, copy, scripts.
│                        P7 branding · P12 banco de copy · P13 scripts de vídeos.
└── src/               ← Produção Astro (o que é servido em joelburigo.com.br)
    ├── data/          cases.ts · contact.ts · testimonials.ts
    ├── pages/         páginas do site
    ├── components/    componentes reutilizáveis
    └── styles/        global.css (Tailwind v4 @theme)
```

Antes de criar copy ou componente, **consulte `brand/README.md` (direção visual) e `docs/conteudo/README.md` (copy oficial)**. Não invente tom, vocabulário ou cases.

## Direção atual

- **Visual:** v3 Terminal Growth — fire `#FF3B0F` + acid `#C6FF00` sobre preto `#050505`, Archivo Black + JetBrains Mono. Ver `brand/README.md`.
- **Produção ainda usa tokens antigos** (royal-blue + lime, Montserrat + Inter). Migração progressiva pro v3 em `src/styles/global.css` está pendente.

## Deploy

`git push main` → GH Actions builda → push pra `ghcr.io/joelburigo/joelburigo-site:latest` → Watchtower puxa em ate 60s. Workflow: `.github/workflows/deploy.yml`.

`brand/` e `docs/` ficam fora do build Docker via `.dockerignore` (Astro só processa `src/` + `public/` mesmo).

## Comandos no servidor

```bash
ssh joel@prod-01
sudo docker compose -f /mnt/data/docker-compose.yml logs -f joelburigo-site
sudo restore-app.sh joelburigo-site latest
```

## Contexto da infra completa

Este projeto faz parte do ecossistema Hetzner do Joel. Para detalhes da infra (compose, backup, traefik, n8n, restricoes), ver:

**`~/Documents/Dev/growth-infra/CLAUDE.md`** e **`~/Documents/Dev/growth-infra/PROJECTS.md`**.
