import Link from 'next/link';
import { Container } from '@/components/patterns/container';
import { Logo } from '@/components/ui/logo';
import { contactInfo } from '@/lib/contact';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-ink text-cream relative border-t border-[var(--jb-hair)]">
      <div className="grid-overlay" aria-hidden="true" />
      <Container>
        {/* Kicker + meta */}
        <div className="text-fg-muted relative flex items-center justify-between border-b border-[var(--jb-hair)] py-4 font-mono text-[11px] tracking-[0.22em] uppercase">
          <div className="flex items-center gap-3">
            <span className="dot-live" />
            <span className="text-acid">// SYS_FOOTER</span>
          </div>
          <span className="hidden md:inline">EST. 2008</span>
        </div>

        {/* Grid 4 colunas */}
        <div className="relative grid grid-cols-1 gap-12 pt-20 pb-8 md:grid-cols-2 md:gap-x-12 md:gap-y-12 lg:grid-cols-4 lg:gap-x-12">
          {/* Col 1 — Marca */}
          <div className="lg:pr-6">
            <Link href="/" className="inline-block" aria-label="Joel Burigo · Home">
              <Logo size="lg" />
            </Link>
            <p className="font-display text-cream mt-7 text-xl leading-[0.95] tracking-[-0.03em] uppercase">
              Sistema <span className="text-fire">&gt;</span> Improviso
            </p>
            <p className="text-fg-3 mt-7 max-w-[320px] font-sans text-[13px] leading-[1.45]">
              Framework 6Ps das Vendas Escaláveis. 140+ MPEs · 17+ anos · ~R$ 1 bilhão em vendas
              estruturadas.
            </p>
          </div>

          {/* Col 2 — Produtos */}
          <div>
            <h3 className="text-acid mb-4 font-mono text-[11px] tracking-[0.22em] uppercase">
              // Produtos
            </h3>
            <ul className="font-mono text-[13px] tracking-[0.22em] uppercase">
              <li>
                <Link
                  href="/vendas-sem-segredos"
                  className="jb-foot-link group text-cream hover:text-acid block py-1.5 transition-colors duration-[180ms]"
                >
                  <span>VSS</span>
                  <span className="text-fg-muted ml-2 font-mono text-[10px] tracking-[0.18em] normal-case">
                    vendas sem segredos
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  href="/advisory"
                  className="jb-foot-link group text-cream hover:text-acid block py-1.5 transition-colors duration-[180ms]"
                >
                  <span>Advisory</span>
                  <span className="text-fg-muted ml-2 font-mono text-[10px] tracking-[0.18em] normal-case">
                    1:1 com Joel
                  </span>
                </Link>
              </li>
              <li className="pt-2">
                <Link
                  href="/diagnostico"
                  className="jb-foot-link text-fire hover:text-acid inline-flex items-center gap-2 py-1.5 transition-colors duration-[180ms]"
                >
                  <span>Diagnóstico</span>
                  <span className="font-mono">→</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3 — Recursos */}
          <div>
            <h3 className="text-acid mb-4 font-mono text-[11px] tracking-[0.22em] uppercase">
              // Recursos
            </h3>
            <ul className="font-mono text-[13px] tracking-[0.22em] uppercase">
              {[
                { href: '/blog', label: 'Blog' },
                { href: '/cases', label: 'Cases' },
                { href: '/sobre', label: 'Sobre' },
                { href: '/contato', label: 'Contato' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="jb-foot-link text-cream hover:text-acid block py-1.5 transition-colors duration-[180ms]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 — Social */}
          <div>
            <h3 className="text-acid mb-4 font-mono text-[11px] tracking-[0.22em] uppercase">
              // Conexão
            </h3>
            <ul className="font-mono text-[13px] tracking-[0.22em] uppercase">
              {[
                { href: contactInfo.social.instagram.url, label: 'Instagram' },
                { href: contactInfo.social.linkedin.url, label: 'LinkedIn' },
                { href: contactInfo.social.youtube.url, label: 'YouTube' },
              ].map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="jb-foot-link text-cream hover:text-acid inline-flex items-center gap-2 py-1.5 transition-colors duration-[180ms]"
                  >
                    <span>{link.label}</span>
                    <span className="text-fg-muted font-mono">→</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Aviso legal colapsável */}
        <div className="relative border-t border-[var(--jb-hair)] py-8">
          <details className="group mx-auto max-w-4xl">
            <summary className="text-fg-muted hover:text-acid flex cursor-pointer list-none items-center justify-center gap-2 font-mono text-[11px] tracking-[0.22em] uppercase transition-colors duration-[180ms]">
              <span>// Aviso legal e isenção de responsabilidade</span>
              <span className="text-acid transition-transform duration-[180ms] group-open:rotate-180">
                ▼
              </span>
            </summary>
            <div className="text-fg-muted mt-8 space-y-6 font-sans text-[12px] leading-[1.65]">
              <div>
                <p className="text-fg-3 mb-2 font-mono text-[11px] tracking-[0.22em] uppercase">
                  Resultados e desempenho
                </p>
                <p>
                  As informações, estratégias e metodologias apresentadas neste site são baseadas na
                  experiência de Joel Burigo e sua equipe ao longo de 17+ anos com empresas B2B e
                  B2C. Todo o conteúdo é fornecido exclusivamente para fins educacionais.
                </p>
              </div>
              <div>
                <p className="text-fg-3 mb-2 font-mono text-[11px] tracking-[0.22em] uppercase">
                  Sem garantia de resultados
                </p>
                <p>
                  Os cases e resultados apresentados não constituem garantia de que você alcançará
                  os mesmos resultados. Cada negócio é único e o desempenho depende de dedicação,
                  contexto de mercado, recursos e execução. Resultados passados não garantem
                  resultados futuros.
                </p>
              </div>
              <div>
                <p className="text-fg-3 mb-2 font-mono text-[11px] tracking-[0.22em] uppercase">
                  Esforço requerido
                </p>
                <p>
                  O sucesso requer trabalho consistente, disciplina e correta implementação. Sistema
                  &gt; Improviso — não existe fórmula mágica.
                </p>
              </div>
              <div>
                <p className="text-fg-3 mb-2 font-mono text-[11px] tracking-[0.22em] uppercase">
                  Responsabilidade
                </p>
                <p>
                  Ao utilizar este site e os serviços oferecidos, você é o único responsável pelos
                  resultados. Growth Master LTDA e Joel Burigo não se responsabilizam por perdas ou
                  prejuízos decorrentes da aplicação das informações fornecidas.
                </p>
              </div>
            </div>
          </details>
        </div>

        {/* Linha final */}
        <div className="relative border-t border-[var(--jb-hair)] py-6">
          <div className="text-fg-muted flex flex-col gap-3 font-mono text-[10px] tracking-[0.22em] uppercase md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>FLORIANÓPOLIS/SC</span>
              <span className="text-[var(--jb-hair-strong)]">·</span>
              <span className="text-acid">-27.59</span>
              <span className="text-[var(--jb-hair-strong)]">·</span>
              <span className="text-acid">-48.55</span>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>© {currentYear} Growth Master LTDA</span>
              <span className="text-[var(--jb-hair-strong)]">·</span>
              <span>CNPJ {contactInfo.company.cnpj}</span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <Link
                href="/privacidade"
                className="hover:text-acid transition-colors duration-[180ms]"
              >
                Privacidade
              </Link>
              <Link href="/termos" className="hover:text-acid transition-colors duration-[180ms]">
                Termos
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}
