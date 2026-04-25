import Link from 'next/link';
import { Container } from '@/components/patterns/container';
import { Breadcrumbs, type BreadcrumbItem } from '@/components/seo/breadcrumbs';

interface AdvisoryPageProps {
  breadcrumbItems?: BreadcrumbItem[];
}

const formatos = [
  {
    nome: 'Sessão Estratégica',
    investimento: 'R$ 997',
    cadencia: '/sessão · 90 min',
    duracao: '90 minutos',
    entrega: 'Relatório executivo 2–3 pgs',
    paraQuem: 'Desafio específico que precisa de direcionamento',
    inclusos: [
      '90 min de consultoria direta (presencial ou remoto)',
      'Diagnóstico rápido dos 6Ps',
      'Plano de ação (3–5 ações prioritárias)',
      'Gravação da sessão',
      'Relatório executivo 2–3 páginas',
    ],
    usos: [
      'Como me diferenciar sem competir por preço?',
      'Devo investir em tráfego ou contratar vendedor?',
      'Minha narrativa de investidor está de pé?',
    ],
  },
  {
    nome: 'Sprint Estratégico',
    investimento: 'R$ 7.500',
    cadencia: 'pagamento único · 30 dias',
    duracao: '4 sessões · 30 dias',
    entrega: 'Documento estratégico final 20–40 pgs',
    paraQuem: 'Momento crítico que precisa de plano estruturado',
    inclusos: [
      '4 sessões de 90 min (1 por semana)',
      'Diagnóstico profundo dos 6Ps',
      'Plano estratégico 12 meses detalhado',
      'WhatsApp direto com o Joel',
      'Documento estratégico final (20–40 páginas)',
    ],
    usos: [
      'Vou abrir filial — preciso de plano estruturado',
      'Migrando de consultoria pra SaaS, preciso reorganizar',
      'Faturamento caiu 40% — preciso reagir rápido',
    ],
    destaque: true,
  },
  {
    nome: 'Conselho Executivo',
    investimento: 'R$ 15.000',
    cadenciaPrefixo: 'a partir de',
    cadencia: '/mês · mín. 3 meses',
    duracao: '3–6 meses',
    entrega: 'Diagnóstico trimestral dos 6Ps',
    paraQuem: 'Empresa que precisa de conselheiro presente',
    inclusos: [
      '8 sessões/mês (2 por semana · 60 min)',
      'WhatsApp prioritário com o Joel',
      'Participação em até 2 reuniões críticas/mês',
      'Revisão ilimitada de materiais estratégicos',
      'Diagnóstico trimestral dos 6Ps',
    ],
    usos: [
      'R$ 300k/mês, meta R$ 1M/mês em 12 meses',
      'Cresceu desordenado, preciso arrumar a casa',
      'Preparar empresa pra exit em 18 meses',
    ],
    precoEspecial: 'R$ 12.500/mês no plano semestral',
  },
];

const eh = [
  'CEO/Founder em momento crítico real',
  'Quer minha cabeça, não execução',
  'Valoriza atalho de 17+ anos',
  'Entende que tempo > dinheiro',
];

const naoEh = [
  'Quer que eu faça por você — Advisory é pensar junto',
  'Busca preço acessível (vai para VSS)',
  'Não tem urgência real',
  'Não aceita feedback direto',
];

export function AdvisoryPage({ breadcrumbItems }: AdvisoryPageProps) {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-ink pb-24 pt-12 md:pt-16">
        <div className="grid-overlay" />
        <div
          className="pointer-events-none absolute -right-40 top-20 h-[600px] w-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(198,255,0,0.08), transparent 70%)',
          }}
        />

        <Container>
          {breadcrumbItems && <Breadcrumbs items={breadcrumbItems} className="mb-5" />}
          <div className="grid items-center gap-[clamp(2rem,5vw,4rem)] lg:grid-cols-[1.2fr_0.8fr] lg:gap-x-[clamp(3rem,6vw,5rem)]">
            <div className="flex flex-col gap-[clamp(1.25rem,2.5vw,2rem)]">
              <div className="kicker" style={{ color: 'var(--jb-fg-muted)' }}>
                // ADVISORY · 1:1 COM JOEL · EXCLUSIVO
              </div>
              <h1
                className="font-display text-cream"
                style={{
                  fontSize: 'clamp(2.25rem, 6.5vw, 5rem)',
                  lineHeight: '0.9',
                  letterSpacing: '-0.045em',
                  textTransform: 'uppercase',
                  margin: 0,
                }}
              >
                Se sua empresa fatura mais de R$ 200k/mês e ainda depende de você —{' '}
                <span className="stroke-text">ela não é empresa.</span> É{' '}
                <span className="text-fire">emprego</span>.
              </h1>
              <p
                className="font-sans"
                style={{
                  fontSize: 'clamp(1.05rem, 2vw, 1.25rem)',
                  lineHeight: '1.5',
                  maxWidth: '42ch',
                  margin: 0,
                  color: 'rgba(245, 241, 232, 0.85)',
                }}
              >
                Advisory é acesso direto à minha cabeça pra momentos críticos ou parceria
                estratégica de longo prazo. <strong className="text-cream">17+ anos</strong>,{' '}
                <strong className="text-cream">140+ empresas estruturadas</strong>,{' '}
                <strong className="text-cream">~R$ 1 bilhão</strong> em vendas estruturadas. Sem
                enrolação, sem PowerPoint de 200 slides, sem execução terceirizada. Eu penso junto.
                Você decide. Você executa.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <a
                  href="mailto:joel@joelburigo.com.br?subject=Solicita%C3%A7%C3%A3o%20Advisory"
                  className="btn-primary"
                  style={{ minHeight: '48px' }}
                >
                  Solicitar convite →
                </a>
                <span className="mono text-fg-muted">★ resposta direta do Joel</span>
              </div>
            </div>

            <aside
              className="border border-white/10 bg-ink-2"
              style={{ boxShadow: 'var(--shadow-terminal)' }}
            >
              <div
                className="flex items-center gap-2 border-b border-white/10"
                style={{ padding: '10px 14px' }}
              >
                <span
                  className="inline-block rounded-full bg-fire"
                  style={{ width: '11px', height: '11px' }}
                />
                <span
                  className="inline-block rounded-full"
                  style={{ width: '11px', height: '11px', background: '#FFB020' }}
                />
                <span
                  className="inline-block rounded-full bg-acid"
                  style={{ width: '11px', height: '11px' }}
                />
                <span
                  className="mono ml-auto text-fg-muted"
                  style={{
                    fontSize: '11px',
                    letterSpacing: '0.12em',
                    textTransform: 'lowercase',
                  }}
                >
                  advisory_filter — qualify
                </span>
              </div>
              <div
                className="p-5"
                style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', lineHeight: '1.7' }}
              >
                <div className="text-fg-muted">[00:00]</div>
                <div className="text-cream">
                  <span className="text-acid">$</span> ./advisory_filter --check
                </div>
                <div className="text-fg-muted">&gt; qualificando candidato…</div>
                <div className="mt-2 text-cream">
                  <span className="text-acid">[✓]</span> momento crítico real ...........{' '}
                  <span className="text-acid">OK</span>
                </div>
                <div className="text-cream">
                  <span className="text-acid">[✓]</span> faturamento R$ 200k+/mês .......{' '}
                  <span className="text-acid">OK</span>
                </div>
                <div className="text-cream">
                  <span className="text-acid">[✓]</span> CEO/Founder comprometido .......{' '}
                  <span className="text-acid">OK</span>
                </div>
                <div className="text-cream">
                  <span className="text-acid">[✓]</span> fit + agenda disponível ........{' '}
                  <span className="text-acid">OK</span>
                </div>
                <div className="mt-2 text-cream">
                  &gt; status:{' '}
                  <span
                    style={{
                      background: 'var(--jb-acid)',
                      color: 'var(--jb-ink)',
                      padding: '0 6px',
                    }}
                  >
                    QUALIFIED
                  </span>
                </div>
                <div className="mt-3 text-fg-muted">[00:02]</div>
                <div className="text-fg-muted">&gt; checking slot availability…</div>
                <div className="text-cream">
                  &gt; slots: <span className="text-acid">limitados</span> · conforme capacidade
                </div>
                <div className="text-cream">&gt; access: convite · indicação · e-mail</div>
                <div className="text-cream">
                  <span className="text-acid">$</span> solicitar_convite
                  <span className="text-fg-muted" style={{ animation: 'blink 1s infinite' }}>
                    _
                  </span>
                </div>
              </div>
            </aside>
          </div>
        </Container>
      </section>

      {/* MANIFESTO / FILTRO É × NÃO É */}
      <section className="relative bg-ink-2 py-20">
        <Container>
          <div className="mx-auto max-w-5xl">
            <div className="mb-12">
              <div className="kicker mb-4">// FILTRO</div>
              <h2
                className="font-display text-cream"
                style={{
                  fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
                  lineHeight: '0.95',
                  letterSpacing: '-0.035em',
                  textTransform: 'uppercase',
                }}
              >
                Advisory <span className="text-acid">é</span>. Advisory{' '}
                <span className="text-fire">não é</span>.
              </h2>
            </div>

            <div className="grid gap-0 border border-white/10 md:grid-cols-2">
              <div
                className="border-b border-white/10 p-8 md:border-b-0 md:border-r"
                style={{ background: 'linear-gradient(180deg, rgba(198,255,0,0.04), transparent)' }}
              >
                <div className="mono mb-5 text-acid">▲ é para</div>
                <ul className="space-y-4">
                  {eh.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 font-sans text-cream"
                      style={{ fontSize: '1rem', lineHeight: '1.45' }}
                    >
                      <span className="text-acid">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div
                className="p-8"
                style={{ background: 'linear-gradient(180deg, rgba(255,59,15,0.04), transparent)' }}
              >
                <div className="mono mb-5 text-fire">▼ NÃO é para</div>
                <ul className="space-y-4">
                  {naoEh.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 font-sans"
                      style={{
                        fontSize: '1rem',
                        lineHeight: '1.45',
                        color: 'rgba(245, 241, 232, 0.8)',
                      }}
                    >
                      <span className="text-fire">✗</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 3 FORMATOS */}
      <section className="relative overflow-hidden bg-ink py-24">
        <div className="grid-overlay" />

        <Container>
          <div className="mx-auto mb-16 max-w-3xl">
            <div className="kicker mb-4">// FORMATOS · 3 NÍVEIS DE PROFUNDIDADE</div>
            <h2
              className="mb-6 font-display text-cream"
              style={{
                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                lineHeight: '0.92',
                letterSpacing: '-0.04em',
                textTransform: 'uppercase',
              }}
            >
              Escolhe o <span className="text-acid">formato</span> que cabe no teu momento.
            </h2>
            <p
              className="font-sans"
              style={{ fontSize: '1.125rem', lineHeight: '1.55', color: 'rgba(245, 241, 232, 0.7)' }}
            >
              De sessão pontual a conselheiro executivo contínuo. Garantia incondicional em todos:
              se não agregar valor na primeira sessão, reembolso 100% · sem fricção. Sem perguntas.
            </p>
          </div>

          <div className="grid gap-0 border border-white/10 lg:grid-cols-3 lg:items-stretch">
            {formatos.map((f, i) => {
              const isLast = i === formatos.length - 1;
              const baseStyle = f.destaque
                ? {
                    background: 'linear-gradient(180deg, rgba(198,255,0,0.06), #0B0B0B)',
                    borderLeft: '1px solid var(--jb-acid-border)',
                    borderRight: '1px solid var(--jb-acid-border)',
                  }
                : { background: '#0B0B0B' };
              return (
                <article
                  key={f.nome}
                  className={`relative flex flex-col p-8 md:p-10 ${
                    !isLast ? 'border-b border-white/10 lg:border-b-0 lg:border-r' : ''
                  }`}
                  style={baseStyle}
                >
                  {f.destaque && (
                    <div
                      className="absolute inline-flex items-center gap-2 bg-acid px-2 py-1"
                      style={{
                        color: 'var(--jb-ink)',
                        top: '-12px',
                        right: '16px',
                        zIndex: 1,
                      }}
                    >
                      <span
                        className="font-display"
                        style={{ fontSize: '0.65rem', letterSpacing: '0.15em' }}
                      >
                        ★ MAIS PEDIDO
                      </span>
                    </div>
                  )}

                  <h3
                    className="mb-3 font-display text-cream"
                    style={{
                      fontSize: '1.35rem',
                      letterSpacing: '-0.02em',
                      textTransform: 'uppercase',
                      lineHeight: '1.1',
                      minHeight: '2.6em',
                    }}
                  >
                    {f.nome}
                  </h3>

                  <div className="mb-6">
                    {f.cadenciaPrefixo && (
                      <div className="mono text-fg-muted" style={{ marginBottom: '2px' }}>
                        {f.cadenciaPrefixo}
                      </div>
                    )}
                    <div
                      className="font-display text-acid"
                      style={{
                        fontSize: 'clamp(1.75rem, 3vw, 2.25rem)',
                        letterSpacing: '-0.035em',
                        lineHeight: '1',
                      }}
                    >
                      {f.investimento}
                    </div>
                    <div className="mono text-fg-muted" style={{ marginTop: '4px' }}>
                      {f.cadencia}
                    </div>
                  </div>

                  <div className="mb-6 space-y-1">
                    <div className="mono text-fg-muted">// duração · {f.duracao}</div>
                    <div className="mono text-fg-muted">// entrega · {f.entrega}</div>
                  </div>

                  <p
                    className="mb-6 font-sans"
                    style={{
                      fontSize: '0.95rem',
                      lineHeight: '1.5',
                      minHeight: '3em',
                      color: 'rgba(245, 241, 232, 0.85)',
                    }}
                  >
                    <strong className="text-cream">Para quem:</strong> {f.paraQuem}
                  </p>

                  <div className="mb-6 border-t border-white/10 pt-5">
                    <div className="mono mb-3 text-acid">// inclui</div>
                    <ul className="space-y-2">
                      {f.inclusos.map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-2 font-sans"
                          style={{
                            fontSize: '0.875rem',
                            lineHeight: '1.4',
                            color: 'rgba(245, 241, 232, 0.85)',
                          }}
                        >
                          <span className="text-acid">▶</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mb-6 border-t border-white/10 pt-5">
                    <div className="mono mb-3 text-fire">// exemplos de uso</div>
                    <ul className="space-y-2">
                      {f.usos.map((u) => (
                        <li
                          key={u}
                          className="font-sans"
                          style={{
                            fontSize: '0.85rem',
                            lineHeight: '1.4',
                            fontStyle: 'italic',
                            color: 'rgba(245, 241, 232, 0.7)',
                          }}
                        >
                          &ldquo;{u}&rdquo;
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mb-6 min-h-[32px]">
                    {f.precoEspecial && (
                      <div className="border-l-2 border-acid pl-3">
                        <div className="mono text-acid">★ {f.precoEspecial}</div>
                      </div>
                    )}
                  </div>

                  <a
                    href="mailto:joel@joelburigo.com.br?subject=Advisory%20%C2%B7%20"
                    className={`mt-auto ${f.destaque ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    Solicitar convite →
                  </a>
                </article>
              );
            })}
          </div>
        </Container>
      </section>

      {/* GARANTIA + PROVA SOCIAL */}
      <section className="relative bg-ink-2 py-20">
        <Container>
          <div className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-[1fr_1fr]">
            <div className="border-l-4 border-acid bg-ink p-8 md:p-10">
              <div className="kicker mb-4">// GARANTIA INCONDICIONAL</div>
              <p
                className="mb-4 font-display text-cream"
                style={{
                  fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                  lineHeight: '1.05',
                  letterSpacing: '-0.035em',
                  textTransform: 'uppercase',
                }}
              >
                Se não agregar valor na <span className="text-acid">primeira sessão</span>,
                devolvemos 100%.
              </p>
              <p
                className="font-sans"
                style={{ fontSize: '0.95rem', lineHeight: '1.55', color: 'rgba(245, 241, 232, 0.8)' }}
              >
                Avisa direto e o reembolso é processado sem burocracia. Sem perguntas. Sem
                justificativas. Válida pra Sessão Estratégica, primeira sessão do Sprint e primeira
                semana do Conselho Executivo.
              </p>
            </div>

            <div className="border-l-4 border-fire bg-ink p-8 md:p-10">
              <div className="kicker mb-4" style={{ color: 'var(--jb-fire)' }}>
                // PROVAS
              </div>
              <div className="mb-5 grid grid-cols-3 gap-4 border-b border-white/10 pb-5">
                <div>
                  <div
                    className="font-display text-acid"
                    style={{ fontSize: '2rem', lineHeight: '1', letterSpacing: '-0.035em' }}
                  >
                    17+
                  </div>
                  <div className="mono mt-1 text-fg-muted" style={{ fontSize: '0.6rem' }}>
                    anos
                  </div>
                </div>
                <div>
                  <div
                    className="font-display text-acid"
                    style={{ fontSize: '2rem', lineHeight: '1', letterSpacing: '-0.035em' }}
                  >
                    140+
                  </div>
                  <div className="mono mt-1 text-fg-muted" style={{ fontSize: '0.6rem' }}>
                    clientes
                  </div>
                </div>
                <div>
                  <div
                    className="font-display text-acid"
                    style={{ fontSize: '1.5rem', lineHeight: '1', letterSpacing: '-0.035em' }}
                  >
                    ~R$ 1BI
                  </div>
                  <div className="mono mt-1 text-fg-muted" style={{ fontSize: '0.6rem' }}>
                    em vendas
                  </div>
                </div>
              </div>
              <p
                className="font-sans"
                style={{ fontSize: '0.95rem', lineHeight: '1.55', color: 'rgba(245, 241, 232, 0.8)' }}
              >
                <strong className="text-cream">Case emblemático:</strong> holding de franquias — de
                R$ 160k/mês para R$ 1 milhão/mês (+433%), leads ×8,33, holding com 1.800+
                franqueados. 2018–2020.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* CTA FINAL */}
      <section className="relative overflow-hidden bg-ink py-24">
        <div className="grid-overlay" />
        <Container>
          <div
            className="mx-auto max-w-4xl border-2 border-fire p-10 md:p-16"
            style={{ background: 'linear-gradient(180deg, rgba(255,59,15,0.08), #050505)' }}
          >
            <div className="kicker mb-5" style={{ color: 'var(--jb-fire)' }}>
              // DECISÃO
            </div>
            <h2
              className="mb-6 font-display text-cream"
              style={{
                fontSize: 'clamp(1.75rem, 4.5vw, 3rem)',
                lineHeight: '0.95',
                letterSpacing: '-0.04em',
                textTransform: 'uppercase',
              }}
            >
              Momento crítico não espera.
              <br />
              Advisory <span className="text-acid">também não.</span>
            </h2>
            <p
              className="mb-8 font-sans"
              style={{ fontSize: '1.125rem', lineHeight: '1.55', color: 'rgba(245, 241, 232, 0.85)' }}
            >
              Vagas limitadas conforme capacidade do momento. Seleção por fit real, não por ordem
              de chegada. Se teu momento é agora, solicita o convite. Se não é, espera o momento
              certo.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <a
                href="mailto:joel@joelburigo.com.br?subject=Solicita%C3%A7%C3%A3o%20Advisory"
                className="btn-fire"
              >
                Solicitar convite →
              </a>
              <span className="mono text-fg-muted">★ SEM ENROLAÇÃO · RESPOSTA DIRETA</span>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
