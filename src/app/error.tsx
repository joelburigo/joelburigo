'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { Container } from '@/components/patterns/container';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // TODO: enviar pro Sentry quando integrar
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink py-20">
      <Container size="md" className="text-center">
        <div className="flex flex-col items-center gap-6">
          <span className="kicker text-fire">// ERROR 500</span>
          <h1 className="text-display-lg stroke-text">500</h1>
          <h2 className="text-display-sm">Algo travou no backend.</h2>
          <p className="body-lg text-fg-3">
            Anotei o erro. Tenta de novo ou volta pra home.
          </p>
          {error.digest && (
            <p className="mono text-fg-muted">Ref: {error.digest}</p>
          )}
          <div className="flex gap-4">
            <button onClick={reset} className="btn-fire">
              Tentar de novo <span className="font-mono">→</span>
            </button>
            <Link href="/" className="btn-secondary">
              Home
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
