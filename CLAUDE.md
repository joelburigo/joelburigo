# CLAUDE.md — joelburigo-site

Site pessoal do Joel Burigo (Astro SSR). Categoria: **interno**.

## Resumo

| Item | Valor |
|---|---|
| Cliente | Joel Burigo (proprio) |
| Producao | https://joelburigo.com.br |
| Stack | Astro SSR (Node 22) |
| GitHub repo | `joelburigo/joelburigo-site` |
| Imagem Docker | `ghcr.io/joelburigo/joelburigo-site:latest` |
| Container no compose | `joelburigo-site` (porta 4321) |
| Banco | nao usa |
| Email | Stalwart Mail + Brevo relay |

## Deploy

`git push main` → GH Actions builda → push pra `ghcr.io/joelburigo/joelburigo-site:latest` → Watchtower puxa em ate 60s. Workflow: `.github/workflows/deploy.yml`.

## Comandos no servidor

```bash
ssh joel@prod-01
sudo docker compose -f /mnt/data/docker-compose.yml logs -f joelburigo-site
sudo restore-app.sh joelburigo-site latest
```

## Contexto da infra completa

Este projeto faz parte do ecossistema Hetzner do Joel. Para detalhes da infra (compose, backup, traefik, n8n, restricoes), ver:

**`~/Documents/Dev/growth-infra/CLAUDE.md`** e **`~/Documents/Dev/growth-infra/PROJECTS.md`**.
