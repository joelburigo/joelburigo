import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/patterns/container';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { CasesGrid } from '@/components/features/cases/cases-grid';

export const metadata: Metadata = {
  title: 'Cases | Joel Burigo',
  description:
    'Resultados reais de clientes que estruturaram vendas com a base que virou os 6Ps.',
  keywords: ['cases sucesso', 'resultados clientes', 'framework 6Ps', 'Joel Burigo'],
  alternates: { canonical: '/cases' },
};

export default function CasesPage() {
  return (
    <main className="relative overflow-hidden bg-ink">
      <div className="grid-overlay" />

      <Container className="relative z-10">
        <section className="pt-10 pb-16 md:pt-14 md:pb-24">
          <div className="mx-auto max-w-5xl">
            <Breadcrumbs
              items={[
                { label: 'Home', href: '/' },
                { label: 'Cases', href: '/cases' },
              ]}
              className="mb-5"
            />
            <div className="kicker mb-6">// CASES · RESULTADOS_REAIS · 140+_MPES</div>
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
              Resultados <span className="text-acid">reais.</span>
            </h1>
            <p className="mt-6 max-w-2xl font-sans text-lg text-cream">
              Alguns dos clientes que implementaram os 6Ps e transformaram vendas aleatórias em
              previsíveis.
            </p>
            <p className="mt-3 max-w-2xl font-mono text-[11px] uppercase tracking-[0.22em] text-fg-muted">
              <span className="text-fire">●</span>&nbsp; DISCLAIMER · RESULTADOS VARIAM POR NICHO,
              TICKET E EXECUÇÃO · MÉTODO &gt; MILAGRE
            </p>
          </div>
        </section>

        <section className="pb-16">
          <div className="mx-auto max-w-5xl">
            <div className="grid gap-px border border-[var(--jb-hair)] bg-[var(--jb-hair)] md:grid-cols-4">
              {[
                { kicker: 'EXPERIÊNCIA', num: '17+', label: 'anos' },
                { kicker: 'CLIENTES', num: '140+', label: 'atendidos' },
                { kicker: 'VOLUME', num: '~R$1BI', label: 'estruturado' },
                { kicker: 'NICHOS', num: '20+', label: 'validados' },
              ].map((s) => (
                <div key={s.kicker} className="bg-ink-2 p-6">
                  <div className="kicker mb-2">// {s.kicker}</div>
                  <div className="font-display text-3xl text-acid">{s.num}</div>
                  <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-fg-muted">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <CasesGrid />

        {/* CTA final */}
        <section className="pb-16 md:pb-24">
          <div className="mx-auto max-w-4xl">
            <div
              className="border border-[var(--jb-acid-border)] bg-ink-2 p-8 md:p-12"
              style={{
                background: 'linear-gradient(180deg, rgba(198,255,0,0.06), var(--jb-ink-2))',
              }}
            >
              <div className="kicker mb-4" style={{ color: 'var(--jb-acid)' }}>
                // QUER_RESULTADO_SIMILAR?
              </div>
              <h2 className="heading-2 mb-4 text-cream">
                Escolhe o caminho que faz sentido pro teu momento.
              </h2>
              <p className="mb-8 font-sans text-fg-2">
                VSS (DIY perpétuo) pra quem quer autonomia. Advisory (1:1) pra quem precisa de
                conselheiro presente.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/vendas-sem-segredos" className="btn-primary min-h-[48px]">
                  <span>Conhecer VSS</span>
                  <span aria-hidden="true">→</span>
                </Link>
                <Link href="/advisory" className="btn-fire min-h-[48px]">
                  <span>Aplicar pra Advisory</span>
                  <span aria-hidden="true">→</span>
                </Link>
                <Link href="/contato" className="btn-secondary min-h-[48px]">
                  Falar comigo
                </Link>
              </div>
              <div className="mt-8 border-t border-[var(--jb-hair)] pt-6 font-mono text-[11px] uppercase tracking-[0.28em] text-fg-muted">
                <span className="text-acid">★</span>&nbsp;&nbsp;SISTEMA{' '}
                <span className="text-fire">&gt;</span> IMPROVISO
              </div>
            </div>
          </div>
        </section>
      </Container>
    </main>
  );
}
