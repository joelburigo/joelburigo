import 'server-only';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ScrollText } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface SessionNotesProps {
  md: string;
  /** Override do título. Default: "Notas da preparação". */
  title?: string;
  /** Override do kicker. Default: "// PREPARAÇÃO". */
  kicker?: string;
  className?: string;
}

/**
 * Card lateral com markdown renderizado (preparação pré-sessão ou notas pós).
 * Usado em `/sessao/[id]` e potencialmente no dashboard.
 *
 * Style brutalist Terminal Growth, prose tunada pra dark.
 */
export function SessionNotes({
  md,
  title = 'Notas da preparação',
  kicker = '// PREPARAÇÃO',
  className,
}: SessionNotesProps) {
  if (!md.trim()) return null;

  return (
    <Card className={cn('flex flex-col gap-4 !p-6', className)}>
      <div className="flex items-center gap-2">
        <ScrollText className="text-acid size-4" aria-hidden />
        <span className="kicker text-acid">{kicker}</span>
      </div>
      <h3 className="heading-3 text-cream">{title}</h3>
      <div
        className={cn(
          'prose prose-invert max-w-none',
          'prose-headings:font-display prose-headings:uppercase prose-headings:tracking-tight prose-headings:text-cream',
          'prose-p:text-fg-2 prose-p:leading-relaxed',
          'prose-strong:text-cream',
          'prose-a:text-acid prose-a:no-underline hover:prose-a:underline',
          'prose-code:text-acid prose-code:font-mono prose-code:text-[13px]',
          'prose-li:text-fg-2 prose-li:marker:text-fire',
          'prose-blockquote:border-l-fire prose-blockquote:text-fg-3'
        )}
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{md}</ReactMarkdown>
      </div>
    </Card>
  );
}
