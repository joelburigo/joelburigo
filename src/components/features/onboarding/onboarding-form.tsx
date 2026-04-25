'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { StepIndicator } from './step-indicator';
import {
  ONBOARDING_STEPS,
  TOTAL_STEPS,
  type OnboardingStep,
} from './steps';

/**
 * Estado por step: { [fieldName]: valor }
 * Estado completo: { [profileKey]: { [fieldName]: valor } }
 */
type StepValues = Record<string, string>;
type FormState = Record<string, StepValues>;

interface OnboardingFormProps {
  /** Valores iniciais — pode vir vazio na primeira vez. */
  initial: FormState;
}

function buildInitialState(initial: FormState): FormState {
  const state: FormState = {};
  for (const step of ONBOARDING_STEPS) {
    const existing = initial[step.profileKey] ?? {};
    const slice: StepValues = {};
    for (const field of step.fields) {
      slice[field.name] = existing[field.name] ?? '';
    }
    state[step.profileKey] = slice;
  }
  return state;
}

function isStepFilled(step: OnboardingStep, values: StepValues): boolean {
  return step.fields.every((field) => {
    const min = field.minLength ?? 4;
    return (values[field.name] ?? '').trim().length >= min;
  });
}

export function OnboardingForm({ initial }: OnboardingFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [state, setState] = useState<FormState>(() => buildInitialState(initial));
  const [saving, setSaving] = useState(false);
  const [, startTransition] = useTransition();

  const completed = useMemo(() => {
    const set = new Set<number>();
    for (const s of ONBOARDING_STEPS) {
      if (isStepFilled(s, state[s.profileKey] ?? {})) set.add(s.position);
    }
    return set;
  }, [state]);

  const current = ONBOARDING_STEPS[step - 1]!;
  const currentValues = state[current.profileKey] ?? {};
  const isLast = step === TOTAL_STEPS;
  const canAdvance = isStepFilled(current, currentValues);

  function updateField(name: string, value: string) {
    setState((prev) => ({
      ...prev,
      [current.profileKey]: {
        ...(prev[current.profileKey] ?? {}),
        [name]: value,
      },
    }));
  }

  async function persistStep(stepNumber: number): Promise<boolean> {
    const target = ONBOARDING_STEPS[stepNumber - 1];
    if (!target) return false;
    setSaving(true);
    try {
      const res = await fetch('/api/onboarding/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: stepNumber,
          data: state[target.profileKey] ?? {},
        }),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(err?.error ?? 'save_failed');
      }
      return true;
    } catch (err) {
      console.error('[onboarding] save failed', err);
      toast.error('Não consegui salvar agora. Tenta de novo em alguns segundos.');
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function onAdvance() {
    if (!canAdvance || saving) return;
    const ok = await persistStep(step);
    if (!ok) return;
    if (isLast) {
      toast.success('Perfil 6P completo. Vamos pro destravamento.');
      startTransition(() => {
        router.push('/app/area');
        router.refresh();
      });
      return;
    }
    setStep((s) => Math.min(TOTAL_STEPS, s + 1));
  }

  function onBack() {
    if (saving) return;
    setStep((s) => Math.max(1, s - 1));
  }

  return (
    <div className="flex flex-col gap-10">
      <StepIndicator currentStep={step} completedSteps={completed} />

      <header className="flex flex-col gap-3">
        <span className="kicker text-acid">// {current.code}</span>
        <h1 className="text-display-sm md:text-display-md text-cream">
          {current.title}
        </h1>
        <p className="body-lg text-fg-2 max-w-2xl">{current.intro}</p>
      </header>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void onAdvance();
        }}
        className="bg-ink-2 flex flex-col gap-6 border border-[var(--jb-hair)] p-6 md:p-8"
        aria-busy={saving}
      >
        {current.fields.map((field) => {
          const value = currentValues[field.name] ?? '';
          const fieldId = `f-${current.profileKey}-${field.name}`;
          return (
            <div key={field.name} className="flex flex-col gap-2">
              <Label htmlFor={fieldId}>{field.label}</Label>
              {field.kind === 'input' ? (
                <Input
                  id={fieldId}
                  name={field.name}
                  value={value}
                  onChange={(e) => updateField(field.name, e.target.value)}
                  placeholder={field.placeholder}
                  disabled={saving}
                  autoComplete="off"
                />
              ) : (
                <Textarea
                  id={fieldId}
                  name={field.name}
                  value={value}
                  onChange={(e) => updateField(field.name, e.target.value)}
                  placeholder={field.placeholder}
                  disabled={saving}
                  rows={3}
                />
              )}
              <p className="text-fg-muted font-mono text-[11px] tracking-[0.18em] uppercase">
                // {field.helpText}
              </p>
            </div>
          );
        })}
      </form>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          type="button"
          variant="ghost"
          onClick={onBack}
          disabled={step === 1 || saving}
          aria-disabled={step === 1 || saving}
        >
          ← Voltar
        </Button>
        <Button
          type="button"
          variant={isLast ? 'primary' : 'fire'}
          onClick={onAdvance}
          disabled={!canAdvance || saving}
          aria-busy={saving}
        >
          {saving
            ? 'SALVANDO...'
            : isLast
              ? 'CONCLUIR'
              : 'AVANÇAR'}{' '}
          <span className="font-mono">→</span>
        </Button>
      </div>
    </div>
  );
}
