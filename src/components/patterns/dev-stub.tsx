import Link from 'next/link';
import { Container } from './container';

interface DevStubProps {
  sprint: number;
  route: string;
  title: string;
  description: string;
  backHref?: string;
  backLabel?: string;
}

/**
 * Stub padrão pra rotas que ainda serão implementadas em sprints futuros.
 * Mantém o shell (header/footer) renderizando corretamente e sinaliza o que vem.
 */
export function DevStub({
  sprint,
  route,
  title,
  description,
  backHref = '/',
  backLabel = 'Voltar',
}: DevStubProps) {
  return (
    <section className="section">
      <Container size="md" className="flex flex-col gap-6">
        <span className="kicker text-fire">// SPRINT {sprint} · EM CONSTRUÇÃO</span>
        <h1 className="text-display-md">{title}</h1>
        <p className="body-lg text-fg-2">{description}</p>
        <div className="flex flex-col gap-2 border border-[var(--jb-hair)] bg-ink-2 p-5">
          <span className="mono text-fg-muted">// rota</span>
          <code className="font-mono text-sm text-acid">{route}</code>
        </div>
        <Link
          href={backHref}
          className="font-mono text-[12px] uppercase tracking-[0.22em] text-fg-3 hover:text-acid"
        >
          ← {backLabel}
        </Link>
      </Container>
    </section>
  );
}
