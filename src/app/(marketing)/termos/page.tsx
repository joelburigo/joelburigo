import type { Metadata } from 'next';
import { Container } from '@/components/patterns/container';
import { contactInfo } from '@/lib/contact';

export const metadata: Metadata = {
  title: 'Termos de Uso',
  description: 'Condições de uso dos produtos Joel Burigo — VSS e Advisory.',
};

export default function TermosPage() {
  return (
    <section className="section">
      <Container size="md" className="prose prose-invert flex flex-col gap-6">
        <span className="kicker">// TERMOS DE USO</span>
        <h1 className="text-display-sm">Termos de Uso</h1>
        <p className="body text-fg-2">
          Ao adquirir VSS ou Advisory você concorda com: conteúdo de uso pessoal (não
          redistribuível), garantia incondicional de 15 dias para reembolso (processado após revisão
          do Joel), e que resultados dependem de aplicação consistente.
        </p>
        <p className="body-sm text-fg-3">
          Texto completo da migração pendente. Dúvidas:{' '}
          <a href={contactInfo.email.mailto} className="text-acid underline">
            {contactInfo.email.main}
          </a>
          .
        </p>
        <p className="mono text-fg-muted">
          // Growth Master LTDA · CNPJ {contactInfo.company.cnpj}
        </p>
      </Container>
    </section>
  );
}
