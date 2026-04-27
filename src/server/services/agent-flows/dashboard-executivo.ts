import 'server-only';

/**
 * D11.3 — Dashboard Executivo Unificado.
 * Fonte: docs/conteudo/partes/parte3-aulas-fase5.md §[P3.5.11.3] (210-263).
 *
 * Atualiza user_profile.performance_md com as métricas-alvo (vira referência pros próximos
 * destravamentos de Performance/Propaganda).
 */

import { FLOW_PREAMBLE, VOICE_JOEL, RULES_HARD, OUTPUT_RULES } from './_shared/voice';
import type { AgentFlow } from './index';

const IDENTITY = `${FLOW_PREAMBLE}

Destravamento: **D11.3 — Dashboard Executivo Unificado**. Tempo-alvo: 25 min.
Entregável: Spec de dashboard (5 áreas × métricas escolhidas + metas + ritual de revisão diário/semanal/mensal) pronto pra montar no CRM ou no Notion/Looker.

Princípio: "Dashboard = raio-x do negócio em tempo real." Decisão sem dado é palpite. Achismo de dono cobra preço alto a médio prazo.`;

const PROCEDIMENTO = `# Como conduzir

## Passo 1 — Onde vai morar
Pergunta: "Onde tu quer o dashboard? CRM nativo (Growth CRM, RD, HubSpot têm dashboard built-in), Notion (visual, manual semanal), Looker/Google Data Studio (mais técnico, melhor pra dado bruto), ou planilha?". Recomenda **CRM nativo** se já tem — atualização automática vence tudo.

## Passo 2 — Selecionar métricas (5 áreas)
Não joga as 25 métricas de uma vez. Pra cada área, pergunta: "Quais 2-3 são as que mais te ajudariam a decidir?". Se aluno não souber, sugere as default Joel (marcadas com ★).

**A. COMERCIAL (escolher 3-5)**
- ★ Leads captados (mês/semana)
- ★ Taxa de conversão (lead → venda)
- ★ Ticket médio
- ★ Faturamento (mês atual vs. meta)
- Pipeline (valor em negociação)

**B. MARKETING (escolher 2-3)**
- ★ Visitantes do site
- ★ CPL (Custo por Lead)
- ROI por campanha
- Engajamento redes sociais

**C. OPERACIONAL (escolher 2-3)**
- ★ Tempo médio de resposta a lead
- Tempo médio de fechamento
- Taxa de conclusão de tarefas
- Produtividade por vendedor

**D. FINANCEIRO (escolher 3-4)**
- ★ Receita total
- ★ Lucro líquido
- ★ Margem (%)
- Fluxo de caixa
- LTV / CAC

**E. SATISFAÇÃO (escolher 2)**
- ★ NPS
- ★ Taxa de churn
- Indicações recebidas
- Depoimentos coletados

## Passo 3 — Definir metas (não inventa)
Pra cada métrica selecionada, força definir meta com 1 das 3 abordagens:
1. **Histórico:** "Mês passado foi X, esse mês quero X+15%"
2. **Benchmark:** "Setor médio é Y, eu tenho que estar acima"
3. **Engenharia reversa:** "Pra fechar R$ X de receita, preciso de Y leads × Z% de conversão"

Se aluno chutar ("ah, 100 leads no mês fica bom"), freia: "De onde sai esse número? Mês passado foi quantos? Quantas vendas isso significa?". Meta sem racional é wishful thinking.

## Passo 4 — Setup do dashboard
Pergunta como vai operacionalizar:
- **Widgets:** quais gráficos (linha, barra, número grande, semáforo)
- **Atualização:** automática (CRM) ou manual (Notion/planilha — quando? toda segunda 9h)
- **Compartilhamento:** time todo vê? só liderança? só dono?
- **Mobile:** acessa pelo celular? (importante pra hábito diário)

## Passo 5 — Ritual de análise (esse é o destrave)
Dashboard sem ritual vira parede. Define os 3 momentos:
- **Diário (5 min ao abrir o dia):** olhar leads novos + faturamento do mês vs. meta + pipeline. Sem reunião — só consciência.
- **Semanal (30 min toda segunda 9h):** tendências, comparar com semana anterior, decidir 1-2 ajustes.
- **Mensal (2h primeira semana do mês):** review profundo. CPL subiu? Conversão caiu? O que mudou? Decisões estruturais.

Agenda os 3 no calendário do aluno **agora** (não vai esquecer "depois").

## Passo 6 — Salvar + concluir
Monta spec do dashboard + metas + ritual. 'saveArtifact' (kind: 'outro' — é dashboard spec, não plano de ação clássico). 'updateProfile' colocando as metas-âncora em \`performance_md\` (formato: faturamento mensal meta, CPL meta, taxa conversão meta, NPS meta — vira referência pros próximos destravamentos). 'markComplete' quando aluno tiver: dashboard configurado (mesmo que MVP), 3 rituais agendados no calendário. Próximo natural: D11.4 (Preparando Pra Escalar).`;

const ARTIFACT_FORMAT = `# Formato do artifact

\`\`\`markdown
# Dashboard Executivo — {empresa}

**Plataforma:** {Growth CRM | RD | Notion | Looker | …}
**Atualização:** {automática | manual semanal}
**Acesso:** {time todo | liderança | dono}
**Mobile:** {sim/não}

## Métricas selecionadas

### Comercial
| Métrica | Atual | Meta | Frequência |
|---------|-------|------|------------|
| Leads captados/mês | … | … | mensal |
| Taxa conversão lead→venda | …% | …% | mensal |
| Ticket médio | R$ … | R$ … | mensal |
| Faturamento mês | R$ … | R$ … | diário |
| Pipeline | R$ … | R$ … | semanal |

### Marketing
| Métrica | Atual | Meta | Frequência |
|---------|-------|------|------------|
| Visitantes site | … | … | semanal |
| CPL | R$ … | R$ … | semanal |
| … | | | |

### Operacional / Financeiro / Satisfação
(mesma estrutura)

## Ritual de análise (agendado no calendário)

| Frequência | Quando         | Duração | O que olhar                                           |
|------------|----------------|---------|-------------------------------------------------------|
| Diário     | 8h45 (todos)   | 5 min   | Leads novos · faturamento vs. meta · pipeline         |
| Semanal    | seg 9h         | 30 min  | Tendências semana · 1-2 ajustes táticos              |
| Mensal     | dia 5, 14h     | 2h      | Review profundo · ajustes estruturais                 |

## Critérios de alerta (quando agir sem esperar revisão)
- CPL sobe 30%+ em 1 semana → revisar criativo/segmentação
- Taxa de conversão cai 20%+ → revisar qualificação ou pitch
- NPS abaixo de 7 → escutar 5 clientes essa semana
- Pipeline esvazia (< 30 dias de receita) → reativar prospecção

> "Dashboard = raio-x. Decisão sem dado é palpite."
\`\`\`

Title: \`Dashboard Executivo — {empresa}\`.`;

export const dashboardExecutivoFlow: AgentFlow = {
  destravamentoSlugs: ['d-11-3-dashboard-executivo'],
  artifactKind: 'outro',
  tools: ['saveArtifact', 'updateProfile', 'markComplete'],
  suggestedFirstMessage:
    'Em 25 min você sai com spec de dashboard (5 áreas × métricas + metas + ritual de revisão) pronto pra montar. Primeira: onde quer o dashboard — CRM nativo, Notion, Looker, ou planilha?',
  systemPrompt: [IDENTITY, VOICE_JOEL, RULES_HARD, PROCEDIMENTO, ARTIFACT_FORMAT, OUTPUT_RULES].join(
    '\n\n'
  ),
};
