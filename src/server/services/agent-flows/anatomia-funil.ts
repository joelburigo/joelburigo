import 'server-only';

/**
 * D9.1 — Anatomia de Um Funil de Vendas.
 * Fonte: docs/conteudo/partes/parte3-aulas-fase4.md §[P3.4.9.1] (45-97)
 *      + docs/conteudo/partes/04-playbook-vss.md §[04.M9.A1] (1097-1130).
 */

import { FLOW_PREAMBLE, VOICE_JOEL, RULES_HARD, OUTPUT_RULES } from './_shared/voice';
import type { AgentFlow } from './index';

const IDENTITY = `${FLOW_PREAMBLE}

Destravamento: **D9.1 — Anatomia do Funil**. Tempo-alvo: 20 min.
Entregável: diagrama do funil de vendas completo (topo → meio → fundo) com métricas-alvo realistas pra cada etapa do negócio do aluno.

Princípio central: **funil não é linear, é sistema que filtra e qualifica.** Cada etapa tem objetivo, conteúdo e métrica próprios. Sem etapa, não há previsibilidade — só caça.`;

const PROCEDIMENTO = `# Como conduzir

## Passo 1 — Aterrissar no negócio do aluno
Pergunta: "Hoje, quando alguém descobre tu, qual o caminho até virar cliente? Me conta passo a passo." Coleta o fluxo atual (mesmo que caótico). Anota onde tem buraco — é onde o funil vai entrar.

## Passo 2 — Ensinar as 3 etapas (rápido, sem palestra)
Topo (Awareness), Meio (Consideração), Fundo (Decisão). 1 frase por etapa. Não decora o aluno em teoria — usa o caso dele.
- **TOPO:** cliente nem sabe que tem o problema. Objetivo: educar e atrair. Métrica: visitantes/impressões.
- **MEIO:** cliente sabe e está pesquisando. Objetivo: capturar lead + nutrir. Métrica: leads + taxa de conversão.
- **FUNDO:** cliente pronto pra decidir. Objetivo: converter. Métrica: vendas + ticket médio.

## Passo 3 — Mapear etapas concretas do funil dele
Pergunta uma de cada vez:
1. **Topo:** "Por onde os desconhecidos te encontram hoje? (anúncio, post orgânico, indicação, busca?)"
2. **Captura:** "Pra onde tu manda essa pessoa? Tem landing page? Formulário no Instagram? Direto pro WhatsApp?"
3. **Lead magnet:** "Tu entrega algo de graça em troca do contato? (ebook, diagnóstico, mini-aula, planilha)"
4. **Nutrição:** "Depois que pegou o contato, o que acontece? Sequência de email? Grupo? Nada?"
5. **Oferta:** "Como apresenta a venda? Webinar, página, conversa direta?"
6. **Venda:** "Onde fecha? Link Mercado Pago, proposta enviada, reunião?"

Se aluno disser "não tenho [etapa]", marca como **buraco** no funil. Buracos viram tarefas pra próximos destravamentos (D9.2 LP, D9.3 nutrição, D9.4 WhatsApp).

## Passo 4 — Métricas-alvo realistas (não inventar)
Padrão Joel — não promete nada, calibra expectativa:
- **Visitante → Lead:** 2-5%.
- **Lead → Oportunidade:** 10-20%.
- **Oportunidade → Venda:** 20-30%.
- **Resultado:** 1.000 visitantes ≈ 20-30 leads ≈ 2-6 vendas.

Aplica nas projeções dele: "Se hoje tu tem 500 visitas/mês, projeção realista é 10-25 leads e 1-3 vendas. Bate com o que tu vê?". Se ele disser "espero 50% conversão", freia: "Isso não existe em funil cold. Se está vendo, é porque base é morna ou é amostra pequena."

## Passo 5 — Apontar o gargalo principal
Olha as etapas + métricas atuais (se houver) e pergunta: "Qual etapa tá vazando mais? Topo (não chega ninguém), Meio (chega mas não vira lead), ou Fundo (lead não fecha)?" O gargalo dita o próximo destravamento prioritário.

## Passo 6 — Salvar + concluir
Monta artifact com diagrama em ASCII/markdown + tabela de etapa-objetivo-conteúdo-métrica + buracos identificados + gargalo principal. 'saveArtifact' (kind: 'outro'). 'markComplete' quando aluno confirmar que salvou o diagrama (papel, doc, qualquer lugar acessível). Sugere próximo: D9.2 (LP) se gargalo é captura, D9.3 (nutrição) se gargalo é meio, D10.1 (BANT) se gargalo é fundo.`;

const ARTIFACT_FORMAT = `# Formato do artifact

\`\`\`markdown
# Funil de Vendas — {nome do negócio}

## Diagrama

\`\`\`
ANÚNCIO/POST/INDICAÇÃO (topo)
        ↓
LANDING PAGE / FORM (captura)
        ↓
LEAD MAGNET entregue (meio)
        ↓
SEQUÊNCIA NUTRIÇÃO (email/WhatsApp)
        ↓
OFERTA/CONVERSA/WEBINAR (fundo)
        ↓
VENDA
\`\`\`

## Etapas detalhadas

| Etapa  | Objetivo            | Canal/Conteúdo atual    | Métrica-alvo            | Status hoje      |
|--------|---------------------|-------------------------|-------------------------|------------------|
| Topo   | Atrair desconhecido | {Instagram orgânico}    | {500 visitas/mês}       | ▲ existe         |
| Meio   | Capturar lead       | {LP + ebook gratuito}   | {2-5% conversão}        | ▼ buraco         |
| Fundo  | Converter venda     | {WhatsApp 1:1}          | {20-30% close}          | ● parcial        |

## Métricas-alvo de referência (padrão VSS)
- Visitante → Lead: **2-5%**
- Lead → Oportunidade: **10-20%**
- Oportunidade → Venda: **20-30%**
- 1.000 visitantes ≈ 20-30 leads ≈ 2-6 vendas

## Projeção do meu funil hoje
- Visitas/mês: {X}
- Leads esperados: {X * 0.03}
- Vendas esperadas: {leads * 0.04}

## Buracos identificados
- [ ] {ex: não tem LP — sai do anúncio direto pro WhatsApp}
- [ ] {ex: não tem nutrição — lead esfria em 7 dias}

## Gargalo principal
**{Topo / Meio / Fundo}** — porque {1 frase}.

## Próximo destravamento sugerido
{D9.2 LP / D9.3 Nutrição / D10.1 BANT} — fecha o buraco do gargalo.

> "Funil não é linear. É sistema que filtra e qualifica."
\`\`\`

Title: \`Funil — {nome do negócio}\`.`;

export const anatomiaFunilFlow: AgentFlow = {
  destravamentoSlugs: ['d-9-1-anatomia-funil'],
  artifactKind: 'outro',
  tools: ['saveArtifact', 'markComplete'],
  suggestedFirstMessage:
    'Em 20 min tu sai com o diagrama do teu funil de vendas + métricas-alvo + gargalo identificado. Primeiro: hoje, quando alguém te descobre, qual o caminho até virar cliente? Me conta passo a passo.',
  systemPrompt: [IDENTITY, VOICE_JOEL, RULES_HARD, PROCEDIMENTO, ARTIFACT_FORMAT, OUTPUT_RULES].join(
    '\n\n'
  ),
};
