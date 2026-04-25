import { cn } from '@/lib/utils';

interface ProgressBarProps {
  /** Total de itens (denominator). */
  total: number;
  /** Itens completos (numerator). */
  completed: number;
  /** Cor do fill — fire (default) ou acid. */
  tone?: 'fire' | 'acid';
  /** Tamanho do bar — md default. */
  size?: 'sm' | 'md';
  /** Mostrar label "X / Y · Z%" abaixo do bar. */
  showLabel?: boolean;
  /** Label custom — sobrescreve o default. */
  label?: string;
  className?: string;
}

/**
 * Barra de progresso brutalist (radius 0). Server-safe (sem state).
 * Fire ou acid fill sobre `--jb-hair` background.
 */
export function ProgressBar({
  total,
  completed,
  tone = 'fire',
  size = 'md',
  showLabel = false,
  label,
  className,
}: ProgressBarProps) {
  const safeTotal = Math.max(0, total);
  const safeCompleted = Math.min(Math.max(0, completed), safeTotal);
  const pct = safeTotal === 0 ? 0 : Math.round((safeCompleted / safeTotal) * 100);
  const fillBg = tone === 'fire' ? 'bg-fire' : 'bg-acid';
  const heightClass = size === 'sm' ? 'h-1.5' : 'h-2';

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div
        className={cn('w-full bg-[var(--jb-hair)] overflow-hidden', heightClass)}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? `${pct}% concluído`}
      >
        <div
          className={cn('h-full transition-all duration-300 ease-out', fillBg)}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <div className="text-fg-3 flex items-center justify-between font-mono text-[11px] tracking-[0.22em] uppercase">
          <span>{label ?? `${safeCompleted} / ${safeTotal} concluídos`}</span>
          <span className={tone === 'fire' ? 'text-fire-hot' : 'text-acid'}>{pct}%</span>
        </div>
      )}
    </div>
  );
}
