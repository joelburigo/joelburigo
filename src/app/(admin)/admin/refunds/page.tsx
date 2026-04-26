import type { Metadata } from 'next';
import { Container } from '@/components/patterns/container';
import { listRefundRequests } from '@/server/services/admin';
import { RefundCard } from '@/components/features/admin/refund-card';

export const metadata: Metadata = {
  title: 'Admin · Reembolsos',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function AdminRefundsPage() {
  const refunds = await listRefundRequests();
  const pending = refunds.filter((r) => r.refund.status === 'pending');
  const others = refunds.filter((r) => r.refund.status !== 'pending');

  return (
    <Container size="xl" className="flex flex-col gap-8 py-2">
      <div>
        <span className="kicker text-fire">// REFUNDS</span>
        <h1 className="heading-2 text-cream mt-2">Reembolsos</h1>
        <p className="text-fg-3 mt-2 text-sm">
          15d incondicional — Joel revisa cada pedido. Aprovação real no gateway é TODO Sprint 4 v2.
        </p>
      </div>

      <section>
        <h2 className="text-fg-3 mb-4 font-mono text-[11px] tracking-[0.22em] uppercase">
          Pendentes ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <p className="text-fg-muted text-xs">Nenhum pedido pendente.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {pending.map((r) => (
              <RefundCard
                key={r.refund.id}
                data={{
                  id: r.refund.id,
                  status: r.refund.status,
                  reason: r.refund.reason,
                  adminNote: r.refund.admin_note,
                  createdAt: r.refund.created_at.toISOString(),
                  user: r.user,
                  purchase: r.purchase
                    ? {
                        productName: r.purchase.productName,
                        productSlug: r.purchase.productSlug,
                        amountCents: r.purchase.amountCents,
                        currency: r.purchase.currency,
                        paidAt: r.purchase.paidAt ? r.purchase.paidAt.toISOString() : null,
                      }
                    : null,
                }}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-fg-3 mb-4 font-mono text-[11px] tracking-[0.22em] uppercase">
          Histórico ({others.length})
        </h2>
        {others.length === 0 ? (
          <p className="text-fg-muted text-xs">Sem histórico.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {others.map((r) => (
              <RefundCard
                key={r.refund.id}
                data={{
                  id: r.refund.id,
                  status: r.refund.status,
                  reason: r.refund.reason,
                  adminNote: r.refund.admin_note,
                  createdAt: r.refund.created_at.toISOString(),
                  user: r.user,
                  purchase: r.purchase
                    ? {
                        productName: r.purchase.productName,
                        productSlug: r.purchase.productSlug,
                        amountCents: r.purchase.amountCents,
                        currency: r.purchase.currency,
                        paidAt: r.purchase.paidAt ? r.purchase.paidAt.toISOString() : null,
                      }
                    : null,
                }}
              />
            ))}
          </div>
        )}
      </section>
    </Container>
  );
}
