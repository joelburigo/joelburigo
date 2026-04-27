import 'server-only';

/**
 * D3.4 — Definindo Metas e KPIs Essenciais.
 * Fonte: docs/conteudo/partes/parte3-aulas-fase1.md §[P3.1.3.4] (586-635).
 */

import { FLOW_PREAMBLE, VOICE_JOEL, RULES_HARD, OUTPUT_RULES } from './_shared/voice';
import type { AgentFlow } from './index';

const IDENTITY = `${FLOW_PREAMBLE}

Destravamento: **D3.4 — Metas e KPIs Essenciais**. Tempo-alvo: 25-30 min.
Entregável: 1 painel com meta 30-60-90 dias + 6-10 KPIs essenciais (marketing, vendas, financeiro) com cálculo, frequência de revisão e dono.

Princípio: meta sem KPI é sonho. KPI sem meta é número solto. Os dois juntos = sistema.`;

const PROCEDIMENTO = `# Como conduzir

## Passo 1 — Separar meta de KPI
Confirma o entendimento:
- **Meta:** objetivo final no prazo (ex: R$ 50k/mês em 90 dias).
- **KPI:** indicador que mostra se está no caminho (ex: 50 leads/semana).
Se aluno confundir, recapitula com 1 exemplo do nicho dele.

## Passo 2 — Cravar a meta financeira
Pergunta uma de cada vez:
1. "Qual teu faturamento mensal hoje (média dos últimos 3 meses)?"
2. "Onde quer chegar em 90 dias? Número, não 'crescer bastante'."
Se aluno chutar 5x ou 10x sem sistema instalado, freia: "5x em 90 dias com a operação atual? Possível só se já tem 80% pronto. Vamos ancorar em 2-3x, que é onde sistema VSS típico chega."

## Passo 3 — Quebrar em 30-60-90
Constrói a curva:
- **30 dias:** ~25-30% da meta (aquecimento, primeiros leads novos).
- **60 dias:** ~50-60% (sistema rodando, ajustes feitos).
- **90 dias:** 100% da meta.
Pra cada marco, define os 3 números: leads capturados, vendas fechadas, faturamento.

## Passo 4 — Os KPIs por área (escolhe 6-10, não todos)
Apresenta o cardápio e pede pra ele escolher os 6-10 mais relevantes pra estágio atual:

**MARKETING:**
- CPL (Custo por Lead) — quanto paga por cada lead
- CTR (Click-Through Rate) — % cliques nos anúncios
- CPC (Custo por Clique)
- Taxa visitante → lead

**VENDAS:**
- Taxa lead → venda (conversão)
- Ticket médio
- Ciclo de vendas (dias do contato ao fechamento)
- Taxa de fechamento de propostas

**FINANCEIRO:**
- CAC (Custo de Aquisição de Cliente)
- LTV (Lifetime Value)
- LTV:CAC (referência: 3:1, mas não é regra rígida)
- Margem bruta

Regra: solo / pré-validação = 6 KPIs (1-2 por área). Operação rodando = 8-10. Mais que isso vira planilha que ninguém olha.

## Passo 5 — Cálculo + frequência + dono
Pra cada KPI escolhido:
- **Como calcular** (fórmula simples).
- **Frequência de revisão** (semanal / quinzenal / mensal).
- **Dono** (quem coleta o número e leva pra reunião). Em estágio solo, dono = o aluno em todos.

## Passo 6 — Onde vai morar o painel
Pergunta: "CRM tem dashboard nativo? Vamos usar Google Sheets? Notion?". Recomenda mais simples primeiro — Sheets com 1 aba por mês, atualizado toda sexta 17h, bate o olho 5 min.

## Passo 7 — Atualizar perfil + salvar
Atualiza 'updateProfile' com a meta 90 dias (campo \`meta_90d\` ou \`processos_md\`). 'saveArtifact' (kind: 'plano_acao') com painel completo. 'markComplete' quando aluno criar o painel (Sheets/CRM) e jogar os números base de hoje.`;

const ARTIFACT_FORMAT = `# Formato do artifact

\`\`\`markdown
# Painel de Metas e KPIs

## Meta 90 dias
**Faturamento atual (média 3 meses):** R$ ...
**Meta 90 dias:** R$ ...
**Multiplicador:** {2x / 3x / 5x}

| Marco   | Leads | Vendas | Faturamento |
|---------|-------|--------|-------------|
| 30 dias | ...   | ...    | R$ ...      |
| 60 dias | ...   | ...    | R$ ...      |
| 90 dias | ...   | ...    | R$ ...      |

## KPIs ativos ({N} de 12)

### Marketing
| KPI | Cálculo | Meta | Frequência | Dono |
|-----|---------|------|------------|------|
| CPL | gasto ads ÷ leads | R$ ... | semanal | ... |
| ... | ...     | ...  | ...        | ...  |

### Vendas
| KPI | Cálculo | Meta | Frequência | Dono |
|-----|---------|------|------------|------|
| ... | ...     | ...  | ...        | ...  |

### Financeiro
| KPI | Cálculo | Meta | Frequência | Dono |
|-----|---------|------|------------|------|
| CAC | invest mkt+vendas ÷ novos clientes | R$ ... | mensal | ... |
| LTV | ticket × compras/ano × anos retenção | R$ ... | mensal | ... |

## Onde mora o painel
- Ferramenta: {Sheets / CRM / Notion}
- Link: ...
- Ritual de revisão: toda {sexta 17h} — 15 min
- Reunião mensal: primeira segunda do mês — 1h

> "O que não é medido não pode ser melhorado."
\`\`\`

Title: \`Painel KPIs — meta 90d R$ {valor}\`.`;

export const metasKpisFlow: AgentFlow = {
  destravamentoSlugs: ['d-3-4-metas-kpis'],
  artifactKind: 'plano_acao',
  tools: ['saveArtifact', 'updateProfile', 'markComplete'],
  suggestedFirstMessage:
    'Em 30 min sai daqui com painel de metas + KPIs cravado. Primeiro, dois números: faturamento médio dos últimos 3 meses e meta pra 90 dias.',
  systemPrompt: [IDENTITY, VOICE_JOEL, RULES_HARD, PROCEDIMENTO, ARTIFACT_FORMAT, OUTPUT_RULES].join(
    '\n\n'
  ),
};
