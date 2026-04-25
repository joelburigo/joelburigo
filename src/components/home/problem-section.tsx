import { Container } from '@/components/patterns/container';
import { cn } from '@/lib/utils';
import s from './problem-section.module.css';

const enemies = [
  {
    id: '01',
    name: 'O Improviso Que Mata',
    desc: 'Empresas que vivem no "vamos ver o que acontece". Sem processo documentado. "Dá um jeito" é o método.',
  },
  {
    id: '02',
    name: 'Agências Amadoras',
    desc: 'Cobram R$ 3–5k/mês pra postar no Instagram, mas não estruturam conversão.',
  },
  {
    id: '03',
    name: 'Consultores Engomados',
    desc: 'Cobram R$ 50–100k, entregam PowerPoint de 200 slides e somem.',
  },
  {
    id: '04',
    name: 'Gurus de Promessa Vazia',
    desc: '"Fique milionário em 6 meses", "fórmula secreta", "aperte um botão". Vendem ilusão.',
  },
  {
    id: '05',
    name: 'CRMs Complexos e Caros',
    desc: 'R$ 500–2.000/mês, exigem analista dedicado, travam mais que ajudam.',
  },
  {
    id: '06',
    name: 'Marketing de Vaidade',
    desc: 'Foca em likes, engajamento, alcance. Ignora ROI, conversão, faturamento.',
  },
  {
    id: '07',
    name: 'Dependência de Budget Alto',
    desc: '"Só funciona com R$ 20k/mês em anúncio". Exclui quem tá começando.',
  },
];

export function ProblemSection() {
  return (
    <section className="section bg-ink relative overflow-hidden">
      <div className="grid-overlay" />

      <Container className="relative z-10">
        <div className={s.sectionHead}>
          <div className="kicker">// 01_DIAGNÓSTICO</div>
          <div className={cn('mono text-fire', s.sectionHeadMeta)}>● GARGALOS DETECTADOS</div>
        </div>
        <div className="hair-divider" />

        <div className={s.problemIntro}>
          <h2 className={s.problemTitle}>
            <span className="text-fire">8 EM CADA 10</span> EMPRESAS
            <br />
            NÃO SABEM QUANTO
            <br />
            VÃO <span className="stroke-text">FATURAR</span> MÊS QUE VEM.
          </h2>
          <p className={s.problemLede}>
            Na moral: a maioria não tem problema de produto. Tem problema de{' '}
            <strong className="text-cream">sistema de vendas</strong>. Improviso mata mais empresa
            que crise. Abaixo, os 7 inimigos que eu combato todo dia.
          </p>
        </div>

        <div className={s.enemiesGrid}>
          {enemies.map((e) => (
            <article key={e.id} className={s.enemyCard}>
              <div className={s.enemyNum}>{e.id}</div>
              <h3 className={s.enemyName}>{e.name}</h3>
              <p className={s.enemyDesc}>{e.desc}</p>
            </article>
          ))}
        </div>

        <aside className={s.problemQuote}>
          <div className={s.quoteMark}>&ldquo;</div>
          <blockquote>
            <p className={s.quoteText}>
              Depois de 17+ anos e 140+ clientes descobri um padrão:{' '}
              <span className="text-acid">vendas aleatórias não escalam. Ponto.</span> Por isso
              condensei tudo nos 6Ps. <span className="text-fire">Sistema &gt; Improviso.</span>
            </p>
            <footer className={s.quoteFoot}>
              <span className="mono">— JOEL BURIGO · CRIADOR DOS 6PS</span>
            </footer>
          </blockquote>
        </aside>
      </Container>
    </section>
  );
}
