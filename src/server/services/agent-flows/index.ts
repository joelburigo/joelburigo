import 'server-only';

/**
 * Registry de flows específicos por destravamento âncora.
 *
 * **66 de 66 destravamentos VSS** com prompt customizado + tool allow-list +
 * artifactKind. Cobre 7 fases × 15 módulos × 66 aulas:
 *
 * - F1 Fundamentos        — D1.1-D1.6, D2.1-D2.5, D3.1-D3.4
 * - F2 Infraestrutura     — D4.1-D4.5, D5.1-D5.4
 * - F3 Atração            — D6.1-D6.4, D7.1-D7.4, D8.1-D8.5
 * - F4 Conversão          — D9.1-D9.4, D10.1-D10.5
 * - F5 Sistema/Integração — D11.1-D11.4
 * - F6 Automação          — D12.1-D12.4, D13.1-D13.4
 * - F7 Crescimento        — D14.1-D14.4, D15.1-D15.4
 *
 * Voz e procedimento extraídos literal de `docs/conteudo/partes/parte3-aulas-fase{1..7}.md`
 * + `04-playbook-vss.md`. Voz Joel via `_shared/voice.ts`.
 *
 * Pra adicionar/editar flow: ver `docs/backend/AGENT_FLOWS.md`.
 */

// ============ Sprint 2 (8 flows-âncora iniciais) ============
import { diagnosticoFlow } from './diagnostico';
import { plano90DiasFlow } from './plano-90-dias';
import { posicionamentoFlow } from './posicionamento';
import { personaIcpFlow } from './persona-icp';
import { ofertaNucleoFlow } from './oferta-nucleo';
import { precificacaoFlow } from './precificacao';
import { coldOutreachFlow } from './cold-outreach';
import { cadenciaMulticanalFlow } from './cadencia-multicanal';

// ============ Sprint 5C (7 flows D1.x/D2.x restantes) ============
import { bemVindoVssFlow } from './bem-vindo-vss';
import { conhecaJoelFlow } from './conheca-joel';
import { framework6psFlow } from './framework-6ps';
import { maquinaVendasFlow } from './maquina-vendas';
import { puvWorkshopFlow } from './puv-workshop';
import { p2PublicoFlow } from './p2-publico';
import { bigIdeaFlow } from './big-idea';

// ============ Sprint 6A — Produto + Métricas + Pessoas (10) ============
import { produtoPmfFlow } from './produto-pmf';
import { metasKpisFlow } from './metas-kpis';
import { metricasImportamFlow } from './metricas-importam';
import { abOtimizacaoFlow } from './ab-otimizacao';
import { coorteChurnFlow } from './coorte-churn';
import { culturaDataDrivenFlow } from './cultura-data-driven';
import { p6PessoasFlow } from './p6-pessoas';
import { contratacaoTreinamentoFlow } from './contratacao-treinamento';
import { plano180365Flow } from './plano-180-365';
import { comunidadeNetworkingFlow } from './comunidade-networking';

// ============ Sprint 6B — CRM + Casa Digital (9) ============
import { bemVindoCrmFlow } from './bem-vindo-crm';
import { setupInicialCrmFlow } from './setup-inicial-crm';
import { contatosOportunidadesFlow } from './contatos-oportunidades';
import { importacaoBaseFlow } from './importacao-base';
import { automacoesIniciaisFlow } from './automacoes-iniciais';
import { casaDigitalFlow } from './casa-digital';
import { siteLandingCrmFlow } from './site-landing-crm';
import { gmnSeoLocalFlow } from './gmn-seo-local';
import { redesVitrineFlow } from './redes-vitrine';

// ============ Sprint 6C — Conteúdo + Tráfego + Prospecção (11) ============
import { marketingConteudoFlow } from './marketing-conteudo';
import { seoPraticoFlow } from './seo-pratico';
import { redesOrganicasFlow } from './redes-organicas';
import { calendarioConteudoFlow } from './calendario-conteudo';
import { trafegoPagoFundamentosFlow } from './trafego-pago-fundamentos';
import { metaAdsFlow } from './meta-ads';
import { googleAdsFlow } from './google-ads';
import { otimizandoCampanhasFlow } from './otimizando-campanhas';
import { prospeccaoAlternativaFlow } from './prospeccao-alternativa';
import { listasProspectsFlow } from './listas-prospects';
import { linkedinInstagramFlow } from './linkedin-instagram';

// ============ Sprint 6D — Funil + Vendas (9) ============
import { anatomiaFunilFlow } from './anatomia-funil';
import { landingConversaoFlow } from './landing-conversao';
import { nutricaoEmailFlow } from './nutricao-email';
import { whatsappCrmFlow } from './whatsapp-crm';
import { qualificacaoBantSpinFlow } from './qualificacao-bant-spin';
import { scriptsAtendimentoFlow } from './scripts-atendimento';
import { objecoesFlow } from './objecoes';
import { tecnicasFechamentoFlow } from './tecnicas-fechamento';
import { posVendaIndicacoesFlow } from './pos-venda-indicacoes';

// ============ Sprint 6E — Sistema + Automação + IA (12) ============
import { p4IntegracaoFlow } from './p4-integracao';
import { p5ProcessosFlow } from './p5-processos';
import { dashboardExecutivoFlow } from './dashboard-executivo';
import { preparandoEscalarFlow } from './preparando-escalar';
import { workflowsComplexosFlow } from './workflows-complexos';
import { segmentacaoComportamentalFlow } from './segmentacao-comportamental';
import { carrinhoUpsellFlow } from './carrinho-upsell';
import { reguasRelacionamentoFlow } from './reguas-relacionamento';
import { agentesIaFundamentosFlow } from './agentes-ia-fundamentos';
import { agenteWhatsappFlow } from './agente-whatsapp';
import { handoffIaHumanoFlow } from './handoff-ia-humano';
import { treinandoAgenteFlow } from './treinando-agente';

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
  // Sprint 2
  diagnosticoFlow,
  plano90DiasFlow,
  posicionamentoFlow,
  personaIcpFlow,
  ofertaNucleoFlow,
  precificacaoFlow,
  coldOutreachFlow,
  cadenciaMulticanalFlow,
  // Sprint 5C
  bemVindoVssFlow,
  conhecaJoelFlow,
  framework6psFlow,
  maquinaVendasFlow,
  puvWorkshopFlow,
  p2PublicoFlow,
  bigIdeaFlow,
  // Sprint 6A
  produtoPmfFlow,
  metasKpisFlow,
  metricasImportamFlow,
  abOtimizacaoFlow,
  coorteChurnFlow,
  culturaDataDrivenFlow,
  p6PessoasFlow,
  contratacaoTreinamentoFlow,
  plano180365Flow,
  comunidadeNetworkingFlow,
  // Sprint 6B
  bemVindoCrmFlow,
  setupInicialCrmFlow,
  contatosOportunidadesFlow,
  importacaoBaseFlow,
  automacoesIniciaisFlow,
  casaDigitalFlow,
  siteLandingCrmFlow,
  gmnSeoLocalFlow,
  redesVitrineFlow,
  // Sprint 6C
  marketingConteudoFlow,
  seoPraticoFlow,
  redesOrganicasFlow,
  calendarioConteudoFlow,
  trafegoPagoFundamentosFlow,
  metaAdsFlow,
  googleAdsFlow,
  otimizandoCampanhasFlow,
  prospeccaoAlternativaFlow,
  listasProspectsFlow,
  linkedinInstagramFlow,
  // Sprint 6D
  anatomiaFunilFlow,
  landingConversaoFlow,
  nutricaoEmailFlow,
  whatsappCrmFlow,
  qualificacaoBantSpinFlow,
  scriptsAtendimentoFlow,
  objecoesFlow,
  tecnicasFechamentoFlow,
  posVendaIndicacoesFlow,
  // Sprint 6E
  p4IntegracaoFlow,
  p5ProcessosFlow,
  dashboardExecutivoFlow,
  preparandoEscalarFlow,
  workflowsComplexosFlow,
  segmentacaoComportamentalFlow,
  carrinhoUpsellFlow,
  reguasRelacionamentoFlow,
  agentesIaFundamentosFlow,
  agenteWhatsappFlow,
  handoffIaHumanoFlow,
  treinandoAgenteFlow,
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
