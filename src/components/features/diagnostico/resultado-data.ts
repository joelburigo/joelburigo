export type PKey = 'posicionamento' | 'publico' | 'produto' | 'programas' | 'processos' | 'pessoas';

export interface PLevel {
  name: string;
  description: string;
  actions: string[];
}

export interface PInfo {
  name: string;
  icon: string;
  description: string;
  levels: Record<number, PLevel>;
}

export const psData: Record<PKey, PInfo> = {
  posicionamento: {
    name: 'Posicionamento',
    icon: 'P1',
    description: 'Como sua empresa se diferencia no mercado',
    levels: {
      0: {
        name: 'Caótico',
        description: 'Compete 100% por preço, sem diferencial claro',
        actions: [
          'Defina sua promessa única de valor',
          'Mapeie seus diferenciais tangíveis',
          'Crie seu elevator pitch',
        ],
      },
      1: {
        name: 'Iniciante',
        description: 'Tenta se diferenciar mas não fica claro',
        actions: [
          'Esclareça sua comunicação',
          'Teste diferentes mensagens',
          'Colete feedback dos clientes',
        ],
      },
      2: {
        name: 'Básico',
        description: 'Tem diferencial mas não defende bem',
        actions: [
          'Fortaleça sua narrativa',
          'Documente casos de sucesso',
          'Treine equipe no posicionamento',
        ],
      },
      3: {
        name: 'Intermediário',
        description: 'Diferencial claro internamente',
        actions: [
          'Amplifique na comunicação',
          'Construa autoridade no nicho',
          'Crie conteúdo consistente',
        ],
      },
      4: {
        name: 'Avançado',
        description: 'Mercado reconhece seu diferencial',
        actions: ['Expanda para novos segmentos', 'Desenvolva sub-marcas', 'Licencie seu método'],
      },
    },
  },
  publico: {
    name: 'Público',
    icon: 'P2',
    description: 'Clareza sobre seu cliente ideal',
    levels: {
      0: {
        name: 'Caótico',
        description: 'Vende para qualquer um',
        actions: [
          'Defina seu ICP (Ideal Customer Profile)',
          'Liste características demográficas',
          'Identifique padrões nos melhores clientes',
        ],
      },
      1: {
        name: 'Iniciante',
        description: 'Público amplo demais',
        actions: [
          'Segmente por setor ou porte',
          'Qualifique leads antes de vender',
          'Rejeite clientes fora do perfil',
        ],
      },
      2: {
        name: 'Básico',
        description: 'Segmentação superficial',
        actions: [
          'Aprofunde nas dores específicas',
          'Mapeie jornada de compra',
          'Crie buyer personas',
        ],
      },
      3: {
        name: 'Intermediário',
        description: 'ICP bem definido',
        actions: [
          'Desenvolva múltiplas personas',
          'Personalize comunicação por segmento',
          'Antecipe objeções por perfil',
        ],
      },
      4: {
        name: 'Avançado',
        description: 'Conhecimento profundo do cliente',
        actions: [
          'Crie micro-segmentos',
          'Desenvolva produtos específicos',
          'Preveja comportamentos',
        ],
      },
    },
  },
  produto: {
    name: 'Produto',
    icon: 'P3',
    description: 'Sua oferta estruturada e com valor claro',
    levels: {
      0: {
        name: 'Caótico',
        description: 'Proposta de valor confusa',
        actions: [
          'Estruture sua oferta',
          'Defina benefícios tangíveis',
          'Estabeleça precificação baseada em valor',
        ],
      },
      1: {
        name: 'Iniciante',
        description: 'Funciona mas mal apresentado',
        actions: ['Melhore a "embalagem"', 'Adicione prova social', 'Crie garantias'],
      },
      2: {
        name: 'Básico',
        description: 'Valor definido mas mal comunicado',
        actions: ['Refine proposta de valor', 'Documente resultados', 'Crie comparativos'],
      },
      3: {
        name: 'Intermediário',
        description: 'Produto bem posicionado',
        actions: ['Desenvolva versões escaláveis', 'Crie linhas de produto', 'Implemente upsells'],
      },
      4: {
        name: 'Avançado',
        description: 'Produto diferenciado e valorizado',
        actions: ['Inovar constantemente', 'Criar ecossistema', 'Desenvolver IP próprio'],
      },
    },
  },
  programas: {
    name: 'Programas',
    icon: 'P4',
    description: 'Como você vende e entrega',
    levels: {
      0: {
        name: 'Caótico',
        description: 'Vendas aleatórias',
        actions: [
          'Mapeie seu funil atual',
          'Defina etapas de venda',
          'Crie sequência de follow-up',
        ],
      },
      1: {
        name: 'Iniciante',
        description: 'Processo existe mas informal',
        actions: [
          'Documente funil de vendas',
          'Implemente CRM básico',
          'Crie templates de proposta',
        ],
      },
      2: {
        name: 'Básico',
        description: 'Funil estruturado',
        actions: ['Automatize follow-ups', 'Crie nutrição de leads', 'Desenvolva múltiplos funis'],
      },
      3: {
        name: 'Intermediário',
        description: 'Funis funcionando bem',
        actions: ['Otimize conversão', 'Teste novos canais', 'Implemente cross-sell'],
      },
      4: {
        name: 'Avançado',
        description: 'Machine de vendas previsível',
        actions: ['Escale aquisição', 'Desenvolva parcerias', 'Crie modelo recorrente'],
      },
    },
  },
  processos: {
    name: 'Processos',
    icon: 'P5',
    description: 'Operação documentada e replicável',
    levels: {
      0: {
        name: 'Caótico',
        description: 'Nada documentado',
        actions: ['Liste processos críticos', 'Documente passo a passo', 'Crie checklists'],
      },
      1: {
        name: 'Iniciante',
        description: 'Alguns processos informais',
        actions: [
          'Padronize tarefas repetitivas',
          'Crie SOPs básicos',
          'Implemente ferramenta de gestão',
        ],
      },
      2: {
        name: 'Básico',
        description: 'Processos principais documentados',
        actions: ['Refine e otimize', 'Treine equipe nos processos', 'Meça indicadores'],
      },
      3: {
        name: 'Intermediário',
        description: 'Operação padronizada',
        actions: [
          'Automatize tarefas',
          'Crie dashboard de métricas',
          'Implemente melhoria contínua',
        ],
      },
      4: {
        name: 'Avançado',
        description: 'Processos otimizados',
        actions: ['Certificação de qualidade', 'Benchmarking', 'Inovação de processos'],
      },
    },
  },
  pessoas: {
    name: 'Pessoas',
    icon: 'P6',
    description: 'Time capacitado e alinhado',
    levels: {
      0: {
        name: 'Caótico',
        description: 'Tudo depende do fundador',
        actions: [
          'Mapeie funções críticas',
          'Contrate primeiro vendedor',
          'Defina papéis e responsabilidades',
        ],
      },
      1: {
        name: 'Iniciante',
        description: 'Time pequeno sem clareza',
        actions: [
          'Crie descrição de cargos',
          'Estabeleça metas individuais',
          'Inicie treinamentos',
        ],
      },
      2: {
        name: 'Básico',
        description: 'Papéis definidos',
        actions: [
          'Desenvolva programa de onboarding',
          'Crie trilha de desenvolvimento',
          'Implemente avaliações',
        ],
      },
      3: {
        name: 'Intermediário',
        description: 'Time estruturado',
        actions: ['Desenvolva lideranças', 'Crie plano de carreira', 'Implemente meritocracia'],
      },
      4: {
        name: 'Avançado',
        description: 'Time de alta performance',
        actions: ['Desenvolva cultura forte', 'Crie programa de sucessão', 'Expanda liderança'],
      },
    },
  },
};

export const STRATEGIC_PS: PKey[] = ['posicionamento', 'publico', 'produto'];

export type Scores = Record<PKey, number>;

export interface MaturityLevel {
  name: string;
  color: string;
  description: string;
}

export function getMaturityLevel(total: number): MaturityLevel {
  if (total <= 4)
    return {
      name: 'Caótico',
      color: 'text-fire',
      description:
        'Sua operação de vendas precisa de estruturação urgente. Foco em construir as bases.',
    };
  if (total <= 8)
    return {
      name: 'Iniciante',
      color: 'text-fire-hot',
      description: 'Você tem alguns elementos, mas falta consistência. Priorize os Ps mais fracos.',
    };
  if (total <= 12)
    return {
      name: 'Em Desenvolvimento',
      color: 'text-fire-hot',
      description: 'Boa base, mas ainda há gaps importantes. Hora de profissionalizar.',
    };
  if (total <= 16)
    return {
      name: 'Estruturado',
      color: 'text-acid',
      description: 'Operação sólida! Foque em otimização e escala dos pontos fortes.',
    };
  if (total <= 20)
    return {
      name: 'Avançado',
      color: 'text-acid',
      description: 'Excelente! Você tem uma máquina de vendas funcionando. Hora de inovar.',
    };
  return {
    name: 'Otimizado',
    color: 'text-acid-hot',
    description: 'Parabéns! Você está no top 5%. Foco em manter e expandir.',
  };
}
