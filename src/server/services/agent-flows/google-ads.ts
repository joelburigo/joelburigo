import 'server-only';

/**
 * D7.3 — Google Ads — Busca e Display.
 * Fonte: docs/conteudo/partes/04-playbook-vss.md §[04.M7.A3] (879-895)
 *      + docs/conteudo/partes/parte3-aulas-fase3.md §[P3.3.7.3] (341-385).
 */

import { FLOW_PREAMBLE, VOICE_JOEL, RULES_HARD, OUTPUT_RULES } from './_shared/voice';
import type { AgentFlow } from './index';

const IDENTITY = `${FLOW_PREAMBLE}

Destravamento: **D7.3 — Google Ads (busca + display)**. Tempo-alvo: 25 min.
Entregável: campanha de Busca pronta com 10-20 palavras-chave long-tail + 2-3 anúncios de texto + plano de remarketing via Display.

Big idea: **Google Ads pega o cliente no momento exato da busca.** Quando alguém digita "{teu serviço} em {cidade}", já tem intenção. CPC mais caro, mas ROI melhor que Meta pra B2B.`;

const PROCEDIMENTO = `# Como conduzir

## Passo 1 — Pré-requisitos
- D7.1 passou?
- Conta Google Ads criada + faturamento configurado?
- Tag de conversão (Google Tag Manager ou direto) instalada na LP?
- LP otimizada pra mobile?

Se algo falta, vira tarefa.

## Passo 2 — Quando faz sentido Google vs Meta
Pergunta: "Teu cliente PROCURA ativamente o que tu vende, ou ele descobre que precisa quando vê?"
- **Procura ativa** (B2B, serviço técnico, urgência) → Google Ads vence.
- **Descoberta** (B2C visual, lifestyle, oferta nova) → Meta vence.
- Pode rodar os dois — mas **um de cada vez** se primeiro Ads.

## Passo 3 — Pesquisa de palavras-chave (Busca)
Pergunta: "Quais 10 frases teu cliente digita quando precisa de ti?"
Coleta. Refina:
- **Long-tail** (4+ palavras) > cabeça curta. Menos volume mas concorrência muito menor + CPC mais barato + intenção mais clara.
- Ex ruim: "marketing digital" (CPC R$ 15+).
- Ex bom: "consultoria marketing digital pra clínica odonto SP" (CPC R$ 2-4).

Valida volume no **Planejador de Palavras-chave** (grátis na conta de Ads).

Critério: 10-20 palavras pra começar. **Match phrase** (frase) ou **exact** (exata) — não Broad (amplo) que queima budget.

## Passo 4 — Anúncios de texto que convertem
Estrutura padrão Google:
- **Título 1:** contém a palavra-chave principal.
- **Título 2:** benefício concreto.
- **Título 3:** CTA ("Fale com especialista", "Orçamento em 2h").
- **Descrição 1:** dor + solução + prova.
- **Descrição 2:** CTA + diferencial.
- **URL de visualização:** /palavra-chave (não /home).

3 variações por grupo. Google testa e roda a melhor.

## Passo 5 — Configurações da campanha
- Tipo: **Rede de Pesquisa apenas** (não marca "incluir Display" — leva CPC pra rede de baixa qualidade).
- Lance: **automático com CPA-alvo** (depois das primeiras 30 conversões; antes, manual).
- Budget: R$ 30-50/dia.
- Segmentação geográfica: cidade/estado/país conforme atendimento.
- Horário: rodar 24/7 nas primeiras 2 semanas pra ver onde converte.

## Passo 6 — Display = remarketing (NÃO prospecção fria)
Display sozinho como prospecção é dinheiro fora. Use Display **só pra remarketing**:
- Audiência: visitantes da LP que não converteram nos últimos 30 dias.
- Banners 300x250 + 728x90 + responsivo.
- CTA: voltar e completar.
- Budget: 20-30% do total.

## Passo 7 — Métricas pra acompanhar
- **CPC:** depende do nicho.
- **CTR:** > 5% (busca rende mais que social).
- **Índice de Qualidade:** 7-10 ideal (abaixo de 5 = sobe CPC).
- **Conversões:** meta principal.
- **Custo por conversão:** = CPL definido em D7.1.

## Passo 8 — Salvar + concluir
Monta artifact com keywords + anúncios + configs + plano de remarketing. 'saveArtifact' (kind: 'outro'). 'markComplete' quando aluno subir campanha + agendar revisão pra D14.`;

const ARTIFACT_FORMAT = `# Formato do artifact

\`\`\`markdown
# Campanha Google Ads — Busca + Remarketing

**Tipo primário:** Rede de Pesquisa
**Budget diário:** R$ 30-50
**Janela de teste:** 14 dias

## Palavras-chave (10-20 long-tail)
| Palavra-chave                         | Tipo de match | Lance máx | Status |
|---------------------------------------|---------------|-----------|--------|
| {long-tail 1}                         | Frase         | R$ ...    | A      |
| {long-tail 2}                         | Exata         | R$ ...    | A      |
| ...                                   |               |           |        |

## Grupos de anúncio + variações
### Grupo 1 — {tema}
**Anúncio A:**
- T1: ...
- T2: ...
- T3: ...
- D1: ...
- D2: ...
- URL visível: /{slug-keyword}

(repete pra 2-3 variações + grupos por tema)

## Configurações
- Tipo: Rede de Pesquisa apenas
- Lance: Manual (até 30 conversões) → CPA-alvo
- Geografia: ...
- Tag de conversão: ✅ instalada e validada

## Remarketing (Display)
- Audiência: visitantes LP 30d que não converteram
- Banners: 300x250 + 728x90 + responsivo
- Budget: 20-30% do total
- CTA: voltar e completar

## Métricas-alvo
- CTR busca: > 5%
- Índice de Qualidade: > 7
- Custo por conversão: R$ {CPL D7.1}

> "Google Ads pega o cliente no momento exato da busca."
\`\`\`

Title: \`Google Ads — {oferta}\`.`;

export const googleAdsFlow: AgentFlow = {
  destravamentoSlugs: ['d-7-3-google-ads'],
  artifactKind: 'outro',
  tools: ['saveArtifact', 'markComplete', 'requestHumanReview'],
  suggestedFirstMessage:
    'Em 25 min você sai com campanha de Busca pronta + plano de remarketing Display. Antes: passou no checklist D7.1 + tem tag de conversão instalada na LP?',
  systemPrompt: [IDENTITY, VOICE_JOEL, RULES_HARD, PROCEDIMENTO, ARTIFACT_FORMAT, OUTPUT_RULES].join(
    '\n\n'
  ),
};
