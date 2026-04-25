import Link from 'next/link';
import { Container } from '@/components/patterns/container';
import { cn } from '@/lib/utils';
import s from './final-cta-section.module.css';

export function FinalCtaSection() {
  return (
    <section className={cn(s.finalCtaSection, 'relative overflow-hidden')}>
      <div className={s.fctaGridOverlay} />

      <Container className="relative z-10">
        <div className={s.fctaWrap}>
          <div className={cn('mono', s.fctaKicker)}>
            // PRÓXIMO PASSO · DIAGNÓSTICO 10 MIN
          </div>

          <h2 className={s.fctaTitle}>
            LIGAR A
            <br />
            <span className={s.fctaTitleStroke}>MÁQUINA?</span>
          </h2>

          <p className={s.fctaLede}>
            Diagnóstico grátis dos 6Ps. 10 minutos. Descobre qual P tá travando o crescimento — e
            qual é a próxima ação prioritária. <strong>Sem enrolação.</strong>
          </p>

          <div className={s.fctaCtas}>
            <Link href="/diagnostico" className={s.fctaBtnPrimary} prefetch>
              <span>Fazer diagnóstico agora</span>
              <span aria-hidden="true">→</span>
            </Link>
            <Link href="/vendas-sem-segredos" className={s.fctaBtnSecondary} prefetch>
              <span>Ou ver o VSS</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          <div className={s.fctaSignature}>
            <span>BORA PRA CIMA.</span>
            <span className={s.fctaSep}>·</span>
            <span>LET&apos;S GROW.</span>
          </div>
        </div>
      </Container>
    </section>
  );
}
