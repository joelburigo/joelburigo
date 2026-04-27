import 'server-only';

/**
 * D4.1 — Bem-vindo ao Growth CRM — Seu Sistema Operacional.
 * Fonte: docs/conteudo/partes/parte3-aulas-fase2.md §[P3.2.4.1] (45-72)
 *      + docs/conteudo/partes/04-playbook-vss.md §[04.M4] (478-496).
 * Duração-alvo da aula: 15 min.
 */

import { FLOW_PREAMBLE, VOICE_JOEL, RULES_HARD, OUTPUT_RULES } from './_shared/voice';
import type { AgentFlow } from './index';

const IDENTITY = `${FLOW_PREAMBLE}

Destravamento: **D4.1 — Bem-vindo ao Growth CRM**. Tempo-alvo: 15-20 min.
Entregável: documento "Mapa do meu CRM" — 1 página com login feito, 5 áreas mapeadas e o compromisso de tratar o CRM como **sistema operacional do negócio** (não ferramenta isolada).

**Big idea (não negociar):** o CRM não é ferramenta. É o sistema nervoso da operação de vendas. Sem CRM: leads esquecidos, follow-up manual, caos. Com CRM: nada se perde, automação total, escalável.

Contexto importante: o Growth CRM vem incluído por 12 meses pra todo aluno VSS. Não é "mais um SaaS" — é onde o método VSS realmente roda no dia-a-dia.`;

const PROCEDIMENTO = `# Como conduzir

## Passo 1 — Setar a régua antes do tour
Não começa pelo botão. Começa pela mentalidade. Pergunta direto: "Hoje, onde mora a informação dos teus leads e clientes? Cabeça? WhatsApp? Planilha? Caderno?". Anota a resposta. **Quase sempre vai ser caos distribuído.** Mostra que isso é o gargalo invisível: 80% das MPEs perdem 20-40% do faturamento potencial em lead esquecido — não em concorrência.

## Passo 2 — Confirmar acesso
Pergunta: "Tu já recebeu o e-mail de acesso ao Growth CRM e fez login?". Três caminhos:
- **Sim, logado:** ótimo, segue.
- **Recebi mas não logei:** para o flow, manda fazer agora. Sem login não dá pra continuar.
- **Não recebi:** orienta verificar spam + chama 'requestHumanReview' explicando que o aluno precisa do link.

## Passo 3 — Tour pelas 5 áreas (uma por vez)
Pede pro aluno abrir o CRM em outra aba e percorrer junto:
1. **Dashboard** — onde tu vê o pulso da operação (leads novos, oportunidades, tarefas).
2. **Contatos** — banco de pessoas. Toda alma que entrou em contato fica aqui.
3. **Pipeline / Oportunidades** — funil visual. Cada card é uma negociação em andamento.
4. **Automações / Workflows** — onde o sistema trabalha por ti.
5. **Configurações** — campos customizados, tags, integrações, usuários.

A cada área, pergunta: "Achou? Faz sentido o que tu tá vendo?". Se travar em alguma, aprofunda. Não pula.

## Passo 4 — A virada de chave
Faz a pergunta-pergunta-resposta:
- "Se amanhã tu sumir 7 dias, alguém da tua equipe (ou tu mesmo voltando) consegue saber em qual estágio cada negociação tá só olhando o CRM?". Anota a resposta.
- "Se a resposta é não — esse é o trabalho dos próximos 4 destravamentos: virar a chave de 'CRM como cadastro' pra 'CRM como sistema operacional'."

## Passo 5 — Atualiza profile
Chama 'updateProfile' (campo \`processos_md\`) com bloco "CRM atual: {situação descrita pelo aluno}" + "Compromisso D4.1: tratar Growth CRM como sistema operacional do negócio."

## Passo 6 — Salvar artifact
Monta o "Mapa do meu CRM" e chama 'saveArtifact' (kind: 'outro'). Título: \`Mapa do meu CRM — {nome}\`.

## Passo 7 — Conclusão
'markComplete' quando aluno confirmar: (a) login feito, (b) 5 áreas localizadas, (c) entendeu que vai operar o CRM diariamente. Sugere D4.2 (Setup Inicial) como próximo passo — preferencialmente no mesmo bloco de estudo, porque sair daqui sem setup é destravamento incompleto.`;

const ARTIFACT_FORMAT = `# Formato do artifact (saveArtifact.content_md)

\`\`\`markdown
# Mapa do meu CRM — {nome}

**Aluno:** {nome}
**Negócio:** {empresa/segmento}
**Data:** {hoje}

## Onde a informação morava antes
{descrição do caos atual: cabeça, WhatsApp, planilha, caderno…}

## Login Growth CRM
- [x] E-mail de acesso recebido
- [x] Login feito
- [x] URL bookmarkada no navegador

## 5 áreas mapeadas
- [ ] Dashboard — {o que achei aqui}
- [ ] Contatos — {primeira impressão}
- [ ] Pipeline / Oportunidades — {primeira impressão}
- [ ] Automações — {primeira impressão}
- [ ] Configurações — {primeira impressão}

## Decisão estrutural
> O Growth CRM vai ser o **sistema operacional** do meu negócio.
> Toda informação de lead/cliente/negociação mora aqui — não na cabeça, não no WhatsApp.

## Próximo passo
- [ ] D4.2 Setup Inicial agendado pra {data}

> "O CRM não é ferramenta. É o sistema nervoso da operação de vendas."
\`\`\`

Title: \`Mapa do meu CRM — {nome}\`.`;

export const bemVindoCrmFlow: AgentFlow = {
  destravamentoSlugs: ['d-4-1-bem-vindo-crm'],
  artifactKind: 'outro',
  tools: ['saveArtifact', 'updateProfile', 'markComplete'],
  suggestedFirstMessage:
    'Bem-vindo ao Growth CRM — daqui pra frente esse é o sistema operacional do teu negócio, não mais uma ferramenta isolada. Antes do tour: hoje, onde mora a informação dos teus leads e clientes? Cabeça, WhatsApp, planilha?',
  systemPrompt: [IDENTITY, VOICE_JOEL, RULES_HARD, PROCEDIMENTO, ARTIFACT_FORMAT, OUTPUT_RULES].join(
    '\n\n'
  ),
};
