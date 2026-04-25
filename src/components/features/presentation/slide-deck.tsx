'use client';

import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { SlidePlaceholder } from './slide-placeholder';

const TOTAL_SLIDES = 19;

interface SlideMeta {
  n: number;
  title: string;
  block?: string;
}

const slides: SlideMeta[] = [
  { n: 0, title: 'Apresentação Joel Burigo' },
  { n: 1, title: 'Problema', block: 'BASE UNIVERSAL' },
  { n: 2, title: 'Raiz', block: 'BASE UNIVERSAL' },
  { n: 3, title: 'Solução 6Ps', block: 'BASE UNIVERSAL' },
  { n: 4, title: '6Ps Fundação (P1-P3)', block: 'BASE UNIVERSAL' },
  { n: 5, title: '6Ps Operação/Escala (P4-P6)', block: 'BASE UNIVERSAL' },
  { n: 6, title: 'Credibilidade', block: 'BASE UNIVERSAL' },
  { n: 7, title: 'Prova', block: 'BASE UNIVERSAL' },
  { n: 8, title: 'Descoberta', block: 'BASE UNIVERSAL' },
  { n: 9, title: 'Transição · Escolha', block: 'BIFURCAÇÃO' },
  { n: 10, title: 'VSS Overview', block: 'MÓDULO VSS' },
  { n: 11, title: 'VSS Conteúdo', block: 'MÓDULO VSS' },
  { n: 12, title: 'VSS Transformação', block: 'MÓDULO VSS' },
  { n: 13, title: 'VSS Investimento', block: 'MÓDULO VSS' },
  { n: 14, title: 'Advisory Overview', block: 'MÓDULO ADVISORY' },
  { n: 15, title: 'Advisory Formato', block: 'MÓDULO ADVISORY' },
  { n: 16, title: 'Advisory Valor', block: 'MÓDULO ADVISORY' },
  { n: 17, title: 'Advisory Investimento', block: 'MÓDULO ADVISORY' },
  { n: 18, title: 'CTA Fechamento', block: 'CTA' },
];

export function SlideDeck() {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((prev) => {
      // Slide 9 (Transição) bloqueia avanço — usuário escolhe módulo VSS ou Advisory
      if (prev === 9) return prev;
      // Fim do módulo VSS pula pra CTA
      if (prev === 13) return 18;
      // Fim do módulo Advisory pula pra CTA
      if (prev === 17) return 18;
      if (prev < TOTAL_SLIDES - 1) return prev + 1;
      return prev;
    });
  }, []);

  const prev = useCallback(() => {
    setCurrent((p) => {
      // Do CTA volta pra Transição
      if (p === 18) return 9;
      if (p > 0) return p - 1;
      return p;
    });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, prev]);

  const progress = (current / (TOTAL_SLIDES - 1)) * 100;
  const slide = slides[current];

  return (
    <div className="bg-ink text-cream fixed inset-0 z-50 flex h-screen w-screen flex-col">
      {/* Progress bar */}
      <div
        className="bg-acid fixed top-0 left-0 z-[100] h-1 transition-all duration-300"
        style={{ width: `${progress}%` }}
      />

      {/* Nav controls */}
      <div className="absolute right-8 bottom-8 z-50 flex gap-3 opacity-30 transition-opacity hover:opacity-100">
        <button
          onClick={prev}
          aria-label="Slide anterior"
          className="bg-ink-2 hover:border-acid hover:text-acid border border-[var(--jb-hair-strong)] p-3"
        >
          <ChevronLeft className="size-6" />
        </button>
        <button
          onClick={next}
          aria-label="Próximo slide"
          className="bg-ink-2 hover:border-acid hover:text-acid border border-[var(--jb-hair-strong)] p-3"
        >
          <ChevronRight className="size-6" />
        </button>
      </div>

      {/* Slide container */}
      <div className="relative grow overflow-hidden">
        <div key={slide.n} className="absolute inset-0 animate-[fadeIn_300ms_ease-out]">
          <SlidePlaceholder n={slide.n} title={slide.title} block={slide.block} />
        </div>
      </div>

      {/* Footer indicator */}
      <div className="text-fg-muted absolute bottom-4 left-0 w-full text-center font-mono text-[11px] tracking-[0.22em] uppercase">
        <span className="text-acid">●</span>&nbsp; SETAS{' '}
        <span className="border border-[var(--jb-hair-strong)] px-1.5 py-0.5">←</span>{' '}
        <span className="border border-[var(--jb-hair-strong)] px-1.5 py-0.5">→</span> · SLIDE{' '}
        <span className="text-acid">{current + 1}</span>/{TOTAL_SLIDES}
      </div>
    </div>
  );
}
