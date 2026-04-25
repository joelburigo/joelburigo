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
    <main className="bg-ink relative overflow-hidden pt-20">
      <div className="grid-overlay" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 pt-12 pb-20 md:pt-16">
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
          <p className="text-cream mt-6 max-w-2xl font-sans text-lg">
            Baseado nas tuas respostas, identifiquei exatamente onde estão os gargalos. Agora é
            arrumar — sem enrolação.
          </p>
        </div>

        {/* Hierarquia */}
        <div className="bg-ink-2 mb-10 border border-[var(--jb-hair)] p-6 md:p-8">
          <div className="kicker mb-4" style={{ color: 'var(--jb-fire)' }}>
            // HIERARQUIA_DOS_6PS · OBRIGATÓRIO_LER
          </div>
          <h3 className="heading-3 text-cream mb-6">
            Ordem importa. Estratégicos primeiro, sempre.
          </h3>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="border-acid bg-ink border-l-2 p-4">
              <div className="kicker mb-2" style={{ color: 'var(--jb-acid)' }}>
                // ESTRATÉGICOS · PESO_MAIOR
              </div>
              <p className="font-display text-cream mb-2 text-sm">
                P1 POSICIONAMENTO → P2 PÚBLICO → P3 PRODUTO
              </p>
              <p className="text-fg-2 font-sans text-sm">
                Definem QUEM você é, pra QUEM vende e O QUÊ oferece. Se estes estão fracos, nada
                mais funciona.
              </p>
            </div>
            <div className="border-fg-3 bg-ink border-l-2 p-4">
              <div className="kicker mb-2">// TÁTICOS · OPERACIONAIS</div>
              <p className="font-display text-cream mb-2 text-sm">
                P4 PROGRAMAS → P5 PROCESSOS → P6 PESSOAS
              </p>
              <p className="text-fg-2 font-sans text-sm">
                Definem COMO vende, opera e executa. Só fazem sentido se os estratégicos estão
                sólidos.
              </p>
            </div>
          </div>
          <div className="mt-4 border-t border-[var(--jb-hair)] pt-4">
            <p className="text-fg-2 font-mono text-sm">
              <span className="text-fire">●</span>&nbsp;{' '}
              <strong className="text-acid">REGRA DE OURO:</strong> não adianta ter processo
              perfeito com posicionamento fraco. Arruma os estratégicos primeiro.
            </p>
          </div>
        </div>

        <Suspense
          fallback={<div className="text-fg-muted font-mono">// Carregando resultado...</div>}
        >
          <DiagnosticoResultado />
        </Suspense>

        {/* CTAs */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div
            className="bg-ink-2 border border-[var(--jb-acid-border)] p-8 lg:col-span-2"
            style={{
              background: 'linear-gradient(180deg, rgba(198,255,0,0.06), var(--jb-ink-2))',
            }}
          >
            <div className="kicker mb-4" style={{ color: 'var(--jb-acid)' }}>
              // RECOMENDADO · VSS
            </div>
            <h3 className="heading-2 text-cream mb-4">Transforma o diagnóstico em resultado.</h3>
            <p className="text-fg-2 mb-6 font-sans">
              Aprende o framework 6Ps completo e implementa na tua empresa com a mesma base aplicada
              em <strong className="text-cream">140+ MPEs</strong>.
            </p>
            <ul className="text-fg-2 mb-6 grid gap-2 font-sans text-sm sm:grid-cols-2">
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
            <h3 className="heading-3 text-cream mb-3">Quer acesso 1:1 comigo?</h3>
            <p className="text-fg-2 mb-6 font-sans">
              Momento crítico que pede conselheiro presente? Advisory é o caminho.
            </p>
            <Link href="/advisory" className="btn-fire min-h-[44px]">
              <span>Conhecer Advisory</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        <div className="text-fg-muted mt-12 border-t border-[var(--jb-hair)] pt-8 font-mono text-[11px] tracking-[0.28em] uppercase">
          <span className="text-acid">★</span>&nbsp;&nbsp;SISTEMA{' '}
          <span className="text-fire">&gt;</span> IMPROVISO · 6PS_DIAGNOSTIC_ENGINE
        </div>
      </div>
    </main>
  );
}
