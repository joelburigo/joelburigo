---
name: Plano de Refactor VSS + Conteúdo
description: Refactor 2.0 concluído — Opção A (4 partes núcleo + recursos), 2 produtos perpétuos (VSS + Advisory), centralização /brand em /conteudo, box Investimento aplicado no site, GTM/execução de lançamento arquivados
status: CONCLUÍDO — 2026-04-22
data: 2026-04-22
---

## Resultado final

```
docs/conteudo/
├── partes/        01-marca · 02-oferta · 03-programa-vss · 04-playbook-vss
├── recursos/      copy-bank · templates · scripts-videos
├── brand/         design system v3 Terminal Growth
├── marketing/     calendario.md + posts/
└── _archive/      14 arquivos preservados (reversíveis)
```

## Progresso

### Fase 1 — Estrutura (concluída)
- [x] Estrutura de pastas criada
- [x] `/brand/` movido para `/docs/conteudo/brand/`
- [x] `marketing/calendario.md` + `marketing/posts/` criados
- [x] `parte*.md` ativos movidos para `partes/`

### Fase 2 — Reescritas e consolidações (concluída via 5 agents paralelos)
- [x] **P3 consolidado** → `04-playbook-vss.md` (8 arquivos viraram 1, 86 KB / 1959 linhas, 66 destravamentos práticos)
- [x] **P8 reescrito** → 2 produtos (VSS + Advisory), Services removido
- [x] **P5 reescrito** → GTM evergreen perpétuo (depois descontinuado/arquivado a pedido)
- [x] **P4/P6/P11/P12 limpos** — Services e linguagem de lançamento removidos
- [x] **Box Investimento aplicado** em `VSSPage.astro`, `VSSLandingPage.astro`, `VSSInvestimentoSlide.astro` — `npx astro check` 0 errors

### Fase 3 — Consolidação Opção A (concluída)
- [x] **02-oferta.md** ← merge P8 + P10 (546 linhas, dedup eliminada)
- [x] **03-programa-vss.md** ← merge P1 + P2 + P4 (1026 linhas, ~58% redução por dedup, substância preservada)
- [x] **01-marca.md** ← rename P7
- [x] **04-playbook-vss.md** ← rename do consolidado
- [x] **recursos/** criado: `copy-bank.md` (P12), `templates.md` (P11), `scripts-videos.md` (P13)
- [x] **P5 arquivado** (a pedido, não entrou no núcleo)
- [x] **P10 fix:** menção residual a Services removida (linha 488)
- [x] **README.md, CLAUDE.md, .dockerignore** atualizados

## Pendências de revisão (não bloqueantes)

Itens que os agents flagged pra você confirmar quando quiser:

1. **02-oferta.md** — proporção VSS/Advisory esforço (~90/10) vs receita (~57/43); meta "300+ alunos/ano VSS" no modelo perpétuo.
2. **03-programa-vss.md** — 2 notas inline `> _Nota: precisa confirmação_` em 03.5.3 (% beta + taxa esperada 70%+); "60 vs 66 aulas" ajustado para "~66".
3. **Site:** "Lote Fundador: primeiros 100 alunos" em VSSLandingPage (linguagem de lançamento residual); menções a "Services" no FAQ do VSSPage; "Economia 84,5%" vs "88%" inconsistente entre as 2 páginas.
4. **P6 (execução)** arquivado por ser todo lançamento/CPL — reescrita evergreen pendente quando fizer sentido.
5. **TBDs no P5 arquivado** — caso reaproveite alguma parte: dia/hora mentoria semanal, fuso, política de férias/feriados, ticket Advisory exato, modelo Clube VSS pós-12 meses.

## Sobre o `_archive/`

14 arquivos preservados via `git mv` (histórico Git intacto). Após 30–60 dias sem uso, podem ser deletados definitivamente.

---


# Plano de Refactor — VSS + Conteúdo + Marca

## Contexto

Sessão de trabalho em que definimos:

1. **Não gravar as 66 aulas do VSS** — reposicionar o item "15 módulos + 66 aulas" como Sistema VSS Implementável (playbook + 15 vídeos-âncora curtos + mentorias ao vivo)
2. **Simplificar para 2 produtos** — VSS + Advisory. Services sai.
3. **Produtos perpétuos** — sem lançamentos, funil evergreen, mentorias em ciclo rotativo
4. **Centralizar tudo em `/docs/conteudo/`** — incluir `/brand/` dentro
5. **Minimizar arquivos** — consolidar playbooks/scripts ao mínimo necessário
6. **Criar `/docs/conteudo/marketing/`** — pasta mínima para produção de posts IG, apresentações, etc.

Regra guia: `/docs/conteudo/` é fonte da verdade. Nenhum arquivo é deletado sem aviso — tudo vai pra `_archive/` antes.

---

## Parte A — Rascunho do box "Investimento" (página VSS)

### Diagnóstico da oferta atual

| Item | Valor | Depende de gravar? |
|---|---|---|
| 15 módulos + 66 aulas (vitalício) | R$ 1.997 | Sim |
| Growth CRM (12 meses) | R$ 6.996 | Não |
| 48 mentorias ao vivo (60 min) | R$ 7.200 | Não |
| Templates, scripts, recursos | R$ 497 | Não |
| Comunidade (90 dias) | R$ 597 | Não |
| **Total empilhado** | **R$ 17.287** | |

Só 11,5% da oferta empilhada depende de vídeos gravados. 88,5% já funciona sem gravar nada.

### Mudanças propostas (mesmos valores, linguagem diferente)

| Antes | Depois |
|---|---|
| 15 módulos + 66 aulas (acesso vitalício) — R$ 1.997 | **Sistema VSS Implementável** (playbook digital + 15 vídeos-âncora + acesso vitalício) — R$ 1.997 |
| Growth CRM completo (12 meses) — R$ 6.996 | *igual* |
| 48 mentorias ao vivo (60 min cada) — R$ 7.200 | **48 mentorias ao vivo com Joel** (1/semana, 60 min — aprofundamento guiado dos 15 módulos) — R$ 7.200 |
| Templates, scripts e recursos — R$ 497 | *igual* |
| Comunidade exclusiva (90 dias) — R$ 597 | *igual* |
| Bônus: 48 gravações + planilhas + biblioteca de objeções | **Bônus:** biblioteca evergreen de mentorias gravadas + planilhas + biblioteca de objeções |

### Copy de headline sugerida (acima do box)

> **Um sistema pra implementar — não mais um curso pra maratonar.**
> Playbook digital navegável, 15 vídeos-âncora (um por módulo) e 48 mentorias ao vivo com o Joel. Cada aula vira ação em 15–20 minutos, direto no seu negócio.

### Justificativa

1. "Sistema VSS Implementável" tira expectativa de maratonar vídeo e cria identidade de produto
2. "playbook digital + 15 vídeos-âncora" deixa claro que tem vídeo (curto, 1 por módulo), sem prometer 66 aulas gravadas
3. "acesso vitalício" permanece — agora vitalício ao playbook + vídeos-âncora + atualizações
4. "aprofundamento guiado dos 15 módulos" conecta explicitamente mentoria ↔ módulo
5. Bônus troca "48 gravações" por "biblioteca evergreen de mentorias gravadas" — reforça o perpétuo

### Arquivos a sincronizar quando aplicar

- `src/components/pages/VSSPage.astro` (linhas 690–770 aprox)
- `src/components/pages/VSSLandingPage.astro`
- `src/components/presentation/slides/vss/VSSInvestimentoSlide.astro`

---

## Parte B — Plano de consolidação

### B1) Cortar Services (2 produtos: VSS + Advisory)

**Impacto em `/docs/conteudo/`:**
- `parte9-services.md` → arquivar em `_archive/` (reversível)
- `parte8-ecossistema-produtos.md` → reescrever versão 2 produtos
- `parte4-diferenciacao.md`, `parte5-go-to-market.md`, `parte6-execucao.md`, `parte11-deliverables-templates.md`, `parte12-banco-recursos-copy.md` → revisões pontuais pra remover menções a Services

**Impacto no site:** auditar rotas/componentes Services e propor redirect → VSS ou remoção.

### B2) Perpétuo sem lançamentos

**O que muda:**
- `parte5-go-to-market.md` reescrita: GTM perpétuo (funil evergreen, tráfego contínuo, conteúdo orgânico, webinar automatizado) — sai o lançamento de R$ 5.000 / CPL
- 48 mentorias viram rolling 12 meses a partir da compra. Aluno entra qualquer dia; ciclo temático anual se repete.
- Página VSS: remover linguagem de "turma X", "próxima abertura". Substituir por "entre hoje, primeira mentoria na próxima [dia da semana]"

### B3) Minimizar playbooks/scripts (23 arquivos → ~11)

| Hoje | Depois |
|---|---|
| `parte3-roteiro-aulas.md` + `parte3-aulas-fase[1–7].md` (8 arquivos) | `parte3-playbook-vss.md` (1 arquivo com os 15 módulos × destravamentos) |
| `parte13-scripts-videos.md` + `parte13-scripts-videos-fala-pura.md` | `parte13-scripts-videos.md` (1 arquivo, 4 scripts: Home, VSS, Advisory, Sobre) |
| `parte9-services.md` | `_archive/parte9-services.md` |
| `parte11-deliverables-templates.md` | mantém mas passa revisão pra cortar templates desnecessários (Joel decide quais) |
| Demais (P1, P2, P4, P5, P6, P7, P8, P10, P12) | mantém com revisões pontuais |

Nada é perdido: o que sai vai pra `_archive/`.

### B4) Mover `/brand/` → `/docs/conteudo/brand/`

**Conteúdo a mover:** `colors_and_type.css`, `homepage.html`, `ig_posts.html`, `v3_terminal_growth.html`, `README.md`, `SKILL.md`, `assets/`, `preview/`.

**Cuidados:**
- Verificar se alguma skill/referência do Claude aponta pro path `/brand/` antes de mover
- Não é consumido pelo site Astro em runtime — só referência visual, então mover não quebra build

### B5) `/docs/conteudo/marketing/` — estrutura mínima

```
docs/conteudo/marketing/
├── calendario.md         (1 arquivo — o que sai, quando, onde)
└── posts/                (1 pasta — um .md por peça; IG, email, anúncio tudo junto)
```

Cada peça tem frontmatter com canal (`canal: instagram-carrossel`). Se crescer muito, subdivide depois.

---

## Estrutura final proposta

```
docs/conteudo/
├── README.md                           (atualizado)
├── parte1-fundamentos.md
├── parte2-arquitetura.md
├── parte3-playbook-vss.md              ← 8 arquivos viram 1
├── parte4-diferenciacao.md             (revisar menções Services)
├── parte5-go-to-market.md              ← REESCRITA (perpétuo)
├── parte6-execucao.md                  (revisar)
├── parte7-branding-joel-burigo.md
├── parte8-ecossistema-produtos.md      ← REESCRITA (2 produtos)
├── parte10-advisory.md                 (revisar)
├── parte11-deliverables-templates.md   (enxugar)
├── parte12-banco-recursos-copy.md      (revisar)
├── parte13-scripts-videos.md           ← consolidado, sem Services
├── brand/                              ← vindo de /brand/
├── marketing/                          ← novo
│   ├── calendario.md
│   └── posts/
└── _archive/
    ├── parte9-services.md
    ├── parte13-scripts-videos-fala-pura.md
    ├── parte3-roteiro-aulas.md
    └── parte3-aulas-fase[1-7].md
```

---

## Ordem de execução proposta (reversível)

1. Criar `_archive/` e mover arquivos sem deletar
2. Mover `/brand/` → `/docs/conteudo/brand/` (git mv, ajustar refs internas)
3. Consolidar P3 (ler 8 arquivos, escrever `parte3-playbook-vss.md`, validar antes de arquivar originais)
4. Consolidar P13 (scripts)
5. Reescrever P8 (2 produtos) e P5 (perpétuo) — mostrar diff conceitual antes
6. Revisões pontuais (P4, P6, P11, P12) pra limpar Services/lançamento
7. Criar `marketing/` estrutura mínima
8. Atualizar `README.md` refletindo tudo
9. Aplicar rascunho do box "Investimento" (Parte A) no site

---

## 3 perguntas para destravar execução

1. **Services — arquivar ou deletar?** Recomendação: arquivar em `_archive/` por 30–60 dias antes de deletar definitivamente.
2. **Mentorias perpétuas — 1/semana em dia fixo?** Ou modelo rotativo mais flexível? Se fixo, qual dia/horário?
3. **Ordem — começar por arquivamento + consolidação de conteúdo, ou aplicar o box "Investimento" no site antes como quick win?**
