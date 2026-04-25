import Link from 'next/link';
import { Container } from '@/components/patterns/container';
import { Breadcrumbs, type BreadcrumbItem } from '@/components/seo/breadcrumbs';

interface VssPageProps {
  breadcrumbItems?: BreadcrumbItem[];
}

const stack = [
  {
    item: 'Sistema VSS Implementável (playbook + 15 vídeos-âncora · acesso vitalício)',
    valor: 'R$ 1.997',
  },
  { item: 'Growth CRM completo (12 meses)', valor: 'R$ 6.996' },
  { item: '48 mentorias ao vivo com Joel (rolling 12 meses)', valor: 'R$ 7.200' },
  { item: 'Templates, scripts e recursos', valor: 'R$ 497' },
  { item: 'Comunidade exclusiva (90 dias)', valor: 'R$ 597' },
];

const pPilares = [
  {
    p: 'P1',
    nome: 'Posicionamento',
    resumo: 'Diferenciação + PUV + Big Idea. Cliente entende em 10s.',
  },
  { p: 'P2', nome: 'Público', resumo: 'ICP cirúrgico + persona + mapa de dores. Conversão sobe.' },
  {
    p: 'P3',
    nome: 'Produto',
    resumo: 'Oferta irresistível + precificação por valor + prova social.',
  },
  { p: 'P4', nome: 'Programas', resumo: 'Growth CRM + funis + automação + tráfego ou prospecção.' },
  { p: 'P5', nome: 'Processos', resumo: '5 playbooks essenciais + SOPs + dashboard unificado.' },
  { p: 'P6', nome: 'Pessoas', resumo: 'Estrutura de time por estágio + onboarding 30d + rituais.' },
];

const fases = [
  {
    n: '01',
    nome: 'Fundamentos',
    janela: '0–30D',
    desc: 'Canvas 6Ps + P1 + P2 + P3 · 15 destravamentos',
  },
  {
    n: '02',
    nome: 'Infraestrutura',
    janela: '30–45D',
    desc: 'Growth CRM + landing page · 9 destravamentos',
  },
  {
    n: '03',
    nome: 'Atração',
    janela: '45–75D',
    desc: 'Orgânico + pago + prospecção · 13 destravamentos',
  },
  {
    n: '04',
    nome: 'Conversão',
    janela: '75–90D',
    desc: 'Funis + scripts + objeções · 9 destravamentos',
  },
  {
    n: '05',
    nome: 'Sistema',
    janela: '90D · MARCO',
    desc: 'Integração + processos · 4 destravamentos',
  },
  {
    n: '06',
    nome: 'Automação',
    janela: 'PÓS-90D',
    desc: 'Workflows + IA conversacional · 8 destravamentos',
  },
  {
    n: '07',
    nome: 'Crescimento',
    janela: 'PÓS-90D',
    desc: 'Analytics + P6 + Plano 180–365d · 8 destravamentos',
  },
];

const paraQuem = [
  'Empreendedor hands-on que quer autonomia',
  'MPE com faturamento R$ 10–100k/mês',
  'Tem 2–3h/semana pra implementar',
  'Quer o método antes de contratar 1:1',
];

const naoEPara = [
  'Quem quer que alguém faça por você (não é DFY)',
  'Quem busca milagre em 7 dias',
  'Quem não tem 6–9h/semana pras primeiras fases',
  'Quem não aceita feedback direto',
];

const objecoes = [
  {
    q: 'R$ 1.997 está caro pra mim agora.',
    a: 'Você não paga R$ 1.997 — você recupera em 1 venda adicional de R$ 500. Stack empilhada: R$ 17.287. E tem 12× R$ 166,42 no cartão. A pergunta real é: quanto custa continuar improvisando mais 12 meses?',
  },
  {
    q: 'Não tenho tempo. Agenda caótica.',
    a: 'Você já gasta mais tempo improvisando. 6–9h/semana nas primeiras fases. Depois dos 90 dias, o sistema passa a rodar por você. É investimento de tempo, não gasto.',
  },
  {
    q: 'Meu nicho é diferente. Não vai funcionar.',
    a: 'Base aplicada em 20+ nichos — consultoria, advocacia, clínicas, academias, e-commerce, B2B, cursos, SaaS, estética, restaurantes. Os 6Ps são universais. A implementação é customizada.',
  },
  {
    q: 'Já tentei curso/agência e não deu.',
    a: 'A diferença é implementação guiada — 48 mentorias ao vivo com o Joel (rolling 12 meses) + comunidade. Não é curso pra maratonar e esquecer. É sistema pra implementar junto.',
  },
  {
    q: 'Não tenho budget pra tráfego pago.',
    a: 'VSS funciona com OU sem tráfego pago. Módulo 8 inteiro é prospecção ativa gratuita (LinkedIn, Instagram, cold email ético). Validado em clientes com R$ 0 de budget.',
  },
  {
    q: 'E se não for pra mim?',
    a: '15 dias de garantia incondicional. Testa, não se adaptou — reembolso 100%. Sem perguntas, sem fricção. Risco zero.',
  },
];

export function VssPage({ breadcrumbItems }: VssPageProps) {
  return (
    <>
      {/* HERO TERMINAL */}
      <section className="bg-ink relative overflow-hidden pt-12 pb-24 md:pt-16">
        <div className="grid-overlay" />

        <Container>
          {breadcrumbItems && <Breadcrumbs items={breadcrumbItems} className="mb-5" />}
          <div className="grid items-center gap-[clamp(2rem,5vw,4rem)] lg:grid-cols-[1.3fr_1fr] lg:gap-x-[clamp(3rem,6vw,5rem)]">
            {/* Copy */}
            <div className="flex flex-col gap-[clamp(1.25rem,2.5vw,2rem)]">
              <div className="kicker" style={{ color: 'var(--jb-fg-muted)' }}>
                // PRODUTO PRINCIPAL · DIY · ACESSO VITALÍCIO
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
                De vendas <span className="text-fire">aleatórias</span> para vendas{' '}
                <span className="stroke-text">previsíveis</span>.
                <br />
                Em 90 dias.
              </h1>
              <p
                className="font-sans"
                style={{
                  fontSize: 'clamp(1.05rem, 2vw, 1.25rem)',
                  lineHeight: '1.5',
                  maxWidth: '40ch',
                  margin: 0,
                  color: 'rgba(245, 241, 232, 0.85)',
                }}
              >
                VSS é o sistema implementável que estrutura os{' '}
                <span className="text-acid">6Ps das Vendas Escaláveis</span> no teu negócio.
                Framework formalizado em 2025 a partir de uma base aplicada em{' '}
                <strong className="text-cream">140+ empresas</strong> e{' '}
                <strong className="text-cream">20+ nichos</strong>. Não há fórmula mágica. Há
                método. E você vai dominar cada etapa — com ou sem budget de tráfego.
              </p>

              {/* Bloco preço + checkout */}
              <div
                className="border-acid border-2 p-6 md:p-8"
                style={{
                  background: 'linear-gradient(180deg, rgba(198,255,0,0.1), rgba(198,255,0,0.02))',
                }}
              >
                <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
                  <div>
                    <div className="mono text-acid mb-2">
                      // INVESTIMENTO ÚNICO · ACESSO VITALÍCIO
                    </div>
                    <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                      <span
                        className="font-display text-acid"
                        style={{
                          fontSize: 'clamp(3rem, 6vw, 4.5rem)',
                          lineHeight: '1',
                          letterSpacing: '-0.045em',
                        }}
                      >
                        R$ 1.997
                      </span>
                      <span
                        className="font-display"
                        style={{
                          fontSize: '1.15rem',
                          letterSpacing: '-0.02em',
                          color: 'rgba(245, 241, 232, 0.8)',
                        }}
                      >
                        à vista
                      </span>
                    </div>
                    <div
                      className="mt-2 font-sans"
                      style={{ fontSize: '1rem', color: 'rgba(245, 241, 232, 0.85)' }}
                    >
                      ou <strong className="text-cream">12× de R$ 166,42</strong> no cartão · stack
                      empilhada <span className="text-fg-muted line-through">R$ 17.287</span>
                    </div>
                  </div>
                  <Link
                    href="#checkout"
                    className="btn-primary"
                    style={{ fontSize: '1rem', padding: '1.25rem 2rem', minHeight: '48px' }}
                  >
                    Comprar agora →
                  </Link>
                </div>
              </div>

              <div className="mono text-fg-muted flex flex-wrap items-center gap-x-6 gap-y-2">
                <span className="flex items-center gap-2">
                  <span className="text-acid">★</span> GARANTIA 15 DIAS
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-acid">★</span> GROWTH CRM INCLUÍDO
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-acid">★</span> 48 MENTORIAS AO VIVO
                </span>
              </div>

              <Link
                href="/diagnostico"
                className="btn-secondary self-start"
                style={{ minHeight: '48px' }}
              >
                Diagnóstico 6Ps grátis
              </Link>
            </div>

            {/* Terminal window */}
            <div
              className="bg-ink-2 border border-white/10"
              style={{ boxShadow: 'var(--shadow-terminal)' }}
            >
              <div
                className="flex items-center gap-2 border-b border-white/10"
                style={{ padding: '10px 14px' }}
              >
                <span
                  className="bg-fire inline-block rounded-full"
                  style={{ width: '11px', height: '11px' }}
                />
                <span
                  className="inline-block rounded-full"
                  style={{ width: '11px', height: '11px', background: '#FFB020' }}
                />
                <span
                  className="bg-acid inline-block rounded-full"
                  style={{ width: '11px', height: '11px' }}
                />
                <span
                  className="mono text-fg-muted ml-auto"
                  style={{
                    fontSize: '11px',
                    letterSpacing: '0.12em',
                    textTransform: 'lowercase',
                  }}
                >
                  vss_diag.run — system=6ps
                </span>
              </div>
              <div
                className="p-5"
                style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', lineHeight: '1.7' }}
              >
                <div className="text-fg-muted">[00:00]</div>
                <div className="text-cream">&gt; scanning máquina de vendas…</div>
                <div className="text-fire">▼ P1 posicionamento .......... 01/05 fraco</div>
                <div className="text-fire">▼ P2 público ................. 02/05 fraco</div>
                <div className="text-fire">▼ P3 produto ................. 02/05 fraco</div>
                <div className="text-fire">▼ P4 programas ............... 00/05 caótico</div>
                <div className="text-fire">▼ P5 processos ............... 00/05 caótico</div>
                <div className="text-fire">▼ P6 pessoas ................. 01/05 fraco</div>
                <div className="text-cream mt-2">
                  &gt; score total: <span className="text-fire">06/30</span> · status:{' '}
                  <span className="text-fire">caótico</span>
                </div>
                <div className="text-fg-muted mt-2">[00:04]</div>
                <div className="text-cream">&gt; aplicando método VSS (90d)…</div>
                <div className="text-acid mt-2">▲ P1 ............. 04/05 forte</div>
                <div className="text-acid">▲ P2 ............. 04/05 forte</div>
                <div className="text-acid">▲ P3 ............. 04/05 forte</div>
                <div className="text-acid">▲ P4 ............. 04/05 forte</div>
                <div className="text-acid">▲ P5 ............. 03/05 estruturado</div>
                <div className="text-acid">▲ P6 ............. 03/05 estruturado</div>
                <div className="text-cream mt-2">
                  &gt; score total: <span className="text-acid">22/30</span> · status:{' '}
                  <span className="text-acid">estruturado</span>
                </div>
                <div className="text-acid mt-3">
                  ★ máquina de crescimento:{' '}
                  <span
                    style={{
                      background: 'var(--jb-acid)',
                      color: 'var(--jb-ink)',
                      padding: '0 6px',
                    }}
                  >
                    ONLINE
                  </span>
                </div>
                <div className="text-fg-muted" style={{ animation: 'blink 1s infinite' }}>
                  _
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 6PS PILARES */}
      <section className="bg-ink-2 relative py-24">
        <Container>
          <div className="mx-auto mb-14 max-w-3xl">
            <div className="kicker mb-4">// 01_FRAMEWORK</div>
            <h2
              className="font-display text-cream mb-6"
              style={{
                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                lineHeight: '0.92',
                letterSpacing: '-0.04em',
                textTransform: 'uppercase',
              }}
            >
              Os <span className="text-acid">6Ps</span> das Vendas Escaláveis
            </h2>
            <p
              className="font-sans"
              style={{
                fontSize: '1.125rem',
                lineHeight: '1.55',
                color: 'rgba(245, 241, 232, 0.7)',
              }}
            >
              Posicionamento → Público → Produto → Programas → Processos → Pessoas. Sequência
              importa — fraqueza em um compromete todos os seguintes. Não é teoria de MBA. É método
              formalizado em 2025 a partir de 17+ anos.
            </p>
          </div>

          <div className="grid gap-0 border border-white/10 sm:grid-cols-2 lg:grid-cols-3">
            {pPilares.map((p, i) => (
              <article
                key={p.p}
                className="p-8"
                style={{
                  borderRight: (i + 1) % 3 === 0 ? '0' : '1px solid var(--jb-hair)',
                  borderBottom: i < pPilares.length - 3 ? '1px solid var(--jb-hair)' : '0',
                }}
              >
                <div
                  className="font-display text-acid"
                  style={{ fontSize: '2.5rem', lineHeight: '1', letterSpacing: '-0.045em' }}
                >
                  {p.p}
                </div>
                <h3
                  className="font-display text-cream mt-2 mb-3"
                  style={{
                    fontSize: '1.1rem',
                    letterSpacing: '-0.02em',
                    textTransform: 'uppercase',
                  }}
                >
                  {p.nome}
                </h3>
                <p
                  className="font-sans"
                  style={{
                    fontSize: '0.9rem',
                    lineHeight: '1.5',
                    color: 'rgba(245, 241, 232, 0.75)',
                  }}
                >
                  {p.resumo}
                </p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      {/* 7 FASES */}
      <section className="bg-ink relative overflow-hidden py-24">
        <div className="grid-overlay" />
        <Container>
          <div className="mx-auto mb-14 max-w-3xl">
            <div className="kicker mb-4">// 02_JORNADA</div>
            <h2
              className="font-display text-cream mb-6"
              style={{
                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                lineHeight: '0.92',
                letterSpacing: '-0.04em',
                textTransform: 'uppercase',
              }}
            >
              <span className="text-acid">7 fases</span> · 15 módulos ·{' '}
              <span className="stroke-text">66 destravamentos</span>
            </h2>
            <p
              className="font-sans"
              style={{
                fontSize: '1.125rem',
                lineHeight: '1.55',
                color: 'rgba(245, 241, 232, 0.7)',
              }}
            >
              Cada destravamento é ação de 15–20 min com entregável tangível. Fases 1–5 em 90 dias.
              Fases 6–7 avançadas pós-fundação. Vitalício: entra qualquer dia, começa essa semana.
            </p>
          </div>

          <div className="mx-auto max-w-5xl border border-white/10">
            {fases.map((f, i) => (
              <div
                key={f.n}
                className="grid gap-0 md:grid-cols-[120px_200px_1fr]"
                style={{ borderTop: i === 0 ? '0' : '1px solid var(--jb-hair)' }}
              >
                <div
                  className="flex items-center border-white/10 p-5 md:border-r"
                  style={{ background: 'rgba(198,255,0,0.04)' }}
                >
                  <span
                    className="font-display text-acid"
                    style={{ fontSize: '2.25rem', lineHeight: '1', letterSpacing: '-0.04em' }}
                  >
                    {f.n}
                  </span>
                </div>
                <div className="flex items-center border-white/10 p-5 md:border-r">
                  <div>
                    <div
                      className="font-display text-cream"
                      style={{
                        fontSize: '1rem',
                        textTransform: 'uppercase',
                        letterSpacing: '-0.02em',
                      }}
                    >
                      {f.nome}
                    </div>
                    <div className="mono text-fg-muted mt-1">{f.janela}</div>
                  </div>
                </div>
                <div className="flex items-center p-5">
                  <p
                    className="font-sans"
                    style={{
                      fontSize: '0.95rem',
                      lineHeight: '1.5',
                      color: 'rgba(245, 241, 232, 0.85)',
                    }}
                  >
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* STACK / VALOR */}
      <section className="bg-ink-2 relative py-24">
        <Container>
          <div className="mx-auto max-w-4xl">
            <div className="mb-12">
              <div className="kicker mb-4">// 03_STACK · O QUE VOCÊ LEVA</div>
              <h2
                className="font-display text-cream"
                style={{
                  fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
                  lineHeight: '0.95',
                  letterSpacing: '-0.035em',
                  textTransform: 'uppercase',
                }}
              >
                Stack empilhada: <span className="stroke-text">R$ 17.287</span>. Investimento:{' '}
                <span className="text-acid">R$ 1.997</span>.
              </h2>
            </div>

            <div className="border border-white/10">
              {stack.map((s, i) => (
                <div
                  key={s.item}
                  className="grid grid-cols-[1fr_auto] gap-4 p-5 md:p-6"
                  style={{ borderTop: i === 0 ? '0' : '1px solid var(--jb-hair)' }}
                >
                  <div
                    className="text-cream font-sans"
                    style={{ fontSize: '0.95rem', lineHeight: '1.4' }}
                  >
                    <span className="mono text-acid mr-2">▶</span>
                    {s.item}
                  </div>
                  <div
                    className="font-display text-acid"
                    style={{ fontSize: '1rem', whiteSpace: 'nowrap', letterSpacing: '-0.01em' }}
                  >
                    {s.valor}
                  </div>
                </div>
              ))}
              <div
                className="grid grid-cols-[1fr_auto] gap-4 p-5 md:p-6"
                style={{
                  borderTop: '1px solid var(--jb-hair)',
                  background: 'rgba(198,255,0,0.06)',
                }}
              >
                <div
                  className="font-display text-cream"
                  style={{
                    fontSize: '1rem',
                    textTransform: 'uppercase',
                    letterSpacing: '-0.02em',
                  }}
                >
                  Total empilhado
                </div>
                <div
                  className="font-display text-cream"
                  style={{ fontSize: '1.25rem', letterSpacing: '-0.02em' }}
                >
                  R$ 17.287
                </div>
              </div>
              <div
                className="grid grid-cols-[1fr_auto] items-center gap-4 p-5 md:p-6"
                style={{
                  borderTop: '2px solid var(--jb-acid)',
                  background: 'rgba(198,255,0,0.12)',
                }}
              >
                <div
                  className="font-display text-cream"
                  style={{
                    fontSize: '1.25rem',
                    textTransform: 'uppercase',
                    letterSpacing: '-0.02em',
                  }}
                >
                  Investimento VSS
                </div>
                <div className="text-right">
                  <div className="flex items-baseline justify-end gap-2">
                    <span
                      className="mono"
                      style={{ fontSize: '0.85rem', color: 'rgba(245, 241, 232, 0.7)' }}
                    >
                      12×
                    </span>
                    <span
                      className="font-display text-acid"
                      style={{
                        fontSize: 'clamp(2.25rem, 5vw, 3rem)',
                        lineHeight: '1',
                        letterSpacing: '-0.035em',
                      }}
                    >
                      R$ 166,42
                    </span>
                  </div>
                  <div
                    className="mono mt-1"
                    style={{ fontSize: '0.8rem', color: 'rgba(245, 241, 232, 0.6)' }}
                  >
                    ou R$ 1.997 à vista
                  </div>
                </div>
              </div>
            </div>
            <p
              className="mt-4 font-sans"
              style={{ fontSize: '0.9rem', color: 'rgba(245, 241, 232, 0.7)' }}
            >
              ★ Acesso vitalício ao playbook · Growth CRM 12 meses · 48 mentorias ao vivo
            </p>
          </div>
        </Container>
      </section>

      {/* É × NÃO É */}
      <section className="bg-ink relative overflow-hidden py-24">
        <div className="grid-overlay" />
        <Container>
          <div className="mx-auto max-w-5xl">
            <div className="mb-12">
              <div className="kicker mb-4">// 04_FIT</div>
              <h2
                className="font-display text-cream"
                style={{
                  fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
                  lineHeight: '0.95',
                  letterSpacing: '-0.035em',
                  textTransform: 'uppercase',
                }}
              >
                VSS <span className="text-acid">é pra você</span>. VSS{' '}
                <span className="text-fire">não é pra você</span>.
              </h2>
            </div>

            <div className="grid gap-0 border border-white/10 md:grid-cols-2">
              <div
                className="border-b border-white/10 p-8 md:border-r md:border-b-0"
                style={{ background: 'linear-gradient(180deg, rgba(198,255,0,0.04), transparent)' }}
              >
                <div className="mono text-acid mb-5">▲ é pra você se</div>
                <ul className="space-y-4">
                  {paraQuem.map((item) => (
                    <li
                      key={item}
                      className="text-cream flex items-start gap-3 font-sans"
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
                <div className="mono text-fire mb-5">▼ NÃO é pra você se</div>
                <ul className="space-y-4">
                  {naoEPara.map((item) => (
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

      {/* OBJEÇÕES */}
      <section className="bg-ink relative overflow-hidden py-24">
        <div className="grid-overlay" />
        <Container>
          <div className="mx-auto mb-14 max-w-3xl">
            <div className="kicker mb-4">// OBJEÇÕES</div>
            <h2
              className="font-display text-cream mb-6"
              style={{
                fontSize: 'clamp(1.75rem, 4.5vw, 3rem)',
                lineHeight: '0.95',
                letterSpacing: '-0.035em',
                textTransform: 'uppercase',
              }}
            >
              As 6 perguntas que <span className="text-acid">todo mundo</span> faz
            </h2>
          </div>

          <div className="mx-auto max-w-5xl border border-white/10">
            {objecoes.map((o, i) => (
              <details
                key={o.q}
                className="group"
                style={{ borderTop: i === 0 ? '0' : '1px solid var(--jb-hair)' }}
              >
                <summary
                  className="font-display text-cream flex cursor-pointer items-center justify-between gap-4 p-6 md:p-8"
                  style={{
                    fontSize: 'clamp(1rem, 2vw, 1.15rem)',
                    letterSpacing: '-0.02em',
                    textTransform: 'uppercase',
                    listStyle: 'none',
                  }}
                >
                  <span>{o.q}</span>
                  <span
                    className="text-acid group-open:rotate-45"
                    style={{ transition: 'transform 180ms' }}
                  >
                    +
                  </span>
                </summary>
                <div className="px-6 pb-6 md:px-8 md:pb-8">
                  <p
                    className="font-sans"
                    style={{
                      fontSize: '1rem',
                      lineHeight: '1.55',
                      color: 'rgba(245, 241, 232, 0.85)',
                    }}
                  >
                    {o.a}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </Container>
      </section>

      {/* GARANTIA + PROVAS */}
      <section className="bg-ink-2 relative py-20">
        <Container>
          <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-2">
            <div className="border-acid bg-ink border-l-4 p-8 md:p-10">
              <div className="kicker mb-4">// GARANTIA 15 DIAS</div>
              <p
                className="font-display text-cream mb-4"
                style={{
                  fontSize: 'clamp(1.35rem, 3vw, 1.75rem)',
                  lineHeight: '1.05',
                  letterSpacing: '-0.035em',
                  textTransform: 'uppercase',
                }}
              >
                15 dias <span className="text-acid">incondicional</span>. Reembolso 100%.
              </p>
              <p
                className="font-sans"
                style={{
                  fontSize: '0.95rem',
                  lineHeight: '1.55',
                  color: 'rgba(245, 241, 232, 0.8)',
                }}
              >
                Testou, não se adaptou — devolvemos tudo. Sem perguntas, sem fricção. Confiança
                total porque a base do método já foi aplicada em 140+ empresas.
              </p>
            </div>
            <div className="border-fire bg-ink border-l-4 p-8 md:p-10">
              <div className="kicker mb-4" style={{ color: 'var(--jb-fire)' }}>
                // PROVAS
              </div>
              <div className="grid grid-cols-3 gap-3 border-b border-white/10 pb-4">
                <div>
                  <div
                    className="font-display text-acid"
                    style={{ fontSize: '1.75rem', lineHeight: '1' }}
                  >
                    17+
                  </div>
                  <div className="mono text-fg-muted mt-1" style={{ fontSize: '0.6rem' }}>
                    anos
                  </div>
                </div>
                <div>
                  <div
                    className="font-display text-acid"
                    style={{ fontSize: '1.75rem', lineHeight: '1' }}
                  >
                    140+
                  </div>
                  <div className="mono text-fg-muted mt-1" style={{ fontSize: '0.6rem' }}>
                    clientes
                  </div>
                </div>
                <div>
                  <div
                    className="font-display text-acid"
                    style={{ fontSize: '1.25rem', lineHeight: '1' }}
                  >
                    ~R$ 1BI
                  </div>
                  <div className="mono text-fg-muted mt-1" style={{ fontSize: '0.6rem' }}>
                    estruturado
                  </div>
                </div>
              </div>
              <p
                className="mt-4 font-sans"
                style={{ fontSize: '0.9rem', lineHeight: '1.5', color: 'rgba(245, 241, 232, 0.8)' }}
              >
                <strong className="text-cream">Framework testado</strong> em 140+ empresas, 20+
                nichos — base 6Ps aplicada.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* CTA FINAL */}
      <section className="bg-ink relative overflow-hidden py-24">
        <div className="grid-overlay" />
        <Container>
          <div
            className="border-acid mx-auto max-w-4xl border-2 p-10 md:p-16"
            style={{ background: 'linear-gradient(180deg, rgba(198,255,0,0.08), #050505)' }}
          >
            <div className="kicker mb-5">// DECISÃO</div>
            <h2
              className="font-display text-cream mb-6"
              style={{
                fontSize: 'clamp(1.75rem, 4.5vw, 3rem)',
                lineHeight: '0.95',
                letterSpacing: '-0.04em',
                textTransform: 'uppercase',
              }}
            >
              Daqui <span className="text-acid">90 dias</span> você estará{' '}
              <span className="text-acid">90 dias mais perto</span> do sistema.
              <br />
              Ou 90 dias mais <span className="text-fire">distante</span>. Escolhe.
            </h2>
            <p
              className="mb-8 font-sans"
              style={{
                fontSize: '1.125rem',
                lineHeight: '1.55',
                color: 'rgba(245, 241, 232, 0.85)',
              }}
            >
              R$ 1.997 à vista ou 12× R$ 166,42. Perpétuo — entra hoje, primeira mentoria na próxima
              data do calendário. Bora pra cima.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link href="#checkout" className="btn-primary">
                Entrar no VSS agora →
              </Link>
              <Link href="/diagnostico" className="btn-secondary">
                Diagnóstico 6Ps grátis
              </Link>
            </div>
            <p className="mono text-fg-muted mt-8">
              ★ SISTEMA &gt; IMPROVISO · SEMPRE ABERTO · EST. 2008
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
