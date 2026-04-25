# src/assets/

Fonte original (não pública) das imagens herdadas do site Astro.

## Por que existe

Imagens aqui **não são servidas direto pelo Next**. Pra aparecer no site, copia
pra `public/` (servido como estático) ou importa via `next/image` static import
(`import hero from '@/assets/images/hero.webp'`).

## Como usar

- **Imagem do site (já em produção):** copiar pra `public/images/<nome>.webp`
  e referenciar via URL (`/images/<nome>.webp`).
- **Imagens do blog (12 posts atuais):** ficam aqui em `images/blog/` até a
  migração do blog pro DB no Sprint 1, que faz `cp -R src/assets/images/blog/*
→ public/assets/images/blog/` preservando URLs relativas no markdown.

## Estrutura

```
src/assets/images/
├── blog/          # posts antigos com variantes responsivas (480/720/1080/1920w + .avif)
├── lp/            # imagens de landing pages
├── advisory-hero.{jpg,webp}
├── hero-bg-{640,1024,1920}w.webp + hero-bg.jpg
├── joel-burigo-vendas-sem-segredos-2-{480,800,1200}w.webp + .png + .avif
├── testimonial-{1,2,3}.{jpg,webp}
└── hotmart-payment-security.png
```
