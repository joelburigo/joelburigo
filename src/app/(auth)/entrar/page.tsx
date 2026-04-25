import type { Metadata } from 'next';
import { Container } from '@/components/patterns/container';
import { MagicLinkForm } from '@/components/features/auth/magic-link-form';

export const metadata: Metadata = {
  title: 'Entrar',
  description: 'Acesse sua área Joel Burigo via magic link.',
  robots: { index: false, follow: false },
};

export default function EntrarPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  return (
    <section className="section">
      <Container size="md">
        <MagicLinkForm searchParamsPromise={searchParams} />
      </Container>
    </section>
  );
}
