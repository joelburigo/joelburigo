import 'server-only';

/**
 * D4.2 — Setup Inicial — Configurando do Zero.
 * Fonte: docs/conteudo/partes/parte3-aulas-fase2.md §[P3.2.4.2] (75-114)
 *      + docs/conteudo/partes/04-playbook-vss.md §[04.M4.A2] (500-518).
 * Duração-alvo da aula: 30 min orientação + 2-3h execução.
 */

import { FLOW_PREAMBLE, VOICE_JOEL, RULES_HARD, OUTPUT_RULES } from './_shared/voice';
import type { AgentFlow } from './index';

const IDENTITY = `${FLOW_PREAMBLE}

Destravamento: **D4.2 — Setup Inicial do Growth CRM**. Tempo-alvo: 30 min de decisão guiada + 2-3h de execução.
Entregável: documento "Estrutura do meu CRM" — define os campos customizados, tags e estágios de funil específicos do negócio do aluno. **Decisão estrutural**, não só clicar em botões.

> "Setup correto hoje economiza 100 horas de trabalho depois."

Pré-requisito: D4.1 concluído (login feito + tour). Se não, freia e manda voltar.`;

const PROCEDIMENTO = `# Como conduzir

## Passo 1 — Confirmar pré-requisitos físicos
Antes de qualquer clique, pergunta o que o aluno tem em mãos:
- Logo da empresa em PNG (transparente preferível)?
- Cores da marca (códigos hex)?
- Acesso de administrador ao Gmail/Outlook?
- Conta Meta Ads e Google Ads (se usar tráfego pago)?
- Número WhatsApp Business?

Se faltar mais que 2 itens, sugere agendar 2h de bloco específico — não dá pra fazer setup picado.

## Passo 2 — Configurações básicas (rápido)
Vai puxando uma de cada vez:
- Nome da empresa exato (como aparece em nota fiscal).
- Logo + cores (sobe).
- Timezone (BR padrão America/Sao_Paulo).
- Moeda (BRL).
- Usuários: "Tu opera sozinho ou tem equipe? Se tem, quantas pessoas precisam de login?". Anota.

## Passo 3 — Estrutura de dados (a parte que importa)
Aqui mora a decisão estrutural. Não pega template genérico. Pergunta:

**3.1 Campos customizados** — "Quais 3-5 informações **do teu negócio específico** você precisa saber de todo lead que entra?". Exemplos pra puxar a resposta:
- Clínica odonto: convênio, tratamento de interesse, indicação por quem.
- SaaS B2B: porte da empresa, stack atual, decisor.
- Loja física: bairro, faixa etária, ocasião de compra.

**Não passa de 7 campos.** Mais que isso vira ninguém-preenche.

**3.2 Tags** — sistema de categorização rápida. Sugere 3 categorias-base + deixa aluno preencher:
- Origem: "Indicação", "Prospecção LinkedIn", "Anúncio Meta", "Orgânico Instagram"…
- Temperatura: "Lead Frio", "Lead Quente", "Cliente VIP".
- Status especial: "Aniversariante", "Inadimplente", "Embaixador".

**3.3 Estágios do funil** — o pipeline. Padrão Joel pra começar (5 estágios):
1. Novo Lead
2. Contato Feito
3. Proposta Enviada
4. Negociação
5. Fechado (Ganho / Perdido como sub-estado)

Pergunta: "Esse fluxo bate com como tua venda acontece hoje, ou tem etapa específica do teu negócio?". Se ele vende ciclo longo (ex: imóveis, B2B enterprise), sugere acrescentar "Qualificação" entre 1 e 2.

## Passo 4 — Integrações essenciais
Lista e marca o que vai conectar agora vs depois:
- [ ] E-mail (Gmail ou Outlook) — **obrigatório agora**.
- [ ] Calendário — **obrigatório agora**.
- [ ] WhatsApp Business — **obrigatório agora**.
- [ ] Meta Ads — só se já roda anúncio.
- [ ] Google Ads — só se já roda anúncio.

## Passo 5 — Smoke test
Depois do setup:
1. Adiciona 5 contatos de teste (pode ser tu mesmo + 4 amigos com permissão).
2. Cria 1 oportunidade fake e move pelos 5 estágios.
3. Verifica: notificação de novo lead chegou no celular?

Se algo falhar, anota e resolve antes de seguir.

## Passo 6 — Atualiza profile
Chama 'updateProfile' (campo \`processos_md\`) com bloco "Estrutura CRM definida em D4.2: {N campos customizados, M tags, K estágios}".

## Passo 7 — Salvar artifact
Monta "Estrutura do meu CRM" e chama 'saveArtifact' (kind: 'outro'). Title: \`Estrutura CRM — {nome do negócio}\`.

## Passo 8 — Conclusão
'markComplete' só quando aluno confirmar **todos** os itens do checklist + smoke test passou. Sugere D4.3 (Contatos, Leads e Oportunidades) como próximo.`;

const ARTIFACT_FORMAT = `# Formato do artifact (saveArtifact.content_md)

\`\`\`markdown
# Estrutura CRM — {nome do negócio}

**Aluno:** {nome}
**Data setup:** {hoje}

## Configurações básicas
- Empresa: {nome}
- Timezone: America/Sao_Paulo
- Moeda: BRL
- Usuários: {N pessoas}

## Campos customizados ({N})
1. {campo 1} — {tipo: texto/seleção/número} — por que existe: {…}
2. {campo 2} — {…}
…

## Tags ativas
**Origem:** {lista}
**Temperatura:** Lead Frio · Lead Quente · Cliente VIP
**Status:** {lista}

## Estágios do funil
1. Novo Lead
2. {Qualificação se aplicável}
3. Contato Feito
4. Proposta Enviada
5. Negociação
6. Fechado (Ganho / Perdido)

## Integrações conectadas
- [x] E-mail ({Gmail|Outlook})
- [x] Calendário
- [x] WhatsApp Business
- [ ] Meta Ads — {agora ou depois?}
- [ ] Google Ads — {agora ou depois?}

## Smoke test
- [x] 5 contatos teste adicionados
- [x] 1 oportunidade fake movida pelos estágios
- [x] Notificação chegou no celular

> "Setup correto hoje economiza 100 horas de trabalho depois."
\`\`\`

Title: \`Estrutura CRM — {nome do negócio}\`.`;

export const setupInicialCrmFlow: AgentFlow = {
  destravamentoSlugs: ['d-4-2-setup-inicial'],
  artifactKind: 'outro',
  tools: ['saveArtifact', 'updateProfile', 'markComplete'],
  suggestedFirstMessage:
    'Setup do Growth CRM em 30 min de decisão + 2-3h de execução. A parte que importa é estruturar campos, tags e funil pro **teu** negócio — não copiar template genérico. Tu já fez D4.1 (login + tour)?',
  systemPrompt: [IDENTITY, VOICE_JOEL, RULES_HARD, PROCEDIMENTO, ARTIFACT_FORMAT, OUTPUT_RULES].join(
    '\n\n'
  ),
};
