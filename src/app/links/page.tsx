import type { Metadata } from 'next';
import Link from 'next/link';
import { contactInfo, getWhatsAppLink } from '@/lib/contact';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Links — Joel Burigo',
  description:
    'Todos os canais oficiais de Joel Burigo · criador dos 6Ps das Vendas Escaláveis',
  robots: { index: false, follow: false },
};

const links = [
  {
    kicker: '// DIAGNÓSTICO',
    title: 'DIAGNÓSTICO 6PS · GRÁTIS',
    body: '10 min · descobre onde teu sistema trava',
    href: '/diagnostico?utm_source=linktree&utm_medium=social&utm_campaign=diagnostico',
    featured: true,
  },
  {
    kicker: '// VSS',
    title: 'VENDAS SEM SEGREDOS',
    body: 'DIY perpétuo · 90 dias · R$ 1.997',
    href: '/vendas-sem-segredos?utm_source=linktree&utm_medium=social&utm_campaign=vss',
    featured: true,
  },
  {
    kicker: '// ADVISORY',
    title: 'ADVISORY · 1:1 COMIGO',
    body: 'Sessão · Sprint · Conselho',
    href: '/advisory?utm_source=linktree&utm_medium=social&utm_campaign=advisory',
  },
  {
    kicker: '// YOUTUBE',
    title: 'YOUTUBE · CONTEÚDO COMPLETO',
    body: 'Playlists e aulas gratuitas',
    href: `${contactInfo.social.youtube.url}?utm_source=linktree&utm_medium=social&utm_campaign=youtube`,
    external: true,
  },
  {
    kicker: '// LINKEDIN',
    title: 'LINKEDIN · B2B',
    body: 'Artigos e reflexões semanais',
    href: contactInfo.social.linkedin.url,
    external: true,
  },
  {
    kicker: '// INSTAGRAM',
    title: 'INSTAGRAM · @JOELBURIGO',
    body: 'Bastidor + posts de execução',
    href: 'https://instagram.com/joelburigo',
    external: true,
  },
  {
    kicker: '// WHATSAPP',
    title: 'FALAR COMIGO',
    body: 'Resposta pessoal · direto do Joel',
    href: getWhatsAppLink('Oi Joel, vim pelo link nas redes'),
    external: true,
  },
  {
    kicker: '// BLOG',
    title: 'BLOG · +50 ARTIGOS',
    body: 'Framework, cases, execução',
    href: '/blog?utm_source=linktree&utm_medium=social&utm_campaign=blog',
  },
];

export default function LinksPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-ink">
      <div className="grid-overlay" />

      <div className="relative z-10 flex items-center justify-between border-b border-[var(--jb-hair)] px-5 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-fg-muted">
        <div className="flex items-center gap-3">
          <span className="dot-live" />
          <span>SYS ONLINE</span>
          <span className="text-[var(--jb-hair-strong)] hidden sm:inline">·</span>
          <span className="hidden sm:inline">FLORIANÓPOLIS/SC</span>
        </div>
        <div>JB_LINKS v3.0</div>
      </div>

      <div className="relative z-10 mx-auto max-w-xl px-5 py-12 md:py-16">
        <header className="mb-10 text-center">
          <div className="mx-auto mb-6 inline-flex h-24 w-24 items-center justify-center border border-[var(--jb-fire-border)] bg-ink-2">
            <span className="font-display text-2xl tracking-tight">
              <span className="text-cream">JB</span>
            </span>
          </div>

          <div className="kicker mb-4">// JOEL_BURIGO · 17+ ANOS · 140+ MPES</div>
          <h1 className="heading-1 mb-3 text-cream">
            JOEL<span className="text-fire">|</span>BURIGO
          </h1>
          <p className="font-sans text-fg-2">
            Vendas Escaláveis pra MPE.
            <br />
            Framework 6Ps. Zero fórmula mágica.
          </p>
        </header>

        <div className="mb-10 grid grid-cols-3 gap-px border border-[var(--jb-hair)] bg-[var(--jb-hair)]">
          {[
            { num: '17+', label: 'anos' },
            { num: '~R$1BI', label: 'estruturado' },
            { num: '140+', label: 'clientes' },
          ].map((s) => (
            <div key={s.label} className="bg-ink-2 p-4 text-center">
              <div className="font-display text-xl text-acid">{s.num}</div>
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-fg-muted">
                {s.label}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          {links.map((link) => {
            const isInternal = !link.external;
            const Tag = isInternal ? Link : 'a';
            return (
              <Tag
                key={link.title}
                href={link.href}
                {...(link.external
                  ? { target: '_blank', rel: 'noopener noreferrer' }
                  : {})}
                className={cn(
                  'group block border bg-ink-2 p-5 transition-all duration-[180ms] hover:-translate-x-[2px] hover:-translate-y-[2px]',
                  link.featured
                    ? 'border-[var(--jb-acid-border)] hover:shadow-[6px_6px_0_var(--jb-acid)] hover:border-acid'
                    : 'border-[var(--jb-hair)] hover:shadow-[6px_6px_0_var(--jb-fire)] hover:border-fire'
                )}
                style={
                  link.featured
                    ? {
                        background:
                          'linear-gradient(180deg, rgba(198,255,0,0.06), var(--jb-ink-2))',
                      }
                    : undefined
                }
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div
                      className={cn(
                        'font-mono text-[11px] uppercase tracking-[0.22em]',
                        link.featured ? 'text-acid' : 'text-fg-muted'
                      )}
                    >
                      {link.kicker}
                    </div>
                    <div className="mt-1 font-display text-base text-cream">{link.title}</div>
                    <div className="mt-1 font-sans text-sm text-fg-3">{link.body}</div>
                  </div>
                  <span
                    className={cn(
                      'font-mono text-xl transition-transform group-hover:translate-x-1',
                      link.featured ? 'text-acid' : 'text-fg-3'
                    )}
                  >
                    →
                  </span>
                </div>
              </Tag>
            );
          })}
        </div>

        <footer className="mt-12 border-t border-[var(--jb-hair)] pt-8 text-center">
          <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.28em] text-fg-muted">
            <span className="text-acid">★</span>&nbsp;&nbsp;SISTEMA{' '}
            <span className="text-fire">&gt;</span> IMPROVISO
          </div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-fg-muted">
            © 2026 Joel Burigo · Growth Master Ltda
          </p>
        </footer>
      </div>
    </main>
  );
}
