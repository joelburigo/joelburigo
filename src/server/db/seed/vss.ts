/**
 * VSS metadata seed — fases, módulos, destravamentos.
 *
 * Conteúdo extraído de docs/conteudo/partes/parte3-aulas-fase{1..7}.md
 * (fonte-de-verdade humana, cp 1:1 — não reescrever).
 *
 * Estrutura: 7 fases · 15 módulos · 66 destravamentos
 * Idempotente — safe rodar várias vezes (upsert por code/slug).
 */
import { eq } from 'drizzle-orm';
import type { Db } from '../client';
import { vss_phases, vss_modules, vss_destravamentos } from '../schema';
import { ulid } from '@/server/lib/ulid';

const CONTENT_VERSION = '2026-01-23';

interface DestravamentoSeed {
  code: string;
  slug: string;
  title: string;
  estimated_minutes: number;
}

interface ModuleSeed {
  code: string;
  slug: string;
  title: string;
  description: string;
  destravamentos: DestravamentoSeed[];
}

interface PhaseSeed {
  code: string;
  slug: string;
  title: string;
  description: string;
  modules: ModuleSeed[];
}

const PHASES: PhaseSeed[] = [
  {
    code: 'F1',
    slug: 'fundamentos',
    title: 'Fase 1 · Fundamentos',
    description:
      'Estratégia 100% documentada, diagnóstico completo dos 6Ps, posicionamento definido, público mapeado, oferta estruturada.',
    modules: [
      {
        code: 'M1',
        slug: 'sistema-vss-6ps',
        title: 'Módulo 1 · O Sistema VSS e os 6Ps',
        description:
          'Boas-vindas, framework dos 6Ps como GPS estratégico, diagnóstico inicial e plano de 90 dias.',
        destravamentos: [
          { code: 'D1.1', slug: 'd-1-1-bem-vindo-vss', title: 'Bem-vindo ao VSS — A Transformação Começa Aqui', estimated_minutes: 15 },
          { code: 'D1.2', slug: 'd-1-2-conheca-joel', title: 'Conheça Joel Burigo e a Missão do VSS', estimated_minutes: 12 },
          { code: 'D1.3', slug: 'd-1-3-framework-6ps', title: 'O Framework dos 6Ps — Seu GPS Estratégico', estimated_minutes: 35 },
          { code: 'D1.4', slug: 'd-1-4-diagnostico', title: 'Diagnóstico — Onde Você Está Hoje', estimated_minutes: 25 },
          { code: 'D1.5', slug: 'd-1-5-maquina-vendas', title: 'A Máquina de Vendas Integrada', estimated_minutes: 20 },
          { code: 'D1.6', slug: 'd-1-6-plano-90-dias', title: 'Seu Plano de Ação 90 Dias', estimated_minutes: 25 },
        ],
      },
      {
        code: 'M2',
        slug: 'p1-p2-posicionamento-publico',
        title: 'Módulo 2 · P1 + P2: Posicionamento e Público',
        description:
          'Posicionamento que diferencia, Proposta Única de Valor, mapeamento cirúrgico do público e Big Idea.',
        destravamentos: [
          { code: 'D2.1', slug: 'd-2-1-p1-posicionamento', title: 'P1 — Posicionamento Que Te Destaca', estimated_minutes: 25 },
          { code: 'D2.2', slug: 'd-2-2-puv-workshop', title: 'Workshop — Criando Sua Proposta Única de Valor (PUV)', estimated_minutes: 30 },
          { code: 'D2.3', slug: 'd-2-3-p2-publico', title: 'P2 — Público, O Coração da Estratégia', estimated_minutes: 25 },
          { code: 'D2.4', slug: 'd-2-4-personas', title: 'Construindo Suas Personas do Zero', estimated_minutes: 30 },
          { code: 'D2.5', slug: 'd-2-5-big-idea', title: 'Big Idea — Sua Mensagem Memorável', estimated_minutes: 20 },
        ],
      },
      {
        code: 'M3',
        slug: 'p3-produto-precificacao',
        title: 'Módulo 3 · P3: Produto e Precificação',
        description:
          'Oferta irresistível, product-market fit, precificação estratégica e definição de metas/KPIs.',
        destravamentos: [
          { code: 'D3.1', slug: 'd-3-1-p3-produto-pmf', title: 'P3 — Produto Irresistível e Product-Market Fit', estimated_minutes: 25 },
          { code: 'D3.2', slug: 'd-3-2-oferta-irresistivel', title: 'Criando Sua Oferta Irresistível', estimated_minutes: 30 },
          { code: 'D3.3', slug: 'd-3-3-precificacao', title: 'Precificação Estratégica', estimated_minutes: 25 },
          { code: 'D3.4', slug: 'd-3-4-metas-kpis', title: 'Definindo Metas e KPIs Essenciais', estimated_minutes: 20 },
        ],
      },
    ],
  },
  {
    code: 'F2',
    slug: 'infraestrutura',
    title: 'Fase 2 · Infraestrutura',
    description:
      'CRM configurado e alimentado, automações básicas funcionando, landing pages publicadas, presença digital profissional.',
    modules: [
      {
        code: 'M4',
        slug: 'growth-crm',
        title: 'Módulo 4 · Domine o Growth CRM',
        description:
          'Setup do Growth CRM do zero, gestão de contatos/oportunidades, importação de base e primeiras automações.',
        destravamentos: [
          { code: 'D4.1', slug: 'd-4-1-bem-vindo-crm', title: 'Bem-vindo ao Growth CRM — Seu Sistema Operacional', estimated_minutes: 15 },
          { code: 'D4.2', slug: 'd-4-2-setup-inicial', title: 'Setup Inicial — Configurando do Zero', estimated_minutes: 30 },
          { code: 'D4.3', slug: 'd-4-3-contatos-oportunidades', title: 'Contatos, Leads e Oportunidades', estimated_minutes: 25 },
          { code: 'D4.4', slug: 'd-4-4-importacao', title: 'Importando Sua Base Atual', estimated_minutes: 20 },
          { code: 'D4.5', slug: 'd-4-5-automacoes-iniciais', title: 'Primeiras Automações e Notificações', estimated_minutes: 30 },
        ],
      },
      {
        code: 'M5',
        slug: 'presenca-digital',
        title: 'Módulo 5 · Presença Digital Profissional',
        description:
          'Casa digital própria, landing pages no CRM, Google Meu Negócio + SEO local e redes sociais como vitrine.',
        destravamentos: [
          { code: 'D5.1', slug: 'd-5-1-casa-digital', title: 'Por Que Você Precisa de Uma Casa Digital', estimated_minutes: 15 },
          { code: 'D5.2', slug: 'd-5-2-site-landing', title: 'Criando Site ou Landing Page no CRM', estimated_minutes: 35 },
          { code: 'D5.3', slug: 'd-5-3-gmn-seo-local', title: 'Google Meu Negócio + SEO Local Básico', estimated_minutes: 25 },
          { code: 'D5.4', slug: 'd-5-4-redes-vitrine', title: 'Redes Sociais Como Vitrine', estimated_minutes: 20 },
        ],
      },
    ],
  },
  {
    code: 'F3',
    slug: 'atracao',
    title: 'Fase 3 · Atração',
    description:
      'Gerar leads qualificados de forma consistente, seja por tráfego orgânico, pago ou prospecção ativa.',
    modules: [
      {
        code: 'M6',
        slug: 'trafego-organico',
        title: 'Módulo 6 · Tráfego Orgânico',
        description:
          'Marketing de conteúdo, SEO prático, redes sociais orgânicas (Instagram + LinkedIn) e calendário editorial.',
        destravamentos: [
          { code: 'D6.1', slug: 'd-6-1-conteudo-atrai', title: 'Marketing de Conteúdo Que Atrai', estimated_minutes: 20 },
          { code: 'D6.2', slug: 'd-6-2-seo-pratico', title: 'SEO Prático Para Iniciantes', estimated_minutes: 25 },
          { code: 'D6.3', slug: 'd-6-3-redes-organicas', title: 'Redes Sociais Orgânicas (Instagram + LinkedIn)', estimated_minutes: 30 },
          { code: 'D6.4', slug: 'd-6-4-calendario-conteudo', title: 'Criando Seu Calendário de Conteúdo', estimated_minutes: 20 },
        ],
      },
      {
        code: 'M7',
        slug: 'trafego-pago',
        title: 'Módulo 7 · Tráfego Pago (Para Quem Tem Budget)',
        description:
          'Fundamentos de mídia paga, primeira campanha Meta Ads, Google Ads (busca/display) e otimização.',
        destravamentos: [
          { code: 'D7.1', slug: 'd-7-1-trafego-pago-fundamentos', title: 'Fundamentos de Tráfego Pago', estimated_minutes: 20 },
          { code: 'D7.2', slug: 'd-7-2-meta-ads', title: 'Meta Ads — Primeira Campanha', estimated_minutes: 30 },
          { code: 'D7.3', slug: 'd-7-3-google-ads', title: 'Google Ads — Busca e Display', estimated_minutes: 25 },
          { code: 'D7.4', slug: 'd-7-4-otimizando-campanhas', title: 'Otimizando e Escalando Campanhas', estimated_minutes: 20 },
        ],
      },
      {
        code: 'M8',
        slug: 'prospeccao-ativa',
        title: 'Módulo 8 · Prospecção Ativa Gratuita',
        description:
          'Alternativa sem budget: listas, LinkedIn/Instagram, cold email + WhatsApp ético e cadências multicanal.',
        destravamentos: [
          { code: 'D8.1', slug: 'd-8-1-prospeccao-alternativa', title: 'Prospecção Ativa: A Alternativa Sem Budget', estimated_minutes: 20 },
          { code: 'D8.2', slug: 'd-8-2-listas-prospects', title: 'Construindo Listas de Prospects', estimated_minutes: 30 },
          { code: 'D8.3', slug: 'd-8-3-linkedin-instagram', title: 'LinkedIn + Instagram Para Prospecção', estimated_minutes: 30 },
          { code: 'D8.4', slug: 'd-8-4-cold-email-whatsapp', title: 'Cold Email e WhatsApp Ético', estimated_minutes: 30 },
          { code: 'D8.5', slug: 'd-8-5-cadencias-multicanal', title: 'Cadências Multicanal no CRM', estimated_minutes: 25 },
        ],
      },
    ],
  },
  {
    code: 'F4',
    slug: 'conversao',
    title: 'Fase 4 · Conversão',
    description:
      'Converter leads em clientes através de funis estruturados e técnicas de fechamento.',
    modules: [
      {
        code: 'M9',
        slug: 'funis-conversao',
        title: 'Módulo 9 · Funis de Conversão',
        description:
          'Anatomia de funil, landing pages de alta conversão, nutrição por e-mail e WhatsApp integrado ao CRM.',
        destravamentos: [
          { code: 'D9.1', slug: 'd-9-1-anatomia-funil', title: 'Anatomia de Um Funil de Vendas', estimated_minutes: 20 },
          { code: 'D9.2', slug: 'd-9-2-landing-alta-conversao', title: 'Criando Landing Pages de Alta Conversão', estimated_minutes: 35 },
          { code: 'D9.3', slug: 'd-9-3-nutricao-email', title: 'Nutrição de Leads Por E-mail', estimated_minutes: 25 },
          { code: 'D9.4', slug: 'd-9-4-whatsapp-crm', title: 'Integrando WhatsApp ao CRM', estimated_minutes: 20 },
        ],
      },
      {
        code: 'M10',
        slug: 'fechamento-pos-venda',
        title: 'Módulo 10 · Fechamento e Pós-Venda',
        description:
          'Qualificação BANT/SPIN, scripts que convertem, tratamento de objeções, fechamento e programa de indicações.',
        destravamentos: [
          { code: 'D10.1', slug: 'd-10-1-qualificacao-bant-spin', title: 'Qualificação de Leads (BANT/SPIN)', estimated_minutes: 25 },
          { code: 'D10.2', slug: 'd-10-2-scripts-atendimento', title: 'Scripts de Atendimento Que Convertem', estimated_minutes: 30 },
          { code: 'D10.3', slug: 'd-10-3-objecoes', title: 'Tratamento de Objeções', estimated_minutes: 30 },
          { code: 'D10.4', slug: 'd-10-4-tecnicas-fechamento', title: 'Técnicas de Fechamento', estimated_minutes: 25 },
          { code: 'D10.5', slug: 'd-10-5-pos-venda-indicacoes', title: 'Pós-Venda e Programa de Indicações', estimated_minutes: 20 },
        ],
      },
    ],
  },
  {
    code: 'F5',
    slug: 'sistema',
    title: 'Fase 5 · Sistema',
    description:
      'Integrar todos os componentes em um sistema coeso e escalável.',
    modules: [
      {
        code: 'M11',
        slug: 'p4-p5-sistema-integrado',
        title: 'Módulo 11 · P4 + P5: Sistema Integrado',
        description:
          'P4 integrando todos os programas, P5 com processos documentados, dashboard executivo e preparação para escala.',
        destravamentos: [
          { code: 'D11.1', slug: 'd-11-1-p4-integracao', title: 'P4 — Integrando Todos os Programas', estimated_minutes: 25 },
          { code: 'D11.2', slug: 'd-11-2-p5-processos', title: 'P5 — Processos Documentados', estimated_minutes: 30 },
          { code: 'D11.3', slug: 'd-11-3-dashboard-executivo', title: 'Dashboard Executivo Unificado', estimated_minutes: 25 },
          { code: 'D11.4', slug: 'd-11-4-preparando-escalar', title: 'Preparando Para Escalar', estimated_minutes: 20 },
        ],
      },
    ],
  },
  {
    code: 'F6',
    slug: 'automacao',
    title: 'Fase 6 · Automação',
    description:
      'Automatizar processos e implementar IA para escalar operações.',
    modules: [
      {
        code: 'M12',
        slug: 'automacoes-avancadas',
        title: 'Módulo 12 · Automações Avançadas',
        description:
          'Workflows complexos, segmentação comportamental, recuperação de carrinho/upsell e réguas de relacionamento.',
        destravamentos: [
          { code: 'D12.1', slug: 'd-12-1-workflows-complexos', title: 'Workflows Complexos', estimated_minutes: 25 },
          { code: 'D12.2', slug: 'd-12-2-segmentacao-comportamental', title: 'Segmentação Comportamental Automática', estimated_minutes: 25 },
          { code: 'D12.3', slug: 'd-12-3-carrinho-upsell', title: 'Recuperação de Carrinho e Upsell', estimated_minutes: 25 },
          { code: 'D12.4', slug: 'd-12-4-reguas-relacionamento', title: 'Réguas de Relacionamento Inteligentes', estimated_minutes: 20 },
        ],
      },
      {
        code: 'M13',
        slug: 'agentes-ia',
        title: 'Módulo 13 · Agentes de IA Conversacional',
        description:
          'Fundamentos de agentes IA, agente WhatsApp 24/7, handoff inteligente IA→humano e treinamento contínuo.',
        destravamentos: [
          { code: 'D13.1', slug: 'd-13-1-agentes-ia-fundamentos', title: 'O Que São Agentes de IA e Como Funcionam', estimated_minutes: 20 },
          { code: 'D13.2', slug: 'd-13-2-agente-whatsapp', title: 'Configurando Agente de WhatsApp 24/7', estimated_minutes: 30 },
          { code: 'D13.3', slug: 'd-13-3-handoff-ia-humano', title: 'Handoff Inteligente (IA → Humano)', estimated_minutes: 20 },
          { code: 'D13.4', slug: 'd-13-4-treinando-agente', title: 'Treinando e Otimizando Seu Agente', estimated_minutes: 20 },
        ],
      },
    ],
  },
  {
    code: 'F7',
    slug: 'crescimento',
    title: 'Fase 7 · Crescimento',
    description:
      'Consolidar resultados, otimizar performance e preparar escala.',
    modules: [
      {
        code: 'M14',
        slug: 'analytics-melhoria-continua',
        title: 'Módulo 14 · Analytics e Melhoria Contínua',
        description:
          'Métricas que importam, testes A/B, análise de coorte/churn e cultura data-driven.',
        destravamentos: [
          { code: 'D14.1', slug: 'd-14-1-metricas-importam', title: 'Métricas Que Realmente Importam', estimated_minutes: 25 },
          { code: 'D14.2', slug: 'd-14-2-ab-otimizacao', title: 'Testes A/B e Otimização', estimated_minutes: 25 },
          { code: 'D14.3', slug: 'd-14-3-coorte-churn', title: 'Análise de Coorte e Churn', estimated_minutes: 20 },
          { code: 'D14.4', slug: 'd-14-4-cultura-data-driven', title: 'Cultura Data-Driven', estimated_minutes: 20 },
        ],
      },
      {
        code: 'M15',
        slug: 'p6-proximos-passos',
        title: 'Módulo 15 · P6 + Próximos Passos',
        description:
          'P6 (pessoas e equipe de alta performance), contratação/treinamento, plano 180-365 dias e comunidade VSS.',
        destravamentos: [
          { code: 'D15.1', slug: 'd-15-1-p6-pessoas', title: 'P6 — Pessoas e Equipe de Alta Performance', estimated_minutes: 25 },
          { code: 'D15.2', slug: 'd-15-2-contratacao-treinamento', title: 'Contratando e Treinando Time', estimated_minutes: 25 },
          { code: 'D15.3', slug: 'd-15-3-plano-180-365', title: 'Seu Plano de 180-365 Dias', estimated_minutes: 25 },
          { code: 'D15.4', slug: 'd-15-4-comunidade-networking', title: 'Comunidade e Networking VSS', estimated_minutes: 15 },
        ],
      },
    ],
  },
];

export async function seedVss(database: Db): Promise<void> {
  console.log('[seed:vss] iniciando…');

  let phaseIndex = 0;
  let moduleCount = 0;
  let destravamentoCount = 0;

  for (const phase of PHASES) {
    phaseIndex += 1;
    const phaseId = await ensurePhase(database, phase, phaseIndex);

    let moduleIndex = 0;
    for (const mod of phase.modules) {
      moduleIndex += 1;
      moduleCount += 1;
      const moduleId = await ensureModule(database, mod, phaseId, moduleIndex);

      let destIndex = 0;
      for (const dest of mod.destravamentos) {
        destIndex += 1;
        destravamentoCount += 1;
        await ensureDestravamento(database, dest, moduleId, destIndex);
      }
    }
    console.log(
      `[seed:vss]   ✓ ${phase.code} ${phase.title} (${phase.modules.length} módulos)`
    );
  }

  console.log(
    `[seed:vss] ✓ ${PHASES.length} fases · ${moduleCount} módulos · ${destravamentoCount} destravamentos`
  );
}

async function ensurePhase(
  database: Db,
  phase: PhaseSeed,
  position: number
): Promise<string> {
  const [existing] = await database
    .select()
    .from(vss_phases)
    .where(eq(vss_phases.code, phase.code))
    .limit(1);

  if (existing) {
    await database
      .update(vss_phases)
      .set({
        position,
        slug: phase.slug,
        title: phase.title,
        description: phase.description,
      })
      .where(eq(vss_phases.id, existing.id));
    return existing.id;
  }

  const id = ulid();
  await database.insert(vss_phases).values({
    id,
    position,
    code: phase.code,
    slug: phase.slug,
    title: phase.title,
    description: phase.description,
  });
  return id;
}

async function ensureModule(
  database: Db,
  mod: ModuleSeed,
  phaseId: string,
  position: number
): Promise<string> {
  const [existing] = await database
    .select()
    .from(vss_modules)
    .where(eq(vss_modules.code, mod.code))
    .limit(1);

  if (existing) {
    await database
      .update(vss_modules)
      .set({
        phase_id: phaseId,
        position,
        slug: mod.slug,
        title: mod.title,
        description: mod.description,
      })
      .where(eq(vss_modules.id, existing.id));
    return existing.id;
  }

  const id = ulid();
  await database.insert(vss_modules).values({
    id,
    phase_id: phaseId,
    position,
    code: mod.code,
    slug: mod.slug,
    title: mod.title,
    description: mod.description,
  });
  return id;
}

/**
 * Slugs com flow âncora customizado em `src/server/services/agent-flows/`.
 * Marcamos com `flow_kind = 'agent_anchored_v1'` pra facilitar filtro no admin
 * e telemetria. Mudar aqui exige criar/registrar o flow em agent-flows/index.ts.
 */
const ANCHORED_SLUGS = new Set<string>([
  // Sprint 2 (8)
  'd-1-4-diagnostico',
  'd-1-6-plano-90-dias',
  'd-2-1-p1-posicionamento',
  'd-2-4-personas',
  'd-3-2-oferta-irresistivel',
  'd-3-3-precificacao',
  'd-8-4-cold-email-whatsapp',
  'd-8-5-cadencias-multicanal',
  // Sprint 5C (7) — Fase 1 + Fase 2 D1.x/D2.x completos
  'd-1-1-bem-vindo-vss',
  'd-1-2-conheca-joel',
  'd-1-3-framework-6ps',
  'd-1-5-maquina-vendas',
  'd-2-2-puv-workshop',
  'd-2-3-p2-publico',
  'd-2-5-big-idea',
  // Sprint 6A (10) — Produto + Métricas + Pessoas
  'd-3-1-p3-produto-pmf',
  'd-3-4-metas-kpis',
  'd-14-1-metricas-importam',
  'd-14-2-ab-otimizacao',
  'd-14-3-coorte-churn',
  'd-14-4-cultura-data-driven',
  'd-15-1-p6-pessoas',
  'd-15-2-contratacao-treinamento',
  'd-15-3-plano-180-365',
  'd-15-4-comunidade-networking',
  // Sprint 6B (9) — CRM + Casa Digital
  'd-4-1-bem-vindo-crm',
  'd-4-2-setup-inicial',
  'd-4-3-contatos-oportunidades',
  'd-4-4-importacao',
  'd-4-5-automacoes-iniciais',
  'd-5-1-casa-digital',
  'd-5-2-site-landing',
  'd-5-3-gmn-seo-local',
  'd-5-4-redes-vitrine',
  // Sprint 6C (11) — Conteúdo + Tráfego + Prospecção
  'd-6-1-conteudo-atrai',
  'd-6-2-seo-pratico',
  'd-6-3-redes-organicas',
  'd-6-4-calendario-conteudo',
  'd-7-1-trafego-pago-fundamentos',
  'd-7-2-meta-ads',
  'd-7-3-google-ads',
  'd-7-4-otimizando-campanhas',
  'd-8-1-prospeccao-alternativa',
  'd-8-2-listas-prospects',
  'd-8-3-linkedin-instagram',
  // Sprint 6D (9) — Funil + Vendas
  'd-9-1-anatomia-funil',
  'd-9-2-landing-alta-conversao',
  'd-9-3-nutricao-email',
  'd-9-4-whatsapp-crm',
  'd-10-1-qualificacao-bant-spin',
  'd-10-2-scripts-atendimento',
  'd-10-3-objecoes',
  'd-10-4-tecnicas-fechamento',
  'd-10-5-pos-venda-indicacoes',
  // Sprint 6E (12) — Sistema + Automação + IA
  'd-11-1-p4-integracao',
  'd-11-2-p5-processos',
  'd-11-3-dashboard-executivo',
  'd-11-4-preparando-escalar',
  'd-12-1-workflows-complexos',
  'd-12-2-segmentacao-comportamental',
  'd-12-3-carrinho-upsell',
  'd-12-4-reguas-relacionamento',
  'd-13-1-agentes-ia-fundamentos',
  'd-13-2-agente-whatsapp',
  'd-13-3-handoff-ia-humano',
  'd-13-4-treinando-agente',
]);

function flowKindFor(slug: string): string {
  return ANCHORED_SLUGS.has(slug) ? 'agent_anchored_v1' : 'agent_guided';
}

async function ensureDestravamento(
  database: Db,
  dest: DestravamentoSeed,
  moduleId: string,
  position: number
): Promise<void> {
  const [existing] = await database
    .select()
    .from(vss_destravamentos)
    .where(eq(vss_destravamentos.code, dest.code))
    .limit(1);

  if (existing) {
    await database
      .update(vss_destravamentos)
      .set({
        module_id: moduleId,
        position,
        slug: dest.slug,
        title: dest.title,
        estimated_minutes: dest.estimated_minutes,
        flow_kind: flowKindFor(dest.slug),
        content_version: CONTENT_VERSION,
      })
      .where(eq(vss_destravamentos.id, existing.id));
    return;
  }

  await database.insert(vss_destravamentos).values({
    id: ulid(),
    module_id: moduleId,
    position,
    code: dest.code,
    slug: dest.slug,
    title: dest.title,
    estimated_minutes: dest.estimated_minutes,
    flow_kind: flowKindFor(dest.slug),
    content_version: CONTENT_VERSION,
    available_from: null,
    published_at: null,
  });
}
