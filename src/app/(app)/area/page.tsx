import type { Metadata } from 'next';
import Link from 'next/link';
import { and, eq, isNull, or, gt, desc } from 'drizzle-orm';
import { Container } from '@/components/patterns/container';
import { Card, CardFeatured } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { db } from '@/server/db/client';
import { entitlements, products, type Entitlement, type Product } from '@/server/db/schema';
import { requireUser } from '@/server/services/session';

export const metadata: Metadata = {
  title: 'Sua área',
  robots: { index: false, follow: false },
};

interface EntitlementRow {
  entitlement: Entitlement;
  product: Product;
}

const DATE_FMT = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

function formatDate(d: Date | null | undefined): string {
  if (!d) return '—';
  try {
    return DATE_FMT.format(d);
  } catch {
    return '—';
  }
}

function ctaForProduct(slug: string): { href: string; label: string } | null {
  if (slug === 'vss') {
    return { href: '/destravamento', label: 'Acessar destravamentos' };
  }
  if (slug.startsWith('advisory')) {
    return {
      href: `/agendamento-sessao?product=${encodeURIComponent(slug)}`,
      label: 'Agendar sessão',
    };
  }
  return null;
}

export default async function AreaPage() {
  const user = await requireUser();

  const now = new Date();
  const rows: EntitlementRow[] = await db
    .select({ entitlement: entitlements, product: products })
    .from(entitlements)
    .innerJoin(products, eq(entitlements.product_id, products.id))
    .where(
      and(
        eq(entitlements.user_id, user.id),
        eq(entitlements.status, 'active'),
        isNull(entitlements.revoked_at),
        or(isNull(entitlements.ends_at), gt(entitlements.ends_at, now))
      )
    )
    .orderBy(desc(entitlements.starts_at));

  return (
    <section className="section">
      <Container size="xl" className="flex flex-col gap-10">
        <header className="flex flex-col gap-3">
          <span className="kicker text-acid">// SUA ÁREA</span>
          <h1 className="text-display-md text-cream">
            {user.name?.trim() ? user.name.split(' ')[0]?.toUpperCase() : 'BEM-VINDO'}
          </h1>
          <div className="text-fg-3 flex flex-col gap-1 font-mono text-[12px] tracking-[0.18em] uppercase sm:flex-row sm:items-center sm:gap-6">
            <span>{user.email}</span>
            <span aria-hidden className="hidden sm:inline">
              ·
            </span>
            <span>Última visita: {formatDate(user.last_login_at)}</span>
          </div>
        </header>

        {rows.length === 0 ? (
          <Card className="flex flex-col gap-4">
            <span className="kicker text-fire">// SEM ACESSO ATIVO</span>
            <h2 className="heading-3 text-cream">Você ainda não tem acesso a nada.</h2>
            <p className="body text-fg-2">
              Comprou via outro email? Use o mesmo aqui pra ver o que liberou. Caso contrário,
              comece pelo VSS.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button asChild variant="fire">
                <Link href="/vendas-sem-segredos">CONHECER VSS →</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/contato">FALAR COM JOEL</Link>
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {rows.map(({ entitlement, product }) => {
              const cta = ctaForProduct(product.slug);
              const isVss = product.slug === 'vss';
              const Wrapper = isVss ? CardFeatured : Card;
              return (
                <Wrapper key={entitlement.id} className="flex flex-col gap-5">
                  <div className="flex flex-col gap-2">
                    <span className="kicker text-acid">
                      // {product.slug.toUpperCase()}
                    </span>
                    <h3 className="heading-3 text-cream">{product.name}</h3>
                    <p className="text-fg-3 font-mono text-[11px] tracking-[0.18em] uppercase">
                      Liberado em {formatDate(entitlement.starts_at)}
                      {entitlement.ends_at ? ` · expira ${formatDate(entitlement.ends_at)}` : ''}
                    </p>
                  </div>

                  {cta ? (
                    <Button asChild variant={isVss ? 'fire' : 'primary'}>
                      <Link href={cta.href}>{cta.label} →</Link>
                    </Button>
                  ) : (
                    <p className="mono text-fg-muted">// CTA específica em breve</p>
                  )}
                </Wrapper>
              );
            })}
          </div>
        )}
      </Container>
    </section>
  );
}
