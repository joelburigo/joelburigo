import 'server-only';
import Link from 'next/link';
import { asc, eq, inArray } from 'drizzle-orm';
import { ArrowRight, Check, ChevronRight, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { db } from '@/server/db/client';
import { user_progress, vss_destravamentos, vss_modules } from '@/server/db/schema';
import { cn } from '@/lib/utils';

interface FaseNavProps {
  /** ID da fase (ULID). */
  phaseId: string;
  /** User logado pra calcular completed/started. */
  userId: string;
}

interface DestravamentoStatus {
  kind: 'completed' | 'in-progress' | 'available' | 'locked';
  label: string;
}

function statusFor(opts: {
  completed: boolean;
  started: boolean;
  publishedAt: Date | null;
  availableFrom: Date | null;
  now: Date;
}): DestravamentoStatus {
  const { completed, started, publishedAt, availableFrom, now } = opts;
  if (completed) return { kind: 'completed', label: 'Concluído' };
  if (started) return { kind: 'in-progress', label: 'Em andamento' };
  // Locked se não publicado ou available_from no futuro
  const isPublished = publishedAt !== null && publishedAt <= now;
  const isAvailable = !availableFrom || availableFrom <= now;
  if (!isPublished || !isAvailable) return { kind: 'locked', label: 'Em breve' };
  return { kind: 'available', label: 'Disponível' };
}

/**
 * Lista módulos + destravamentos de uma fase. Server component.
 * Usa `<details>` HTML pra colapsar sem JS — primeiro módulo aberto por padrão.
 */
export async function FaseNav({ phaseId, userId }: FaseNavProps) {
  const modules = await db
    .select()
    .from(vss_modules)
    .where(eq(vss_modules.phase_id, phaseId))
    .orderBy(asc(vss_modules.position));

  if (modules.length === 0) {
    return (
      <div className="bg-ink-2 flex flex-col gap-3 border border-[var(--jb-hair)] p-6">
        <span className="kicker text-fire-hot">// MÓDULOS EM PREPARAÇÃO</span>
        <p className="body text-fg-2">
          Os módulos desta fase estão sendo finalizados. Volte em breve.
        </p>
      </div>
    );
  }

  const moduleIds = modules.map((m) => m.id);

  const destravamentos = await db
    .select()
    .from(vss_destravamentos)
    .where(inArray(vss_destravamentos.module_id, moduleIds))
    .orderBy(asc(vss_destravamentos.position));

  const progressRows = await db
    .select()
    .from(user_progress)
    .where(eq(user_progress.user_id, userId));

  const progressByDest = new Map(progressRows.map((r) => [r.destravamento_id, r] as const));

  const byModule = new Map<string, typeof destravamentos>();
  for (const d of destravamentos) {
    const list = byModule.get(d.module_id) ?? [];
    list.push(d);
    byModule.set(d.module_id, list);
  }

  const now = new Date();

  // Encontra primeiro módulo com destravamento não-completo pra abrir por default
  const firstOpenIdx = (() => {
    for (let i = 0; i < modules.length; i += 1) {
      const list = byModule.get(modules[i]!.id) ?? [];
      const hasIncomplete = list.some((d) => !progressByDest.get(d.id)?.completed_at);
      if (hasIncomplete) return i;
    }
    return 0;
  })();

  return (
    <div className="flex flex-col gap-4">
      {modules.map((mod, idx) => {
        const list = byModule.get(mod.id) ?? [];
        const completedInModule = list.filter(
          (d) => progressByDest.get(d.id)?.completed_at
        ).length;
        const total = list.length;
        const moduleComplete = total > 0 && completedInModule >= total;

        return (
          <details
            key={mod.id}
            open={idx === firstOpenIdx}
            className="group bg-ink-2 border border-[var(--jb-hair)] open:border-[var(--jb-hair-strong)]"
          >
            <summary className="hover:bg-cream/[0.02] flex cursor-pointer items-center justify-between gap-4 px-5 py-4 transition-colors [&::-webkit-details-marker]:hidden [&::marker]:hidden">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <ChevronRight
                  className="text-fg-3 size-4 shrink-0 transition-transform group-open:rotate-90"
                  aria-hidden
                />
                <div className="flex min-w-0 flex-col gap-1">
                  <span
                    className={cn(
                      'kicker',
                      moduleComplete ? 'text-acid' : 'text-fire-hot'
                    )}
                  >
                    // {mod.code} · MÓDULO {String(mod.position).padStart(2, '0')}
                  </span>
                  <span className="text-cream font-display truncate text-[15px] uppercase tracking-tight">
                    {mod.title}
                  </span>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="text-fg-3 font-mono text-[11px] tracking-[0.22em] uppercase">
                  {completedInModule}/{total}
                </span>
                {moduleComplete && (
                  <Badge variant="acid">
                    <Check className="size-3" aria-hidden /> OK
                  </Badge>
                )}
              </div>
            </summary>

            <div className="border-t border-[var(--jb-hair)]">
              {list.length === 0 ? (
                <p className="text-fg-3 px-5 py-4 font-mono text-[11px] tracking-[0.22em] uppercase">
                  // Sem destravamentos publicados
                </p>
              ) : (
                <ul className="flex flex-col">
                  {list.map((d) => {
                    const progress = progressByDest.get(d.id);
                    const status = statusFor({
                      completed: !!progress?.completed_at,
                      started: !!progress?.started_at && !progress?.completed_at,
                      publishedAt: d.published_at,
                      availableFrom: d.available_from,
                      now,
                    });

                    const isLocked = status.kind === 'locked';

                    const inner = (
                      <div className="flex w-full items-center gap-4 px-5 py-3">
                        <StatusIcon kind={status.kind} />
                        <div className="flex min-w-0 flex-1 flex-col gap-1">
                          <span
                            className={cn(
                              'truncate text-[14px]',
                              status.kind === 'completed'
                                ? 'text-fg-3 line-through'
                                : 'text-cream'
                            )}
                          >
                            {d.title}
                          </span>
                          <span className="text-fg-3 flex items-center gap-3 font-mono text-[10px] tracking-[0.22em] uppercase">
                            <span>{d.code}</span>
                            <span aria-hidden>·</span>
                            <span className="inline-flex items-center gap-1">
                              <Clock className="size-3" aria-hidden /> {d.estimated_minutes} min
                            </span>
                          </span>
                        </div>
                        <StatusBadge kind={status.kind} label={status.label} />
                        {!isLocked && (
                          <ArrowRight
                            className="text-fg-3 size-4 shrink-0 transition-colors group-hover:text-acid"
                            aria-hidden
                          />
                        )}
                      </div>
                    );

                    return (
                      <li
                        key={d.id}
                        className="border-b border-[var(--jb-hair)] last:border-b-0"
                      >
                        {isLocked ? (
                          <div className="opacity-60">{inner}</div>
                        ) : (
                          <Link
                            href={`/app/destravamento/${d.slug}`}
                            className="hover:bg-cream/[0.04] focus-visible:bg-cream/[0.04] block transition-colors"
                          >
                            {inner}
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </details>
        );
      })}
    </div>
  );
}

function StatusIcon({ kind }: { kind: DestravamentoStatus['kind'] }) {
  if (kind === 'completed') {
    return (
      <span
        className="bg-acid text-ink inline-flex size-6 shrink-0 items-center justify-center"
        aria-label="Concluído"
      >
        <Check className="size-3.5" aria-hidden />
      </span>
    );
  }
  if (kind === 'in-progress') {
    return (
      <span
        className="border-fire bg-fire/10 inline-flex size-6 shrink-0 items-center justify-center border"
        aria-label="Em andamento"
      >
        <span className="bg-fire size-2 animate-pulse" />
      </span>
    );
  }
  if (kind === 'locked') {
    return (
      <span
        className="bg-ink-3 text-fg-muted inline-flex size-6 shrink-0 items-center justify-center border border-[var(--jb-hair)]"
        aria-label="Bloqueado"
      >
        <Clock className="size-3" aria-hidden />
      </span>
    );
  }
  return (
    <span
      className="border-fg-3 inline-flex size-6 shrink-0 items-center justify-center border"
      aria-label="Disponível"
    />
  );
}

function StatusBadge({ kind, label }: { kind: DestravamentoStatus['kind']; label: string }) {
  if (kind === 'completed') return <Badge variant="acid">{label}</Badge>;
  if (kind === 'in-progress') return <Badge variant="live">{label}</Badge>;
  if (kind === 'locked')
    return (
      <span className="text-fg-muted font-mono text-[10px] tracking-[0.22em] uppercase">
        {label}
      </span>
    );
  return <Badge variant="fire">{label}</Badge>;
}
