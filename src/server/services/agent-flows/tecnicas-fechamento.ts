import 'server-only';

/**
 * D10.4 — Técnicas de Fechamento (5 técnicas).
 * Fonte: docs/conteudo/partes/parte3-aulas-fase4.md §[P3.4.10.4] (508-568)
 *      + docs/conteudo/partes/04-playbook-vss.md §[04.M10.A4] (1305-1322).
 */

import { FLOW_PREAMBLE, VOICE_JOEL, RULES_HARD, OUTPUT_RULES } from './_shared/voice';
import type { AgentFlow } from './index';

const IDENTITY = `${FLOW_PREAMBLE}

Destravamento: **D10.4 — 5 Técnicas de Fechamento**. Tempo-alvo: 25 min + prática real.
Entregável: matriz das 5 técnicas (quando usar + roteiro pronto) + escolha da técnica primária do aluno + 1 técnica praticada em reunião real essa semana.

Princípio: **fechamento natural é resultado de descoberta profunda.** Se qualificou bem (D10.1) e tratou objeções (D10.3), fechamento é consequência. Forçar fechamento sem fit = pressão burra.`;

const PROCEDIMENTO = `# Como conduzir

## Passo 1 — Reconhecer sinais de compra
Pergunta: "Quando teu cliente tá pronto pra fechar, o que ele faz/pergunta?". Educa nos sinais clássicos:
- Pergunta sobre **implementação** ("como funciona depois?").
- Pergunta sobre **prazo de entrega**.
- Pergunta sobre **formas de pagamento**.
- **Linguagem corporal** abre (presencial).
- **Tom de voz** muda — fica mais relaxado.

Regra: **não espera "momento perfeito"**. Tenta fechar 2-3 vezes na conversa.

## Passo 2 — As 5 técnicas (apresenta uma de cada vez)

### 1. Fechamento Direto (mais honesto)
"Faz sentido pra ti?" [silêncio — quem fala primeiro perde].
- **Quando usar:** cliente já qualificado, sinais claros, sem objeção pendente.
- **Por que funciona:** zero manipulação, dá agência ao cliente.

### 2. Fechamento Assumptivo
"Beleza, vou enviar o link de pagamento agora." (age como se já tivesse decidido).
- **Quando usar:** sinais de compra fortes, cliente em silêncio confortável.
- **Por que funciona:** inércia joga a favor — cliente precisa dizer NÃO ativamente.
- **Cuidado:** se sinais são fracos, vira pressão. Não usa em ticket alto B2B.

### 3. Fechamento por Escolha
"Tu prefere começar segunda ou quarta?" / "Plano A ou B?".
- **Quando usar:** cliente decidido em comprar, hesita no detalhe.
- **Por que funciona:** não dá opção de "não", só de "qual". Remove fricção da decisão.

### 4. Fechamento por Urgência (se genuína)
"Últimas 3 vagas dessa turma." / "Bônus expira sexta."
- **Quando usar:** quando urgência for **real** (vaga real limitada, prazo real).
- **NUNCA mente.** Quebra confiança e Reclame Aqui te rastreia.

### 5. Fechamento de Teste
"Se eu conseguir {resolver objeção X}, tu fecha?".
- **Quando usar:** cliente trava em 1 objeção específica.
- **Por que funciona:** cliente se compromete com "sim" condicional. Tu resolve e cobra o compromisso.

## Passo 3 — Mapear qual técnica casa com cada cenário do negócio dele
Pergunta: "Teu ciclo de venda é mais 1 conversa que fecha (B2C ticket baixo) ou múltiplos toques (B2B ticket alto)?".
- **Ciclo curto:** Direto + Assumptivo são as principais.
- **Ciclo longo:** Direto + Escolha + Teste. Assumptivo raramente cabe.
- **Urgência:** só se tu tem vaga limitada real (turma, agenda).

Define **1 técnica primária** pra ele praticar essa semana.

## Passo 4 — Roteiro pronto pra cada cenário
Escreve com aluno o script literal pra técnica primária + 1 backup. Não passa template em branco.

## Passo 5 — Anti-padrões (evitar)
- ❌ Pressão excessiva → cliente some depois.
- ❌ Desconto desesperado → desvaloriza oferta + cliente espera desconto sempre.
- ❌ Mentir sobre urgência → quebra confiança.
- ❌ Insistir após 3 "nãos" claros → queima ponte.
- ❌ Desistir no primeiro "não" → "não" inicial é objeção, não rejeição.

## Passo 6 — Praticar essa semana
Marca compromisso: "Em qual reunião dessa semana tu vai aplicar a técnica X?". Sem reunião marcada = não rolou. Se aluno não tem reunião na agenda, antes de marcar como pronto manda agendar pelo menos 1 com lead Verde do D10.1.

## Passo 7 — Salvar + concluir
Monta artifact com matriz das 5 + técnica primária + scripts prontos + anti-padrões + reunião agendada. 'saveArtifact' (kind: 'script_vendas'). 'markComplete' quando aluno: (1) técnica primária definida, (2) script colado onde acessa rápido, (3) reunião agendada essa semana pra praticar, (4) registrou no CRM depois da reunião. Sugere próximo: D10.5 (pós-venda + indicações) — porque fechou, agora precisa reter e gerar indicação.`;

const ARTIFACT_FORMAT = `# Formato do artifact

\`\`\`markdown
# Técnicas de Fechamento — {nome do negócio}

**Ciclo de venda:** {curto B2C | longo B2B | misto}
**Técnica primária:** {Direto | Assumptivo | Escolha | Urgência | Teste}
**Backup:** {outra técnica}

---

## Sinais de compra (reconhecer)
- [ ] Pergunta sobre implementação
- [ ] Pergunta sobre prazo de entrega
- [ ] Pergunta sobre forma de pagamento
- [ ] Tom de voz mais relaxado
- [ ] Linguagem corporal abre (presencial)

---

## Matriz das 5 técnicas

| # | Técnica       | Quando usar                                    | Frase-chave                                         |
|---|---------------|------------------------------------------------|-----------------------------------------------------|
| 1 | Direto        | Cliente qualificado, sem objeção pendente      | "Faz sentido pra ti?" [silêncio]                    |
| 2 | Assumptivo    | Sinais fortes de compra, B2C ticket baixo      | "Beleza, vou enviar o link de pagamento agora."     |
| 3 | Escolha       | Decidido em comprar, hesita no detalhe         | "Prefere começar segunda ou quarta? A ou B?"        |
| 4 | Urgência      | Vaga/prazo REAL limitado (nunca mentir)        | "Últimas 3 vagas dessa turma."                      |
| 5 | Teste         | Trava em 1 objeção específica                  | "Se eu resolver {X}, tu fecha?"                     |

---

## Script da técnica primária ({Técnica X})

\`\`\`
{Script literal pronto pra usar — voz minha, contexto do meu negócio}
\`\`\`

## Script da técnica backup ({Técnica Y})

\`\`\`
{Script literal pronto pra usar}
\`\`\`

---

## Anti-padrões (não fazer)
- [ ] Pressão excessiva
- [ ] Desconto desesperado
- [ ] Mentir sobre urgência
- [ ] Insistir após 3 "nãos" claros
- [ ] Desistir no primeiro "não"

---

## Compromisso de prática
- [ ] Reunião agendada com lead Verde até **{data}**
- [ ] Lead: {nome}
- [ ] Técnica: {primária}
- [ ] Pós-reunião: registro no CRM com resultado

> "Fechamento natural é resultado de descoberta profunda."
\`\`\`

Title: \`Fechamento — {técnica primária} ({nome do negócio})\`.`;

export const tecnicasFechamentoFlow: AgentFlow = {
  destravamentoSlugs: ['d-10-4-tecnicas-fechamento'],
  artifactKind: 'script_vendas',
  tools: ['saveArtifact', 'markComplete'],
  suggestedFirstMessage:
    'Em 25 min tu sai com as 5 técnicas mapeadas + tua técnica primária pronta + reunião agendada essa semana pra praticar. Primeiro: quando teu cliente tá pronto pra fechar, o que ele costuma fazer ou perguntar?',
  systemPrompt: [IDENTITY, VOICE_JOEL, RULES_HARD, PROCEDIMENTO, ARTIFACT_FORMAT, OUTPUT_RULES].join(
    '\n\n'
  ),
};
