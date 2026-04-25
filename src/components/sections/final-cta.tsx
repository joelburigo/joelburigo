import Link from 'next/link';
import { Container } from '@/components/patterns/container';

interface FinalCtaProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  ctaLabel?: string;
  ctaHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}

export function FinalCta({
  title = (
    <>
      Sistema <span className="text-fire">&gt;</span> Improviso
    </>
  ),
  description = 'Se vendas viraram loteria no seu negócio, tem método pra tirar isso de vez. Começa pelo diagnóstico de 7 minutos.',
  ctaLabel = 'Fazer diagnóstico',
  ctaHref = '/diagnostico',
  secondaryLabel = 'Ver Vendas Sem Segredos',
  secondaryHref = '/vendas-sem-segredos',
}: FinalCtaProps) {
  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      <div className="grid-overlay" aria-hidden="true" />
      <Container className="relative">
        <div className="flex flex-col items-center gap-8 text-center">
          <h2 className="text-display-md md:text-display-lg max-w-4xl">{title}</h2>
          <p className="body-lg max-w-2xl text-fg-2">{description}</p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link href={ctaHref} className="btn-primary">
              {ctaLabel} <span className="font-mono">→</span>
            </Link>
            <Link href={secondaryHref} className="btn-secondary">
              {secondaryLabel}
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
