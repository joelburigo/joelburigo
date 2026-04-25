# Conteúdo — Joel Burigo

**Fonte única** do ecossistema Joel Burigo: estratégia, oferta, programa, marca e marketing.

**Versão:** 2.0 — refactor concluído (Opção A: 4 partes núcleo + recursos).

---

## Estrutura

```
docs/conteudo/
├── README.md              ← este arquivo
├── _plano-refactor.md     ← histórico do refactor 2.0
├── partes/                ← 4 partes núcleo
├── recursos/              ← copy bank + templates + scripts
├── brand/                 ← design system (Terminal Growth)
├── marketing/             ← produção de peças (posts, emails, decks)
└── _archive/              ← versões anteriores (reversíveis)
```

---

## Partes núcleo (`partes/`)

| #      | Arquivo                                         | Conteúdo                                                                                                                                  | Substitui       |
| ------ | ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| **01** | [01-marca.md](partes/01-marca.md)               | Branding Joel Burigo: história, manifesto, tom de voz, vocabulário, os 7 inimigos, movimento Máquina de Crescimento                       | P7              |
| **02** | [02-oferta.md](partes/02-oferta.md)             | Ecossistema completo — VSS (R$ 1.997 perpétuo) + Advisory (R$ 997–15.000/mês). Visão, formatos, jornada, projeções, marketing por produto | P8 + P10        |
| **03** | [03-programa-vss.md](partes/03-programa-vss.md) | Programa VSS — visão estratégica, Framework 6Ps, arquitetura 15 módulos / 90 dias, Growth CRM como diferencial, garantia                  | P1 + P2 + P4    |
| **04** | [04-playbook-vss.md](partes/04-playbook-vss.md) | Playbook implementável — 7 fases, 15 módulos, 66 destravamentos práticos (15-20 min cada)                                                 | P3 (8 arquivos) |

---

## Recursos (`recursos/`)

Utilitários reutilizáveis em marketing, vendas e conteúdo.

- [copy-bank.md](recursos/copy-bank.md) — frases, jargões, objeções, transformações, urgência, prova social _(ex-P12)_
- [templates.md](recursos/templates.md) — canvas, relatórios, playbooks comerciais _(ex-P11)_
- [scripts-videos.md](recursos/scripts-videos.md) — scripts de vídeo das páginas principais _(ex-P13)_

---

## Marca (`brand/`)

Design system Terminal Growth — cores, tipografia, componentes HTML/CSS preview. Ver [brand/README.md](brand/README.md) e [brand/SKILL.md](brand/SKILL.md).

---

## Marketing (`marketing/`)

- [calendario.md](marketing/calendario.md) — agenda editorial única
- `posts/` — peças produzidas (1 arquivo por peça, frontmatter define canal)

---

## Produtos ativos

| Produto      | Modelo                                                   | Investimento             | Para quem                  |
| ------------ | -------------------------------------------------------- | ------------------------ | -------------------------- |
| **VSS**      | DIY perpétuo (playbook + mentorias ao vivo + Growth CRM) | R$ 1.997 (12x R$ 166,42) | Faturamento R$ 10–100k/mês |
| **Advisory** | 1:1 com Joel — Sessão / Sprint / Conselho                | R$ 997 – R$ 15.000/mês   | Faturamento R$ 200k+/mês   |

Services foi descontinuado (`_archive/parte9-services.md`).

---

## `_archive/`

Versões anteriores preservadas:

- `parte1-fundamentos.md`, `parte2-arquitetura.md`, `parte4-diferenciacao.md` — consolidados em `partes/03-programa-vss.md`
- `parte3-aulas-fase[1-7].md` + `parte3-roteiro-aulas.md` — consolidados em `partes/04-playbook-vss.md`
- `parte5-go-to-market.md` — GTM evergreen reescrito; depois descontinuado da estrutura núcleo
- `parte6-execucao.md` — baseado em lançamento; reescrita evergreen pendente quando necessário
- `parte8-ecossistema-produtos.md`, `parte10-advisory.md` — consolidados em `partes/02-oferta.md`
- `parte9-services.md` — produto descontinuado
- `parte13-scripts-videos-fala-pura.md` — duplicata consolidada

Reversíveis. Após 30–60 dias sem uso, podem ser deletados.

---

## Como usar

- **Para entender a oferta:** comece em `partes/02-oferta.md`
- **Para entender o programa VSS por dentro:** `partes/03-programa-vss.md` + `partes/04-playbook-vss.md`
- **Para escrever copy/posts:** puxe de `recursos/copy-bank.md` + `partes/01-marca.md` (tom, vocabulário)
- **Para produzir peças:** use `marketing/calendario.md` + nomeação `marketing/posts/`

---

**Última atualização:** 2026-04-22
