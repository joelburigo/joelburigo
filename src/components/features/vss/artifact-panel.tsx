import 'server-only';
import { FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { agent_artifacts } from '@/server/db/schema';

type Artifact = typeof agent_artifacts.$inferSelect;

interface ArtifactPanelProps {
  /** Lista de artifacts já carregada pelo server (do destravamento ou conversation atual). */
  artifacts: Artifact[];
  /** Sticky no desktop, default true. */
  sticky?: boolean;
}

const DATE_FMT = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

function safeFormat(d: Date | null | undefined): string {
  if (!d) return '—';
  try {
    return DATE_FMT.format(d);
  } catch {
    return '—';
  }
}

/**
 * Truncate markdown pra preview — preserva quebras de linha mas corta em N chars.
 */
function truncateMd(md: string | null, max = 320): string {
  if (!md) return '';
  if (md.length <= max) return md;
  const cut = md.slice(0, max);
  const lastNewline = cut.lastIndexOf('\n');
  return (lastNewline > max * 0.6 ? cut.slice(0, lastNewline) : cut).trim() + '…';
}

/**
 * Painel lateral com artifacts gerados na conversa.
 * Server component — só renderiza dados pré-carregados.
 * Edição de artifact (Tiptap/MD) fica pra Sprint 4.
 */
export function ArtifactPanel({ artifacts, sticky = true }: ArtifactPanelProps) {
  return (
    <aside
      className={
        sticky
          ? 'lg:sticky lg:top-6 lg:max-h-[calc(100vh-4rem)] lg:overflow-y-auto'
          : undefined
      }
      aria-label="Artifacts da conversa"
    >
      <div className="bg-ink-2 flex flex-col border border-[var(--jb-hair)]">
        <header className="flex items-center justify-between gap-3 border-b border-[var(--jb-hair)] px-5 py-4">
          <div className="flex flex-col gap-1">
            <span className="kicker text-fire-hot">// ARTIFACTS</span>
            <span className="text-fg-3 font-mono text-[10px] tracking-[0.22em] uppercase">
              {artifacts.length} item{artifacts.length === 1 ? '' : 's'}
            </span>
          </div>
          <FileText className="text-fg-3 size-4" aria-hidden />
        </header>

        {artifacts.length === 0 ? (
          <div className="flex flex-col gap-2 px-5 py-6">
            <span className="text-fg-3 font-mono text-[11px] tracking-[0.22em] uppercase">
              // Sem artifacts ainda
            </span>
            <p className="body-sm text-fg-3">
              Conforme você conversa com o agente, os entregáveis (planos, scripts, perfis)
              aparecem aqui versionados.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col">
            {artifacts.map((art) => (
              <li
                key={art.id}
                className="flex flex-col gap-3 border-b border-[var(--jb-hair)] px-5 py-4 last:border-b-0"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-col gap-1">
                    <span className="text-cream font-display text-[14px] uppercase tracking-tight">
                      {art.title}
                    </span>
                    <span className="text-fg-3 font-mono text-[10px] tracking-[0.22em] uppercase">
                      {art.kind} · v{art.version} · {safeFormat(art.created_at)}
                    </span>
                  </div>
                  {art.is_current && <Badge variant="acid">Atual</Badge>}
                </div>
                {art.content_md ? (
                  <pre className="bg-ink-3 text-fg-2 border-l-fire max-h-40 overflow-hidden border-l-2 px-3 py-2 font-mono text-[11px] leading-relaxed whitespace-pre-wrap">
                    {truncateMd(art.content_md)}
                  </pre>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
