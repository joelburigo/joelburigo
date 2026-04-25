import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/patterns/container';
import { BookingWidget } from '@/components/features/advisory/booking-widget';

export const metadata: Metadata = {
  title: 'Agendar Sessão Estratégica — Advisory | Joel Burigo',
  description:
    'Sessão estratégica 1:1 de 90 min. Diagnóstico 6Ps + plano de ação com 3-5 prioridades. R$ 997.',
  keywords: ['sessão estratégica', 'advisory', 'Joel Burigo', 'agendamento'],
  robots: { index: false, follow: false },
};

const incluido = [
  '90 minutos de consultoria ao vivo 1:1',
  'Análise profunda do desafio atual',
  'Diagnóstico rápido dos 6Ps',
  'Plano de ação (3-5 ações prioritárias)',
  'Gravação da sessão',
  'Relatório executivo 2–3 páginas',
];

export default function AgendamentoSessaoPage() {
  return (
    <main className="relative overflow-hidden bg-ink pt-20">
      <div className="grid-overlay" />

      <Container className="relative z-10">
        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-5xl">
            <div className="mb-12">
              <div className="kicker mb-6">// ADVISORY · SESSÃO · 90_MIN · R$ 997</div>
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
                Agendar <span className="text-acid">Sessão.</span>
              </h1>
              <p className="mt-6 max-w-2xl font-sans text-lg text-cream">
                Escolhe o melhor horário pra tua sessão estratégica de 90 minutos. Máximo 4
                sessões/mês na agenda.
              </p>
            </div>

            <div className="mb-10 grid gap-6 md:grid-cols-3">
              <div className="card">
                <div className="kicker mb-3">// DURAÇÃO</div>
                <div className="font-display text-3xl text-cream">90 min</div>
              </div>
              <div className="card">
                <div className="kicker mb-3">// DISPONIBILIDADE</div>
                <div className="font-display text-3xl text-cream">4/mês</div>
              </div>
              <div className="card" style={{ borderColor: 'var(--jb-acid-border)' }}>
                <div className="kicker mb-3" style={{ color: 'var(--jb-acid)' }}>
                  // INVESTIMENTO
                </div>
                <div className="font-display text-3xl text-acid">R$ 997</div>
              </div>
            </div>

            <div className="mb-10 border border-[var(--jb-acid-border)] bg-ink-2 p-8">
              <div className="kicker mb-4" style={{ color: 'var(--jb-acid)' }}>
                // INCLUÍDO
              </div>
              <ul className="grid gap-3 md:grid-cols-2">
                {incluido.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 font-sans text-fg-2"
                  >
                    <span className="mt-[3px] shrink-0 text-acid">▶</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border border-[var(--jb-hair)] bg-ink-2 p-4">
              <div className="kicker mb-4 px-2 pt-2">// CALENDÁRIO · ESCOLHA_HORÁRIO</div>
              <BookingWidget />
            </div>

            <div className="mt-10">
              <Link
                href="/advisory"
                className="font-mono text-[12px] uppercase tracking-[0.22em] text-fg-3 hover:text-acid"
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
