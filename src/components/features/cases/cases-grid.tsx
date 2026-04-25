'use client';

import { useState } from 'react';
import { cases, type Case } from '@/data/cases';
import { cn } from '@/lib/utils';

const filters = [
  { value: 'all', label: 'Todos' },
  { value: 'Vendas Sem Segredos', label: 'VSS' },
  { value: 'Advisory', label: 'Advisory' },
];

export function CasesGrid() {
  const [filter, setFilter] = useState<string>('all');

  const filtered = cases.filter((c) => (filter === 'all' ? true : c.produto.includes(filter)));

  return (
    <>
      <section className="pb-10">
        <div className="mx-auto max-w-5xl">
          <div className="kicker mb-4">// FILTRAR_POR_PRODUTO</div>
          <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={cn(
                  filter === f.value ? 'btn-primary' : 'btn-secondary',
                  'min-h-[40px] px-5 py-2 text-xs'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-6 md:grid-cols-2">
            {filtered.map((caso: Case) => (
              <article
                key={caso.empresa}
                className="bg-ink-2 hover:border-acid border border-[var(--jb-hair)] p-6 transition-all duration-[180ms] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[6px_6px_0_var(--jb-acid)] md:p-8"
              >
                <div className="mb-5 flex flex-wrap items-start justify-between gap-3 border-b border-[var(--jb-hair)] pb-5">
                  <div
                    className={cn('kicker', caso.produto.includes('Advisory') && 'text-fire')}
                    style={
                      caso.produto.includes('Advisory') ? { color: 'var(--jb-fire)' } : undefined
                    }
                  >
                    // {caso.produto.toUpperCase()}
                  </div>
                  {caso.badge && (
                    <div className="text-acid border border-[var(--jb-acid-border)] bg-[var(--jb-acid-soft)] px-3 py-1 font-mono text-[10px] tracking-[0.2em] uppercase">
                      ★ {caso.badge}
                    </div>
                  )}
                </div>

                <div className="mb-6">
                  <h3 className="heading-3 text-cream mb-1">{caso.empresa}</h3>
                  <p className="text-fg-muted font-mono text-[11px] tracking-[0.22em] uppercase">
                    {caso.nicho}
                  </p>
                </div>

                <div className="mb-5 grid grid-cols-3 gap-px border border-[var(--jb-hair)] bg-[var(--jb-hair)]">
                  <div className="bg-ink p-4">
                    <div className="kicker mb-1">// ANTES</div>
                    <div className="font-display text-cream text-base">{caso.antes}</div>
                  </div>
                  <div className="bg-ink p-4">
                    <div className="kicker mb-1" style={{ color: 'var(--jb-acid)' }}>
                      // DEPOIS
                    </div>
                    <div className="font-display text-acid text-base">{caso.depois}</div>
                  </div>
                  <div className="bg-ink p-4">
                    <div className="kicker mb-1">// TEMPO</div>
                    <div className="font-display text-cream text-base">{caso.tempo}</div>
                  </div>
                </div>

                <div className="border-acid bg-ink mb-6 flex items-baseline gap-3 border-l-2 p-4">
                  <span className="text-acid font-mono">▲</span>
                  <span className="font-display text-acid text-3xl">{caso.crescimento}</span>
                  <span className="text-fg-muted font-mono text-[11px] tracking-[0.22em] uppercase">
                    crescimento
                  </span>
                </div>

                <div className="mb-4">
                  <div className="kicker mb-2" style={{ color: 'var(--jb-fire)' }}>
                    // SITUAÇÃO_ANTES
                  </div>
                  <p className="text-fg-2 font-sans text-sm leading-relaxed">
                    {caso.situacaoAntes}
                  </p>
                </div>

                <div>
                  <div className="kicker mb-2" style={{ color: 'var(--jb-acid)' }}>
                    // O_QUE_FIZEMOS
                  </div>
                  <p className="text-fg-2 font-sans text-sm leading-relaxed">{caso.solucao}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
