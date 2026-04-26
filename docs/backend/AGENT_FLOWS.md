# Agent Flows — flows específicos por destravamento

> Sprint 2 entrega 1. Versão atual: **v1** (8 destravamentos âncora).

Os 66 destravamentos do VSS rodam, por padrão, o prompt genérico definido em `src/server/services/agent.ts` (`SYSTEM_BASE`). Pra os 8 destravamentos âncora — os de maior valor pro aluno destravar nos primeiros dias — temos prompts customizados, tool allow-lists e schemas de artifact específicos em `src/server/services/agent-flows/`.

## Os 8 flows âncora (v1)

| Code | Slug                          | Flow file                  | Artifact kind  |
| ---- | ----------------------------- | -------------------------- | -------------- |
| D1.4 | d-1-4-diagnostico             | `diagnostico.ts`           | `diagnostico`  |
| D1.6 | d-1-6-plano-90-dias           | `plano-90-dias.ts`         | `plano_acao`   |
| D2.1 | d-2-1-p1-posicionamento       | `posicionamento.ts`        | `oferta`       |
| D2.4 | d-2-4-personas                | `persona-icp.ts`           | `icp`          |
| D3.2 | d-3-2-oferta-irresistivel     | `oferta-nucleo.ts`         | `oferta`       |
| D3.3 | d-3-3-precificacao            | `precificacao.ts`          | `precificacao` |
| D8.4 | d-8-4-cold-email-whatsapp     | `cold-outreach.ts`         | `cadencia`     |
| D8.5 | d-8-5-cadencias-multicanal    | `cadencia-multicanal.ts`   | `cadencia`     |

DB: estes destravamentos têm `flow_kind = 'agent_anchored_v1'` (ver `src/server/db/seed/vss.ts`). Os outros 58 ficam em `agent_guided`.

## Anatomia de um flow

```ts
export const ofertaNucleoFlow: AgentFlow = {
  destravamentoSlugs: ['d-3-2-oferta-irresistivel'],
  artifactKind: 'oferta',
  tools: ['saveArtifact', 'updateProfile', 'markComplete', 'requestHumanReview'],
  suggestedFirstMessage: 'Em 30 min montamos tua oferta empilhada...',
  systemPrompt: [IDENTITY, VOICE_JOEL, RULES_HARD, PROCEDIMENTO, ARTIFACT_FORMAT, OUTPUT_RULES].join('\n\n'),
};
```

- `systemPrompt` substitui o `SYSTEM_BASE` genérico. O bloco de contexto dinâmico (destravamento + perfil 6P) é appended depois pelo `agent.ts` — não duplique.
- `tools` é um allow-list. Tudo fora dessa lista é filtrado pelo `buildAgentTools(ctx, allowed)` antes de chegar no `streamText`.
- `model` (opcional) sobrescreve `getModel('chat')`. Não usado em v1.
- Prompt em PARTS (`IDENTITY`, `VOICE_JOEL`, `PROCEDIMENTO`, etc.) — cada uma é uma `const` separada. Sem strings de 1 linha gigantes.

## Voz Joel (compartilhada)

Tudo em `_shared/voice.ts`:
- `FLOW_PREAMBLE` — abertura padrão.
- `VOICE_JOEL` — pronome, vocabulário canônico, tom.
- `RULES_HARD` — proibições (jargão IA, motivacional vazio, inventar caso/número).
- `OUTPUT_RULES` — formato markdown, uma pergunta por vez, quando chamar tool.

Fonte de verdade humana: `docs/conteudo/brand/ANTI_DRIFT.md` + `docs/conteudo/brand/USAGE.md` + `docs/conteudo/partes/04-playbook-vss.md`. Se atualizar voz, atualize `_shared/voice.ts` e o ANTI_DRIFT em paralelo.

## Tools disponíveis (todas no v1)

- `saveArtifact({ title, content_md, kind })` — persiste markdown estruturado em `agent_artifacts`. Usar quando o aluno aprovar o entregável.
- `updateProfile({ field, value })` — patch em `user_profiles` (campos 6P + base). Usar conforme aluno revela info nova, sem esperar o final.
- `markComplete({ summary? })` — só após confirmação explícita do aluno ("fechado", "tá ótimo"). Marca `user_progress.completed_at` + `agent_conversations.status = 'completed'`.
- `requestHumanReview({ reason })` — sinaliza pra Joel revisar (status `needs_review`). Usar quando fora de escopo ou travado.

## Fluxo de aprovação (artifact → markComplete)

1. Agente conduz a coleta seguindo o procedimento do flow.
2. Quando os campos do artifact estão completos, monta a versão final em markdown e **mostra pro aluno revisar antes** de chamar `saveArtifact`.
3. Após `saveArtifact`, espera confirmação explícita ("pode marcar como pronto") antes de `markComplete`.
4. Sugere o próximo destravamento conectado (ex: D3.2 Oferta → D3.3 Precificação).

## Adicionar novo flow

1. Criar `src/server/services/agent-flows/<slug>.ts` exportando `<slug>Flow: AgentFlow`.
2. Importar e registrar em `src/server/services/agent-flows/index.ts` (array `FLOWS`).
3. Adicionar slug em `ANCHORED_SLUGS` em `src/server/db/seed/vss.ts`.
4. Rodar `pnpm db:seed` pra atualizar `flow_kind` no DB.
5. Smoke-test: `curl -sL -c /tmp/v.txt http://localhost:4321/api/dev/login?as=vss` + POST em `/api/agent/chat`.

## Não-objetivos (intencionais)

- Sem versionamento de prompt em DB (v1 é code-as-truth — git + code review é suficiente).
- Sem A/B test de prompt (Sprint 4+).
- Sem search semântica de artifacts prévios (Sprint 3 traz `searchPriorArtifacts`).
