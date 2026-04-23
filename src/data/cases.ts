// Cases de Sucesso Centralizados

export interface Case {
  empresa: string
  nicho: string
  produto: string
  antes: string
  depois: string
  tempo: string
  crescimento: string
  resultado: string
  situacaoAntes: string
  solucao: string
  badge?: string
}

export const cases: Case[] = [
  // ========== VENDAS SEM SEGREDOS (7 cases) ==========
  {
    empresa: 'Studio Amanda Oliveira',
    nicho: 'Estética e Beleza',
    produto: 'Vendas Sem Segredos',
    antes: 'R$ 18k/mês',
    depois: 'R$ 42k/mês',
    tempo: '4 meses',
    crescimento: '2.3x',
    resultado: 'De R$ 18k para R$ 42k/mês em 4 meses',
    situacaoAntes:
      'Salão com clientela fixa mas sem crescimento. Agenda gerenciada no caderno. Clientes só voltavam quando precisavam. Sem ofertas de pacotes. Taxa de retorno irregular. Tudo na base da memória.',
    solucao:
      'Entrou no VSS e implementou os 6Ps em 90 dias. Criou 3 pacotes de recorrência (Mensal, Trimestral, Semestral), implementou Growth CRM com agenda digital, automação de lembrete por WhatsApp, e pós-atendimento. 60% das clientes migraram para pacotes recorrentes.',
    badge: 'Destaque',
  },
  {
    empresa: 'Barbearia Estilo Urbano',
    nicho: 'Serviços Masculinos',
    produto: 'Vendas Sem Segredos',
    antes: 'R$ 12k/mês',
    depois: 'R$ 28k/mês',
    tempo: '3 meses',
    crescimento: '2.3x',
    resultado: 'De R$ 12k para R$ 28k/mês em 3 meses',
    situacaoAntes:
      'Barbearia com 1 cadeira, agenda só por WhatsApp. Muitos buracos na agenda. Clientes só marcavam quando lembravam. Sem recorrência. Faturamento oscilava muito (R$ 8k a R$ 16k).',
    solucao:
      'Completou VSS em 90 dias. Implementou Growth CRM com agendamento online, criou pacotes mensais (corte + barba), automação de lembrete 3 dias antes, e follow-up pós-atendimento. 45% dos clientes viraram assinantes mensais. Agenda 95% ocupada.',
    badge: 'Destaque',
  },
  {
    empresa: 'Loja Essence Moda',
    nicho: 'Varejo Feminino',
    produto: 'Vendas Sem Segredos',
    antes: 'R$ 22k/mês',
    depois: 'R$ 48k/mês',
    tempo: '5 meses',
    crescimento: '2.2x',
    resultado: 'De R$ 22k para R$ 48k/mês em 5 meses',
    situacaoAntes:
      'Loja física com Instagram ativo, mas vendas só presenciais. Sem estratégia online. Clientes compravam 1x e sumiam. Sem follow-up. Muito estoque parado sem giro.',
    solucao:
      'Fez VSS e estruturou vendas online via WhatsApp Business com Growth CRM, catálogo digital, follow-up automatizado pós-compra, programa de fidelidade (10% na 5ª compra), e promoções segmentadas. Vendas online representam 40% do faturamento.',
    badge: 'Destaque',
  },
  {
    empresa: 'Clínica Dental Care',
    nicho: 'Odontologia',
    produto: 'Vendas Sem Segredos',
    antes: 'R$ 28k/mês',
    depois: 'R$ 62k/mês',
    tempo: '6 meses',
    crescimento: '2.2x',
    resultado: 'De R$ 28k para R$ 62k/mês em 6 meses',
    situacaoAntes:
      'Dentista com consultório próprio, agenda cheia mas ticket baixo. Só fazia limpeza e restauração. Não apresentava tratamentos complexos. Processo comercial zero. Tudo informal.',
    solucao:
      'Implementou VSS: estruturou oferta clara de tratamentos (clareamento, implantes, ortodontia), scripts de apresentação, Growth CRM com follow-up pós-consulta, parcelamento facilitado. Ticket médio subiu 85% e agenda de implantes com 2 meses de espera.',
  },
  {
    empresa: 'Advocacia Silva & Costa',
    nicho: 'Serviços Jurídicos',
    produto: 'Vendas Sem Segredos',
    antes: 'R$ 32k/mês',
    depois: 'R$ 68k/mês',
    tempo: '5 meses',
    crescimento: '2.1x',
    resultado: 'De R$ 32k para R$ 68k/mês em 5 meses',
    situacaoAntes:
      'Escritório pequeno (2 sócios) que atendia só indicação. Sem site, sem presença digital. Proposta comercial confusa. Não tinha CRM. Perdiam clientes por desorganização no follow-up.',
    solucao:
      'VSS completo: definiu ICP (empresas 10-50 funcionários), criou oferta em 3 pacotes (Bronze, Silver, Gold), implementou Growth CRM, prospecção ativa no LinkedIn (20 conexões/dia). Conversão subiu de 12% para 32%.',
  },
  {
    empresa: 'Personal Trainer Lucas Mendes',
    nicho: 'Fitness Individual',
    produto: 'Vendas Sem Segredos',
    antes: 'R$ 8k/mês',
    depois: 'R$ 22k/mês',
    tempo: '4 meses',
    crescimento: '2.8x',
    resultado: 'De R$ 8k para R$ 22k/mês em 4 meses',
    situacaoAntes:
      'Personal solo que cobrava por aula avulsa. Sem previsibilidade. Agenda irregular (uns meses cheio, outros vazio). Não tinha sistema de indicação. Clientes cancelavam sem aviso.',
    solucao:
      'VSS: criou pacotes mensais (8, 12, 16 sessões), implementou Growth CRM para gestão de alunos, automação de cobrança, follow-up de reengajamento. Migrou 80% dos alunos para mensalidade fixa. Faturamento previsível.',
  },
  {
    empresa: 'Escola de Inglês FluenTalk',
    nicho: 'Educação e Idiomas',
    produto: 'Vendas Sem Segredos',
    antes: 'R$ 24k/mês',
    depois: 'R$ 58k/mês',
    tempo: '6 meses',
    crescimento: '2.4x',
    resultado: 'De R$ 24k para R$ 58k/mês em 6 meses',
    situacaoAntes:
      'Escola com 35 alunos, processo de matrícula manual. Conversão 10%. Sem follow-up automatizado. Alto cancelamento (churn 25%). Recepcionista não sabia vender.',
    solucao:
      'VSS: criou funil completo com landing page, Growth CRM, automação de nutrição, onboarding estruturado, treinamento da recepcionista. Conversão subiu para 28%. Churn caiu para 8%. Fila de espera para turmas.',
  },

  // ========== ADVISORY - SESSÃO ESTRATÉGICA (1 case) ==========
  {
    empresa: 'Consultoria Rodrigo Almeida',
    nicho: 'Consultoria Empresarial',
    produto: 'Advisory - Sessão Estratégica',
    antes: 'R$ 22k/mês',
    depois: 'R$ 58k/mês',
    tempo: '6 meses',
    crescimento: '2.6x',
    resultado: 'De R$ 22k para R$ 58k/mês em 6 meses',
    situacaoAntes:
      'Consultor solo com boa expertise técnica, mas sem previsibilidade. Dependia 100% de indicação. Proposta comercial confusa (cada cliente era diferente). Conversão baixa (15%). Não sabia quanto ia faturar no mês seguinte.',
    solucao:
      'Contratou Sessão Estratégica (90 min): definimos ICP (empresas de serviços 5-20 pessoas), criamos estrutura de proposta em 3 pacotes, plano de ação de prospecção no LinkedIn. Rodrigo implementou sozinho nos 6 meses seguintes. Conversão subiu para 38%.',
  },

  // ========== ADVISORY - SPRINT 30 DIAS (1 case) ==========
  {
    empresa: 'TechSupport Pro',
    nicho: 'Tecnologia e Suporte TI',
    produto: 'Advisory - Sprint 30 Dias',
    antes: 'R$ 15k/mês',
    depois: 'R$ 48k/mês',
    tempo: '7 meses',
    crescimento: '3.2x',
    resultado: 'De R$ 15k para R$ 48k/mês em 7 meses',
    situacaoAntes:
      'Técnico em TI atendendo pequenas empresas. Modelo "bombeiro" (só quando quebrava). Sem recorrência. Cobrava por hora/chamado. Dificuldade de precificar. Clientes sempre pediam desconto.',
    solucao:
      'Advisory Sprint 30 Dias: em 4 semanas migramos o modelo para MSP (Managed Service Provider) com pacotes mensais de suporte preventivo (Básico R$ 800, Pro R$ 1.500, Enterprise R$ 2.800). Definimos ICP, pitch de venda consultiva, roadmap de implementação. Cliente executou nos 6 meses seguintes. 12 empresas assinaram contratos.',
  },

  // ========== ADVISORY - CONSELHO EXECUTIVO (1 case) ==========
  {
    empresa: 'Grupo VidaPlena Saúde',
    nicho: 'Clínicas Médicas (Holding)',
    produto: 'Advisory - Conselho Executivo',
    antes: 'R$ 280k/mês',
    depois: 'R$ 850k/mês',
    tempo: '10 meses',
    crescimento: '3.0x',
    resultado: 'De R$ 280k para R$ 850k/mês em 10 meses (4 clínicas)',
    situacaoAntes:
      'Holding com 4 clínicas (ortopedia, cardiologia, dermatologia, pediatria). Cada clínica funcionava isolada. Processos diferentes. Sem padronização. Crescimento desordenado. Queriam abrir 5ª unidade mas não tinham sistema replicável.',
    solucao:
      'Conselho Executivo (6 meses): sessões semanais comigo, estruturação completa dos 6Ps para holding, Growth CRM integrado, playbook comercial unificado, treinamento de equipe, processos documentados. Padronizaram atendimento, marketing e vendas. Abriram 5ª clínica com ROI positivo desde mês 1.',
  },
]
