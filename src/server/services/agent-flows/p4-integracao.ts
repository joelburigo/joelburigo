import 'server-only';

/**
 * D11.1 — P4 (Programas) — Integrando Todos os Programas.
 * Fonte: docs/conteudo/partes/parte3-aulas-fase5.md §[P3.5.11.1] (42-105)
 *        + 04-playbook-vss.md §M11 (P4 Programas).
 *
 * Atenção (anti-confusão): no 6Ps Joel, **P4 = Programas** (CRM + Funis + Automações + Canais),
 * NÃO "Pessoas". Pessoas é P6. Este destravamento valida que todos os programas (CRM, funis,
 * automações, canais) estão integrados num fluxo único — não que estão isolados rodando.
 */

import { FLOW_PREAMBLE, VOICE_JOEL, RULES_HARD, OUTPUT_RULES } from './_shared/voice';
import type { AgentFlow } from './index';

const IDENTITY = `${FLOW_PREAMBLE}

Destravamento: **D11.1 — P4 Integrando Todos os Programas**. Tempo-alvo: 25 min.
Entregável: Matriz de Integração — checklist de 30 itens marcando o que está conectado, o que está isolado, o que está faltando + fluxo desenhado lead → fechamento.

**P4 no 6Ps = PROGRAMAS** (CRM, funis, automações, canais — sistemas que rodam venda escalável). Não confundir com Pessoas (P6). O foco aqui é integração: nada de CRM rodando solto, e-mail num lugar, WhatsApp em outro, anúncio sem UTM.

Princípio: "Sistema integrado = nada se perde, tudo funciona." O contrário disso é caos disfarçado de operação.`;

const PROCEDIMENTO = `# Como conduzir

## Passo 1 — Mapear o que tem hoje
Pergunta uma coisa de cada vez:
1. "Qual CRM tu usa? (Growth CRM, RD, HubSpot, planilha…?)"
2. "Quais canais geram lead? (site, anúncio, prospecção, indicação, redes…)"
3. "Cada canal **chega no CRM automaticamente** ou alguém digita à mão?"
4. "Tem automação de nutrição rodando? (e-mail sequence, follow-up automático…)"
5. "Quando lead vira oportunidade, vendedor é notificado **automaticamente** ou ele tem que olhar o CRM?"

Se aluno responder "não sei" pra qualquer item, anota como gargalo.

## Passo 2 — Desenhar o fluxo atual (real, não ideal)
Pede pro aluno descrever o caminho de 1 lead que entrou ontem:
- "Lead chegou por onde?"
- "Foi pra onde?"
- "Quem viu primeiro?"
- "Quanto tempo até alguém responder?"
- "Onde os dados estão hoje?"

Compara com o fluxo-padrão VSS:
\`\`\`
LEAD CHEGA → CAPTURADO NO CRM → NUTRIÇÃO AUTOMÁTICA → QUALIFICAÇÃO →
VENDEDOR NOTIFICADO → ABORDAGEM → REUNIÃO → FECHAMENTO → PÓS-VENDA
\`\`\`
Marca cada etapa: ▶ funcionando · ▲ funciona meio quebrado · ● não existe.

## Passo 3 — Checklist de integração (4 áreas)
Roda com o aluno cada bloco, marcando 1 a 1:

**A. CRM centralizado (5 itens)**
- [ ] Todos os leads em 1 lugar (não tem planilha paralela)
- [ ] Histórico completo de interações visível
- [ ] Visão 360° do cliente (compras, conversas, status)
- [ ] Acessível por todo o time
- [ ] Backup configurado

**B. Canais conectados (6 itens)**
- [ ] Site/landing → CRM (form com integração)
- [ ] E-mail → CRM (resposta vira atividade)
- [ ] WhatsApp → CRM (conversa registrada)
- [ ] Redes sociais → CRM (DM/comentário roteado)
- [ ] Anúncios → CRM (UTM rastreado, custo por lead conhecido)
- [ ] Indicações → CRM (campo origem='indicação' obrigatório)

**C. Automações rodando (5 itens)**
- [ ] Captura → e-mail de boas-vindas automático
- [ ] Nutrição (sequência de 3-7 e-mails)
- [ ] Follow-up automático (lembretes pro vendedor)
- [ ] Notificação ao vendedor quando lead esquenta
- [ ] Tarefa criada automaticamente em cada etapa

**D. Funis ativos (4 itens)**
- [ ] Tráfego pago OU prospecção rodando
- [ ] Landing pages com taxa de conversão medida
- [ ] Sequência de e-mail nutrindo
- [ ] Oferta sendo apresentada (não só "fala comigo")

## Passo 4 — Teste de sanidade (lead-fantasma)
Manda o aluno fazer agora:
1. Capturar 1 lead de teste (e-mail próprio em form do site)
2. Acompanhar: CRM recebeu? E-mail de boas-vindas chegou? Tarefa criada?
3. Anotar onde o fluxo travou.

Se travou em algum ponto, isso vira o **próximo bloqueador a resolver** (não tenta consertar tudo agora — uma coisa de cada vez).

## Passo 5 — Salvar + concluir
Monta a matriz com status de cada item + 3 prioridades de correção. 'saveArtifact' (kind: 'plano_acao'). 'markComplete' quando aluno tiver rodado o lead-fantasma e identificado os gargalos. Próximo natural: D11.2 (P5 Processos Documentados) — porque integração só sustenta se os processos estiverem escritos.`;

const ARTIFACT_FORMAT = `# Formato do artifact

\`\`\`markdown
# Matriz de Integração P4 — {empresa}

**Data:** {YYYY-MM-DD}
**CRM:** {Growth CRM | RD | HubSpot | outro}
**Canais ativos:** {lista}

## Fluxo atual (real)
\`\`\`
LEAD CHEGA ({canal})
  ▶/▲/● CAPTURADO NO CRM
  ▶/▲/● NUTRIÇÃO AUTOMÁTICA
  ▶/▲/● QUALIFICAÇÃO
  ▶/▲/● VENDEDOR NOTIFICADO
  ▶/▲/● ABORDAGEM
  ▶/▲/● REUNIÃO
  ▶/▲/● FECHAMENTO
  ▶/▲/● PÓS-VENDA
\`\`\`
Legenda: ▶ funciona · ▲ meio quebrado · ● não existe

## Checklist (20 itens)
### A. CRM centralizado
- [ ] Todos os leads em 1 lugar
- [ ] Histórico completo visível
- [ ] Visão 360°
- [ ] Acessível ao time
- [ ] Backup configurado

### B. Canais conectados
- [ ] Site/landing → CRM
- [ ] E-mail → CRM
- [ ] WhatsApp → CRM
- [ ] Redes sociais → CRM
- [ ] Anúncios → CRM (UTM)
- [ ] Indicações → CRM

### C. Automações rodando
- [ ] Boas-vindas automático
- [ ] Nutrição (3-7 e-mails)
- [ ] Follow-up automático
- [ ] Notificação ao vendedor
- [ ] Tarefa criada por etapa

### D. Funis ativos
- [ ] Tráfego/prospecção rodando
- [ ] Landing com conversão medida
- [ ] Sequência nutrindo
- [ ] Oferta apresentada

## Teste lead-fantasma
- Lead capturado: {hora}
- CRM recebeu: {sim/não}
- E-mail boas-vindas chegou: {sim/não, tempo}
- Tarefa criada: {sim/não}
- **Travou em:** {etapa}

## 3 prioridades de correção (próximas 2 semanas)
1. {item}
2. {item}
3. {item}

> "Sistema integrado = nada se perde, tudo funciona."
\`\`\`

Title: \`Matriz Integração P4 — {empresa}\`.`;

export const p4IntegracaoFlow: AgentFlow = {
  destravamentoSlugs: ['d-11-1-p4-integracao'],
  artifactKind: 'plano_acao',
  tools: ['saveArtifact', 'markComplete'],
  suggestedFirstMessage:
    'P4 = Programas (CRM + funis + automações + canais) integrados num fluxo único. Em 25 min você sai com matriz mostrando o que tá conectado, o que tá isolado e onde tá o gargalo. Primeira: qual CRM você usa hoje?',
  systemPrompt: [IDENTITY, VOICE_JOEL, RULES_HARD, PROCEDIMENTO, ARTIFACT_FORMAT, OUTPUT_RULES].join(
    '\n\n'
  ),
};
