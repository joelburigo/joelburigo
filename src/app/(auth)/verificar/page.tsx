import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/patterns/container';
import { ReenviarButton } from '@/components/features/auth/reenviar-button';

export const metadata: Metadata = {
  title: 'Verifique seu email',
  robots: { index: false, follow: false },
};

interface SearchParams {
  email?: string;
}

export default async function VerificarPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const email = params.email?.trim() ?? '';

  return (
    <section className="section">
      <Container size="sm" className="flex flex-col gap-8">
        <header className="flex flex-col gap-3">
          <span className="kicker text-fire">// LINK ENVIADO</span>
          <h1 className="text-display-md text-cream">VERIFIQUE SEU EMAIL</h1>
          <p className="body-lg text-fg-2">
            {email ? (
              <>
                Link enviado pra{' '}
                <span className="text-acid font-mono break-all">{email}</span>. Expira em 15
                minutos.
              </>
            ) : (
              <>Link enviado. Expira em 15 minutos.</>
            )}
          </p>
        </header>

        <div className="bg-ink-2 border-acid flex flex-col gap-4 border-l-4 p-6">
          <p className="body text-cream">
            Abra o email e clique no botão <strong className="text-acid">Entrar</strong>. Se não
            achar, confere a aba de promoções e o spam.
          </p>
          <p className="mono text-fg-muted">// Funciona uma vez só. Não compartilhe.</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {email && <ReenviarButton email={email} />}
          <Link
            href="/entrar"
            className="text-fg-3 hover:text-acid font-mono text-[12px] tracking-[0.22em] uppercase"
          >
            ← Voltar
          </Link>
        </div>
      </Container>
    </section>
  );
}
