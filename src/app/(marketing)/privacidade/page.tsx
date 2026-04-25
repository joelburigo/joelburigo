import type { Metadata } from 'next';
import { Container } from '@/components/patterns/container';
import { contactInfo } from '@/lib/contact';

export const metadata: Metadata = {
  title: 'Política de Privacidade',
  description: 'Como a Growth Master LTDA coleta, usa e protege seus dados.',
};

export default function PrivacidadePage() {
  return (
    <section className="section">
      <Container size="md" className="prose prose-invert flex flex-col gap-6">
        <span className="kicker">// PRIVACIDADE</span>
        <h1 className="text-display-sm">Política de Privacidade</h1>
        <p className="body text-fg-2">
          Esta página está sendo migrada para a nova plataforma. Enquanto isso, conteúdo completo
          disponível mediante solicitação em{' '}
          <a href={contactInfo.email.mailto} className="text-acid underline">
            {contactInfo.email.main}
          </a>
          .
        </p>
        <p className="body-sm text-fg-3">
          Coletamos apenas dados necessários pro atendimento (nome, email, empresa, telefone quando
          informado). Não vendemos dados. Compartilhamos apenas com ferramentas de operação (Brevo,
          Mercado Pago, Google Analytics, Meta Ads). Você pode solicitar exclusão a qualquer momento.
        </p>
        <p className="mono text-fg-muted">
          // Growth Master LTDA · CNPJ {contactInfo.company.cnpj}
        </p>
      </Container>
    </section>
  );
}
