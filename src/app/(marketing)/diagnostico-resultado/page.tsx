import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { DiagnosticoResultado } from '@/components/features/diagnostico/resultado';

export const metadata: Metadata = {
  title: 'Resultado do Diagnóstico 6Ps | Joel Burigo',
  description:
    'Veja o resultado detalhado do seu diagnóstico de vendas baseado no framework dos 6Ps.',
  keywords: ['diagnóstico vendas', 'resultado 6Ps', 'análise vendas'],
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default function DiagnosticoResultadoPage() {
  return (
    <main className="relative overflow-hidden bg-ink pt-20">
      <div className="grid-overlay" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-20 pt-12 md:pt-16">
        {/* Header */}
        <div className="mb-12">
          <div className="kicker mb-4">// DIAGNÓSTICO · COMPLETO · RAIO_X</div>
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
            Teu <span className="text-acid">raio-X</span> de vendas.
          </h1>
          <p className="mt-6 max-w-2xl font-sans text-lg text-cream">
            Baseado nas tuas respostas, identifiquei exatamente onde estão os gargalos. Agora é
            arrumar — sem enrolação.
          </p>
        </div>

        {/* Hierarquia */}
        <div className="mb-10 border border-[var(--jb-hair)] bg-ink-2 p-6 md:p-8">
          <div className="kicker mb-4" style={{ color: 'var(--jb-fire)' }}>
            // HIERARQUIA_DOS_6PS · OBRIGATÓRIO_LER
          </div>
          <h3 className="heading-3 mb-6 text-cream">
            Ordem importa. Estratégicos primeiro, sempre.
          </h3>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="border-l-2 border-acid bg-ink p-4">
              <div className="kicker mb-2" style={{ color: 'var(--jb-acid)' }}>
                // ESTRATÉGICOS · PESO_MAIOR
              </div>
              <p className="mb-2 font-display text-sm text-cream">
                P1 POSICIONAMENTO → P2 PÚBLICO → P3 PRODUTO
              </p>
              <p className="font-sans text-sm text-fg-2">
                Definem QUEM você é, pra QUEM vende e O QUÊ oferece. Se estes estão fracos, nada
                mais funciona.
              </p>
            </div>
            <div className="border-l-2 border-fg-3 bg-ink p-4">
              <div className="kicker mb-2">// TÁTICOS · OPERACIONAIS</div>
              <p className="mb-2 font-display text-sm text-cream">
                P4 PROGRAMAS → P5 PROCESSOS → P6 PESSOAS
              </p>
              <p className="font-sans text-sm text-fg-2">
                Definem COMO vende, opera e executa. Só fazem sentido se os estratégicos estão
                sólidos.
              </p>
            </div>
          </div>
          <div className="mt-4 border-t border-[var(--jb-hair)] pt-4">
            <p className="font-mono text-sm text-fg-2">
              <span className="text-fire">●</span>&nbsp;{' '}
              <strong className="text-acid">REGRA DE OURO:</strong> não adianta ter processo
              perfeito com posicionamento fraco. Arruma os estratégicos primeiro.
            </p>
          </div>
        </div>

        <Suspense
          fallback={
            <div className="font-mono text-fg-muted">// Carregando resultado...</div>
          }
        >
          <DiagnosticoResultado />
        </Suspense>

        {/* CTAs */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div
            className="border border-[var(--jb-acid-border)] bg-ink-2 p-8 lg:col-span-2"
            style={{
              background: 'linear-gradient(180deg, rgba(198,255,0,0.06), var(--jb-ink-2))',
            }}
          >
            <div className="kicker mb-4" style={{ color: 'var(--jb-acid)' }}>
              // RECOMENDADO · VSS
            </div>
            <h3 className="heading-2 mb-4 text-cream">
              Transforma o diagnóstico em resultado.
            </h3>
            <p className="mb-6 font-sans text-fg-2">
              Aprende o framework 6Ps completo e implementa na tua empresa com a mesma base
              aplicada em <strong className="text-cream">140+ MPEs</strong>.
            </p>
            <ul className="mb-6 grid gap-2 sm:grid-cols-2 font-sans text-sm text-fg-2">
              <li>
                <span className="text-acid">▶</span> Framework 6Ps completo
              </li>
              <li>
                <span className="text-acid">▶</span> 15 módulos, 66 aulas
              </li>
              <li>
                <span className="text-acid">▶</span> 48 mentorias ao vivo
              </li>
              <li>
                <span className="text-acid">▶</span> Growth CRM incluso (12 meses)
              </li>
            </ul>
            <Link href="/vendas-sem-segredos" className="btn-primary min-h-[48px]" prefetch>
              <span>Conhecer VSS</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          <div className="card">
            <div className="kicker mb-3" style={{ color: 'var(--jb-fire)' }}>
              // ALTERNATIVA · ADVISORY
            </div>
            <h3 className="heading-3 mb-3 text-cream">Quer acesso 1:1 comigo?</h3>
            <p className="mb-6 font-sans text-fg-2">
              Momento crítico que pede conselheiro presente? Advisory é o caminho.
            </p>
            <Link href="/advisory" className="btn-fire min-h-[44px]">
              <span>Conhecer Advisory</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        <div className="mt-12 border-t border-[var(--jb-hair)] pt-8 font-mono text-[11px] uppercase tracking-[0.28em] text-fg-muted">
          <span className="text-acid">★</span>&nbsp;&nbsp;SISTEMA{' '}
          <span className="text-fire">&gt;</span> IMPROVISO · 6PS_DIAGNOSTIC_ENGINE
        </div>
      </div>
    </main>
  );
}
