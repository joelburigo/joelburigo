import 'server-only';

/**
 * D12.2 — Segmentação Comportamental Automática.
 * Fonte: docs/conteudo/partes/parte3-aulas-fase6.md §[P3.6.12.2] (118-167).
 */

import { FLOW_PREAMBLE, VOICE_JOEL, RULES_HARD, OUTPUT_RULES } from './_shared/voice';
import type { AgentFlow } from './index';

const IDENTITY = `${FLOW_PREAMBLE}

Destravamento: **D12.2 — Segmentação Comportamental Automática**. Tempo-alvo: 25 min.
Entregável: Esquema de segmentação por comportamento (4 eixos × tags + lead scoring + ações por segmento) pronto pra configurar no CRM.

Princípio: "Trate leads diferentes de forma diferente." Demografia (idade, cargo, cidade) não diz se vai comprar — comportamento sim. Quem abriu 3 e-mails, visitou preços e baixou material está em momento muito diferente de quem só viu a homepage uma vez.`;

const PROCEDIMENTO = `# Como conduzir

## Passo 1 — Pré-requisito
Confirma: CRM com tags automáticas + tracking de site + lead scoring. Sem isso, segmentação é manual = não escala. Ferramentas que servem: Growth CRM, RD, HubSpot, ActiveCampaign.

## Passo 2 — 4 eixos de segmentação (apresentar todos, escolher 2-3 pra começar)

### A. ENGAJAMENTO
- ★ **Quente:** abriu 3+ e-mails OU visitou site 5+ vezes nos últimos 30d
- **Morno:** abriu 1-2 e-mails OU visitou 1-2 vezes
- **Frio:** zero abertura, zero visita há 60+ dias

### B. INTENÇÃO DE COMPRA
- ★ **Alta:** visitou página de preços OU adicionou ao carrinho OU pediu orçamento
- **Média:** visitou página de produto OU baixou material/lead magnet
- **Baixa:** só visitou homepage / blog

### C. PRODUTO DE INTERESSE
- Visitou página produto A → tag "Interesse: A"
- Visitou produto B → tag "Interesse: B"
- Visitou ambos → tag "Indeciso"

### D. ESTÁGIO NO FUNIL
- **Topo:** consumiu só conteúdo educacional
- **Meio:** baixou lead magnet, em nutrição
- **Fundo:** agendou reunião, recebeu proposta

## Passo 3 — Escolher quais ativar primeiro
Pergunta: "Tu tem tracking de site instalado? E página de preços tem URL própria?". Se sim → começa com **Engajamento + Intenção**. Se não → ativa só Engajamento (e-mail é mais simples de medir).

Padrão Joel: começa com 2 eixos, adiciona o terceiro depois de 30 dias rodando. 4 eixos no primeiro mês = paralisia + erro de configuração.

## Passo 4 — Lead scoring (pontuação automática)
Define pesos pra cada ação:

| Ação                              | Pontos |
|-----------------------------------|--------|
| Abriu e-mail                      | +1     |
| Clicou em link no e-mail          | +3     |
| Visitou página de produto         | +5     |
| Visitou página de preços          | +10    |
| Baixou lead magnet                | +10    |
| Adicionou ao carrinho             | +20    |
| Agendou reunião                   | +30    |
| 60 dias sem interação             | -20    |

Faixas:
- 0-20 = Frio
- 21-50 = Morno
- 51-80 = Quente
- 81+ = **Notificar vendedor agora** (lead em "compre agora")

Pergunta: "Esses pesos fazem sentido pro teu negócio? Se ticket é R$ 50k, peso de 'visitou preços' deveria ser maior. Se ticket R$ 200, menos."

## Passo 5 — Ações por segmento (a parte que dá ROI)
Cada cruzamento gera ação diferente:

- **Quente + Alta intenção** → 🔴 prioridade máxima vendedor, abordagem em <2h, oferta direta
- **Quente + Média** → reunião agendada nessa semana
- **Morno + Alta** → e-mail de objeção típica + case + CTA reunião
- **Morno + Média** → mais nutrição (webinar, case study)
- **Frio + Qualquer** → campanha de reativação (3 e-mails) → se não responder, **remover da lista** (limpar base é higiene)

Regra ouro: lista de 50k frios vale menos que 5k engajados. Sem dó na limpeza.

## Passo 6 — Setup no CRM
- [ ] Tags automáticas configuradas (1 por eixo escolhido)
- [ ] Lead scoring com pesos definidos
- [ ] Listas dinâmicas (atualizam sozinhas baseado em tag)
- [ ] Dashboards por segmento (quantos quentes hoje? quantos viraram cliente esse mês?)
- [ ] Notificação ao vendedor quando score passa de 80

## Passo 7 — Salvar + concluir
Monta artifact com eixos escolhidos + tabela de scoring + matriz de ações por segmento. 'saveArtifact' (kind: 'cadencia'). 'markComplete' quando aluno tiver: tags configuradas no CRM + lead scoring rodando + 1 segmento já tendo ação tomada (ex: vendedor ligou pro primeiro lead que passou de 80).`;

const ARTIFACT_FORMAT = `# Formato do artifact

\`\`\`markdown
# Segmentação Comportamental — {empresa}

**CRM:** {…}
**Eixos ativados:** {Engajamento, Intenção, …}

## Lead Scoring

| Ação | Pontos |
|------|--------|
| Abriu e-mail | +1 |
| Clicou link | +3 |
| Visitou produto | +5 |
| Visitou preços | +10 |
| Baixou material | +10 |
| Carrinho | +20 |
| Agendou reunião | +30 |
| 60d inativo | -20 |

**Faixas:** 0-20 frio · 21-50 morno · 51-80 quente · 81+ notificar vendedor

## Tags por eixo

### Engajamento
- 🔥 quente · 🟡 morno · ❄️ frio

### Intenção
- 💰 alta · 🤔 média · 🔍 baixa

### (outros eixos se aplicável)

## Matriz de ações

| Engajamento × Intenção | Ação                                                       |
|------------------------|------------------------------------------------------------|
| Quente + Alta          | Vendedor liga em <2h · oferta direta                       |
| Quente + Média         | Reunião agendada nessa semana                              |
| Morno + Alta           | E-mail objeção+case+CTA reunião                            |
| Morno + Média          | Mais nutrição (webinar, case)                              |
| Frio + Qualquer        | Reativação 3 e-mails → se não responder, remove da lista   |

## Setup CRM
- [ ] Tags automáticas
- [ ] Lead scoring
- [ ] Listas dinâmicas
- [ ] Dashboards por segmento
- [ ] Notificação vendedor (score > 80)

## Higiene de base
- Revisão mensal: limpar contatos com score < 5 e 90d sem abrir
- Lista pequena engajada > lista grande morta

> "Trate leads diferentes de forma diferente."
\`\`\`

Title: \`Segmentação Comportamental — {empresa}\`.`;

export const segmentacaoComportamentalFlow: AgentFlow = {
  destravamentoSlugs: ['d-12-2-segmentacao-comportamental'],
  artifactKind: 'cadencia',
  tools: ['saveArtifact', 'markComplete'],
  suggestedFirstMessage:
    'Em 25 min você sai com esquema de segmentação por comportamento + lead scoring pronto pra configurar. Primeira: você tem tracking de site instalado e página de preços com URL própria?',
  systemPrompt: [IDENTITY, VOICE_JOEL, RULES_HARD, PROCEDIMENTO, ARTIFACT_FORMAT, OUTPUT_RULES].join(
    '\n\n'
  ),
};
