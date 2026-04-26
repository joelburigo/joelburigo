import 'server-only';

/**
 * Registry de flows específicos por destravamento âncora.
 *
 * 8 destravamentos âncora têm prompt customizado + tool allow-list + artifactKind:
 *   - D1.4 Diagnóstico 6Ps          → diagnostico.ts
 *   - D1.6 Plano 90 Dias            → plano-90-dias.ts
 *   - D2.1 Posicionamento (P1)      → posicionamento.ts
 *   - D2.4 Persona / ICP            → persona-icp.ts
 *   - D3.2 Oferta Irresistível      → oferta-nucleo.ts
 *   - D3.3 Precificação             → precificacao.ts
 *   - D8.4 Cold Email + WhatsApp    → cold-outreach.ts
 *   - D8.5 Cadência Multicanal      → cadencia-multicanal.ts
 *
 * Os outros 58 destravamentos seguem o prompt genérico em `agent.ts` (sem regressão).
 *
 * Pra adicionar um novo flow: crie `<slug>.ts` exportando `AgentFlow`, importe aqui e
 * registre em `FLOWS`. Ver `docs/backend/AGENT_FLOWS.md`.
 */

import { diagnosticoFlow } from './diagnostico';
import { plano90DiasFlow } from './plano-90-dias';
import { posicionamentoFlow } from './posicionamento';
import { personaIcpFlow } from './persona-icp';
import { ofertaNucleoFlow } from './oferta-nucleo';
import { precificacaoFlow } from './precificacao';
import { coldOutreachFlow } from './cold-outreach';
import { cadenciaMulticanalFlow } from './cadencia-multicanal';

export type AgentToolName =
  | 'saveArtifact'
  | 'updateProfile'
  | 'markComplete'
  | 'requestHumanReview';

export interface AgentFlow {
  /** Slugs do `vss_destravamentos` que esse flow atende. Pode mapear pra mais de 1. */
  destravamentoSlugs: string[];
  /** Prompt completo (sem o bloco de contexto dinâmico — agent.ts adiciona depois). */
  systemPrompt: string;
  /** Subset de tools disponíveis nesse flow. Tudo que estiver fora é filtrado. */
  tools: AgentToolName[];
  /** Override de model name (default vem de getModel('chat')). */
  model?: string;
  /** Mensagem sugerida pra primeiro turno (placeholder do chat vazio). */
  suggestedFirstMessage?: string;
  /** `kind` que vai pra agent_artifacts.kind quando saveArtifact for chamado. */
  artifactKind: string;
}

const FLOWS: AgentFlow[] = [
  diagnosticoFlow,
  plano90DiasFlow,
  posicionamentoFlow,
  personaIcpFlow,
  ofertaNucleoFlow,
  precificacaoFlow,
  coldOutreachFlow,
  cadenciaMulticanalFlow,
];

/** Index slug → flow pra lookup O(1). */
const SLUG_INDEX: Map<string, AgentFlow> = (() => {
  const m = new Map<string, AgentFlow>();
  for (const f of FLOWS) {
    for (const slug of f.destravamentoSlugs) {
      if (m.has(slug)) {
        // dev-time guard — duplicação seria bug
        throw new Error(`[agent-flows] slug duplicado: ${slug}`);
      }
      m.set(slug, f);
    }
  }
  return m;
})();

/** Retorna o flow específico pro destravamento, ou null se for genérico. */
export function getFlowFor(destravamentoSlug: string): AgentFlow | null {
  return SLUG_INDEX.get(destravamentoSlug) ?? null;
}

/** Lista de slugs cobertos (pra admin/debug). */
export function listAnchoredSlugs(): string[] {
  return Array.from(SLUG_INDEX.keys());
}
