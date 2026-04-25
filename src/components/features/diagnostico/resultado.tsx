'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { STRATEGIC_PS, getMaturityLevel, psData, type PKey, type Scores } from './resultado-data';
import { RadarChart } from './radar-chart';

const PKEYS: PKey[] = ['posicionamento', 'publico', 'produto', 'programas', 'processos', 'pessoas'];

function scoreColor(score: number) {
  if (score >= 3) return 'text-acid';
  if (score >= 2) return 'text-fire-hot';
  if (score >= 1) return 'text-fire-hot';
  return 'text-fire';
}

export function DiagnosticoResultado() {
  const params = useSearchParams();

  const scores: Scores = useMemo(
    () => ({
      posicionamento: parseInt(params.get('posicionamento') || '0', 10),
      publico: parseInt(params.get('publico') || '0', 10),
      produto: parseInt(params.get('produto') || '0', 10),
      programas: parseInt(params.get('programas') || '0', 10),
      processos: parseInt(params.get('processos') || '0', 10),
      pessoas: parseInt(params.get('pessoas') || '0', 10),
    }),
    [params]
  );

  const total = PKEYS.reduce((sum, k) => sum + scores[k], 0);
  const maturity = getMaturityLevel(total);

  const sorted = useMemo(
    () => PKEYS.map((k) => [k, scores[k]] as const).sort((a, b) => a[1] - b[1]),
    [scores]
  );
  const top3 = sorted.slice(0, 3);
  const hasStrategicIssue = top3.some(([k]) => STRATEGIC_PS.includes(k));
  const weakestKey = sorted[0][0];
  const weakestScore = sorted[0][1];
  const weakest = psData[weakestKey];
  const currentLevel = weakest.levels[weakestScore];
  const nextLevel = weakestScore < 4 ? weakest.levels[weakestScore + 1] : null;

  return (
    <>
      {/* Score Geral + Radar */}
      <div
        className="bg-ink-2 mb-12 border border-[var(--jb-acid-border)] p-8"
        style={{
          background: 'linear-gradient(180deg, rgba(198,255,0,0.06), var(--jb-ink-2))',
        }}
      >
        <div className="grid gap-8 md:grid-cols-2 md:items-center">
          <div>
            <div className="kicker mb-3" style={{ color: 'var(--jb-acid)' }}>
              // SCORE · PONTUAÇÃO_GERAL
            </div>
            <div className="mb-4 flex items-baseline gap-3">
              <span className="font-display text-acid text-6xl md:text-7xl">{total}</span>
              <span className="font-display text-fg-3 text-3xl">/24</span>
            </div>
            <p className="font-display text-cream mb-3 text-xl">
              NÍVEL: <strong className={maturity.color}>{maturity.name}</strong>
            </p>
            <p className="text-fg-2 font-sans">{maturity.description}</p>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative h-80 w-80">
              <RadarChart scores={scores} />
            </div>
          </div>
        </div>
      </div>

      {/* Análise por P */}
      <div className="mb-12">
        <div className="kicker mb-4">// ANÁLISE · DETALHADA_POR_P</div>
        <h2 className="heading-2 text-cream mb-6">Análise detalhada dos 6Ps</h2>
        <div className="space-y-4">
          {PKEYS.map((key) => {
            const score = scores[key];
            const pInfo = psData[key];
            const level = pInfo.levels[score];
            const isStrategic = STRATEGIC_PS.includes(key);
            return (
              <div
                key={key}
                className={cn(
                  'bg-ink-2 hover:border-acid border p-6 transition-all',
                  isStrategic ? 'border-[var(--jb-acid-border)]' : 'border-[var(--jb-hair)]'
                )}
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-3">
                      <span className="font-display text-acid text-3xl">{pInfo.icon}</span>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="heading-4 text-cream">{pInfo.name}</h3>
                          <span
                            className={cn(
                              'inline-flex items-center gap-1 px-2 py-0.5 font-mono text-[10px] tracking-[0.18em] uppercase',
                              isStrategic
                                ? 'text-acid bg-[var(--jb-acid-soft-2)]'
                                : 'text-fg-3 bg-[var(--jb-hair)]'
                            )}
                          >
                            {isStrategic ? '★ ESTRATÉGICO' : '// TÁTICO'}
                          </span>
                        </div>
                        <p className="text-fg-2 font-sans text-sm">{pInfo.description}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={cn('font-display text-2xl', scoreColor(score))}>{score}/4</div>
                    <div className="text-fg-muted font-mono text-[11px] tracking-[0.18em] uppercase">
                      {level.name}
                    </div>
                  </div>
                </div>
                <div className="bg-ink mb-4 border border-[var(--jb-hair)] p-4">
                  <p className="text-fg-2 font-sans">{level.description}</p>
                </div>
                <div>
                  <p className="text-cream mb-2 font-mono text-[11px] tracking-[0.22em] uppercase">
                    Próximas ações
                  </p>
                  <ul className="space-y-2">
                    {level.actions.map((a) => (
                      <li key={a} className="text-fg-2 flex items-start gap-2 font-sans text-sm">
                        <ChevronRight className="text-acid mt-0.5 size-4 shrink-0" />
                        <span>{a}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Prioridades */}
      <div className="border-fire bg-ink-2 mb-12 border-l-2 p-6 md:p-8">
        <div className="kicker mb-4" style={{ color: 'var(--jb-fire)' }}>
          // PRIORIDADES · IMEDIATAS
        </div>
        <h2 className="heading-2 text-cream mb-6">Tuas prioridades imediatas</h2>
        <p className="text-fg-2 mb-4 font-sans">
          {hasStrategicIssue ? (
            <>
              <strong className="text-fire-hot">▲ CRÍTICO:</strong> você tem gaps nos Ps{' '}
              <strong className="text-cream">estratégicos</strong>. Priorize-os{' '}
              <strong className="text-cream">antes</strong> de trabalhar nos táticos/operacionais.
            </>
          ) : (
            <>Baseado no framework dos 6Ps, recomendamos focar nesta ordem:</>
          )}
        </p>
        <div className="space-y-4">
          {top3.map(([key, score], idx) => {
            const pInfo = psData[key];
            const isStrategic = STRATEGIC_PS.includes(key);
            return (
              <div
                key={key}
                className={cn(
                  'flex items-start gap-4 border p-4',
                  isStrategic
                    ? 'border-fire bg-[var(--jb-fire-soft)]'
                    : 'bg-ink border-[var(--jb-fire-border)]'
                )}
              >
                <div
                  className={cn(
                    'font-display text-cream flex h-8 w-8 shrink-0 items-center justify-center text-lg font-bold',
                    isStrategic ? 'bg-fire' : 'bg-fire-deep'
                  )}
                >
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <h4 className="font-display text-cream mb-1">
                    {pInfo.icon} {pInfo.name}
                  </h4>
                  <p className="text-fg-2 mb-2 font-sans text-sm">
                    Pontuação atual: {score}/4 — {pInfo.levels[score].name}
                  </p>
                  <p className="text-fg-2 font-sans text-sm">{pInfo.levels[score].description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Plano de Ação */}
      <div className="bg-ink-2 mb-12 border border-[var(--jb-hair)] p-6 md:p-8">
        <div className="kicker mb-4">// PLANO · PRÓXIMOS_PASSOS</div>
        <h2 className="heading-2 text-cream mb-6">Próximos passos</h2>
        <div className="space-y-6">
          <div className="border border-[var(--jb-acid-border)] bg-[var(--jb-acid-soft)] p-6">
            <h3 className="heading-3 text-cream mb-3">★ Foco Principal: {weakest.name}</h3>
            <p className="text-fg-2 mb-4 font-sans">
              Este é seu gargalo crítico. Ao melhorar {weakest.name.toLowerCase()}, você destrava
              crescimento em toda operação.
            </p>
            {nextLevel && (
              <div className="bg-ink mb-4 border border-[var(--jb-hair)] p-4">
                <p className="text-cream mb-2 font-mono text-[11px] tracking-[0.22em] uppercase">
                  Meta: chegar ao nível &ldquo;{nextLevel.name}&rdquo;
                </p>
                <p className="text-fg-2 font-sans text-sm">{nextLevel.description}</p>
              </div>
            )}
            <p className="text-cream mb-3 font-mono text-[11px] tracking-[0.22em] uppercase">
              Checklist de 30 dias:
            </p>
            <div className="space-y-2">
              {currentLevel.actions.map((action) => (
                <label key={action} className="group flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    className="bg-ink text-acid focus:ring-acid mt-1 size-5 border-[var(--jb-hair)] focus:ring-2"
                  />
                  <span className="text-fg-2 group-hover:text-cream font-sans transition-colors">
                    {action}
                  </span>
                </label>
              ))}
            </div>
          </div>
          <div className="bg-ink border border-[var(--jb-hair)] p-6">
            <h4 className="font-display text-cream mb-3 text-lg">★ Dica do Joel:</h4>
            <p className="text-fg-2 font-sans">
              Não tente melhorar todos os Ps ao mesmo tempo. Foque em {weakest.name.toLowerCase()}{' '}
              pelos próximos 30-60 dias.{' '}
              <strong className="text-cream">
                Um P bem resolvido tem mais impacto que seis Ps mal executados.
              </strong>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
