import Link from 'next/link';
import { Container } from '@/components/patterns/container';
import { Logo } from '@/components/ui/logo';
import { contactInfo } from '@/lib/contact';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t border-[var(--jb-hair)] bg-ink text-cream">
      <div className="grid-overlay" aria-hidden="true" />
      <Container>
        {/* Kicker + meta */}
        <div className="relative flex items-center justify-between border-b border-[var(--jb-hair)] py-4 font-mono text-[11px] uppercase tracking-[0.22em] text-fg-muted">
          <div className="flex items-center gap-3">
            <span className="dot-live" />
            <span className="text-acid">// SYS_FOOTER</span>
          </div>
          <span className="hidden md:inline">EST. 2004</span>
        </div>

        {/* Grid 4 colunas */}
        <div className="relative grid grid-cols-1 gap-12 pt-20 pb-8 md:grid-cols-2 md:gap-x-12 md:gap-y-12 lg:grid-cols-4 lg:gap-x-12">
          {/* Col 1 — Marca */}
          <div className="lg:pr-6">
            <Link href="/" className="inline-block" aria-label="Joel Burigo · Home">
              <Logo size="lg" />
            </Link>
            <p className="mt-7 font-display text-xl uppercase leading-[0.95] tracking-[-0.03em] text-cream">
              Sistema <span className="text-fire">&gt;</span> Improviso
            </p>
            <p className="mt-7 max-w-[320px] font-sans text-[13px] leading-[1.45] text-fg-3">
              Framework 6Ps das Vendas Escaláveis. 140+ MPEs · 17+ anos · ~R$ 1 bilhão em vendas estruturadas.
            </p>
          </div>

          {/* Col 2 — Produtos */}
          <div>
            <h3 className="mb-4 font-mono text-[11px] uppercase tracking-[0.22em] text-acid">// Produtos</h3>
            <ul className="font-mono text-[13px] uppercase tracking-[0.22em]">
              <li>
                <Link
                  href="/vendas-sem-segredos"
                  className="jb-foot-link group block py-1.5 text-cream transition-colors duration-[180ms] hover:text-acid"
                >
                  <span>VSS</span>
                  <span className="ml-2 font-mono text-[10px] normal-case tracking-[0.18em] text-fg-muted">
                    vendas sem segredos
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  href="/advisory"
                  className="jb-foot-link group block py-1.5 text-cream transition-colors duration-[180ms] hover:text-acid"
                >
                  <span>Advisory</span>
                  <span className="ml-2 font-mono text-[10px] normal-case tracking-[0.18em] text-fg-muted">
                    1:1 com Joel
                  </span>
                </Link>
              </li>
              <li className="pt-2">
                <Link
                  href="/diagnostico"
                  className="jb-foot-link inline-flex items-center gap-2 py-1.5 text-fire transition-colors duration-[180ms] hover:text-acid"
                >
                  <span>Diagnóstico</span>
                  <span className="font-mono">→</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3 — Recursos */}
          <div>
            <h3 className="mb-4 font-mono text-[11px] uppercase tracking-[0.22em] text-acid">// Recursos</h3>
            <ul className="font-mono text-[13px] uppercase tracking-[0.22em]">
              {[
                { href: '/blog', label: 'Blog' },
                { href: '/cases', label: 'Cases' },
                { href: '/sobre', label: 'Sobre' },
                { href: '/contato', label: 'Contato' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="jb-foot-link block py-1.5 text-cream transition-colors duration-[180ms] hover:text-acid"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 — Social */}
          <div>
            <h3 className="mb-4 font-mono text-[11px] uppercase tracking-[0.22em] text-acid">// Conexão</h3>
            <ul className="font-mono text-[13px] uppercase tracking-[0.22em]">
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
                    className="jb-foot-link inline-flex items-center gap-2 py-1.5 text-cream transition-colors duration-[180ms] hover:text-acid"
                  >
                    <span>{link.label}</span>
                    <span className="font-mono text-fg-muted">→</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Aviso legal colapsável */}
        <div className="relative border-t border-[var(--jb-hair)] py-8">
          <details className="group mx-auto max-w-4xl">
            <summary className="flex cursor-pointer list-none items-center justify-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-fg-muted transition-colors duration-[180ms] hover:text-acid">
              <span>// Aviso legal e isenção de responsabilidade</span>
              <span className="text-acid transition-transform duration-[180ms] group-open:rotate-180">▼</span>
            </summary>
            <div className="mt-8 space-y-6 font-sans text-[12px] leading-[1.65] text-fg-muted">
              <div>
                <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.22em] text-fg-3">
                  Resultados e desempenho
                </p>
                <p>
                  As informações, estratégias e metodologias apresentadas neste site são baseadas na
                  experiência de Joel Burigo e sua equipe ao longo de 17+ anos com empresas B2B e B2C.
                  Todo o conteúdo é fornecido exclusivamente para fins educacionais.
                </p>
              </div>
              <div>
                <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.22em] text-fg-3">
                  Sem garantia de resultados
                </p>
                <p>
                  Os cases e resultados apresentados não constituem garantia de que você alcançará os
                  mesmos resultados. Cada negócio é único e o desempenho depende de dedicação, contexto
                  de mercado, recursos e execução. Resultados passados não garantem resultados futuros.
                </p>
              </div>
              <div>
                <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.22em] text-fg-3">
                  Esforço requerido
                </p>
                <p>
                  O sucesso requer trabalho consistente, disciplina e correta implementação. Sistema
                  &gt; Improviso — não existe fórmula mágica.
                </p>
              </div>
              <div>
                <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.22em] text-fg-3">
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
          <div className="flex flex-col gap-3 font-mono text-[10px] uppercase tracking-[0.22em] text-fg-muted md:flex-row md:items-center md:justify-between">
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
              <Link href="/privacidade" className="transition-colors duration-[180ms] hover:text-acid">
                Privacidade
              </Link>
              <Link href="/termos" className="transition-colors duration-[180ms] hover:text-acid">
                Termos
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}
