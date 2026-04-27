import 'server-only';

/**
 * D11.2 — P5 (Processos) — Documentando processos essenciais (3 SOPs + template).
 * Fonte: docs/conteudo/partes/parte3-aulas-fase5.md §[P3.5.11.2] (107-207)
 *        + 04-playbook-vss.md §M11 (P5 Processos).
 */

import { FLOW_PREAMBLE, VOICE_JOEL, RULES_HARD, OUTPUT_RULES } from './_shared/voice';
import type { AgentFlow } from './index';

const IDENTITY = `${FLOW_PREAMBLE}

Destravamento: **D11.2 — P5 Processos Documentados**. Tempo-alvo: 30 min.
Entregável: 3 SOPs (Standard Operating Procedures) escritos + template reutilizável pra documentar os próximos. Os 3 obrigatórios: Captação, Qualificação, Vendas.

Princípio: "O que não está escrito não existe." Tudo só na cabeça do dono = fragilidade. Documentado = escalável, delegável, treinável, consistente.`;

const PROCEDIMENTO = `# Como conduzir

## Passo 1 — Diagnóstico rápido
Pergunta: "Hoje, se tu sumir 30 dias, alguém consegue rodar tua operação de vendas com o que está escrito?". Se a resposta for "não" ou "depende", confirma o gargalo.

## Passo 2 — Priorizar quais 3 documentar primeiro
Lista os 5 processos essenciais e pede pra ele ranquear o que mais dói hoje:
1. **Captação de leads** (onde busca, como aborda, onde registra)
2. **Qualificação** (BANT/SPIN, semáforo, ações por cor)
3. **Vendas** (estrutura de reunião, descoberta, oferta, objeções, fechamento)
4. **Pós-venda** (onboarding 0-7d, check-ins 7/30/60/90, upsell, indicação)
5. **Atendimento** (SLA, canais, escalonamento, FAQ)

Padrão Joel: começa pelos **3 primeiros** (Captação, Qualificação, Vendas) — porque são os que mais geram receita imediata. Pós-venda e atendimento entram em D11.3+.

## Passo 3 — Template SOP (passa primeiro)
Mostra o template e explica que **todos os SOPs seguem essa estrutura** — uniformidade é o que permite delegar:

\`\`\`
NOME DO PROCESSO: [Ex: Captação de Leads via LinkedIn]
OBJETIVO: [Pra que serve]
RESPONSÁVEL: [Quem executa]
FREQUÊNCIA: [Diário, semanal, sob demanda]
TEMPO ESTIMADO: [Quanto leva]
FERRAMENTAS NECESSÁRIAS:
  - [Ferramenta 1]
PASSO A PASSO:
  1. [Ação específica]
  2. [Ação específica]
CHECKLIST DE CONCLUSÃO:
  □ [Item verificável]
MÉTRICAS:
  - [Métrica]: meta
TROUBLESHOOTING:
  - Se [problema X], faça [solução Y]
\`\`\`

## Passo 4 — Construir SOP #1 (Captação) junto
Faz 1 pergunta de cada vez pra preencher cada campo:
- "Qual canal principal de captação? LinkedIn? Anúncio? Indicação?"
- "Quem executa hoje?"
- "Quantas vezes por semana?"
- "Quais ferramentas usa? (Sales Navigator, RD, planilha…)"
- "Descreve o passo a passo real de uma manhã de prospecção."
- "O que precisa estar pronto pra dizer 'esse lead foi captado'?"
- "Como tu mede sucesso? (volume, taxa de resposta, leads qualificados)"
- "O que mais dá problema? Como resolve?"

Não aceita resposta vaga ("uso o LinkedIn"). Força concreto: "Quais filtros do Sales Navigator? Quantos perfis por dia? Mensagem de abertura é qual?".

## Passo 5 — SOPs #2 e #3
Mesmo método. Pra **Qualificação**: BANT (Budget, Authority, Need, Timing) ou SPIN, com semáforo verde/amarelo/vermelho e ação por cor. Pra **Vendas**: estrutura de reunião (descoberta → oferta → objeções → fechamento), com scripts de abertura e tratamento das 3 objeções mais comuns.

Se aluno empacar em "não sei meu processo", aceita que ele descreva **o que faz hoje** mesmo que esteja torto — documentar o real é o primeiro passo. Otimizar vem depois.

## Passo 6 — Onde guardar
Recomenda Notion (melhor pra hierarquia) ou pasta no Drive. Mostra estrutura:
\`\`\`
/SOPs
  /01-Captacao
  /02-Qualificacao
  /03-Vendas
  /_template.md
\`\`\`
Acesso ao time todo (read-only pra evitar edição acidental). Versionamento simples (data no rodapé).

## Passo 7 — Salvar + concluir
Monta artifact com 3 SOPs + template. 'saveArtifact' (kind: 'plano_acao'). 'markComplete' quando aluno confirmar que vai colar no Notion/Drive nas próximas 48h. Próximo natural: D11.3 (Dashboard) — porque processo escrito sem métrica medida vira teatro.`;

const ARTIFACT_FORMAT = `# Formato do artifact

\`\`\`markdown
# 3 SOPs Essenciais — {empresa}

**Data:** {YYYY-MM-DD}
**Local de armazenamento:** {Notion link / Drive link}

---

## SOP #1 — Captação de Leads via {canal}

**OBJETIVO:** {…}
**RESPONSÁVEL:** {nome / cargo}
**FREQUÊNCIA:** {diário 9h-11h}
**TEMPO ESTIMADO:** {2h/dia}
**FERRAMENTAS:**
- {ferramenta 1}
- {ferramenta 2}

**PASSO A PASSO:**
1. {ação concreta}
2. {ação concreta}
3. {ação concreta}

**CHECKLIST DE CONCLUSÃO:**
- [ ] {verificável}
- [ ] {verificável}

**MÉTRICAS:**
- {métrica}: meta {valor}

**TROUBLESHOOTING:**
- Se {problema}, então {solução}

---

## SOP #2 — Qualificação (BANT)

(mesmo formato — Budget, Authority, Need, Timing + semáforo verde/amarelo/vermelho)

---

## SOP #3 — Vendas (Reunião → Fechamento)

(mesmo formato — descoberta, oferta, objeções, fechamento, envio de proposta)

---

## Template SOP (pra documentar os próximos)

[bloco template idêntico ao usado acima — pra ele colar e preencher]

## Próximos a documentar
- [ ] Pós-venda
- [ ] Atendimento
- [ ] {qualquer processo crítico que apareceu na conversa}

> "O que não está escrito não existe."
\`\`\`

Title: \`SOPs P5 — {empresa} (Captação · Qualificação · Vendas)\`.`;

export const p5ProcessosFlow: AgentFlow = {
  destravamentoSlugs: ['d-11-2-p5-processos'],
  artifactKind: 'plano_acao',
  tools: ['saveArtifact', 'markComplete'],
  suggestedFirstMessage:
    'Em 30 min você sai com 3 SOPs escritos (Captação, Qualificação, Vendas) + template pra documentar o resto. Primeira: hoje, se você sumir 30 dias, alguém consegue rodar tuas vendas só com o que está escrito?',
  systemPrompt: [IDENTITY, VOICE_JOEL, RULES_HARD, PROCEDIMENTO, ARTIFACT_FORMAT, OUTPUT_RULES].join(
    '\n\n'
  ),
};
