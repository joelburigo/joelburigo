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

  const filtered = cases.filter((c) =>
    filter === 'all' ? true : c.produto.includes(filter)
  );

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
                className="border border-[var(--jb-hair)] bg-ink-2 p-6 md:p-8 transition-all duration-[180ms] hover:border-acid hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[6px_6px_0_var(--jb-acid)]"
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
                    <div className="border border-[var(--jb-acid-border)] bg-[var(--jb-acid-soft)] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-acid">
                      ★ {caso.badge}
                    </div>
                  )}
                </div>

                <div className="mb-6">
                  <h3 className="heading-3 mb-1 text-cream">{caso.empresa}</h3>
                  <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-fg-muted">
                    {caso.nicho}
                  </p>
                </div>

                <div className="mb-5 grid grid-cols-3 gap-px border border-[var(--jb-hair)] bg-[var(--jb-hair)]">
                  <div className="bg-ink p-4">
                    <div className="kicker mb-1">// ANTES</div>
                    <div className="font-display text-base text-cream">{caso.antes}</div>
                  </div>
                  <div className="bg-ink p-4">
                    <div className="kicker mb-1" style={{ color: 'var(--jb-acid)' }}>
                      // DEPOIS
                    </div>
                    <div className="font-display text-base text-acid">{caso.depois}</div>
                  </div>
                  <div className="bg-ink p-4">
                    <div className="kicker mb-1">// TEMPO</div>
                    <div className="font-display text-base text-cream">{caso.tempo}</div>
                  </div>
                </div>

                <div className="mb-6 flex items-baseline gap-3 border-l-2 border-acid bg-ink p-4">
                  <span className="text-acid font-mono">▲</span>
                  <span className="font-display text-3xl text-acid">{caso.crescimento}</span>
                  <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-fg-muted">
                    crescimento
                  </span>
                </div>

                <div className="mb-4">
                  <div className="kicker mb-2" style={{ color: 'var(--jb-fire)' }}>
                    // SITUAÇÃO_ANTES
                  </div>
                  <p className="font-sans text-sm text-fg-2 leading-relaxed">
                    {caso.situacaoAntes}
                  </p>
                </div>

                <div>
                  <div className="kicker mb-2" style={{ color: 'var(--jb-acid)' }}>
                    // O_QUE_FIZEMOS
                  </div>
                  <p className="font-sans text-sm text-fg-2 leading-relaxed">{caso.solucao}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
