import type { Metadata } from 'next';
import Link from 'next/link';
import { Hero } from '@/components/sections/hero';
import { FinalCta } from '@/components/sections/final-cta';
import { Container } from '@/components/patterns/container';
import { SectionHeader } from '@/components/patterns/section-header';
import { CardFeatured } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { PRODUCTS } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Advisory Strategic — Conselho executivo 1:1 com Joel Burigo',
  description:
    'Sessão avulsa, Sprint de 30 dias ou Conselho Executivo mensal. Para MPEs com urgência e contexto que exige pensamento sob medida.',
  alternates: { canonical: '/advisory' },
};

const modalidades = [
  {
    id: 'advisory_sessao' as const,
    title: 'Sessão Avulsa',
    priceCents: PRODUCTS.advisorySession.price_cents,
    summary: '90 min de consultoria 1:1 com decisão documentada e próximos passos claros.',
    bullets: [
      'Diagnóstico focado em 1 gargalo específico',
      'Plano de ação pós-sessão em PDF',
      'Follow-up em 7 dias por texto',
      'Agendamento self-service via Cal.com',
    ],
    cta: 'Comprar sessão',
    href: '/api/payments/checkout?product=advisory_sessao',
  },
  {
    id: 'advisory_sprint' as const,
    title: 'Sprint 30 Dias',
    priceCents: PRODUCTS.advisorySprint.price_cents,
    summary: '4 sessões em 30 dias + acompanhamento direto comigo pra destravar 1 projeto comercial.',
    bullets: [
      '4 sessões de 90 min (semanais)',
      'Acesso direto via WhatsApp entre sessões',
      'Revisão de artefatos (scripts, playbook, pricing)',
      'Entrega final: plano 90d documentado',
    ],
    cta: 'Comprar sprint',
    href: '/api/payments/checkout?product=advisory_sprint',
    featured: true,
  },
  {
    id: 'advisory_conselho' as const,
    title: 'Conselho Executivo',
    priceCents: PRODUCTS.advisoryCouncil.price_cents,
    suffix: '/mês',
    summary:
      'Continuidade mensal. Acompanho a operação, reviso decisões estratégicas, participo de comitês.',
    bullets: [
      '2 sessões mensais de 90 min',
      'Review de OKRs e forecast comercial',
      'Acesso prioritário via WhatsApp',
      'Cobrança manual (PIX/boleto + NF) — Joel qualifica',
    ],
    cta: 'Aplicar ao Conselho',
    href: '/contato?tipo=advisory-conselho',
    featured: false,
  },
];

export default function AdvisoryPage() {
  return (
    <>
      <Hero
        kicker="// ADVISORY · 1:1 COM JOEL"
        title={
          <>
            Pensamento <span className="text-acid">sob medida</span>, quando o momento não aceita manual.
          </>
        }
        subtitle="Advisory é pra MPE que já tem operação rodando mas precisa destravar uma decisão específica com um 3º olhar. Não substitui o VSS — complementa."
        ctaPrimary={{ label: 'Falar agora', href: '/contato' }}
        ctaSecondary={{ label: 'Ver modalidades', href: '#modalidades' }}
      />

      <section id="modalidades" className="section border-b border-[var(--jb-hair)]">
        <Container>
          <SectionHeader
            kicker="// modalidades"
            title="Três formatos, mesmo padrão de rigor"
            description="Escolha pela densidade — 1 sessão, 30 dias ou acompanhamento contínuo."
          />
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {modalidades.map((m) => (
              <CardFeatured
                key={m.id}
                className={m.featured ? 'ring-1 ring-fire shadow-[6px_6px_0_var(--jb-fire)]' : ''}
              >
                <div className="flex flex-col gap-4">
                  <span className="kicker">// {m.id.replace('advisory_', '').toUpperCase()}</span>
                  <h3 className="heading-2">{m.title}</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-4xl font-black text-acid">
                      {formatCurrency(m.priceCents)}
                    </span>
                    {'suffix' in m && m.suffix && (
                      <span className="mono text-fg-3">{m.suffix}</span>
                    )}
                  </div>
                  <p className="body text-fg-2">{m.summary}</p>
                  <ul className="flex flex-col gap-2 text-fg-2">
                    {m.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-2">
                        <span className="text-acid">→</span>
                        <span className="body-sm">{b}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href={m.href} className="btn-primary mt-4 w-fit">
                    {m.cta} <span className="font-mono">→</span>
                  </Link>
                </div>
              </CardFeatured>
            ))}
          </div>
        </Container>
      </section>

      <FinalCta
        title={<>Advisory é pro caso de <span className="text-fire">urgência real</span>.</>}
        description="Se a decisão pode esperar 30 dias, VSS resolve. Se não pode, me liga."
        ctaLabel="Falar com Joel"
        ctaHref="/contato"
        secondaryLabel="Ver VSS"
        secondaryHref="/vendas-sem-segredos"
      />
    </>
  );
}
