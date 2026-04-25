interface SlidePlaceholderProps {
  n: number;
  title: string;
  block?: string;
  pendingPort?: boolean;
}

/**
 * Placeholder pros 19 slides da apresentação comercial.
 * Conteúdo byte-fiel dos `*Slide.astro` originais será portado em rodada futura.
 * O deck (state machine + keyboard nav + branching) já está completo.
 */
export function SlidePlaceholder({ n, title, block, pendingPort = true }: SlidePlaceholderProps) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-6 bg-ink p-8 md:p-16">
      <div className="grid-overlay" aria-hidden="true" />
      <div className="relative z-10 flex max-w-3xl flex-col items-center gap-6 text-center">
        <div className="font-mono text-[11px] uppercase tracking-[0.28em] text-fg-muted">
          // SLIDE {String(n).padStart(2, '0')} / 19{block ? ` · ${block}` : ''}
        </div>
        <h1
          className="font-display text-cream"
          style={{
            fontSize: 'clamp(2.5rem, 7vw, 5rem)',
            fontWeight: 900,
            letterSpacing: '-0.045em',
            lineHeight: '0.92',
            textTransform: 'uppercase',
          }}
        >
          {title}
        </h1>
        {pendingPort && (
          <div className="border border-[var(--jb-fire-border)] bg-[var(--jb-fire-soft)] px-5 py-3">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-fire">
              ★ Conteúdo do slide em port byte-fiel · arquitetura do deck pronta
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
