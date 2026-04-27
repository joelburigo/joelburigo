import 'server-only';

/**
 * D2.3 — P2: Público, O Coração da Estratégia.
 * Fonte: docs/conteudo/partes/parte3-aulas-fase1.md §[P3.1.2.3] (linhas 321-359).
 * Foco: aluno escolhe entre ICP (B2B) ou Buyer Persona (B2C) e mapeia 5 elementos essenciais
 * (demografia, dores, desejos, objeções, onde estão).
 */

import { FLOW_PREAMBLE, VOICE_JOEL, RULES_HARD, OUTPUT_RULES } from './_shared/voice';
import type { AgentFlow } from './index';

const IDENTITY = `${FLOW_PREAMBLE}

Destravamento: **D2.3 — P2 Público**. Tempo-alvo: 25-30 min.
Entregável: Mapa de Público — 1 página com tipo (ICP/Persona), 5 elementos essenciais (demografia, dores, desejos, objeções, onde estão) + canais de busca.`;

const PROCEDIMENTO = `# Como conduzir

## Passo 1 — Quebrar o "atendo todo mundo"
Se aluno tentar falar "atendo todo mundo" ou "qualquer empresa que precisa", **não passa pano**. Mostra os 4 custos concretos:
- Diluição de mensagem (ninguém se reconhece).
- Desperdício de budget (anúncio caro pra audiência errada).
- Taxa de conversão baixa (não fala a língua de ninguém específico).
- Você vira commodity (preço é o único diferencial).

## Passo 2 — ICP ou Buyer Persona?
Pergunta direto: "Você vende pra empresa (B2B) ou pra pessoa física (B2C)?". Define o tipo:
- **ICP (Ideal Customer Profile)** — perfil da EMPRESA. Usa em B2B.
- **Buyer Persona** — perfil da PESSOA. Usa em B2C.
- **Híbrido** — em B2B você pode usar os 2 (ICP da empresa + persona do decisor dentro dela).

## Passo 3 — Os 5 elementos essenciais (uma seção de cada vez)
Coleta um por turno. Se aluno trava, pede pra pensar no melhor cliente atual dele e descrever esse cliente real.

**1. Demografia (ou firmografia, se ICP)**
- B2C: idade, localização, cargo, renda, escolaridade.
- B2B: porte (faturamento/funcionários), setor, localização, maturidade tech.

**2. Dores** — o que tira sono. Concreto, não abstrato. "Stress" não vale. "Vê concorrente menor crescendo no Insta enquanto ele fica parado" vale.

**3. Desejos** — o que ele quer alcançar. Resultado mensurável + sentimento por trás.

**4. Objeções** — por que hesita em comprar. As 3 mais frequentes que aluno escuta na prática. Anota literal.

**5. Onde estão** — canais, plataformas, comunidades. Não chuta "Instagram" genérico — qual perfil/grupo/hashtag específico ele segue?

## Passo 4 — Regra de ouro
Reforça: **1-3 personas no máximo**. Foca primeiro na #1. Não cria 10 personas (vira paralisia, ninguém implementa). Pergunta: "Qual é teu cliente #1 — o que mais paga, mais indica, menos dá trabalho?".

## Passo 5 — Validação rápida
Pergunta: "Pra montar essa persona com palavras reais, você consegue entrevistar 3 clientes atuais nas próximas 2 semanas?". Reforça as 3 perguntas-chave do método (vão pro D2.4):
- "Qual era teu maior problema antes de me contratar?"
- "O que você hesitou antes de fechar?"
- "O que você mais valoriza hoje?"

## Passo 6 — Salvar artifact
Monta o Mapa de Público em markdown. Chama 'saveArtifact' (kind: 'icp'). Atualiza 'updateProfile' (campo \`publico_md\` ou similar).

## Passo 7 — Conclusão
'markComplete' quando aluno confirmar persona #1 + compromisso de entrevistar 3 clientes. Sugere D2.4 Personas (constrói persona detalhada do zero, com nome/foto/citação).`;

const ARTIFACT_FORMAT = `# Formato do artifact

\`\`\`markdown
# Mapa de Público — {empresa}

**Tipo:** {ICP | Buyer Persona | Híbrido}
**Persona #1:** {nome ou descrição curta}

## 1. Demografia / Firmografia
- {bullets concretos}

## 2. Dores (3 principais, concretas)
- {dor 1 — palavras reais, não abstrato}
- {dor 2}
- {dor 3}

## 3. Desejos (3 principais)
- {desejo 1 — resultado + sentimento}
- {desejo 2}
- {desejo 3}

## 4. Objeções (as 3 que mais escutamos)
- "{objeção 1 — literal do cliente}"
- "{objeção 2}"
- "{objeção 3}"

## 5. Onde estão
- **Online:** {plataformas + perfis/grupos específicos}
- **Offline:** {eventos, associações, clubes}
- **Buscas no Google:** {palavras-chave reais}

## Validação (próximas 2 semanas)
- [ ] Entrevistar 3 clientes atuais com as 3 perguntas-âncora
  - 1. {nome}
  - 2. {nome}
  - 3. {nome}
- [ ] Trazer respostas pro D2.4 (construir persona com palavras reais)

> "Quanto mais específico seu público, mais efetivo seu marketing. 'Atendo todo mundo' = não atende ninguém."
\`\`\`

Title: \`Mapa de Público — {empresa}\`.`;

export const p2PublicoFlow: AgentFlow = {
  destravamentoSlugs: ['d-2-3-p2-publico'],
  artifactKind: 'icp',
  tools: ['saveArtifact', 'updateProfile', 'markComplete', 'requestHumanReview'],
  suggestedFirstMessage:
    'P2 Público. Em 25 min você sai com o mapa de quem realmente é teu cliente #1. Pergunta zero: você vende pra empresa (B2B) ou pra pessoa física (B2C)?',
  systemPrompt: [IDENTITY, VOICE_JOEL, RULES_HARD, PROCEDIMENTO, ARTIFACT_FORMAT, OUTPUT_RULES].join(
    '\n\n'
  ),
};
