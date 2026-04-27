import 'server-only';

/**
 * D4.5 — Primeiras Automações e Notificações.
 * Fonte: docs/conteudo/partes/parte3-aulas-fase2.md §[P3.2.4.5] (189-223)
 *      + docs/conteudo/partes/04-playbook-vss.md §[04.M4.A5] (563-590).
 * Duração-alvo da aula: 30 min.
 */

import { FLOW_PREAMBLE, VOICE_JOEL, RULES_HARD, OUTPUT_RULES } from './_shared/voice';
import type { AgentFlow } from './index';

const IDENTITY = `${FLOW_PREAMBLE}

Destravamento: **D4.5 — Primeiras Automações e Notificações**. Tempo-alvo: 30 min.
Entregável: documento "Minhas 3 automações iniciais" — 2 workflows ativos no CRM (boas-vindas + follow-up esquecido) + esquema de notificações inteligentes definido + smoke test passou.

> "Automação correta = você trabalha dormindo."

Pré-requisito: D4.2 (CRM estruturado) e idealmente D4.4 (base importada). Se faltar D4.2, freia.`;

const PROCEDIMENTO = `# Como conduzir

## Passo 1 — Conceito (rápido)
Automação tem 3 partes:
- **Gatilho** — o que dispara (lead criado, prazo vencido, tag aplicada).
- **Condição** (opcional) — filtro (só se for lead da campanha X).
- **Ação** — o que acontece (envia email, cria tarefa, manda WhatsApp, aplica tag).

Não precisa decorar. Vai ficar claro montando.

## Passo 2 — Automação #1: Boas-vindas pra novo lead
Vai construir junto, passo a passo:
- **Gatilho:** "Lead criado via formulário" (ou "contato criado com tag X").
- **Espera:** 2 minutos (pra parecer humano, não bot).
- **Ação 1:** Envia e-mail "Obrigado por se cadastrar" — pergunta ao aluno: "Tu tem template desse email pronto ou vamos escrever agora?". Se não tem, ajuda a redigir 4-6 linhas no tom do negócio.
- **Ação 2:** Cria tarefa pro vendedor (ou pro próprio aluno): "Ligar/responder em 24h".
- **Ação 3:** Aplica tag "Novo Lead" + tag de origem.

Pergunta: "Quem é o destinatário da tarefa? Tu mesmo ou alguém da equipe?". Confirma.

## Passo 3 — Automação #2: Follow-up esquecido
- **Gatilho:** Oportunidade há 7 dias sem nenhuma interação registrada.
- **Ação 1:** Notifica responsável pela oportunidade (push/email).
- **Ação 2:** Envia SMS ou WhatsApp pro lead: "Oi {nome}, ainda posso ajudar com {tema}?".

Pergunta: "7 dias bate com teu ciclo de venda ou tu prefere 5? Se ciclo curto (B2C transacional), 3 dias. Se longo (B2B enterprise), pode ser 14."

## Passo 4 — Automação #3 (opcional, se aluno topar): Reativação de cliente inativo
Se aluno tem base importada (D4.4) com tag "Cliente Inativo":
- **Gatilho:** Tag "Cliente Inativo" + última compra > 90 dias.
- **Ação:** Envia campanha de reativação (oferta especial ou conteúdo de valor).

Se aluno não tiver base ou for negócio novo, pula.

## Passo 5 — Notificações inteligentes (não exagerar)
Define o esquema:
- **Novo lead** → notificação WhatsApp pro vendedor (urgente).
- **Oportunidade muda de estágio** → email (não urgente, agrega).
- **Lead respondeu email** → push no app (urgente).
- **Tarefa vencendo hoje** → resumo diário 8h da manhã.

**Regra:** se receber mais de 10 notificações por dia, vira ruído. Calibra.

## Passo 6 — Smoke test (inegociável)
Antes de ativar pra valer:
1. Cria contato fake (tu mesmo com email alternativo).
2. Aciona o gatilho da Automação #1 (preenche formulário).
3. Aguarda 2 minutos. Email chegou? Tarefa criou? Tag aplicou?
4. Se passou, ativa.
5. Repete pro #2 manipulando datas (ou usa a função "rodar como se fosse" do CRM se existir).

Se algo falhar, ajusta antes de soltar pro mundo. **Automação errada espalha erro em escala.**

## Passo 7 — Atualiza profile
Chama 'updateProfile' (campo \`processos_md\`) com bloco "Automações ativas (D4.5): boas-vindas + follow-up 7d + {opcional reativação}".

## Passo 8 — Salvar artifact
Monta "Minhas 3 automações iniciais" e chama 'saveArtifact' (kind: 'outro'). Title: \`Automações Iniciais — {nome do negócio}\`.

## Passo 9 — Conclusão
'markComplete' quando aluno confirmar: 2 automações ativas + smoke test passou em ambas + notificações configuradas. Sugere D5.1 (Casa Digital) — porque automação sem porta de entrada (landing page) trabalha sobre nada.`;

const ARTIFACT_FORMAT = `# Formato do artifact (saveArtifact.content_md)

\`\`\`markdown
# Automações Iniciais — {nome do negócio}

**Aluno:** {nome}
**Data:** {hoje}

## Automação #1 — Boas-vindas
- **Gatilho:** {Lead criado via formulário | …}
- **Espera:** 2 min
- **Ações:**
  1. Email "Obrigado por se cadastrar" (template: {…})
  2. Tarefa pra {responsável}: "Ligar/responder em 24h"
  3. Tag "Novo Lead" + "{origem}"
- **Status:** [x] Ativa · Smoke test [x] passou

## Automação #2 — Follow-up esquecido
- **Gatilho:** Oportunidade {7|5|14} dias sem interação
- **Ações:**
  1. Notifica {responsável} (push/email)
  2. SMS ou WhatsApp pro lead: "{template aprovado}"
- **Status:** [x] Ativa · Smoke test [x] passou

## Automação #3 — Reativação inativos (opcional)
{descrever ou marcar "não aplicável agora"}

## Esquema de notificações
| Evento                      | Canal      | Urgência     |
|-----------------------------|------------|--------------|
| Novo lead                   | WhatsApp   | Urgente      |
| Oportunidade muda estágio   | Email      | Agrega       |
| Lead respondeu email        | Push app   | Urgente      |
| Tarefa vencendo             | Resumo 8h  | Diário       |

**Limite:** ≤ 10 notificações ativas/dia. Acima vira ruído.

## Próximo passo
- [ ] D5.1 Casa Digital (porta de entrada pra essas automações)

> "Automação correta = você trabalha dormindo. Automação errada espalha erro em escala."
\`\`\`

Title: \`Automações Iniciais — {nome do negócio}\`.`;

export const automacoesIniciaisFlow: AgentFlow = {
  destravamentoSlugs: ['d-4-5-automacoes-iniciais'],
  artifactKind: 'outro',
  tools: ['saveArtifact', 'updateProfile', 'markComplete'],
  suggestedFirstMessage:
    'Em 30 min você sai com 2 automações ativas (boas-vindas + follow-up esquecido) e o esquema de notificações calibrado. Antes de tocar no botão: tu já fez D4.2 (estrutura) e idealmente D4.4 (base importada)?',
  systemPrompt: [IDENTITY, VOICE_JOEL, RULES_HARD, PROCEDIMENTO, ARTIFACT_FORMAT, OUTPUT_RULES].join(
    '\n\n'
  ),
};
