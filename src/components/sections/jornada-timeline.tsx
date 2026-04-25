import { Container } from '@/components/patterns/container';

const fases = [
  {
    numero: '01',
    nome: 'Fundamentos',
    janela: '0–30 DIAS',
    modulos: 'M1–M3 · 15 destravamentos',
    objetivo:
      'Estratégia 100% documentada. Diagnóstico completo dos 6Ps. Posicionamento, público e oferta estruturados.',
    destravamentos: [
      'Ativar conta e entrar na comunidade',
      'Estudar Framework dos 6Ps (seu GPS)',
      'Preencher Canvas 6Ps do seu negócio',
      'Definir P1 — Posicionamento + PUV + Big Idea',
      'Construir Persona #1 com entrevistas reais',
      'Estruturar oferta irresistível (value stacking)',
    ],
    acento: 'acid' as const,
  },
  {
    numero: '02',
    nome: 'Infraestrutura',
    janela: '30–45 DIAS',
    modulos: 'M4–M5 · 9 destravamentos',
    objetivo:
      'Growth CRM configurado. Landing page ativa. Presença digital profissional no ar — fundação tecnológica pronta pra receber lead.',
    destravamentos: [
      'Setup inicial do Growth CRM',
      'Importar sua base atual',
      'Configurar primeiras 2 automações',
      'Criar e publicar landing page',
      'Google Meu Negócio + SEO local básico',
      'Otimizar perfis sociais (vitrine)',
    ],
    acento: 'fire' as const,
  },
  {
    numero: '03',
    nome: 'Atração',
    janela: '45–75 DIAS',
    modulos: 'M6–M8 · 13 destravamentos',
    objetivo:
      'Canais de aquisição ligados — tráfego orgânico, pago (se tiver budget) ou prospecção ativa gratuita. Leads entrando previsivelmente.',
    destravamentos: [
      'Definir estratégia de marketing de conteúdo',
      'SEO on-page básico no seu site',
      'Estratégia orgânica de Instagram + LinkedIn',
      'Ativar primeira campanha Meta Ads (opcional)',
      'Construir lista de 100+ prospects qualificados',
      'Cadência multicanal de 15 dias',
    ],
    acento: 'acid' as const,
  },
  {
    numero: '04',
    nome: 'Conversão',
    janela: '75–90 DIAS',
    modulos: 'M9–M10 · 9 destravamentos',
    objetivo:
      'Funil de vendas desenhado. Scripts que convertem. Banco de objeções. Pós-venda e indicações rodando. A Máquina começa a girar.',
    destravamentos: [
      'Desenhar funil de vendas completo',
      'Landing page de alta conversão',
      'Sequência de nutrição por e-mail (7 dias)',
      'Integrar WhatsApp ao CRM',
      'Qualificar leads com BANT + SPIN',
      'Banco de respostas pras 7 objeções mais comuns',
      'Pós-venda + programa de indicações',
    ],
    acento: 'fire' as const,
  },
  {
    numero: '05',
    nome: 'Sistema',
    janela: '90 DIAS · MARCO',
    modulos: 'M11 · 4 destravamentos',
    objetivo:
      'Os 6Ps integrados. 5 processos essenciais documentados (P5). Dashboard executivo único. Máquina de Crescimento ligada.',
    destravamentos: [
      'Validar integração completa (checklist P4)',
      'Documentar 5 processos essenciais (P5)',
      'Montar dashboard executivo unificado',
      'Avaliar se você está pronto pra escalar',
    ],
    acento: 'acid' as const,
    marco: true,
  },
  {
    numero: '06',
    nome: 'Automação',
    janela: 'PÓS-90 DIAS',
    modulos: 'M12–M13 · 8 destravamentos',
    objetivo:
      'Automações avançadas e agentes de IA. Sistema roda 24/7 sem depender da sua presença. Você sai da operação e entra na estratégia.',
    destravamentos: [
      '3 workflows complexos essenciais',
      'Segmentação comportamental + lead scoring',
      'Recuperação de carrinho + upsell',
      '4 réguas de relacionamento inteligentes',
      'Agente de IA no WhatsApp 24/7',
      'Handoff inteligente (IA → humano)',
    ],
    acento: 'fire' as const,
  },
  {
    numero: '07',
    nome: 'Crescimento',
    janela: 'PÓS-90 DIAS',
    modulos: 'M14–M15 · 8 destravamentos',
    objetivo:
      'Cultura data-driven. P6 — Pessoas estruturado por estágio. Plano 180–365 dias. De Vendas Aleatórias para Vendas Previsíveis.',
    destravamentos: [
      'Separar métricas de vaidade de métricas de negócio',
      'Rodar primeiro teste A/B estruturado',
      'Análise de coorte + prevenção de churn',
      'Mapear estrutura de time (P6) por estágio',
      'Programa de onboarding de 30 dias',
      'Escrever Plano 180–365 dias',
    ],
    acento: 'acid' as const,
  },
];

export function JornadaTimeline() {
  return (
    <section className="relative overflow-hidden bg-ink py-24">
      <div className="grid-overlay" />
      <Container>
        <div className="mx-auto mb-16 max-w-3xl">
          <div className="kicker mb-4">// JORNADA · 90 DIAS GUIADOS + PERPÉTUO</div>
          <h2
            className="mb-6 font-display text-cream"
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              lineHeight: '0.92',
              letterSpacing: '-0.04em',
              textTransform: 'uppercase',
            }}
          >
            <span className="text-acid">7 fases</span>. 15 módulos.{' '}
            <span className="stroke-text">66 destravamentos</span>.
          </h2>
          <p
            className="font-sans"
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.25rem)',
              lineHeight: '1.5',
              color: 'rgba(245, 241, 232, 0.7)',
            }}
          >
            De vendas aleatórias para vendas previsíveis. Cada destravamento é uma ação de 15–20
            minutos com entregável tangível. Não é curso pra maratonar — é sistema pra implementar.
            90 dias de execução, não 7 dias de milagre.
          </p>
        </div>

        <div className="mx-auto mb-12 max-w-5xl border border-white/10 bg-ink-2 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="dot-live" />
              <span className="mono text-acid">SYS ONLINE · VSS_CORE v3.0</span>
            </div>
            <div className="mono text-fg-muted">FASES 1–5 · 90 DIAS · FASES 6–7 · PERPÉTUO</div>
          </div>
        </div>

        <div className="mx-auto max-w-5xl">
          {fases.map((f, i) => {
            const acentoColor = f.acento === 'acid' ? 'var(--jb-acid)' : 'var(--jb-fire)';
            const isLast = i === fases.length - 1;
            return (
              <article
                key={f.numero}
                className="relative grid gap-6 border-t border-white/10 py-10 md:grid-cols-[200px_1fr] md:gap-10 md:py-14"
                style={isLast ? { borderBottom: '1px solid var(--jb-hair)' } : undefined}
              >
                <div className="flex flex-col">
                  <div
                    className="font-display"
                    style={{
                      color: acentoColor,
                      fontSize: 'clamp(4rem, 10vw, 7rem)',
                      lineHeight: '0.9',
                      letterSpacing: '-0.045em',
                      fontWeight: 900,
                    }}
                  >
                    {f.numero}
                  </div>
                  <div className="mono mt-2">// {f.janela}</div>
                  <div className="mono mt-1 text-fg-muted" style={{ fontSize: '0.65rem' }}>
                    {f.modulos}
                  </div>
                  {f.marco && (
                    <div
                      className="mt-3 inline-flex w-fit items-center gap-2 border border-acid bg-acid px-2 py-1"
                      style={{ color: 'var(--jb-ink)' }}
                    >
                      <span
                        className="font-display"
                        style={{ fontSize: '0.65rem', letterSpacing: '0.15em' }}
                      >
                        ★ MARCO 90D
                      </span>
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <h3
                    className="mb-4 font-display text-cream"
                    style={{
                      fontSize: 'clamp(1.5rem, 3.5vw, 2.25rem)',
                      lineHeight: '1',
                      letterSpacing: '-0.035em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Fase {f.numero} — {f.nome}
                  </h3>
                  <p
                    className="mb-6 font-sans"
                    style={{
                      fontSize: 'clamp(1rem, 1.8vw, 1.125rem)',
                      lineHeight: '1.55',
                      color: 'rgba(245, 241, 232, 0.85)',
                    }}
                  >
                    {f.objetivo}
                  </p>
                  <div className="border border-white/10 bg-ink-2 p-5 md:p-6">
                    <div className="mono mb-3" style={{ color: acentoColor }}>
                      // destravamentos-chave
                    </div>
                    <ul className="grid gap-2 md:grid-cols-2">
                      {f.destravamentos.map((d) => (
                        <li
                          key={d}
                          className="flex items-start gap-2 font-sans"
                          style={{
                            fontSize: '0.9rem',
                            lineHeight: '1.45',
                            color: 'rgba(245, 241, 232, 0.8)',
                          }}
                        >
                          <span style={{ color: acentoColor }}>▶</span>
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mx-auto mt-16 max-w-4xl border-l-4 border-acid bg-ink-2 p-8 md:p-10">
          <div className="kicker mb-4">// RESULTADO AO FIM DAS 7 FASES</div>
          <p
            className="mb-4 font-display text-cream"
            style={{
              fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
              lineHeight: '1.05',
              letterSpacing: '-0.035em',
              textTransform: 'uppercase',
            }}
          >
            <span className="text-acid">Máquina de Crescimento</span> ligada. Sistema rodando. Dono
            desafogado.
          </p>
          <p
            className="font-sans"
            style={{ fontSize: '1rem', lineHeight: '1.55', color: 'rgba(245, 241, 232, 0.8)' }}
          >
            De vendas aleatórias para vendas previsíveis. 6Ps integrados, CRM operacional, funis
            ativos, processos documentados, time autônomo. Não é milagre — é método aplicado com
            disciplina em 140+ empresas.
          </p>
          <p
            className="mt-6 font-display text-fire"
            style={{ fontSize: '1.25rem', letterSpacing: '-0.02em', textTransform: 'uppercase' }}
          >
            Sistema &gt; Improviso. Bora pra cima.
          </p>
        </div>
      </Container>
    </section>
  );
}
