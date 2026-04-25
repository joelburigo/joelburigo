import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/patterns/container';
import { HighLevelForm } from '@/components/ui/highlevel-form';

export const metadata: Metadata = {
  title: 'Aplicar pra Advisory — Sprint + Conselho | Joel Burigo',
  description:
    'Análise de fit pra Sprint Estratégico 30 Dias ou Conselho Executivo. Vagas limitadas.',
  keywords: ['advisory', 'sprint estratégico', 'conselho executivo', 'consultoria', 'Joel Burigo'],
  robots: { index: false, follow: false },
};

const steps = [
  {
    n: '01',
    title: 'Você aplica',
    body: 'Preenche o formulário detalhando desafio e momento atual.',
  },
  {
    n: '02',
    title: 'Análise de fit',
    body: 'Analiso pessoalmente se faz sentido — sem fila, sem intermediários.',
  },
  {
    n: '03',
    title: 'Conversa inicial',
    body: 'Se houver fit, agendamos 30 min pra alinhar expectativa.',
  },
];

export default function AdvisoryAplicacaoPage() {
  return (
    <main className="bg-ink relative overflow-hidden pt-20">
      <div className="grid-overlay" />

      <Container className="relative z-10">
        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-5xl">
            <div className="mb-12">
              <div className="kicker mb-6">// ADVISORY · APLICAÇÃO · ANÁLISE_DE_FIT</div>
              <h1
                className="font-display text-cream"
                style={{
                  fontSize: 'clamp(2.5rem, 7vw, 4.5rem)',
                  fontWeight: 900,
                  letterSpacing: '-0.045em',
                  lineHeight: '0.92',
                  textTransform: 'uppercase',
                  margin: 0,
                }}
              >
                Aplicar pra <span className="text-acid">Advisory.</span>
              </h1>
              <p className="text-cream mt-6 max-w-2xl font-sans text-lg">
                Preenche o formulário detalhando teu momento. Analiso pessoalmente ·{' '}
                <strong className="text-acid">resposta direta do Joel</strong>, sem fila.
              </p>
            </div>

            <div className="mb-10 grid gap-6 md:grid-cols-2">
              <div className="card" style={{ borderColor: 'var(--jb-acid-border)' }}>
                <div className="kicker mb-3" style={{ color: 'var(--jb-acid)' }}>
                  // SPRINT · 30_DIAS
                </div>
                <h3 className="heading-3 text-cream mb-4">Sprint Estratégico 30 Dias</h3>
                <ul className="text-fg-2 space-y-2 font-mono text-[13px]">
                  <li>
                    <span className="text-acid">▶</span> 30 dias intensivos
                  </li>
                  <li>
                    <span className="text-acid">▶</span> 4 sessões de 90 min
                  </li>
                  <li>
                    <span className="text-acid">▶</span> Plano estratégico 12 meses
                  </li>
                  <li>
                    <span className="text-acid">▶</span> R$ 7.500
                  </li>
                </ul>
                <p className="text-fg-2 mt-4 font-sans">
                  Pra momentos de virada que exigem plano estruturado em 30 dias.
                </p>
              </div>

              <div className="card" style={{ borderColor: 'var(--jb-fire-border)' }}>
                <div className="kicker mb-3" style={{ color: 'var(--jb-fire)' }}>
                  // CONSELHO · EXECUTIVO
                </div>
                <h3 className="heading-3 text-cream mb-4">Conselho Executivo</h3>
                <ul className="text-fg-2 space-y-2 font-mono text-[13px]">
                  <li>
                    <span className="text-fire">●</span> 3-6 meses
                  </li>
                  <li>
                    <span className="text-fire">●</span> 8 sessões/mês
                  </li>
                  <li>
                    <span className="text-fire">●</span> WhatsApp direto
                  </li>
                  <li>
                    <span className="text-fire">●</span> R$ 15.000/mês
                  </li>
                </ul>
                <p className="text-fg-2 mt-4 font-sans">
                  Pra empresas que precisam de conselheiro presente e acompanhamento contínuo.
                </p>
              </div>
            </div>

            <div className="bg-ink-2 mb-10 border border-[var(--jb-hair)] p-8">
              <div className="kicker mb-6">// COMO_FUNCIONA</div>
              <div className="grid gap-6 md:grid-cols-3">
                {steps.map((step) => (
                  <div key={step.n}>
                    <div
                      className="text-acid mb-3 font-mono text-sm font-bold"
                      style={{ letterSpacing: '0.1em' }}
                    >
                      {step.n}
                    </div>
                    <h3 className="heading-4 text-cream mb-2">{step.title}</h3>
                    <p className="text-fg-2 font-sans text-sm">{step.body}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-ink-2 mb-10 border border-[var(--jb-acid-border)] p-4 sm:p-6">
              <div className="kicker mb-4" style={{ color: 'var(--jb-acid)' }}>
                // FORMULÁRIO · APLICAÇÃO
              </div>
              <HighLevelForm formId="GwMlk5A2LFPxqbNJC1j2" height="2042px" />
            </div>

            <div className="border-fire bg-ink-2 border-l-2 p-6">
              <div className="kicker mb-2" style={{ color: 'var(--jb-fire)' }}>
                // VAGAS · EXTREMAMENTE_LIMITADAS
              </div>
              <p className="text-cream font-sans">
                Vagas limitadas conforme capacidade do momento — tanto no Sprint quanto no Conselho
                Executivo. Só aceito quem tá em momento crítico real e vai executar.
              </p>
            </div>

            <div className="mt-10">
              <Link
                href="/advisory"
                className="text-fg-3 hover:text-acid font-mono text-[12px] tracking-[0.22em] uppercase"
              >
                ← Voltar pra Advisory
              </Link>
            </div>
          </div>
        </section>
      </Container>
    </main>
  );
}
