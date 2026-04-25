import { Container } from '@/components/patterns/container';
import { Breadcrumbs, type BreadcrumbItem } from '@/components/seo/breadcrumbs';
import { HighLevelForm } from '@/components/ui/highlevel-form';

interface DiagnosticoPageProps {
  breadcrumbItems?: BreadcrumbItem[];
}

export function DiagnosticoPage({ breadcrumbItems }: DiagnosticoPageProps) {
  return (
    <section className="relative min-h-screen overflow-hidden bg-ink pb-20 pt-32">
      <div className="grid-overlay" />

      <Container size="md">
        {breadcrumbItems && <Breadcrumbs items={breadcrumbItems} className="mb-5" />}

        {/* Status bar */}
        <div className="mb-10 border border-white/10 bg-ink-2">
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-6">
            <div className="flex items-center gap-3">
              <span className="dot-live" />
              <span className="mono text-acid">SYS ONLINE · DIAGNÓSTICO 6PS</span>
            </div>
            <div className="mono text-fg-muted">10 MIN · GRÁTIS · SEM ENROLAÇÃO</div>
          </div>
        </div>

        {/* Hero */}
        <div className="mb-12">
          <div className="kicker mb-4">// DIAGNÓSTICO · 24 PERGUNTAS · 6 PILARES</div>
          <h1
            className="mb-6 font-display text-cream"
            style={{
              fontSize: 'clamp(2.25rem, 6vw, 4.5rem)',
              lineHeight: '0.9',
              letterSpacing: '-0.045em',
              textTransform: 'uppercase',
            }}
          >
            Tua empresa é <span className="text-fire">empresa</span>
            <br />
            ou é <span className="stroke-text">emprego</span>?
          </h1>
          <p
            className="mb-6 font-sans"
            style={{
              fontSize: 'clamp(1.05rem, 2vw, 1.25rem)',
              lineHeight: '1.5',
              color: 'rgba(245, 241, 232, 0.85)',
            }}
          >
            Diagnóstico baseado numa prática aplicada em{' '}
            <strong className="text-cream">140+ empresas</strong> em{' '}
            <strong className="text-cream">17+ anos</strong>. 24 perguntas, raio-x dos{' '}
            <span className="text-acid">6Ps das Vendas Escaláveis</span>, score de 0–30 — identifica
            em minutos qual P está travando a Máquina.
          </p>

          {/* Bloco de honestidade */}
          <div className="mb-8 border-l-4 border-fire bg-fire/5 p-5">
            <div className="mono mb-2 text-fire">// na moral</div>
            <p
              className="font-sans text-cream"
              style={{ fontSize: '1rem', lineHeight: '1.55' }}
            >
              Não é teste de certo ou errado. É{' '}
              <strong className="text-cream">radiografia real</strong> do que impede tua empresa de
              escalar. <strong className="text-cream">Responde com sinceridade</strong> — maquiar
              diagnóstico é improvisar cura. E improviso mata mais empresa que crise.
            </p>
          </div>

          {/* Prova social em tira */}
          <div className="grid gap-3 border border-white/10 bg-ink-2 md:grid-cols-3">
            <div className="p-5" style={{ borderRight: '1px solid var(--jb-hair)' }}>
              <div
                className="font-display text-acid"
                style={{ fontSize: '2rem', lineHeight: '1', letterSpacing: '-0.035em' }}
              >
                140+
              </div>
              <div className="mono mt-2 text-fg-muted">clientes atendidos</div>
            </div>
            <div className="p-5" style={{ borderRight: '1px solid var(--jb-hair)' }}>
              <div
                className="font-display text-acid"
                style={{ fontSize: '2rem', lineHeight: '1', letterSpacing: '-0.035em' }}
              >
                17+
              </div>
              <div className="mono mt-2 text-fg-muted">anos de experiência</div>
            </div>
            <div className="p-5">
              <div
                className="font-display text-acid"
                style={{ fontSize: '2rem', lineHeight: '1', letterSpacing: '-0.035em' }}
              >
                ~R$ 1BI
              </div>
              <div className="mono mt-2 text-fg-muted">em vendas estruturadas</div>
            </div>
          </div>
        </div>

        {/* Form wrapper terminal */}
        <div className="border border-white/10 bg-ink-2">
          <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
            <span className="inline-block h-3 w-3 bg-fire" />
            <span className="inline-block h-3 w-3" style={{ background: '#FFB020' }} />
            <span className="inline-block h-3 w-3 bg-acid" />
            <span className="mono ml-3 text-fg-muted">&gt; diagnostico_6ps.run</span>
          </div>
          <div className="p-4 md:p-6">
            <HighLevelForm formId="LiMgJuffsmbXgFNyyil9" height="1726px" />
          </div>
        </div>

        {/* Rodapé manifesto */}
        <div className="mt-10 text-center">
          <p className="mono text-fg-muted">
            ★ SISTEMA &gt; IMPROVISO · @joelburigo · FLORIANÓPOLIS/SC
          </p>
        </div>
      </Container>
    </section>
  );
}
