import type { Metadata } from 'next';
import { Container } from '@/components/patterns/container';
import { contactInfo } from '@/lib/contact';

export const metadata: Metadata = {
  title: 'Termos de Uso',
  description:
    'Condições de uso dos produtos Joel Burigo — VSS (Vendas Sem Segredos) e Advisory (1:1).',
  alternates: { canonical: '/termos' },
};

const LAST_UPDATE = '25 de abril de 2026';

export default function TermosPage() {
  return (
    <main className="bg-ink relative overflow-hidden">
      <div className="grid-overlay" />
      <section className="section relative z-10">
        <Container size="md" className="flex flex-col gap-10">
          <header className="flex flex-col gap-4">
            <span className="kicker text-acid">// TERMOS DE USO</span>
            <h1 className="text-display-sm text-cream">Termos de Uso</h1>
            <p className="text-fg-3 font-mono text-[11px] tracking-[0.22em] uppercase">
              Última atualização: {LAST_UPDATE}
            </p>
          </header>

          <article className="prose prose-invert max-w-none prose-headings:font-display prose-headings:uppercase prose-headings:tracking-tight prose-headings:text-cream prose-p:text-fg-2 prose-p:leading-relaxed prose-strong:text-cream prose-a:text-acid prose-a:no-underline hover:prose-a:underline prose-li:text-fg-2 prose-li:marker:text-fire">
            <h2>1. Quem somos</h2>
            <p>
              <strong>{contactInfo.company.legalName}</strong>, CNPJ {contactInfo.company.cnpj},
              representada por Joel Burigo, com endereço comercial em Florianópolis/SC. Contato:{' '}
              <a href={contactInfo.email.mailto}>{contactInfo.email.main}</a>.
            </p>
            <p>
              Estes termos regem o uso dos produtos digitais e serviços de consultoria oferecidos
              em <a href={contactInfo.website.url}>{contactInfo.website.domain}</a>. Ao comprar ou
              acessar qualquer produto, você concorda integralmente com o que está aqui.
            </p>

            <h2>2. Objeto</h2>
            <p>Os produtos cobertos por este termo são:</p>
            <ul>
              <li>
                <strong>VSS — Vendas Sem Segredos:</strong> programa digital DIY de implementação
                dos 6Ps, com acesso vitalício ao conteúdo gravado, agente IA de execução e
                comunidade. Investimento R$ 1.997 (à vista ou parcelado).
              </li>
              <li>
                <strong>Advisory — Sessão Estratégica:</strong> encontro 1:1 de 90 minutos com
                Joel Burigo. R$ 997. Acesso single-shot.
              </li>
              <li>
                <strong>Advisory — Sprint 30 dias:</strong> 4 encontros 1:1 + acompanhamento por
                30 dias. R$ 7.500.
              </li>
              <li>
                <strong>Advisory — Conselho Executivo:</strong> mensalidade R$ 15.000 com agenda
                fixa de sessões e canal direto. Renovação mensal sob aceite mútuo.
              </li>
            </ul>

            <h2>3. Licença de uso</h2>
            <p>
              Todo conteúdo (vídeos, materiais, templates, transcrições, artifacts gerados por
              agente) é licenciado pra uso <strong>pessoal e intransferível</strong>. Você não
              pode redistribuir, revender, repostar publicamente ou compartilhar credenciais de
              acesso. Cada licença vale pra uma única pessoa física ou jurídica.
            </p>

            <h2>4. Pagamento e formas aceitas</h2>
            <p>
              Pagamentos são processados por <strong>Mercado Pago</strong> (BRL — Pix, boleto,
              cartão nacional, parcelamento até 12x) ou <strong>Stripe</strong> (cartões
              internacionais, fallback). Os dados financeiros nunca passam pelos nossos
              servidores — vão direto pro processador.
            </p>
            <p>
              O acesso ao produto é liberado após confirmação do pagamento (Pix em minutos, boleto
              em até 2 dias úteis, cartão imediato).
            </p>

            <h2>5. Garantia incondicional de 15 dias</h2>
            <p>
              Você tem <strong>15 dias corridos</strong> a partir da data da compra pra pedir
              reembolso integral, <strong>sem precisar justificar motivo</strong>. Esse prazo é
              maior do que o exigido pelo CDC (art. 49 — 7 dias) por escolha nossa.
            </p>
            <p>
              Pra solicitar: envia email pra{' '}
              <a href={contactInfo.email.mailto}>{contactInfo.email.main}</a> com o assunto{' '}
              <em>Reembolso</em>. O dinheiro volta pelo mesmo método de pagamento em até 7 dias
              úteis após a confirmação.
            </p>

            <h2>6. Acesso ao conteúdo</h2>
            <ul>
              <li>
                <strong>VSS:</strong> acesso <em>vitalício</em> enquanto a plataforma existir.
                Atualizações de conteúdo incluídas sem custo.
              </li>
              <li>
                <strong>Advisory Sessão:</strong> acesso single-shot — uma sessão agendada e
                executada.
              </li>
              <li>
                <strong>Advisory Sprint:</strong> acesso por 30 dias corridos a partir da
                primeira sessão.
              </li>
              <li>
                <strong>Conselho:</strong> acesso enquanto a mensalidade estiver paga e nenhuma
                das partes sinalizar encerramento.
              </li>
            </ul>

            <h2>7. Suspensão e revogação de acesso</h2>
            <p>Podemos suspender ou encerrar seu acesso, sem reembolso, nos seguintes casos:</p>
            <ul>
              <li>Compartilhamento de credenciais ou tentativa de revenda do conteúdo.</li>
              <li>
                Chargeback fraudulento ou contestação indevida de pagamento já confirmado.
              </li>
              <li>Conduta abusiva com Joel ou demais participantes.</li>
              <li>Uso da plataforma pra atividades ilegais.</li>
            </ul>

            <h2>8. Limitação de responsabilidade</h2>
            <p>
              VSS e Advisory são <strong>programas educacionais e consultivos</strong>.
              Resultados dependem da aplicação consistente do que ensinamos no contexto real do
              seu negócio. <strong>Não prometemos retorno financeiro específico</strong>, taxa de
              conversão garantida ou tempo exato de execução. Os cases publicados em{' '}
              <a href="/cases">/cases</a> são exemplos reais, mas não constituem promessa de
              resultado.
            </p>

            <h2>9. Propriedade intelectual</h2>
            <p>
              Todo conteúdo (vídeos, textos, frameworks, marca, identidade visual, código da
              plataforma) é propriedade de {contactInfo.company.legalName}. O framework{' '}
              <strong>6Ps das Vendas Escaláveis</strong> é autoral de Joel Burigo. Reprodução não
              autorizada implica em ação judicial.
            </p>

            <h2>10. Privacidade e dados</h2>
            <p>
              O tratamento de dados pessoais segue nossa{' '}
              <a href="/privacidade">Política de Privacidade</a> e a Lei Geral de Proteção de
              Dados (LGPD — Lei 13.709/18).
            </p>

            <h2>11. Vigência e atualizações</h2>
            <p>
              Estes termos entram em vigor na data de aceite (compra ou cadastro) e ficam
              vigentes enquanto durar o acesso. Podemos atualizar este documento a qualquer
              momento, com aviso prévio de <strong>30 dias</strong> por email pros usuários
              ativos.
            </p>

            <h2>12. Foro</h2>
            <p>
              Fica eleito o foro da comarca de <strong>Florianópolis/SC</strong> pra dirimir
              qualquer questão decorrente destes termos, com renúncia a qualquer outro por mais
              privilegiado que seja.
            </p>

            <h2>13. Dúvidas</h2>
            <p>
              Manda email pra{' '}
              <a href={contactInfo.email.mailto}>{contactInfo.email.main}</a>. Resposta em até 2
              dias úteis.
            </p>
          </article>

          <p className="text-fg-muted font-mono text-[11px] tracking-[0.22em] uppercase">
            // {contactInfo.company.legalName} · CNPJ {contactInfo.company.cnpj}
          </p>
        </Container>
      </section>
    </main>
  );
}
