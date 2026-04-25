import type { Metadata } from 'next';
import Link from 'next/link';
import { Hero } from '@/components/sections/hero';
import { ProofBar } from '@/components/sections/proof-bar';
import { Framework6Ps } from '@/components/sections/framework-6ps';
import { FinalCta } from '@/components/sections/final-cta';
import { Container } from '@/components/patterns/container';
import { SectionHeader } from '@/components/patterns/section-header';
import { CardFeatured } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { PRODUCTS } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Vendas Sem Segredos (VSS) — Sistema DIY com copiloto IA',
  description:
    'Playbook completo dos 6Ps das Vendas Escaláveis. Aplicação guiada por copiloto IA. 15 módulos, 66 destravamentos, mentorias ao vivo mensais. Acesso vitalício R$ 1.997.',
  alternates: { canonical: '/vendas-sem-segredos' },
};

export default function VssPage() {
  return (
    <>
      <Hero
        kicker="// VSS · ACESSO VITALÍCIO"
        title={
          <>
            Vendas Sem Segredos: você aplica, o{' '}
            <span className="text-acid">copiloto guia</span>.
          </>
        }
        subtitle="Playbook completo dos 6Ps com IA que conhece sua empresa. 15 módulos, 66 destravamentos, mentoria ao vivo mensal comigo. Sem prazo pra consumir."
        ctaPrimary={{ label: 'Liga a Máquina', href: '#investimento' }}
        ctaSecondary={{ label: 'Ver o que inclui', href: '#inclui' }}
        note={`${formatCurrency(PRODUCTS.vss.price_cents)} à vista ou parcelado · acesso vitalício`}
      />

      <ProofBar />

      <section id="inclui" className="section border-b border-[var(--jb-hair)]">
        <Container>
          <SectionHeader
            kicker="// o que inclui"
            title={
              <>
                Tudo que você precisa pra aplicar <span className="text-fire">desde o dia 1</span>
              </>
            }
          />
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                code: '01',
                title: 'Onboarding guiado',
                description:
                  'Primeira sessão com o copiloto mapeia sua empresa, oferta, operação, números e gargalo principal. 10-15 min.',
              },
              {
                code: '02',
                title: '66 destravamentos',
                description:
                  'Cada ponto do playbook vira uma sessão interativa com o agente. Ele pergunta, desafia, ajuda a gerar o artifact.',
              },
              {
                code: '03',
                title: 'Artifacts entregáveis',
                description:
                  'ICP, cadência, scripts, plano 90d — gerados com você e exportáveis (MD/PDF).',
              },
              {
                code: '04',
                title: 'Mentoria ao vivo mensal',
                description:
                  'Live mensal comigo (Joel) com replay automático. Casos reais dos alunos.',
              },
              {
                code: '05',
                title: 'Consolidação por fase',
                description:
                  'Ao terminar cada fase, o agente junta seus artifacts num "Plano da Fase" exportável.',
              },
              {
                code: '06',
                title: 'Growth CRM (12 meses)',
                description:
                  'Acesso ao Growth CRM incluso por 12 meses pra colocar o playbook em prática sem atrito.',
              },
            ].map((item) => (
              <CardFeatured key={item.code} className="flex flex-col gap-3">
                <span className="kicker">// {item.code}</span>
                <h3 className="heading-3">{item.title}</h3>
                <p className="body-sm text-fg-2">{item.description}</p>
              </CardFeatured>
            ))}
          </div>
        </Container>
      </section>

      <Framework6Ps />

      <section id="investimento" className="section border-b border-[var(--jb-hair)] bg-ink-2">
        <Container>
          <SectionHeader
            kicker="// investimento"
            title={
              <>
                <span className="text-acid">{formatCurrency(PRODUCTS.vss.price_cents)}</span> — acesso vitalício.
              </>
            }
            description="Parcelável no cartão BR via Mercado Pago. PIX à vista. Garantia incondicional de 15 dias."
          />
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <CardFeatured className="flex flex-col gap-4">
              <span className="kicker">// acesso</span>
              <h3 className="heading-2">Tudo que está acima</h3>
              <ul className="mt-2 flex flex-col gap-2 text-fg-2">
                <li>→ 66 destravamentos com copiloto</li>
                <li>→ Mentoria ao vivo mensal (com replay)</li>
                <li>→ Growth CRM 12 meses</li>
                <li>→ Acesso vitalício, sem prazo</li>
                <li>→ Atualizações do playbook sem custo</li>
              </ul>
            </CardFeatured>
            <CardFeatured className="flex flex-col gap-4">
              <span className="kicker">// como funciona o pagamento</span>
              <ul className="flex flex-col gap-3 text-fg-2">
                <li>
                  <strong className="text-cream">Parcelado:</strong> até 12x no cartão via Mercado Pago.
                </li>
                <li>
                  <strong className="text-cream">PIX:</strong> aprovação instantânea.
                </li>
                <li>
                  <strong className="text-cream">Boleto:</strong> disponível (prazo 3 dias úteis).
                </li>
                <li>
                  <strong className="text-cream">Garantia:</strong> 15 dias — devolução sem perguntas.
                </li>
              </ul>
              <Link href="/api/payments/checkout?product=vss" className="btn-primary mt-4 w-fit">
                Liga a Máquina <span className="font-mono">→</span>
              </Link>
            </CardFeatured>
          </div>
        </Container>
      </section>

      <FinalCta
        title={
          <>
            Sistema <span className="text-fire">&gt;</span> Improviso
          </>
        }
        description="15 dias de garantia incondicional. Se não servir, devolvemos sem perguntas."
        ctaLabel="Começar agora"
        ctaHref="/api/payments/checkout?product=vss"
        secondaryLabel="Falar com Joel"
        secondaryHref="/contato"
      />
    </>
  );
}
