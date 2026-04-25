import { Container } from '@/components/patterns/container';

const licoes = [
  {
    p: 'P1',
    nome: 'Posicionamento',
    acento: 'acid' as const,
    aprendizado:
      'Sem clareza de quem você é, por que existe e o que faz diferente, vira commodity. Compete por preço. Perde margem. Perde cliente. Perde a empresa.',
    cicatriz:
      'Quebrei aos 25 com calote de sócio — sem P1 e P6 cristalinos, parceria é prejuízo anunciado.',
    sinal_forte:
      'Cliente explica em 10s o que você faz de diferente. Não compete só por preço. Indicação espontânea.',
    sinal_fraco: '"Fazemos de tudo." Copy genérico. Só vende em promoção. Compara só pelo preço.',
  },
  {
    p: 'P2',
    nome: 'Público',
    acento: 'fire' as const,
    aprendizado:
      'Se você tenta vender pra todo mundo, não vende pra ninguém. Mensagem vira genérica. Oferta vira fraca. Conversão vira zero.',
    cicatriz:
      'Perdi tempo e dinheiro atendendo qualquer cliente que aparecia. Sem ICP, cada venda era tentativa.',
    sinal_forte:
      'Cliente diz "é exatamente o que eu precisava". Conversão acima da média. Você sabe onde encontrá-lo.',
    sinal_fraco: '"Vendemos para qualquer um." Conversão baixa. Leads frios. CAC alto.',
  },
  {
    p: 'P3',
    nome: 'Produto',
    acento: 'acid' as const,
    aprendizado:
      'Produto não é o que você entrega. É como você empacota valor + risco. "Se não gostar, grátis. Se gostar, R$ 500." Minha primeira venda depois da quebra foi assim — e nasceu o P3.',
    cicatriz:
      'Pós-quebra (2012), Ribeirão das Neves/MG. Loja de roupas em BH foi a prova: oferta irresistível > promessa vazia.',
    sinal_forte:
      'Conversão saudável. Compra sem objeção de preço. Churn baixo. Indicação espontânea.',
    sinal_fraco:
      'Objeção constante de preço. Cliente não entende o valor. Churn alto. Sem diferenciação.',
  },
  {
    p: 'P4',
    nome: 'Programas',
    acento: 'fire' as const,
    aprendizado:
      'Vender sem sistema é roleta-russa. CRM + funis + automação = previsibilidade. Sem isso, você depende de sorte e talento improvisado. E improviso mata.',
    cicatriz:
      'Holding de franquias (2018–2020): R$ 160k/mês → R$ 1 milhão/mês, +433%, leads ×8,33. Só funcionou porque tinha programas estruturados.',
    sinal_forte:
      'Leads todo mês. CRM atualizado diariamente. Automações 24/7. Pipeline previsível.',
    sinal_fraco:
      'Leads em planilha/papel. Follow-up manual (ou esquecido). Vendas por acaso. Memória como CRM.',
  },
  {
    p: 'P5',
    nome: 'Processos',
    acento: 'acid' as const,
    aprendizado:
      'Sem processo documentado você não cresce — só repete o caos em volume maior. Cada cliente vira projeto único. Impossível replicar. Impossível escalar.',
    cicatriz:
      'Tentando escalar Growth Master, minha cabeça virou o gargalo. Se não estava em checklist, não acontecia.',
    sinal_forte:
      'Processos acessíveis. Onboarding em ≤7 dias. Métricas visíveis. Melhoria contínua.',
    sinal_fraco:
      'Tudo na cabeça do fundador. Cada venda é única. Erros repetidos. Caos operacional.',
  },
  {
    p: 'P6',
    nome: 'Pessoas',
    acento: 'fire' as const,
    aprendizado:
      'Se tua empresa depende de ti, tu não tem empresa — tu tem emprego. Empresa que depende 100% do dono não é empresa, é prisão com CNPJ.',
    cicatriz:
      'No barraco em Ribeirão das Neves, eu era tudo: vendedor, entregador, suporte. No VSS, criei o sistema pra libertar donos dessa prisão.',
    sinal_forte:
      'Time autônomo. Baixa rotatividade. Metas batidas. Negócio sobrevive 2 semanas sem você.',
    sinal_fraco: 'Tudo depende do fundador. Rotatividade alta. Papéis confusos. Time desmotivado.',
  },
];

export function LicoesDosPps() {
  return (
    <section className="bg-ink relative overflow-hidden py-24">
      <div className="grid-overlay" />
      <Container>
        <div className="mx-auto mb-16 max-w-3xl">
          <div className="kicker mb-4">// 01_FRAMEWORK · 6PS DAS VENDAS ESCALÁVEIS</div>
          <h2
            className="font-display text-cream mb-6"
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              lineHeight: '0.92',
              letterSpacing: '-0.04em',
              textTransform: 'uppercase',
            }}
          >
            Os <span className="text-acid">6Ps</span> — lições de{' '}
            <span className="stroke-text">140+ MPEs</span>
          </h2>
          <p
            className="font-sans"
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.25rem)',
              lineHeight: '1.5',
              color: 'rgba(245, 241, 232, 0.7)',
            }}
          >
            17+ anos. ~R$ 1 bilhão em vendas estruturadas. 20+ nichos validados. Cada P não foi
            inventado numa sala — foi descoberto na dor real e formalizado em 2025. Não há fórmula
            mágica. Há método.
          </p>
        </div>

        <div className="mx-auto max-w-6xl border border-white/10">
          {licoes.map((l, i) => {
            const acentoColor = l.acento === 'acid' ? 'var(--jb-acid)' : 'var(--jb-fire)';
            return (
              <article
                key={l.p}
                className="grid gap-0 md:grid-cols-[180px_1fr]"
                style={{ borderTop: i === 0 ? '0' : '1px solid var(--jb-hair)' }}
              >
                <div
                  className="flex flex-col justify-center border-b border-white/10 p-8 md:border-r md:border-b-0"
                  style={{
                    background:
                      l.acento === 'acid' ? 'rgba(198,255,0,0.04)' : 'rgba(255,59,15,0.04)',
                  }}
                >
                  <div
                    className="font-display"
                    style={{
                      color: acentoColor,
                      fontSize: '4rem',
                      lineHeight: '0.9',
                      letterSpacing: '-0.04em',
                      fontWeight: 900,
                    }}
                  >
                    {l.p}
                  </div>
                  <div
                    className="font-display text-cream mt-2"
                    style={{
                      fontSize: '1rem',
                      letterSpacing: '-0.02em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {l.nome}
                  </div>
                </div>
                <div className="p-8 md:p-10">
                  <p
                    className="text-cream mb-5 font-sans"
                    style={{
                      fontSize: 'clamp(1.05rem, 1.8vw, 1.25rem)',
                      lineHeight: '1.5',
                      fontWeight: 500,
                    }}
                  >
                    {l.aprendizado}
                  </p>
                  <div className="mb-6 border-l-2 pl-4" style={{ borderColor: acentoColor }}>
                    <div className="mono mb-1" style={{ color: acentoColor }}>
                      // cicatriz que virou método
                    </div>
                    <p
                      className="font-sans"
                      style={{
                        fontSize: '0.95rem',
                        lineHeight: '1.5',
                        color: 'rgba(245, 241, 232, 0.8)',
                      }}
                    >
                      {l.cicatriz}
                    </p>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="border-acid/35 bg-acid/5 border p-4">
                      <div className="mono text-acid mb-2">▲ sinal forte</div>
                      <p
                        className="font-sans"
                        style={{
                          fontSize: '0.875rem',
                          lineHeight: '1.45',
                          color: 'rgba(245, 241, 232, 0.85)',
                        }}
                      >
                        {l.sinal_forte}
                      </p>
                    </div>
                    <div className="border-fire/35 bg-fire/5 border p-4">
                      <div className="mono text-fire mb-2">▼ sinal fraco</div>
                      <p
                        className="font-sans"
                        style={{
                          fontSize: '0.875rem',
                          lineHeight: '1.45',
                          color: 'rgba(245, 241, 232, 0.85)',
                        }}
                      >
                        {l.sinal_fraco}
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mx-auto mt-16 max-w-4xl">
          <div className="border-acid bg-ink-2 border-l-4 p-8 md:p-10">
            <p
              className="font-display text-cream mb-4"
              style={{
                fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
                lineHeight: '1.05',
                letterSpacing: '-0.035em',
                textTransform: 'uppercase',
              }}
            >
              Cada P dos <span className="text-acid">6Ps</span> não foi inventado. Foi{' '}
              <span className="text-fire">descoberto</span> na dor e nomeado depois.
            </p>
            <p
              className="font-sans"
              style={{ fontSize: '1rem', lineHeight: '1.55', color: 'rgba(245, 241, 232, 0.8)' }}
            >
              Por isso funciona. Não é teoria de MBA. É cicatriz que virou método. É 17+ anos
              condensados em 2025 a partir de uma base aplicada em 140+ empresas e 20+ nichos.{' '}
              <strong className="text-cream">Sistema &gt; Improviso.</strong>
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
