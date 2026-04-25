import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/patterns/container';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';

export const metadata: Metadata = {
  title: 'Jornada de 90 Dias — VSS | Joel Burigo',
  description:
    'Do caos à previsibilidade em 13 semanas. Como funciona a jornada de 90 dias do VSS.',
  keywords: ['jornada 90 dias', 'VSS', 'framework 6Ps', 'vendas estruturadas'],
  alternates: { canonical: '/jornada-90-dias' },
};

const fases = [
  {
    semanas: '01-02',
    nome: 'FUNDAMENTOS',
    horas: '6-8h/semana',
    atividades: [
      'Diagnóstico completo dos 6Ps',
      'Define posicionamento, público, produto',
      'Cria plano de ação 90 dias',
    ],
    resultados: [
      'Clareza de onde está e pra onde vai',
      'Documentos estratégicos prontos',
      'Prioridades definidas',
      'Roadmap visual criado',
    ],
    vendas: 'Nenhuma venda esperada (fase de planejamento)',
  },
  {
    semanas: '03-04',
    nome: 'INFRAESTRUTURA',
    horas: '8-10h/semana',
    atividades: [
      'Configura Growth CRM do zero',
      'Cria site ou landing page',
      'Importa base de contatos',
      'Configura primeiras automações',
    ],
    resultados: [
      'CRM 100% operacional',
      'Presença digital no ar',
      'Sistema pronto pra capturar leads',
      'Automações básicas funcionando',
    ],
    vendas: 'Possíveis primeiras vendas se já tem base aquecida',
  },
  {
    semanas: '05-08',
    nome: 'ATRAÇÃO',
    horas: '6-10h/semana',
    atividades: [
      'ROTA A: Tráfego pago (se tem budget)',
      'ROTA B: Prospecção LinkedIn (sem budget)',
      'ROTA C: Conteúdo orgânico (todos fazem)',
      'Primeiros leads chegando',
    ],
    resultados: [
      'Rota A: 30-100 leads via tráfego',
      'Rota B: 20-50 conversas via prospecção',
      'Rota C: Primeiros seguidores e engajamento',
      'Sistema de atração funcionando',
    ],
    vendas: 'Primeiras vendas começam a acontecer',
  },
  {
    semanas: '09-10',
    nome: 'CONVERSÃO',
    horas: '5-7h/semana',
    atividades: [
      'Otimiza funis de conversão',
      'Implementa scripts testados',
      'Configura automações de nutrição',
      'Integra WhatsApp pra atendimento',
      'Documenta objeções e respostas',
    ],
    resultados: [
      'Taxa de conversão melhorando',
      'Processo de vendas documentado',
      'Follow-up automatizado ativo',
      'Tempo de resposta < 5 minutos',
    ],
    vendas: 'Fluxo de vendas mais consistente',
  },
  {
    semanas: '11-13',
    nome: 'INTEGRAÇÃO',
    horas: '4-6h/semana',
    atividades: [
      'Documenta todos os processos',
      'Analisa métricas dos 90 dias',
      'Identifica gargalos',
      'Cria plano pros próximos 90 dias',
      'Implementa melhorias',
    ],
    resultados: [
      'Sistema integrado funcionando',
      'Métricas claras (CPL, CAC, LTV, conversão)',
      'Gargalos identificados',
      'Roadmap de escala definido',
      'Processos documentados',
    ],
    vendas: 'Sistema rodando de forma previsível',
  },
];

const resultadoConsolidado = [
  {
    titulo: 'Fundação Estratégica Sólida',
    itens: [
      '6Ps definidos e documentados',
      'Posicionamento claro e diferenciado',
      'Público-alvo mapeado cirurgicamente',
      'Oferta estruturada',
    ],
  },
  {
    titulo: 'Infraestrutura Profissional',
    itens: [
      'Growth CRM configurado e operacional',
      'Site / landing pages publicados',
      'Funis de vendas ativos',
      'Automações rodando 24/7',
    ],
  },
  {
    titulo: 'Sistema de Atração Funcionando',
    itens: [
      'Tráfego pago estruturado OU',
      'Prospecção ativa consistente OU',
      'Crescimento orgânico planejado',
      'Leads chegando todo mês',
    ],
  },
  {
    titulo: 'Processo de Conversão Otimizado',
    itens: [
      'Scripts testados e ajustados',
      'Objeções mapeadas e respondidas',
      'Taxa de conversão medida',
      'Follow-up automatizado ativo',
    ],
  },
  {
    titulo: 'Sistema Validado com Vendas',
    itens: [
      'Primeiras vendas confirmadas',
      'Volume varia por nicho, ticket e ciclo',
      'O que funciona e o que não funciona',
      'Previsibilidade: quantos leads pra bater meta',
    ],
  },
  {
    titulo: 'Clareza Sobre Próximos Passos',
    itens: [
      'Métricas documentadas',
      'Pontos fortes e fracos identificados',
      'Plano de escala 90-180 dias pronto',
      'Confiança pra continuar crescendo',
    ],
  },
];

export default function Jornada90DiasPage() {
  return (
    <main className="relative overflow-hidden bg-ink">
      <div className="grid-overlay" />

      <Container className="relative z-10">
        {/* Hero */}
        <section className="pt-10 pb-16 md:pt-14 md:pb-24">
          <div className="mx-auto max-w-5xl">
            <Breadcrumbs
              items={[
                { label: 'Home', href: '/' },
                { label: 'Jornada 90 Dias', href: '/jornada-90-dias' },
              ]}
              className="mb-5"
            />
            <div className="kicker mb-6">// VSS · JORNADA · 90_DIAS · 13_SEMANAS</div>
            <h1
              className="font-display text-cream"
              style={{
                fontSize: 'clamp(2.5rem, 8vw, 5rem)',
                fontWeight: 900,
                letterSpacing: '-0.045em',
                lineHeight: '0.92',
                textTransform: 'uppercase',
                margin: 0,
              }}
            >
              Do caos à <span className="text-acid">previsibilidade.</span>
            </h1>
            <p className="mt-6 max-w-2xl font-sans text-lg text-cream">
              Em 13 semanas, teu sistema de vendas sai do aleatório e vira uma máquina com
              processo. Zero promessa vazia. Zero fórmula mágica. Método estruturado que funciona
              em quem executa.
            </p>
          </div>
        </section>

        {/* Premissa Central */}
        <section className="pb-16">
          <div className="mx-auto max-w-6xl">
            <div className="kicker mb-6">// PREMISSA_CENTRAL · O_QUE_ESPERAR</div>
            <div className="grid gap-6 md:grid-cols-2">
              <div
                className="border border-[var(--jb-acid-border)] bg-ink-2 p-8"
                style={{
                  background:
                    'linear-gradient(180deg, rgba(198,255,0,0.06), var(--jb-ink-2))',
                }}
              >
                <div className="kicker mb-3" style={{ color: 'var(--jb-acid)' }}>
                  // PROMETEMOS
                </div>
                <p className="font-sans text-lg text-cream leading-relaxed">
                  Em 90 dias você tem um{' '}
                  <strong className="text-acid">
                    sistema de vendas estruturado e funcionando
                  </strong>
                  , com primeiras vendas confirmadas e clareza de como escalar.
                </p>
              </div>
              <div className="border border-[var(--jb-fire-border)] bg-ink-2 p-8">
                <div className="kicker mb-3" style={{ color: 'var(--jb-fire)' }}>
                  // NÃO_PROMETEMOS
                </div>
                <ul className="space-y-2 font-sans text-fg-2">
                  <li>
                    <span className="text-fire">●</span>&nbsp; Enriquecimento rápido
                  </li>
                  <li>
                    <span className="text-fire">●</span>&nbsp; Sistema 100% automatizado e perfeito
                  </li>
                  <li>
                    <span className="text-fire">●</span>&nbsp; Crescimento exponencial imediato
                  </li>
                  <li>
                    <span className="text-fire">●</span>&nbsp; Fórmula mágica sem esforço
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-6 border-l-2 border-acid bg-ink-2 p-6">
              <div className="kicker mb-2" style={{ color: 'var(--jb-acid)' }}>
                // HONESTIDADE_BRUTAL
              </div>
              <p className="font-sans text-cream">
                Nos primeiros 90 dias você <strong>constrói a fundação</strong>. Dos 90 aos 180 você{' '}
                <strong>escala e otimiza</strong>. É jornada de construção, não milagre instantâneo.
              </p>
            </div>
          </div>
        </section>

        {/* Investimento de tempo */}
        <section className="pb-16">
          <div className="mx-auto max-w-6xl">
            <div className="kicker mb-6">// INVESTIMENTO_DE_TEMPO · REAL</div>
            <h2 className="heading-2 mb-8 text-cream">Quanto tempo você precisa dedicar</h2>

            <div className="overflow-x-auto border border-[var(--jb-hair)] bg-ink-2">
              <table className="w-full">
                <thead className="bg-ink border-b border-[var(--jb-hair)]">
                  <tr>
                    {['Semanas', 'Fase', 'Horas/Sem', 'Atividades'].map((h) => (
                      <th
                        key={h}
                        className="px-6 py-4 text-left font-mono text-[11px] uppercase tracking-[0.22em] text-fg-muted"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {fases.map((f, i) => (
                    <tr key={f.nome} className={i > 0 ? 'border-t border-[var(--jb-hair)]' : ''}>
                      <td className="px-6 py-4 font-mono text-sm text-cream">{f.semanas}</td>
                      <td className="px-6 py-4 font-display text-sm text-cream">{f.nome}</td>
                      <td className="px-6 py-4 font-display text-acid">{f.horas}</td>
                      <td className="px-6 py-4 font-sans text-sm text-fg-2">{f.atividades[0]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-8 grid gap-px border border-[var(--jb-hair)] bg-[var(--jb-hair)] md:grid-cols-3">
              {[
                { kicker: 'MÉDIA', num: '6-9h', label: 'por semana', acent: true },
                { kicker: 'DIÁRIO', num: '1-2h', label: 'durante a semana' },
                { kicker: 'FIM_DE_SEMANA', num: '6-9h', label: 'sábado ou domingo' },
              ].map((s) => (
                <div key={s.kicker} className="bg-ink-2 p-6">
                  <div className="kicker mb-2">// {s.kicker}</div>
                  <div className={`font-display text-3xl ${s.acent ? 'text-acid' : 'text-cream'}`}>
                    {s.num}
                  </div>
                  <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-fg-muted">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 border-l-2 border-fire bg-ink-2 p-5">
              <p className="font-sans text-cream">
                <strong>Se não tem 6-9h/semana</strong> pra investir no futuro do negócio, espera
                ter antes de entrar. <strong>Mas se tem, compensa.</strong>
              </p>
            </div>
          </div>
        </section>

        {/* As 5 Fases */}
        <section className="pb-16">
          <div className="mx-auto max-w-6xl">
            <div className="kicker mb-6">// AS_5_FASES · TIMELINE</div>
            <h2 className="heading-2 mb-10 text-cream">As 5 fases da jornada</h2>

            <div className="space-y-8">
              {fases.map((fase, idx) => (
                <article
                  key={fase.nome}
                  className="border border-[var(--jb-hair)] bg-ink-2 p-6 md:p-8 transition-all duration-[180ms] hover:border-acid hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[6px_6px_0_var(--jb-acid)]"
                >
                  <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3 border-b border-[var(--jb-hair)] pb-5">
                    <div>
                      <div className="kicker mb-1" style={{ color: 'var(--jb-acid)' }}>
                        // FASE_{String(idx + 1).padStart(2, '0')} · SEMANAS_{fase.semanas}
                      </div>
                      <h3 className="heading-2 text-cream">{fase.nome}</h3>
                    </div>
                    <div className="border border-[var(--jb-acid-border)] bg-[var(--jb-acid-soft)] px-4 py-2">
                      <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-acid">
                        {fase.horas}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-6 lg:grid-cols-2">
                    <div>
                      <div className="kicker mb-3">// O_QUE_VOCÊ_FAZ</div>
                      <ul className="space-y-2">
                        {fase.atividades.map((a) => (
                          <li
                            key={a}
                            className="flex items-start gap-3 font-sans text-sm text-fg-2"
                          >
                            <span className="mt-[3px] shrink-0 text-acid">▶</span>
                            <span>{a}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="kicker mb-3" style={{ color: 'var(--jb-acid)' }}>
                        // RESULTADO_ESPERADO
                      </div>
                      <ul className="space-y-2">
                        {fase.resultados.map((r) => (
                          <li
                            key={r}
                            className="flex items-start gap-3 font-sans text-sm text-fg-2"
                          >
                            <span className="mt-[3px] shrink-0 text-acid">●</span>
                            <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-6 border-l-2 border-fire bg-ink p-4 font-mono text-sm text-cream">
                    <span className="text-fire">●</span>&nbsp; VENDAS_NESTA_FASE: {fase.vendas}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Resultado Consolidado */}
        <section className="pb-16">
          <div className="mx-auto max-w-6xl">
            <div className="kicker mb-6">// AO_FINAL_DOS_90_DIAS</div>
            <h2 className="heading-2 mb-10 text-cream">O que você vai ter construído</h2>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {resultadoConsolidado.map((item) => (
                <div key={item.titulo} className="card">
                  <h3 className="heading-4 mb-4 text-cream">{item.titulo}</h3>
                  <ul className="space-y-2">
                    {item.itens.map((sub) => (
                      <li key={sub} className="flex items-start gap-3 font-sans text-sm text-fg-2">
                        <span className="mt-[3px] shrink-0 text-acid">▶</span>
                        <span>{sub}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div
              className="mt-10 border border-[var(--jb-acid-border)] bg-ink-2 p-8"
              style={{
                background:
                  'linear-gradient(180deg, rgba(198,255,0,0.06), var(--jb-ink-2))',
              }}
            >
              <div className="kicker mb-4" style={{ color: 'var(--jb-acid)' }}>
                // O_QUE_VOCÊ_TERÁ · CONCRETAMENTE
              </div>
              <div className="mx-auto max-w-3xl space-y-4">
                {[
                  {
                    title: 'SISTEMA VALIDADO',
                    body: 'Primeiras vendas confirmadas provando que funciona.',
                  },
                  {
                    title: 'PIPELINE PREVISÍVEL',
                    body: 'Você sabe quantos leads precisa pra bater meta.',
                  },
                  {
                    title: 'AUTONOMIA',
                    body: 'Processos documentados e sistema replicável.',
                  },
                ].map((b) => (
                  <div key={b.title} className="border-l-2 border-acid bg-ink p-5">
                    <div className="font-display text-acid">{b.title}</div>
                    <p className="mt-1 font-sans text-fg-2">{b.body}</p>
                  </div>
                ))}
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-fg-muted">
                  NOTA: volume varia por nicho, ticket e ciclo. O importante é ter{' '}
                  <strong className="text-cream">sistema previsível rodando</strong>.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Próximos 90 Dias */}
        <section className="pb-16">
          <div className="mx-auto max-w-5xl">
            <div className="border border-[var(--jb-fire-border)] bg-ink-2 p-8 md:p-12">
              <div className="kicker mb-4" style={{ color: 'var(--jb-fire)' }}>
                // APÓS_OS_90_DIAS · ESCALA
              </div>
              <h2 className="heading-2 mb-6 text-cream">E depois dos 90 dias?</h2>
              <p className="mb-6 font-sans text-fg-2">
                O programa continua pra você evoluir e otimizar o sistema. Acesso vitalício ao
                conteúdo.
              </p>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                {[
                  'Automação avançada',
                  'Múltiplos canais',
                  'Estruturação de time',
                  'Otimização com dados',
                ].map((item) => (
                  <div key={item} className="border border-[var(--jb-hair)] bg-ink p-4">
                    <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-acid">
                      ▶ {item}
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-6 font-display text-xl text-acid">
                RESULTADO: escala e crescimento acelerado.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="pb-16 md:pb-24">
          <div className="mx-auto max-w-5xl">
            <div
              className="border border-[var(--jb-acid-border)] bg-ink-2 p-8 md:p-12"
              style={{
                background:
                  'linear-gradient(180deg, rgba(198,255,0,0.06), var(--jb-ink-2))',
              }}
            >
              <div className="kicker mb-4" style={{ color: 'var(--jb-acid)' }}>
                // PRONTO_PRA_COMEÇAR?
              </div>
              <h2 className="heading-2 mb-4 text-cream">
                Agora você sabe o que acontece. Sem surpresa, sem promessa vazia.
              </h2>
              <p className="mb-8 font-sans text-fg-2">
                Apenas trabalho estruturado que gera resultado em quem executa.
              </p>

              <div className="mb-8 grid gap-px border border-[var(--jb-hair)] bg-[var(--jb-hair)] md:grid-cols-3">
                {[
                  { num: '15 MÓDULOS', sub: '66 aulas práticas' },
                  { num: '48 MENTORIAS', sub: 'semanais em grupo' },
                  { num: 'CRM INCLUSO', sub: '12 meses grátis' },
                ].map((b) => (
                  <div key={b.num} className="bg-ink p-5">
                    <div className="font-display text-2xl text-acid">{b.num}</div>
                    <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-fg-muted">
                      {b.sub}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-4">
                <Link href="/vendas-sem-segredos" className="btn-primary min-h-[48px]" prefetch>
                  <span>Começar minha jornada</span>
                  <span aria-hidden="true">→</span>
                </Link>
                <Link href="/diagnostico" className="btn-secondary min-h-[48px]">
                  Diagnóstico grátis
                </Link>
              </div>

              <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.22em] text-fg-muted">
                <span className="text-acid">●</span>&nbsp; 15 DIAS DE GARANTIA · ACESSO VITALÍCIO ·
                12× R$ 166,42
              </p>

              <div className="mt-8 border-t border-[var(--jb-hair)] pt-6 font-mono text-[11px] uppercase tracking-[0.28em] text-fg-muted">
                <span className="text-acid">★</span>&nbsp;&nbsp;SISTEMA{' '}
                <span className="text-fire">&gt;</span> IMPROVISO · LET&apos;S GROW
              </div>
            </div>
          </div>
        </section>
      </Container>
    </main>
  );
}
