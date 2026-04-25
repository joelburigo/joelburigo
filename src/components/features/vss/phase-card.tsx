import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { Card, CardFeatured } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ProgressBar } from './progress-bar';

interface PhaseCardProps {
  /** Slug pra link `/app/fase/[slug]`. */
  slug: string;
  /** Position usado pra prefixo "01 — ...". */
  position: number;
  /** Code curto (ex: F1) — também exibido no kicker. */
  code: string;
  /** Título humano. */
  title: string;
  /** Resumo opcional. */
  description?: string | null;
  /** Total de destravamentos da fase. */
  totalDestravamentos: number;
  /** Quantos destravamentos completos. */
  completedDestravamentos: number;
  /** Ativo = pelo menos 1 destravamento iniciado/completo OU é a próxima fase. */
  isCurrent?: boolean;
}

/**
 * Card pra dashboard listando fase + % concluído.
 * Featured (acid) quando é a fase atual; default brutalist quando concluída/futura.
 */
export function PhaseCard({
  slug,
  position,
  code,
  title,
  description,
  totalDestravamentos,
  completedDestravamentos,
  isCurrent,
}: PhaseCardProps) {
  const isComplete = totalDestravamentos > 0 && completedDestravamentos >= totalDestravamentos;
  const Wrapper = isCurrent ? CardFeatured : Card;
  const positionLabel = String(position).padStart(2, '0');

  return (
    <Link
      href={`/app/fase/${slug}`}
      className="group focus-visible:outline-acid block focus-visible:outline-2 focus-visible:outline-offset-4"
      aria-label={`Abrir fase ${title}`}
    >
      <Wrapper className="flex h-full flex-col gap-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-2">
            <span
              className={cn(
                'kicker',
                isCurrent ? 'text-acid' : isComplete ? 'text-fg-3' : 'text-fire-hot'
              )}
            >
              // {code} · FASE {positionLabel}
            </span>
            <h3 className="heading-3 text-cream">{title}</h3>
          </div>
          {isComplete ? (
            <Badge variant="acid">
              <Check className="size-3" aria-hidden /> Concluída
            </Badge>
          ) : isCurrent ? (
            <Badge variant="live">Em curso</Badge>
          ) : null}
        </div>

        {description ? <p className="body-sm text-fg-3">{description}</p> : null}

        <div className="mt-auto flex flex-col gap-3">
          <ProgressBar
            total={totalDestravamentos}
            completed={completedDestravamentos}
            tone={isComplete ? 'acid' : 'fire'}
            showLabel
          />
          <span
            className={cn(
              'inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.22em] uppercase transition-colors',
              isCurrent ? 'text-acid' : 'text-fg-3 group-hover:text-acid'
            )}
          >
            Abrir fase <ArrowRight className="size-3" aria-hidden />
          </span>
        </div>
      </Wrapper>
    </Link>
  );
}
