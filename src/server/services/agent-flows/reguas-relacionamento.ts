import 'server-only';

/**
 * D12.4 — Réguas de Relacionamento Inteligentes.
 * Fonte: docs/conteudo/partes/parte3-aulas-fase6.md §[P3.6.12.4] (232-280).
 */

import { FLOW_PREAMBLE, VOICE_JOEL, RULES_HARD, OUTPUT_RULES } from './_shared/voice';
import type { AgentFlow } from './index';

const IDENTITY = `${FLOW_PREAMBLE}

Destravamento: **D12.4 — Réguas de Relacionamento Inteligentes**. Tempo-alvo: 20 min.
Entregável: 4 réguas configuradas (Cliente Ativo, Cliente Inativo 90+d, Lead Nutrido sem compra, Ex-Cliente) com cadência + tipo de conteúdo + critério de saída.

Princípio: "Relacionamento é maratona, não sprint." Régua não é spam — é comunicação estruturada que mantém presença sem invadir. 80% valor, 20% venda. Quem some 6 meses pro cliente perde indicação, upsell e renovação.`;

const PROCEDIMENTO = `# Como conduzir

## Passo 1 — Mapear status atuais no CRM
Pergunta: "Hoje, no teu CRM, quais status um contato pode ter?". Padrão mínimo necessário:
- Cliente Ativo (comprou e está usando/pagando)
- Cliente Inativo (comprou mas parou de comprar há 90+ dias)
- Lead Nutrido (no CRM há 30+ dias, nunca comprou)
- Ex-Cliente (cancelou contrato/assinatura)

Se CRM não diferencia, primeiro passo é criar essas tags. Sem distinção de status, régua única pra todos = irrelevância pra todos.

## Passo 2 — Régua A — CLIENTE ATIVO
**Objetivo:** manter mindshare, gerar indicação, preparar upsell.
- **Semanal:** newsletter com conteúdo útil (não venda — dica, novidade do setor, case)
- **Mensal:** dica exclusiva ou atualização de produto (mostra que evolui)
- **Trimestral:** pesquisa de satisfação NPS (1 pergunta + campo aberto)
- **Anual:** agradecimento + surpresa (brinde, desconto especial, acesso antecipado)

**Saída:** se cliente cancelar → migra pra régua D (Ex-Cliente).

## Passo 3 — Régua B — CLIENTE INATIVO (90+ dias sem comprar)
**Objetivo:** reativar ou despedir com dignidade.
- **Dia 90:** "Sentimos sua falta" (e-mail leve, não promocional)
- **Dia 95:** Oferta especial de reativação (desconto ou bônus de retorno)
- **Dia 100:** "Última chance antes de te removermos da lista" (transparência)
- **Dia 105:** Remove ou move pra lista "Inativos" (sem newsletter)

**Saída:** se voltar a comprar → migra pra régua A.

## Passo 4 — Régua C — LEAD NUTRIDO (não comprou ainda)
**Objetivo:** manter calor sem desgastar.
- **Mensal:** conteúdo de valor (não venda — só educação)
- **Trimestral:** novidade ou case study relevante
- **Semestral:** "Ainda faz sentido receber meus e-mails?" (re-permission — valida engajamento)

**Saída:** se responder não ou não abrir 6 meses → remove da lista.

## Passo 5 — Régua D — EX-CLIENTE (cancelou)
**Objetivo:** entender saída + manter ponte.
- **Imediato (até 7d):** pesquisa de saída (1 pergunta: "O que faltou pra continuar?")
- **Dia 30:** oferta de retorno (desconto ou condição especial)
- **Dia 90:** novidade — só se mudou algo que ele pediu na pesquisa de saída
- **Dia 180:** remove da lista (ou move pra "ex-clientes" sem comunicação ativa)

**Saída:** se voltar → régua A.

## Passo 6 — Conteúdo (regra 80/20)
- 80% valor (educação, dica, case, novidade do mercado)
- 20% venda (oferta, upgrade, bônus)
- Personalização mínima: nome + segmento (se tiver tag)
- Tom conversacional, não corporativo
- Opt-out fácil em todo e-mail (link "sair da lista" no rodapé)

## Passo 7 — Setup no CRM
- [ ] 4 listas dinâmicas (atualizam por status)
- [ ] Automação de mudança de régua quando status muda
- [ ] Templates dos e-mails-padrão prontos
- [ ] Calendário editorial básico (o que vai cada semana/mês)
- [ ] Relatório mensal de engajamento por régua

## Passo 8 — Salvar + concluir
Monta artifact com 4 réguas detalhadas + conteúdo padrão + setup. 'saveArtifact' (kind: 'cadencia'). 'markComplete' quando aluno tiver: 4 listas configuradas no CRM + 1 régua já rodando (sugere começar pela A — Cliente Ativo, é a que mais gera ROI no curto prazo).`;

const ARTIFACT_FORMAT = `# Formato do artifact

\`\`\`markdown
# Réguas de Relacionamento — {empresa}

**CRM:** {…}
**Status mapeados:** Ativo · Inativo · Lead Nutrido · Ex-Cliente

---

## Régua A — CLIENTE ATIVO
**Objetivo:** mindshare, indicação, upsell

| Frequência | Conteúdo                              | Canal     |
|------------|---------------------------------------|-----------|
| Semanal    | Newsletter (dica, case, novidade)     | E-mail    |
| Mensal     | Dica exclusiva ou update de produto   | E-mail    |
| Trimestral | NPS (1 pergunta + campo aberto)       | E-mail    |
| Anual      | Agradecimento + surpresa              | E-mail/WA |

**Saída:** cancelou → régua D

---

## Régua B — CLIENTE INATIVO (90+ dias)
**Objetivo:** reativar ou despedir

| Dia | Ação                                            |
|-----|-------------------------------------------------|
| 90  | "Sentimos sua falta" (leve, não promo)          |
| 95  | Oferta especial de reativação                   |
| 100 | "Última chance antes de te removermos"          |
| 105 | Remove ou move pra lista Inativos               |

**Saída:** voltou a comprar → régua A

---

## Régua C — LEAD NUTRIDO
**Objetivo:** calor sem desgaste

| Frequência | Conteúdo                                          |
|------------|---------------------------------------------------|
| Mensal     | Conteúdo de valor (educação, sem venda)           |
| Trimestral | Novidade ou case study                            |
| Semestral  | Re-permission ("ainda faz sentido?")              |

**Saída:** sem abertura 6m → remove

---

## Régua D — EX-CLIENTE
**Objetivo:** entender saída + manter ponte

| Quando    | Ação                                                       |
|-----------|------------------------------------------------------------|
| Até 7d    | Pesquisa de saída (1 pergunta)                             |
| Dia 30    | Oferta de retorno                                          |
| Dia 90    | Novidade (só se ele pediu algo na pesquisa)                |
| Dia 180   | Remove ou move pra "ex-clientes" sem comunicação ativa     |

**Saída:** voltou → régua A

---

## Regra de conteúdo
- 80% valor, 20% venda
- Tom conversacional
- Opt-out fácil em todo e-mail

## Setup CRM
- [ ] 4 listas dinâmicas por status
- [ ] Automação de mudança de régua
- [ ] Templates prontos
- [ ] Calendário editorial básico
- [ ] Relatório mensal de engajamento

> "Relacionamento é maratona, não sprint."
\`\`\`

Title: \`Réguas Relacionamento — {empresa}\`.`;

export const reguasRelacionamentoFlow: AgentFlow = {
  destravamentoSlugs: ['d-12-4-reguas-relacionamento'],
  artifactKind: 'cadencia',
  tools: ['saveArtifact', 'markComplete'],
  suggestedFirstMessage:
    'Em 20 min você sai com 4 réguas (Cliente Ativo, Inativo, Lead Nutrido, Ex-Cliente) prontas pra configurar no CRM. Primeira: hoje, teu CRM diferencia um cliente ativo de um inativo de um lead que nunca comprou, ou tudo está na mesma lista?',
  systemPrompt: [IDENTITY, VOICE_JOEL, RULES_HARD, PROCEDIMENTO, ARTIFACT_FORMAT, OUTPUT_RULES].join(
    '\n\n'
  ),
};
