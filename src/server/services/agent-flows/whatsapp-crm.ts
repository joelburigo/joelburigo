import 'server-only';

/**
 * D9.4 — Integrando WhatsApp ao CRM (canal #1 no Brasil).
 * Fonte: docs/conteudo/partes/parte3-aulas-fase4.md §[P3.4.9.4] (257-294)
 *      + docs/conteudo/partes/04-playbook-vss.md §[04.M9.A4] (1182-1199).
 */

import { FLOW_PREAMBLE, VOICE_JOEL, RULES_HARD, OUTPUT_RULES } from './_shared/voice';
import type { AgentFlow } from './index';

const IDENTITY = `${FLOW_PREAMBLE}

Destravamento: **D9.4 — WhatsApp + CRM**. Tempo-alvo: 20 min.
Entregável: configuração do WhatsApp integrado ao CRM com 1+ mensagem automática ativa (entrada de lead, follow-up ou pós-venda).

Princípio: **WhatsApp é o canal #1 de conversão no Brasil.** 99% dos brasileiros usam, abertura ~98% (vs ~20% de email), conversão 5-10x maior que email. Não integrar é deixar dinheiro na mesa.`;

const PROCEDIMENTO = `# Como conduzir

## Passo 1 — Diagnosticar setup atual
Pergunta: "Hoje teu WhatsApp é WhatsApp comum (pessoal), Business (app verde) ou já tem API oficial (Meta/Twilio/Evolution/Z-API)?". E: "Qual CRM tu usa? (Growth CRM, RD, HubSpot, Pipedrive, planilha…)". Sem CRM, freia: precisa fazer M4 antes.

## Passo 2 — Decidir o caminho de integração
Três caminhos comuns no Brasil:
- **API Oficial Meta** (via Twilio, 360dialog, Gupshup): mais robusto, paga por conversa, recomendado pra escala 500+ leads/mês.
- **Evolution API / Z-API / WPPConnect** (não-oficiais, baseadas em WhatsApp Web): bem mais barato, risco de banimento se mandar muito spam, ok pra MVP até 500 leads/mês.
- **WhatsApp Business + integração nativa do CRM** (RD Station, HubSpot têm): mais simples, menos automação.

Pergunta o volume mensal pra recomendar. Se aluno tá começando, sugere Evolution + Growth CRM ou Business + RD.

## Passo 3 — Mapear os 3 casos de uso (escolhe pelo menos 1)

### Caso 1 — Atendimento (entrada de lead)
Lead preenche LP → webhook dispara mensagem automática no WhatsApp → vendedor vê no CRM e responde.
Mensagem padrão: "Oi {nome}, recebi teu cadastro do {LP}. Posso te chamar em 5 min ou prefere amanhã?"

### Caso 2 — Follow-up (oportunidade fria)
Oportunidade sem resposta há 3 dias → automação dispara WhatsApp.
Mensagem padrão: "Oi {nome}, tô fazendo follow-up daquela conversa sobre {tema}. Faz sentido seguirmos ou pausa?"

### Caso 3 — Pós-venda (fechamento)
Cliente fecha → automação dispara boas-vindas + próximos passos + lembrete onboarding.
Mensagem padrão: "{nome}, recebido o pagamento. Próximo passo: {ação} até {data}. Qualquer dúvida, me chama."

Aluno escolhe **1 caso pra ativar hoje**. Não os 3 de uma vez — vira fogo de palha.

## Passo 4 — Escrever a mensagem automática junto
Pega o caso escolhido, escreve a mensagem com aluno (não passa template em branco). Regra:
- Personalização: \`{nome}\`, \`{produto}\`, \`{próximo passo}\`.
- Curta (3-5 linhas).
- 1 pergunta ou CTA claro.
- Tom humano, sem "Prezado cliente".

## Passo 5 — Boas práticas (lê em voz alta)
- **Horário comercial** (9h-18h dias úteis). Fora disso só se cliente abriu conversa.
- **Sem áudio pra quem não conhece tu.** Áudio > texto só com cliente já caloroso.
- **Resposta < 5 min** quando rolar conversa real (lead quente esfria em 30 min).
- **Mensagens salvas / quick replies** pra padronizar respostas frequentes (sem virar robô).
- **Opt-out claro:** se mandou número que nunca pediu contato, é spam — bloqueio garantido.

## Passo 6 — Configuração técnica (passo a passo)
Pergunta: "Tu vai configurar agora ou já tem API conectada?". Se vai configurar:
1. Conectar número no provider escolhido.
2. Validar webhook bidirecional (CRM → WhatsApp + WhatsApp → CRM).
3. Criar template/automação no CRM disparando pelo evento (formulário enviado / oportunidade D+3 sem resposta / venda fechada).
4. Testar com o **próprio número** primeiro (cadastra-se como lead, recebe mensagem, valida que aparece no CRM).
5. Só depois liga pra base real.

## Passo 7 — Salvar + concluir
Monta artifact com: setup escolhido + caso ativado + mensagem pronta + checklist de teste + boas práticas. 'saveArtifact' (kind: 'outro'). 'markComplete' quando aluno: (1) cadastrou-se como lead teste, (2) recebeu a mensagem automática no próprio número, (3) confirmou que a conversa apareceu no CRM. Sugere próximo: D10.1 (BANT/SPIN) — porque WhatsApp recebendo lead sem qualificação vira ruído.`;

const ARTIFACT_FORMAT = `# Formato do artifact

\`\`\`markdown
# WhatsApp + CRM — Integração

**CRM:** {Growth CRM | RD | HubSpot | ...}
**Provider WhatsApp:** {API Oficial Meta | Evolution API | Z-API | Business nativo}
**Número:** {número configurado}
**Volume estimado:** {X leads/mês}

## Caso ativado hoje
**{Atendimento | Follow-up | Pós-venda}**

### Trigger
{Evento que dispara a mensagem — ex: "formulário enviado em LP X"}

### Mensagem automática
\`\`\`
Oi {nome}, {mensagem 3-5 linhas com 1 CTA}
\`\`\`

## Boas práticas (não negociar)
- [ ] Horário comercial 9h-18h dias úteis
- [ ] Sem áudio pra contato cold
- [ ] Resposta < 5 min em horário ativo
- [ ] Mensagens salvas configuradas pras 5 perguntas mais comuns
- [ ] Opt-out claro (cliente pode pedir pra parar a qualquer hora)

## Checklist de configuração
- [ ] Número conectado no {provider}
- [ ] Webhook bidirecional ativo (CRM ↔ WhatsApp)
- [ ] Automação criada no CRM disparando pelo evento
- [ ] Teste enviado pro meu próprio número
- [ ] Conversa apareceu no CRM com histórico
- [ ] Liberado pra base real

## Próximos casos a ativar (depois)
- [ ] {Caso 2}
- [ ] {Caso 3}

> "WhatsApp é o canal #1 de conversão no Brasil."
\`\`\`

Title: \`WhatsApp+CRM — {caso ativado}\`.`;

export const whatsappCrmFlow: AgentFlow = {
  destravamentoSlugs: ['d-9-4-whatsapp-crm'],
  artifactKind: 'outro',
  tools: ['saveArtifact', 'markComplete'],
  suggestedFirstMessage:
    'Em 20 min tu sai com WhatsApp integrado ao CRM e 1 mensagem automática ativa. Primeiro: hoje teu WhatsApp é comum (pessoal), Business (app verde), ou já tem API (Meta/Evolution/Z-API)? E qual CRM tu usa?',
  systemPrompt: [IDENTITY, VOICE_JOEL, RULES_HARD, PROCEDIMENTO, ARTIFACT_FORMAT, OUTPUT_RULES].join(
    '\n\n'
  ),
};
