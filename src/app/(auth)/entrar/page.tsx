import type { Metadata } from 'next';
import { Container } from '@/components/patterns/container';
import { EntrarForm } from '@/components/features/auth/entrar-form';
import { DevLoginButtons } from '@/components/features/auth/dev-login-buttons';

export const metadata: Metadata = {
  title: 'Entrar',
  description: 'Acesse sua área Joel Burigo via link de acesso enviado por email.',
  robots: { index: false, follow: false },
};

interface SearchParams {
  next?: string;
  error?: string;
}

export default async function EntrarPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const next = params.next && params.next.startsWith('/') && !params.next.startsWith('//')
    ? params.next
    : '/area';

  return (
    <section className="section">
      <Container size="sm">
        <EntrarForm next={next} initialError={params.error} />
        {process.env.NODE_ENV !== 'production' && <DevLoginButtons />}
      </Container>
    </section>
  );
}
