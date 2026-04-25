/**
 * Configuração dos 6 steps do onboarding 6Ps.
 *
 * Cada step mapeia 1 P do framework -> 1 coluna `*_md` em `user_profiles`.
 * Os campos textarea são agregados em markdown simples (label + valor) na hora
 * de salvar, mas pra preview/edição mantemos cada campo individual.
 *
 * Schema (não alterar): produto_md · pessoas_md · precificacao_md ·
 * processos_md · performance_md · propaganda_md.
 */

export type ProfileKey =
  | 'produto_md'
  | 'pessoas_md'
  | 'precificacao_md'
  | 'processos_md'
  | 'performance_md'
  | 'propaganda_md';

export interface StepField {
  /** Nome do campo no formulário (input name + key no objeto data). */
  name: string;
  label: string;
  placeholder: string;
  helpText: string;
  /** Tipo de input. Default = textarea. */
  kind?: 'input' | 'textarea';
  /** Min chars pra considerar preenchido. Default = 4. */
  minLength?: number;
}

export interface OnboardingStep {
  /** 1-6 */
  position: number;
  /** Slug do P (uppercase pra kicker). */
  code: string;
  /** Coluna do schema onde a soma dos campos vira markdown. */
  profileKey: ProfileKey;
  title: string;
  /** 1 frase de ajuda exibida abaixo do título. */
  intro: string;
  fields: StepField[];
}

export const ONBOARDING_STEPS: readonly OnboardingStep[] = [
  {
    position: 1,
    code: 'PRODUTO',
    profileKey: 'produto_md',
    title: 'Seu produto',
    intro:
      'O que você vende, qual a transformação real e por que alguém escolhe você no lugar do concorrente.',
    fields: [
      {
        name: 'oferta',
        label: 'O que você vende (em 1 linha)',
        placeholder: 'Ex: programa de 90 dias pra escalar vendas em SaaS B2B',
        helpText: 'Sem floreio: nome do produto + formato + público.',
      },
      {
        name: 'transformacao',
        label: 'Qual transformação seu cliente leva pra casa',
        placeholder: 'Ex: sai de vendas avulsas pra pipeline previsível com R$ 50k/mês recorrente',
        helpText: 'Antes vs depois — concreto, em números se der.',
      },
      {
        name: 'diferencial',
        label: 'Por que você no lugar do concorrente',
        placeholder: 'Ex: único método com CRM próprio incluído, sem mais ferramenta pra pagar',
        helpText: 'O que só você entrega. Não copiar promessa de mercado.',
      },
    ],
  },
  {
    position: 2,
    code: 'PESSOAS',
    profileKey: 'pessoas_md',
    title: 'Cliente ideal e time',
    intro:
      'Quem é seu cliente perfeito (ICP) e quem está com você na operação. Pessoas erradas matam qualquer sistema.',
    fields: [
      {
        name: 'icp',
        label: 'Cliente ideal (ICP)',
        placeholder:
          'Ex: agência de marketing 5-15 pessoas, faturando 80-300k/mês, sócio atende vendas',
        helpText: 'Setor, tamanho, faturamento, quem decide. Mais específico = melhor.',
      },
      {
        name: 'dor',
        label: 'Dor principal que esse cliente sente',
        placeholder: 'Ex: vende "no boca a boca" e não sabe quanto vai entrar mês que vem',
        helpText: 'A dor que faz ele assinar hoje. Palavras dele, não suas.',
      },
      {
        name: 'time',
        label: 'Time atual',
        placeholder: 'Ex: só eu (founder) + 1 closer freelancer. Sem SDR, sem marketing in-house',
        helpText: 'Quem faz vendas, marketing e entrega. Se for só você, escreve "só eu".',
      },
    ],
  },
  {
    position: 3,
    code: 'PRECIFICACAO',
    profileKey: 'precificacao_md',
    title: 'Precificação',
    intro:
      'Quanto cobra, como cobra e o que isso diz da sua proposta. Preço errado bloqueia volume e margem.',
    fields: [
      {
        name: 'ticket',
        label: 'Ticket médio',
        placeholder: 'Ex: R$ 1.997 à vista ou 12x R$ 197',
        helpText: 'Valor + parcelamento padrão.',
        kind: 'input',
      },
      {
        name: 'modelo',
        label: 'Modelo de cobrança',
        placeholder: 'Ex: pagamento único pra DIY, mensalidade pra advisory contínuo',
        helpText: 'One-shot, recorrente, performance, híbrido.',
      },
      {
        name: 'racional',
        label: 'Por que esse preço',
        placeholder: 'Ex: posicionamento premium · economiza 18 meses de tentativa e erro',
        helpText: 'Como justifica o número quando o cliente questiona.',
      },
    ],
  },
  {
    position: 4,
    code: 'PROCESSOS',
    profileKey: 'processos_md',
    title: 'Processos comerciais',
    intro:
      'Como o lead vira cliente. Funil, etapas, cadência. Aqui é onde a maioria perde — sem processo, vira improviso.',
    fields: [
      {
        name: 'funil',
        label: 'Etapas do seu funil hoje',
        placeholder: 'Ex: lead → call descoberta → proposta → fechamento → onboarding',
        helpText: 'Liste passo a passo, do primeiro contato até a venda.',
      },
      {
        name: 'cadencia',
        label: 'Cadência de follow-up',
        placeholder: 'Ex: 5 toques em 14 dias (whatsapp + email + call), depois reciclar em 30 dias',
        helpText: 'Quantos toques, em quanto tempo, em quais canais.',
      },
      {
        name: 'gargalo',
        label: 'Gargalo principal hoje',
        placeholder: 'Ex: 70% dos leads somem entre call e proposta, sem motivo claro',
        helpText: 'Onde você perde gente. O P mais fraco do seu sistema.',
      },
    ],
  },
  {
    position: 5,
    code: 'PERFORMANCE',
    profileKey: 'performance_md',
    title: 'Performance e métricas',
    intro:
      'Os números que você acompanha (ou deveria). Sem métrica, qualquer ajuste é chute.',
    fields: [
      {
        name: 'metricas',
        label: 'Métricas que você acompanha hoje',
        placeholder: 'Ex: leads/mês, taxa de conversão MQL→SQL, ticket médio, churn',
        helpText: 'O que está no seu dashboard. Se não tem dashboard, escreve "nenhuma".',
      },
      {
        name: 'numeros_atuais',
        label: 'Números atuais (se souber)',
        placeholder: 'Ex: 80 leads/mês · 12% conversão · ticket R$ 5k · CAC R$ 800',
        helpText: 'Estimativa serve. Tudo bem se for 1 ou 2 números só.',
      },
      {
        name: 'meta_90d',
        label: 'Meta nos próximos 90 dias',
        placeholder: 'Ex: dobrar pipeline de R$ 200k pra R$ 400k',
        helpText: 'Específico, mensurável, com prazo. Não vale "crescer mais".',
      },
    ],
  },
  {
    position: 6,
    code: 'PROPAGANDA',
    profileKey: 'propaganda_md',
    title: 'Propaganda e aquisição',
    intro:
      'Como o lead chega até você. Canais, conteúdo, gatilhos. Sem aquisição não tem nada pra processo qualificar.',
    fields: [
      {
        name: 'canais',
        label: 'Canais de aquisição ativos',
        placeholder: 'Ex: indicação (60%) · LinkedIn orgânico (30%) · ads Meta (10%)',
        helpText: 'De onde vem o lead hoje. Estimar % se não tiver tracking.',
      },
      {
        name: 'conteudo',
        label: 'Conteúdo que você publica',
        placeholder: 'Ex: 3 posts/sem LinkedIn + 1 newsletter quinzenal · sem vídeo',
        helpText: 'Frequência + formato + plataforma.',
      },
      {
        name: 'investimento',
        label: 'Investimento mensal em mídia paga',
        placeholder: 'Ex: R$ 3k Meta · R$ 1k Google · zero pra tráfego no LinkedIn',
        helpText: 'Soma do que sai do bolso. Pode ser 0.',
      },
    ],
  },
] as const;

export const TOTAL_STEPS = ONBOARDING_STEPS.length;

/**
 * Converte os campos de um step em markdown estruturado pra coluna `*_md`.
 * Cada campo vira uma sub-seção `### {label}\n{valor}`.
 */
export function fieldsToMarkdown(
  step: OnboardingStep,
  values: Record<string, string>
): string {
  const lines: string[] = [`## ${step.title}`];
  for (const field of step.fields) {
    const v = (values[field.name] ?? '').trim();
    if (!v) continue;
    lines.push('', `### ${field.label}`, v);
  }
  return lines.join('\n');
}

export function findStepByPosition(position: number): OnboardingStep | null {
  return ONBOARDING_STEPS.find((s) => s.position === position) ?? null;
}
