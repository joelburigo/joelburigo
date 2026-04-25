import Link from 'next/link';
import { Container } from '@/components/patterns/container';
import { SectionHeader } from '@/components/patterns/section-header';
import { CardFeatured } from '@/components/ui/card';

const pathways = [
  {
    kicker: '// DIY · R$ 1.997',
    title: 'Vendas Sem Segredos',
    description:
      'Playbook completo dos 6Ps com copiloto IA. Você aplica, o agente ajuda. 15 módulos, 66 destravamentos, mentorias ao vivo mensais.',
    href: '/vendas-sem-segredos',
    cta: 'Conhecer VSS',
  },
  {
    kicker: '// 1:1 · POR AVALIAÇÃO',
    title: 'Advisory Strategic',
    description:
      'Conselho executivo 1:1 com Joel. Sessão avulsa, sprint 30 dias ou Conselho mensal. Para MPEs com urgência e contexto que exige pensamento sob medida.',
    href: '/advisory',
    cta: 'Aplicar Advisory',
  },
];

export function Pathways() {
  return (
    <section className="section border-b border-[var(--jb-hair)]">
      <Container>
        <SectionHeader
          kicker="// escolha seu caminho"
          title={
            <>
              Dois jeitos de atacar <span className="text-fire">o mesmo sistema</span>
            </>
          }
          description="Mesma metodologia, entrega diferente. Você escolhe a densidade de acompanhamento."
        />
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {pathways.map((path) => (
            <CardFeatured key={path.href} className="flex flex-col gap-5">
              <span className="kicker">{path.kicker}</span>
              <h3 className="text-display-sm">{path.title}</h3>
              <p className="body text-fg-2">{path.description}</p>
              <Link
                href={path.href}
                className="mt-auto inline-flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.22em] text-acid hover:underline"
              >
                {path.cta} <span>→</span>
              </Link>
            </CardFeatured>
          ))}
        </div>
      </Container>
    </section>
  );
}
