import { cn } from '@/lib/utils';
import { TOTAL_STEPS } from './steps';

interface StepIndicatorProps {
  currentStep: number;
  completedSteps: ReadonlySet<number>;
}

/**
 * Stepper top — 6 dots numerados.
 *  - atual = fire (preenchido)
 *  - completos = acid (preenchido)
 *  - futuros = hair (outline)
 */
export function StepIndicator({ currentStep, completedSteps }: StepIndicatorProps) {
  const steps = Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1);
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        {steps.map((n, i) => {
          const isCurrent = n === currentStep;
          const isCompleted = completedSteps.has(n) && !isCurrent;
          return (
            <div key={n} className="flex flex-1 items-center gap-2">
              <span
                aria-current={isCurrent ? 'step' : undefined}
                aria-label={`Passo ${n} de ${TOTAL_STEPS}`}
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center font-mono text-[12px] font-bold transition-colors duration-[180ms]',
                  isCurrent &&
                    'bg-fire text-ink shadow-[3px_3px_0_var(--jb-acid)]',
                  isCompleted &&
                    'bg-acid text-ink shadow-[3px_3px_0_var(--jb-fire)]',
                  !isCurrent &&
                    !isCompleted &&
                    'bg-ink-2 text-fg-muted border border-[var(--jb-hair)]'
                )}
              >
                {n}
              </span>
              {i < steps.length - 1 && (
                <span
                  aria-hidden
                  className={cn(
                    'h-px flex-1 transition-colors duration-[180ms]',
                    completedSteps.has(n) ? 'bg-acid' : 'bg-[var(--jb-hair)]'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
      <p className="mono text-fg-muted">
        // PASSO {currentStep} DE {TOTAL_STEPS}
      </p>
    </div>
  );
}
