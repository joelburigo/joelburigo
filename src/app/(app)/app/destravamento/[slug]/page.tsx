import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { Container } from '@/components/patterns/container';
import { DestravamentoWorkspace } from '@/components/features/vss';
import { db } from '@/server/db/client';
import { vss_destravamentos } from '@/server/db/schema';
import { requireUser } from '@/server/services/session';

export const metadata: Metadata = {
  title: 'Workspace',
  robots: { index: false, follow: false },
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function DestravamentoPage({ params }: PageProps) {
  const { slug } = await params;
  const user = await requireUser(`/app/destravamento/${slug}`);

  // Pre-check existência do slug — workspace component re-busca o detalhe
  // mas precisamos rodar `notFound()` no nível da page se slug inválido.
  const [exists] = await db
    .select({ id: vss_destravamentos.id })
    .from(vss_destravamentos)
    .where(eq(vss_destravamentos.slug, slug))
    .limit(1);

  if (!exists) {
    notFound();
  }

  return (
    <section className="section">
      <Container size="xl">
        <DestravamentoWorkspace userId={user.id} slug={slug} />
      </Container>
    </section>
  );
}
