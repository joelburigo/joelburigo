import type { Metadata } from 'next';
import { Container } from '@/components/patterns/container';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { ContatoForm } from '@/components/features/contato/contato-form';
import { contactInfo, getWhatsAppLink } from '@/lib/contact';

export const metadata: Metadata = {
  title: 'Contato | Joel Burigo',
  description: 'Fala direto comigo. Respondo pessoalmente · sem intermediários.',
  keywords: ['contato Joel Burigo', 'consultoria vendas', 'falar com Joel'],
  alternates: { canonical: '/contato' },
};

const channels = [
  {
    label: 'EMAIL',
    value: contactInfo.email.main,
    href: contactInfo.email.mailto,
  },
  {
    label: 'WHATSAPP',
    value: contactInfo.phone.display,
    href: getWhatsAppLink('Olá Joel, gostaria de saber mais sobre as soluções'),
  },
  {
    label: 'LOCALIZAÇÃO',
    value: 'Ribeirão da Ilha, Florianópolis/SC',
    href: null,
  },
  {
    label: 'ATENDIMENTO',
    value: contactInfo.businessHours.weekdays,
    href: null,
  },
];

const faqs = [
  {
    q: 'Qual o melhor caminho pra mim?',
    a: 'Quer o método completo pra implementar com autonomia? VSS. Precisa de acesso direto pra decisões estratégicas? Advisory.',
  },
  {
    q: 'Quanto tempo até ver resultado?',
    a: 'VSS: 90 dias você já tá rodando. Advisory: depende do formato e de onde tu tá hoje.',
  },
  {
    q: 'Trabalha com qualquer nicho?',
    a: 'Já estruturei vendas em 20+ nichos diferentes. A base dos 6Ps foi aplicada em 140+ empresas.',
  },
  {
    q: 'Tem garantia?',
    a: 'VSS tem 15 dias incondicional. Advisory tem garantia de satisfação na primeira sessão.',
  },
];

export default function ContatoPage() {
  return (
    <main className="relative overflow-hidden bg-ink">
      <div className="grid-overlay" />

      <Container className="relative z-10">
        <section className="pt-10 pb-16 md:pt-14 md:pb-24">
          <div className="mx-auto max-w-4xl">
            <Breadcrumbs
              items={[
                { label: 'Home', href: '/' },
                { label: 'Contato', href: '/contato' },
              ]}
              className="mb-5"
            />
            <div className="kicker mb-6">// CONTATO · DIRETO · SEM_INTERMEDIÁRIOS</div>
            <h1
              className="font-display text-cream"
              style={{
                fontSize: 'clamp(2.5rem, 8vw, 5rem)',
                fontWeight: 900,
                letterSpacing: '-0.045em',
                lineHeight: '0.92',
                textTransform: 'uppercase',
                margin: 0,
              }}
            >
              Quer <span className="text-fire">ligar a Máquina</span>?
            </h1>
            <p className="mt-6 max-w-2xl font-sans text-lg text-cream">
              Respondo pessoalmente · sem intermediários. Manda mensagem no canal que preferir.
            </p>
            <p className="mt-3 max-w-2xl font-mono text-[12px] uppercase tracking-[0.22em] text-fg-muted">
              <span className="text-acid">●</span>&nbsp; FLORIANÓPOLIS/SC &nbsp;·&nbsp; -27.59 /
              -48.55
            </p>
          </div>
        </section>

        {/* Canais */}
        <section className="pb-16">
          <div className="mx-auto max-w-5xl">
            <div className="kicker mb-6">// CANAIS · DISPONÍVEIS</div>
            <div className="grid gap-0 border border-[var(--jb-hair)] bg-ink-2 md:grid-cols-2 lg:grid-cols-4">
              {channels.map((c, i) => {
                const classes = ['border-[var(--jb-hair)]', 'p-6'];
                if (i < 3) classes.push('border-b md:border-b-0 md:border-r');
                if (i < 2) classes.push('md:border-r lg:border-r');
                if (i === 1) classes.push('md:border-r-0 lg:border-r');
                return (
                  <div key={c.label} className={classes.join(' ')}>
                    <div className="kicker mb-3">// {c.label}</div>
                    {c.href ? (
                      <a
                        href={c.href}
                        target={c.href.startsWith('http') ? '_blank' : undefined}
                        rel={c.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="block font-sans text-cream transition-colors hover:text-acid"
                      >
                        {c.value}
                      </a>
                    ) : (
                      <div className="font-sans text-cream">{c.value}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Form */}
        <section className="pb-16 md:pb-24">
          <div className="mx-auto max-w-4xl">
            <div className="kicker mb-6">// FORMULÁRIO · DIRETO</div>
            <div className="border border-[var(--jb-acid-border)] bg-ink-2 p-6 md:p-10">
              <h2 className="heading-2 mb-3 text-cream">Manda sua mensagem</h2>
              <p className="mb-8 font-sans text-fg-2">
                Conta teu desafio atual. Quanto mais detalhe, melhor a resposta.
              </p>
              <ContatoForm />
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="pb-16 md:pb-24">
          <div className="mx-auto max-w-3xl">
            <div className="kicker mb-6">// FAQ · DÚVIDAS_COMUNS</div>
            <h2 className="heading-2 mb-10 text-cream">Perguntas frequentes</h2>
            <div className="space-y-0 border border-[var(--jb-hair)] bg-ink-2">
              {faqs.map((faq, i) => (
                <div
                  key={faq.q}
                  className={`p-6 md:p-8 ${i > 0 ? 'border-t border-[var(--jb-hair)]' : ''}`}
                >
                  <h3 className="heading-4 mb-3 text-cream">{faq.q}</h3>
                  <p className="font-sans text-fg-2">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </Container>
    </main>
  );
}
