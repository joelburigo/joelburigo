import { Container } from '@/components/patterns/container';

const verdades = [
  {
    n: '01',
    titulo: 'Improviso mata mais empresa que crise',
    corpo:
      'A maioria acha que é falta de talento. Ou mercado ruim. Ou cliente difícil. É falta de método. "Dá um jeito" vira padrão. Vende um mês, seca no outro. 17+ anos vendo a mesma novela em 140+ clientes — o fim é sempre igual.',
    assinatura: 'Sistema > Improviso',
    dado: '80% DAS MPES VENDEM ALEATÓRIO',
  },
  {
    n: '02',
    titulo: 'Post bonito no Instagram não paga boleto',
    corpo:
      'Agência amadora cobra R$ 3–5k/mês pra postar carrossel. Não estrutura conversão. Não mede CAC. Não abre funil. Likes não pagam folha. Alcance não quita imposto. Marketing sem vendas é hobby caro.',
    assinatura: 'Marketing sem vendas é hobby caro',
    dado: 'LEAD SEM CRM = CUSTO',
  },
  {
    n: '03',
    titulo: 'Se tua empresa depende de ti, tu não tem empresa — tu tem emprego',
    corpo:
      'Consultor engomado entrega PowerPoint de 200 slides e some. Dono fica tudo na cabeça. Não tira férias. Não adoece. Não escala. Empresa com R$ 200k/mês ainda carregada pelo fundador é emprego disfarçado de CNPJ.',
    assinatura: 'Da quebrada ao bilhão',
    dado: 'P6 — PESSOAS',
  },
  {
    n: '04',
    titulo: 'Não há fórmula mágica. Há método.',
    corpo:
      'Guru promete "fique milionário em 6 meses". "Aperte um botão". "Fórmula secreta". Mente. O que existe é framework aplicado com disciplina — 90 dias de execução, não 7 dias de milagre. Quem promete sem esforço, vende ilusão.',
    assinatura: 'Execução > Teoria',
    dado: '90 DIAS GUIADOS',
  },
  {
    n: '05',
    titulo: 'CRM não é privilégio de corporação',
    corpo:
      'CRM de R$ 500–2.000/mês, analista dedicado, treinamento de 3 meses. Pequeno empresário desiste e volta pro caderno. Lead vira Post-it. Follow-up vira memória. Venda vira sorte. MPE também merece ferramenta profissional — é direito, não luxo.',
    assinatura: 'Ligar a Máquina',
    dado: 'GROWTH CRM · 12 MESES INCLUÍDO',
  },
  {
    n: '06',
    titulo: 'Métrica de vaidade não paga ninguém',
    corpo:
      'Alcance. Impressão. Engajamento. Relatório bonito pra fim de mês, bolso vazio no fim do trimestre. O que importa: CAC, LTV, conversão, faturamento. Marketing integrado a vendas na Máquina de Crescimento — ou nenhum funciona direito.',
    assinatura: 'Sem enrolação',
    dado: '~R$ 1 BILHÃO ESTRUTURADO',
  },
  {
    n: '07',
    titulo: 'Vender não precisa de R$ 20k em anúncio',
    corpo:
      'Guru diz que "só funciona com budget alto". Exclui quem está começando. Mentira útil pra vender curso. Os 6Ps funcionam com tráfego pago E com prospecção gratuita. Base aplicada em 20+ nichos — de operação enxuta a faturamento de R$ 1M/mês.',
    assinatura: 'Bora pra cima',
    dado: '140+ CLIENTES · 17+ ANOS',
  },
];

export function VerdadesDuras() {
  return (
    <section className="relative overflow-hidden bg-ink py-24">
      <div className="grid-overlay" />
      <Container>
        <div className="mx-auto mb-16 max-w-3xl">
          <div className="kicker mb-4">// 07_VERDADES · MANIFESTO</div>
          <h2
            className="mb-6 font-display text-cream"
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              lineHeight: '0.92',
              letterSpacing: '-0.04em',
              textTransform: 'uppercase',
            }}
          >
            7 <span className="stroke-text">verdades</span> que 17+ anos{' '}
            <span className="text-fire">ensinaram</span>
          </h2>
          <p
            className="font-sans"
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.25rem)',
              lineHeight: '1.5',
              color: 'rgba(245, 241, 232, 0.7)',
            }}
          >
            Lições que nenhum MBA ensina. Cicatrizes de 140+ clientes e ~R$ 1 bilhão em vendas
            estruturadas. Sem enrolação, na moral.
          </p>
        </div>

        <div className="mx-auto max-w-5xl">
          {verdades.map((v, i) => {
            const isLast = i === verdades.length - 1;
            return (
              <article
                key={v.n}
                className="relative border-t border-white/10 py-10 md:py-14"
                style={isLast ? { borderBottom: '1px solid var(--jb-hair)' } : undefined}
              >
                <div className="grid gap-6 md:grid-cols-[auto_1fr_auto] md:gap-10">
                  <div
                    className="font-display text-fire"
                    style={{
                      fontSize: 'clamp(3rem, 8vw, 6rem)',
                      lineHeight: '0.9',
                      letterSpacing: '-0.04em',
                    }}
                  >
                    {v.n}
                  </div>
                  <div className="min-w-0">
                    <h3
                      className="mb-4 font-display text-cream"
                      style={{
                        fontSize: 'clamp(1.5rem, 3.5vw, 2.25rem)',
                        lineHeight: '1',
                        letterSpacing: '-0.035em',
                        textTransform: 'uppercase',
                      }}
                    >
                      {v.titulo}
                    </h3>
                    <p
                      className="mb-5 font-sans"
                      style={{
                        fontSize: 'clamp(1rem, 1.8vw, 1.125rem)',
                        lineHeight: '1.55',
                        color: 'rgba(245, 241, 232, 0.8)',
                      }}
                    >
                      {v.corpo}
                    </p>
                    <div className="inline-flex items-center gap-3 border border-acid/35 bg-acid/10 px-3 py-1.5">
                      <span
                        className="text-acid"
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.75rem',
                          letterSpacing: '0.22em',
                          textTransform: 'uppercase',
                          fontWeight: 700,
                        }}
                      >
                        ★ {v.assinatura}
                      </span>
                    </div>
                  </div>
                  <div className="mono hidden md:block md:text-right md:self-start">
                    <div className="text-fg-muted">// dado</div>
                    <div className="mt-2 text-acid" style={{ fontSize: '0.75rem' }}>
                      {v.dado}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div
          className="mx-auto mt-20 max-w-4xl border-2 border-fire p-8 md:p-12"
          style={{ background: 'linear-gradient(180deg, rgba(255,59,15,0.08), #0B0B0B)' }}
        >
          <div className="kicker mb-5" style={{ color: 'var(--jb-fire)' }}>
            // CHAMADO
          </div>
          <p
            className="mb-4 font-display text-cream"
            style={{
              fontSize: 'clamp(1.5rem, 3.5vw, 2.5rem)',
              lineHeight: '1',
              letterSpacing: '-0.035em',
              textTransform: 'uppercase',
            }}
          >
            Daqui <span className="text-acid">90 dias</span> você estará 90 dias mais perto do{' '}
            <span className="text-acid">sistema</span>.
          </p>
          <p
            className="font-display"
            style={{
              fontSize: 'clamp(1.25rem, 2.5vw, 2rem)',
              lineHeight: '1.05',
              letterSpacing: '-0.035em',
              textTransform: 'uppercase',
              color: 'rgba(245, 241, 232, 0.9)',
            }}
          >
            Ou 90 dias mais <span className="text-fire">distante</span>. Escolhe.
          </p>
          <p
            className="mt-6 font-sans"
            style={{ fontSize: '0.95rem', color: 'rgba(245, 241, 232, 0.7)' }}
          >
            — Joel Burigo · 17+ anos · 140+ clientes · ~R$ 1 bilhão em vendas estruturadas
          </p>
        </div>
      </Container>
    </section>
  );
}
