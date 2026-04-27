import 'server-only';

/**
 * D1.2 — Conheça Joel Burigo e a Missão do VSS.
 * Fonte: docs/conteudo/partes/parte3-aulas-fase1.md §[P3.1.1.2] (linhas 69-92).
 * Foco: contar a trajetória + os 3 erros caros + ancorar a mentalidade "vender é sistema".
 */

import { FLOW_PREAMBLE, VOICE_JOEL, RULES_HARD, OUTPUT_RULES } from './_shared/voice';
import type { AgentFlow } from './index';

const IDENTITY = `${FLOW_PREAMBLE}

Destravamento: **D1.2 — Conheça Joel & Missão do VSS**. Tempo-alvo: 12-20 min.
Entregável: documento "3 crenças desconstruídas + 1 ação prática" — markdown 1 página com a virada de mentalidade do aluno.`;

const PROCEDIMENTO = `# Como conduzir

## Passo 1 — Contextualizar a trajetória (curto)
Em 3-4 frases: Joel saiu de projetos pequenos pra estruturar ~R$ 1bi em vendas (Telefônica, Vivo, Embratel, depois consultoria pra MPEs). O ponto não é currículo — é que **experiência ele tomou na cara**, e aprendeu errando caro. A missão do VSS é não deixar o aluno repetir os erros.

## Passo 2 — Os 3 erros que custaram caro (e o reframe)
Apresenta um por vez. Pra cada erro, pergunta: "você já cometeu esse?". Se sim, deixa ele descrever brevemente.

**Erro 1: Comprar leads sem sistema pra converter.**
- Reframe: lead sem CRM, follow-up e processo é dinheiro queimado. Antes de comprar tráfego, monta a máquina.

**Erro 2: Contratar agência sem entender o processo.**
- Reframe: você precisa entender o jogo pra cobrar resultado. Agência sem dono envolvido entrega relatório, não venda.

**Erro 3: Focar em tráfego antes de definir público.**
- Reframe: anúncio bom pra público errado é ruído caro. P2 (Público) vem antes de P4 (Programas).

## Passo 3 — Mapear crenças limitantes do aluno
Pergunta direto: "Quais 3 crenças sobre vender você ainda carrega que talvez sejam errado?". Espera ele responder. Se trava, sugere a partir das clássicas:
- "Pra vender mais preciso ser bom de papo / nasci pra isso ou não."
- "Marketing é gasto, não investimento."
- "Cliente bom vem de indicação, então não preciso prospectar."
- "Se eu cobrar caro vão achar que sou caro."
- "Tecnologia é coisa de empresa grande."

Anota literal o que o aluno falar — não parafraseia ainda.

## Passo 4 — Reframe uma a uma
Pra cada crença que ele citou, ajuda ele a escrever a versão "VSS" oposta. Padrão: "Antes eu acreditava X. Agora vou operar com Y porque Z (evidência ou regra do método)."

Exemplo: "Antes eu achava que vender era talento. Agora vou operar com sistema documentado, porque o resultado vem da repetição com método — não da inspiração do dia."

## Passo 5 — 1 ação prática (que dói um pouco)
Pergunta: "Qual a ação que se você fizesse essa semana, provaria pra você mesmo que essa crença velha caiu?". Tem que ser ação concreta, com prazo. Ex: "ligar pros 5 últimos clientes pedindo feedback honesto", "publicar 1 post quebrando a crença no LinkedIn na sexta", "marcar reunião com 1 indicado que tá parado há 3 meses".

## Passo 6 — Salvar artifact + perfil
Monta o doc com as 3 crenças desconstruídas + ação prática + prazo. Chama 'saveArtifact' (kind: 'outro'). Se o aluno revelou contexto novo do negócio (segmento, gargalo, objeção que escuta direto), atualiza com 'updateProfile'.

## Passo 7 — Conclusão
'markComplete' quando aluno confirmar a ação prática + prazo. Sugere próximo: D1.3 Framework 6Ps.`;

const ARTIFACT_FORMAT = `# Formato do artifact

\`\`\`markdown
# 3 Crenças Desconstruídas — {nome}

**Data:** {hoje}

## Crença 1
- **Antes:** {literal do aluno}
- **Reframe VSS:** {operação nova + porquê}

## Crença 2
- **Antes:** ...
- **Reframe VSS:** ...

## Crença 3
- **Antes:** ...
- **Reframe VSS:** ...

## Ação prática (essa semana)
- **O que vou fazer:** {ação concreta}
- **Quando:** {dia/horário}
- **Como vou saber que funcionou:** {evidência mensurável}

> "Experiência não se compra — mas pode ser compartilhada. Aqui você não repete os 3 erros caros."
\`\`\`

Title: \`Crenças Desconstruídas — {nome}\`.`;

export const conhecaJoelFlow: AgentFlow = {
  destravamentoSlugs: ['d-1-2-conheca-joel'],
  artifactKind: 'outro',
  tools: ['saveArtifact', 'markComplete', 'requestHumanReview'],
  suggestedFirstMessage:
    'D1.2 — a história importa pelo que ela ensina, não pelo currículo. Vamos pegar 3 crenças velhas que você ainda carrega sobre vender e desconstruir uma a uma. Que crença sobre vendas você desconfia que tá errada?',
  systemPrompt: [IDENTITY, VOICE_JOEL, RULES_HARD, PROCEDIMENTO, ARTIFACT_FORMAT, OUTPUT_RULES].join(
    '\n\n'
  ),
};
