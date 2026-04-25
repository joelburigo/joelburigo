import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Container } from '@/components/patterns/container';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { JornadaTimeline } from '@/components/sections/jornada-timeline';
import { LicoesDosPps } from '@/components/sections/licoes-dos-pps';
import { VerdadesDuras } from '@/components/sections/verdades-duras';

export const metadata: Metadata = {
  title: 'Sobre | Joel Burigo',
  description:
    'De barraco em 2012 a 140+ clientes. Da quebrada ao bilhão. Manifesto + história + 6Ps formalizados em 2025.',
  keywords: [
    'Joel Burigo',
    'história',
    'Framework 6Ps',
    'vendas escaláveis',
    'consultor vendas',
  ],
  alternates: { canonical: '/sobre' },
};

const ps6 = [
  { n: 'P1', nome: 'POSICIONAMENTO' },
  { n: 'P2', nome: 'PÚBLICO' },
  { n: 'P3', nome: 'PRODUTO' },
  { n: 'P4', nome: 'PROGRAMAS' },
  { n: 'P5', nome: 'PROCESSOS' },
  { n: 'P6', nome: 'PESSOAS' },
];

const inimigos = [
  {
    n: '01',
    titulo: 'IMPROVISO',
    descricao:
      'Vendas aleatórias, sem processo, dependendo de sorte ou da agenda do dia.',
  },
  {
    n: '02',
    titulo: 'FÓRMULA MÁGICA',
    descricao: 'Promessa de atalho. "Passo a passo fácil". Não há fórmula. Há método.',
  },
  {
    n: '03',
    titulo: 'MARKETING SEM VENDAS',
    descricao:
      'Post bonito no Instagram não paga boleto. Marketing sem vendas é hobby caro.',
  },
  {
    n: '04',
    titulo: 'DEPENDÊNCIA DO FUNDADOR',
    descricao: 'Se tua empresa depende de ti, tu não tem empresa — tu tem emprego.',
  },
  {
    n: '05',
    titulo: 'CRM VAZIO',
    descricao:
      'Ferramenta no lugar errado, processo no lugar nenhum. Leads entram e somem.',
  },
  {
    n: '06',
    titulo: 'TÁTICA SEM SISTEMA',
    descricao:
      'Anúncio sem funil, funil sem script, script sem follow-up. Peça solta não escala.',
  },
  {
    n: '07',
    titulo: 'MOTIVACIONAL VAZIO',
    descricao:
      '"Você consegue!". Fica o discurso, some a execução. Sem sistema, motivação é placebo.',
  },
];

const personalidade = [
  {
    carac: 'DIRETO',
    significa: 'Fala a verdade sem enrolação.',
    exemplo: 'Não há fórmula mágica. Há método.',
  },
  {
    carac: 'PARCEIRO',
    significa: 'Implementa junto, não ensina de cima pra baixo.',
    exemplo: 'Vem comigo. Mostro exatamente como faço.',
  },
  {
    carac: 'INTENSO',
    significa: 'Energia alta, comprometido com resultado real.',
    exemplo: 'Quando eu entro, eu entro pra valer.',
  },
  {
    carac: 'TRANSPARENTE',
    significa: 'Conta fracassos, não só vitórias.',
    exemplo: 'Quebrei aos 25. Morei em barraco. Sei como é.',
  },
  {
    carac: 'SISTEMÁTICO',
    significa: 'Foco em sistema replicável, não tática isolada.',
    exemplo: 'Sistema > Improviso. Base de tudo.',
  },
  {
    carac: 'ACESSÍVEL',
    significa: 'Metodologia profissional ao alcance de MPE.',
    exemplo: 'Ferramentas e método ao alcance de quem vem de baixo.',
  },
];

const stats = [
  { num: '17+', label: 'Anos' },
  { num: '140+', label: 'Clientes' },
  { num: '~R$1BI', label: 'Estruturado' },
  { num: '20+', label: 'Nichos' },
];

const cicatrizes = [
  'Quebrou empresa aos 25 anos em março/2012 (calote de sócio)',
  'Morou 6 meses em barraco de R$ 300 sem geladeira em Ribeirão das Neves/MG',
  'Trabalhou nos Correios por R$ 1.400/mês enquanto reconstruía',
  'Bateu em 100+ portas com um milheiro de cartões de visita em BH',
  'Atendeu 140+ clientes ao longo de 17+ anos — sabe o que funciona e o que não funciona',
  'Reconstruiu 2×: quebra em 2012 e perda de ~R$ 250k em 2019 (Growth Master/OnSell)',
];

export default function SobrePage() {
  return (
    <main className="relative overflow-hidden bg-ink">
      <div className="grid-overlay" />

      <Container className="relative z-10">
        {/* Hero */}
        <section className="pt-10 pb-16 md:pt-14 md:pb-24">
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'Sobre', href: '/sobre' },
            ]}
            className="mb-6"
          />
          <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:items-center">
            <div>
              <div className="kicker mb-6">
                // JOEL_BURIGO · 1987-PRESENTE · RIBEIRÃO_DA_ILHA/SC
              </div>
              <h1
                className="font-display text-cream"
                style={{
                  fontSize: 'clamp(2.75rem, 9vw, 6rem)',
                  fontWeight: 900,
                  letterSpacing: '-0.045em',
                  lineHeight: '0.92',
                  textTransform: 'uppercase',
                  margin: 0,
                }}
              >
                <span className="block">Da quebrada</span>
                <span className="block">
                  <span className="stroke-text">ao</span>{' '}
                  <span className="text-acid">bilhão.</span>
                </span>
              </h1>
              <p
                className="mt-8 max-w-[56ch] font-sans text-xl text-cream"
                style={{ lineHeight: '1.55' }}
              >
                Março/2012. Barraco de R$ 300 em Ribeirão das Neves/MG. Sem geladeira. Cama em
                tijolos.
              </p>
              <p
                className="mt-5 max-w-[62ch] font-sans"
                style={{ lineHeight: '1.65', color: 'var(--jb-fg-2)' }}
              >
                25 anos, calote do próprio sócio, primeira empresa quebrada. Nos Correios por R$
                1.400/mês colocando encomenda na esteira. Seis meses ali. Juntei cada centavo,
                comprei um milheiro de cartão de visita e bati em 100+ portas subindo a Afonso Pena
                em BH.
              </p>
              <p
                className="mt-4 max-w-[62ch] font-sans"
                style={{ lineHeight: '1.65', color: 'var(--jb-fg-2)' }}
              >
                Hoje, 17+ anos depois, cicatriz virou a base dos 6Ps, aplicada em{' '}
                <strong className="text-cream">140+ empresas</strong> e{' '}
                <strong className="text-cream">~R$ 1 bilhão</strong> em vendas estruturadas.
              </p>
              <p className="mt-6 max-w-xl font-mono text-[13px] uppercase tracking-[0.22em] text-fg-3">
                <span className="text-acid">●</span>&nbsp; NASCIDO 1987 · PALHOÇA/SC ·
                JARDIM_ELDORADO
              </p>
            </div>

            <aside>
              <div className="border border-[var(--jb-acid-border)] bg-ink-2 overflow-hidden">
                <Image
                  src="/images/joel-burigo-vendas-sem-segredos-2-1200w.webp"
                  alt="Joel Burigo — especialista em Vendas Escaláveis"
                  width={1200}
                  height={1500}
                  loading="lazy"
                  className="w-full h-auto"
                  style={{ filter: 'grayscale(100%) contrast(1.1)' }}
                />
                <div className="p-6 border-t border-[var(--jb-hair)]">
                  <div className="kicker mb-3" style={{ color: 'var(--jb-acid)' }}>
                    // JOEL_BURIGO
                  </div>
                  <p
                    className="font-display text-lg text-cream"
                    style={{ lineHeight: '1.1' }}
                  >
                    Vendas Escaláveis · Framework 6Ps
                  </p>
                </div>
              </div>
            </aside>
          </div>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-2 gap-px border border-[var(--jb-hair)] bg-[var(--jb-hair)] md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="bg-ink p-6">
                <div className="font-display text-3xl md:text-4xl text-acid">{s.num}</div>
                <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-fg-muted">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Manifesto */}
        <section className="pb-16">
          <div className="border border-[var(--jb-fire-border)] bg-ink-2 p-8 md:p-12">
            <div className="kicker mb-6" style={{ color: 'var(--jb-fire)' }}>
              // MANIFESTO · DA_QUEBRADA_AO_BILHÃO
            </div>
            <div
              className="space-y-5 max-w-[62ch] font-sans text-lg text-cream"
              style={{ lineHeight: '1.6' }}
            >
              <p>
                Eu acredito em <strong>sistema &gt; improviso</strong>.
              </p>
              <p>
                Acredito que <em>marketing sem vendas é hobby caro</em> — e que{' '}
                <em>post bonito no Instagram não paga boleto</em>.
              </p>
              <p>
                Acredito que <strong>improviso mata mais empresa que crise</strong> e que quem
                constrói sistema replicável vence no longo prazo.
              </p>
              <p>
                Acredito que metodologia profissional deveria estar ao alcance de quem vem de baixo
                — não trancada em consultoria de R$ 50-100k.
              </p>
            </div>
            <p
              className="mt-8 border-t border-[var(--jb-fire-border)] pt-6 font-display text-2xl md:text-3xl text-acid"
              style={{ lineHeight: '1.05' }}
            >
              &ldquo;SE TUA EMPRESA DEPENDE DE TU, TU NÃO TEM EMPRESA — TU TEM EMPREGO.&rdquo;
            </p>
          </div>
        </section>
      </Container>

      <JornadaTimeline />

      <Container className="relative z-10">
        {/* Cicatrizes */}
        <section className="py-16">
          <div className="mx-auto max-w-5xl">
            <div className="kicker mb-6">// CICATRIZES · QUE_VIRARAM_SABEDORIA</div>
            <h2
              className="heading-2 mb-8 max-w-[30ch] text-cream"
              style={{ lineHeight: '1.15' }}
            >
              Cada falha ensinou algo que nenhum MBA ensina.
            </h2>
            <ul className="space-y-0 border border-[var(--jb-hair)] bg-ink-2">
              {cicatrizes.map((c, i) => (
                <li
                  key={c}
                  className={`flex items-start gap-5 p-6 ${i > 0 ? 'border-t border-[var(--jb-hair)]' : ''}`}
                >
                  <div
                    className="font-mono text-sm font-bold text-acid shrink-0 pt-[2px]"
                    style={{ letterSpacing: '0.1em' }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <p className="font-sans text-fg-2" style={{ lineHeight: '1.6' }}>
                    {c}
                  </p>
                </li>
              ))}
            </ul>

            <div className="mt-10 border-l-2 border-fire bg-ink-2 p-8">
              <div className="kicker mb-4" style={{ color: 'var(--jb-fire)' }}>
                // INSIGHT · O_PADRÃO_DEPOIS_DE_17_ANOS
              </div>
              <p
                className="font-display text-2xl text-cream mb-5"
                style={{ lineHeight: '1.05' }}
              >
                &ldquo;IMPROVISO MATA MAIS EMPRESA QUE CRISE.&rdquo;
              </p>
              <p
                className="max-w-[62ch] font-sans text-fg-2"
                style={{ lineHeight: '1.65' }}
              >
                A maioria das MPEs brasileiras não quebra por falta de mercado. Quebra por falta de
                sistema replicável. Marketing sozinho não converte — leads chegam mas não viram
                venda porque falta CRM, processo, follow-up, proposta padronizada.
              </p>
              <p
                className="mt-4 max-w-[62ch] font-sans text-fg-2"
                style={{ lineHeight: '1.65' }}
              >
                Foi isso que virou a base dos{' '}
                <strong className="text-cream">6Ps das Vendas Escaláveis</strong> — metodologia que
                eu formalizei em 2025 para integrar Marketing + Vendas + Operação num sistema
                único. Cada P veio de erro ou acerto real.
              </p>
            </div>
          </div>
        </section>

        {/* 6Ps quick grid */}
        <section className="pb-16">
          <div className="mx-auto max-w-6xl">
            <div className="kicker mb-6">// FRAMEWORK · 6PS_DAS_VENDAS_ESCALÁVEIS</div>
            <h2
              className="heading-2 mb-8 max-w-[36ch] text-cream"
              style={{ lineHeight: '1.15' }}
            >
              Os 6Ps são sequenciais. Pular etapa é garantia de falha.
            </h2>
            <div className="grid gap-px border border-[var(--jb-hair)] bg-[var(--jb-hair)] grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
              {ps6.map((p) => (
                <div key={p.n} className="bg-ink-2 p-5">
                  <div className="font-display text-2xl leading-none text-acid">{p.n}</div>
                  <div className="mt-3 font-mono text-[11px] uppercase tracking-[0.22em] text-cream">
                    {p.nome}
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.22em] text-fg-muted">
              <span className="text-acid">●</span>&nbsp; POSICIONAMENTO → PÚBLICO → PRODUTO →
              PROGRAMAS → PROCESSOS → PESSOAS
            </p>
          </div>
        </section>
      </Container>

      <LicoesDosPps />
      <VerdadesDuras />

      <Container className="relative z-10">
        {/* 7 Inimigos */}
        <section className="py-16">
          <div className="mx-auto max-w-5xl">
            <div className="kicker mb-6">// OS_7_INIMIGOS · DA_MÁQUINA_DE_CRESCIMENTO</div>
            <h2 className="heading-2 mb-8 text-cream" style={{ lineHeight: '1.15' }}>
              O que impede MPE de escalar.
            </h2>
            <div className="grid gap-0 border border-[var(--jb-hair)] bg-ink-2 md:grid-cols-2">
              {inimigos.map((i, idx) => {
                const classes = ['p-6'];
                if (idx % 2 === 0 && idx < inimigos.length - 1) {
                  classes.push('md:border-r md:border-[var(--jb-hair)]');
                }
                if (idx >= 2) classes.push('border-t border-[var(--jb-hair)]');
                if (idx === 1) classes.push('border-t md:border-t-0 border-[var(--jb-hair)]');
                return (
                  <article key={i.n} className={classes.join(' ')}>
                    <div className="flex items-baseline gap-3 mb-3">
                      <span
                        className="font-mono text-sm font-bold text-fire"
                        style={{ letterSpacing: '0.1em' }}
                      >
                        #{i.n}
                      </span>
                      <h3 className="heading-4 text-cream">{i.titulo}</h3>
                    </div>
                    <p
                      className="font-sans text-sm text-fg-2"
                      style={{ lineHeight: '1.65' }}
                    >
                      {i.descricao}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* Personalidade */}
        <section className="pb-16">
          <div className="mx-auto max-w-6xl">
            <div className="kicker mb-6">// COMO_EU_TRABALHO · 6_CARACTERÍSTICAS</div>
            <h2 className="heading-2 mb-8 text-cream" style={{ lineHeight: '1.15' }}>
              Como eu trabalho.
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {personalidade.map((item) => (
                <div key={item.carac} className="card">
                  <div className="kicker mb-3" style={{ color: 'var(--jb-acid)' }}>
                    // {item.carac}
                  </div>
                  <p
                    className="font-sans text-cream mb-4 font-bold"
                    style={{ lineHeight: '1.5' }}
                  >
                    {item.significa}
                  </p>
                  <p
                    className="font-mono text-sm text-fg-2 border-l-2 border-[var(--jb-hair-strong)] pl-3"
                    style={{ lineHeight: '1.55' }}
                  >
                    &ldquo;{item.exemplo}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 2 Caminhos */}
        <section className="pb-16">
          <div className="mx-auto max-w-6xl">
            <div className="kicker mb-6">// 2_CAMINHOS · PRA_TRABALHAR_COMIGO</div>
            <h2
              className="heading-2 mb-8 max-w-[36ch] text-cream"
              style={{ lineHeight: '1.15' }}
            >
              Dois caminhos. Escolhe o que faz sentido pro teu momento.
            </h2>

            <div className="grid gap-6 md:grid-cols-2">
              <article
                className="border border-[var(--jb-acid-border)] bg-ink-2 p-8"
                style={{
                  background:
                    'linear-gradient(180deg, rgba(198,255,0,0.06), var(--jb-ink-2))',
                }}
              >
                <div className="kicker mb-4" style={{ color: 'var(--jb-acid)' }}>
                  // DIY · PERPÉTUO · PRINCIPAL
                </div>
                <h3 className="heading-2 mb-3 text-cream" style={{ lineHeight: '1.05' }}>
                  VENDAS SEM SEGREDOS
                </h3>
                <div className="font-display text-3xl leading-none text-acid mb-6">R$ 1.997</div>
                <ul
                  className="space-y-2 font-sans text-sm text-fg-2"
                  style={{ lineHeight: '1.55' }}
                >
                  <li>
                    <span className="text-acid">▶</span> Pra MPE faturando R$ 10-100k/mês
                  </li>
                  <li>
                    <span className="text-acid">▶</span> 90 dias guiados + acesso vitalício
                  </li>
                  <li>
                    <span className="text-acid">▶</span> 15 módulos, 66 aulas práticas
                  </li>
                  <li>
                    <span className="text-acid">▶</span> Growth CRM incluso (12 meses)
                  </li>
                  <li>
                    <span className="text-acid">▶</span> 48 mentorias ao vivo semanais
                  </li>
                  <li>
                    <span className="text-acid">▶</span> Garantia 15 dias incondicional
                  </li>
                </ul>
                <Link href="/vendas-sem-segredos" className="btn-primary mt-8 min-h-[44px]" prefetch>
                  <span>Conhecer VSS</span>
                  <span aria-hidden="true">→</span>
                </Link>
              </article>

              <article className="border border-[var(--jb-fire-border)] bg-ink-2 p-8">
                <div className="kicker mb-4" style={{ color: 'var(--jb-fire)' }}>
                  // 1:1 · EXCLUSIVO · CONVITE
                </div>
                <h3 className="heading-2 mb-3 text-cream" style={{ lineHeight: '1.05' }}>
                  ADVISORY
                </h3>
                <div className="font-display text-3xl leading-none text-fire mb-6">
                  R$ 997-15.000/mês
                </div>
                <ul
                  className="space-y-2 font-sans text-sm text-fg-2"
                  style={{ lineHeight: '1.55' }}
                >
                  <li>
                    <span className="text-fire">●</span> Pra empresas R$ 200k+/mês
                  </li>
                  <li>
                    <span className="text-fire">●</span> Sessão (R$ 997 · 90 min)
                  </li>
                  <li>
                    <span className="text-fire">●</span> Sprint 30 dias (R$ 7.500)
                  </li>
                  <li>
                    <span className="text-fire">●</span> Conselho Executivo (R$ 15.000/mês)
                  </li>
                  <li>
                    <span className="text-fire">●</span> Vagas extremamente limitadas
                  </li>
                  <li>
                    <span className="text-fire">●</span> Acesso direto comigo
                  </li>
                </ul>
                <Link href="/advisory" className="btn-fire mt-8 min-h-[44px]" prefetch>
                  <span>Aplicar pra Advisory</span>
                  <span aria-hidden="true">→</span>
                </Link>
              </article>
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="pb-16 md:pb-24">
          <div className="mx-auto max-w-5xl">
            <div className="border border-[var(--jb-hair)] bg-ink-2 p-8 md:p-12">
              <div className="kicker mb-5">// LEGADO · DA_QUEBRADA_AO_LEGADO</div>
              <h2
                className="heading-1 mb-6 max-w-[28ch] text-cream"
                style={{ lineHeight: '1.1' }}
              >
                Meu filho Davi (10/10/2024) nunca vai saber o que é barraco sem geladeira.
              </h2>
              <p
                className="max-w-[62ch] font-sans text-lg text-fg-2 mb-5"
                style={{ lineHeight: '1.6' }}
              >
                Mas vai saber o que é dignidade do trabalho. Vai saber que sistema supera
                improviso. Vai saber que da quebrada pro bilhão tem um caminho — e esse caminho tem
                nome: <strong className="text-acid">metodologia</strong>.
              </p>
              <p
                className="max-w-[62ch] font-sans text-fg-2"
                style={{ lineHeight: '1.65' }}
              >
                Meu legado é simples: ajudar empreendedor brasileiro — especialmente quem vem de
                baixo — a estruturar vendas sem precisar passar pelo sofrimento que eu passei.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <Link href="/vendas-sem-segredos" className="btn-primary min-h-[48px]" prefetch>
                  <span>Conhecer VSS</span>
                  <span aria-hidden="true">→</span>
                </Link>
                <Link href="/diagnostico" className="btn-secondary min-h-[48px]">
                  Diagnóstico grátis
                </Link>
              </div>

              <div className="mt-10 border-t border-[var(--jb-hair)] pt-6">
                <div className="font-display text-lg text-cream" style={{ lineHeight: '1.1' }}>
                  JOEL BURIGO
                </div>
                <div className="mt-2 font-mono text-[11px] uppercase tracking-[0.22em] text-fg-muted">
                  ESPECIALISTA EM VENDAS ESCALÁVEIS · CRIADOR DOS 6PS · RIBEIRÃO DA ILHA/SC
                </div>
                <div className="mt-4 font-mono text-[11px] uppercase tracking-[0.28em] text-fg-muted">
                  <span className="text-acid">★</span>&nbsp;&nbsp;SISTEMA{' '}
                  <span className="text-fire">&gt;</span> IMPROVISO · BORA PRA CIMA · LET&apos;S
                  GROW
                </div>
              </div>
            </div>
          </div>
        </section>
      </Container>
    </main>
  );
}
