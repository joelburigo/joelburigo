import { Container } from '@/components/patterns/container';
import { SectionHeader } from '@/components/patterns/section-header';
import { Card } from '@/components/ui/card';

const pilares = [
  {
    code: 'P1',
    name: 'Produto',
    description: 'Oferta clara, diferencial defensável, promessa que o mercado acredita.',
  },
  {
    code: 'P2',
    name: 'Pessoas',
    description: 'Time comercial estruturado — quem faz o quê, em que densidade, com qual meta.',
  },
  {
    code: 'P3',
    name: 'Precificação',
    description: 'Ticket, margem, condição — pricing que reflete valor real, não custo + chute.',
  },
  {
    code: 'P4',
    name: 'Processos',
    description: 'Playbook de prospecção, qualificação e fechamento. Replicável, medível, ensinável.',
  },
  {
    code: 'P5',
    name: 'Performance',
    description: 'Métricas que importam — conversão, ciclo, CAC, LTV. Dashboard > planilha perdida.',
  },
  {
    code: 'P6',
    name: 'Propaganda',
    description: 'Geração de demanda previsível — inbound, outbound, conteúdo, parceria. Sem apostar em um canal só.',
  },
];

export function Framework6Ps() {
  return (
    <section className="section border-b border-[var(--jb-hair)] bg-ink-2">
      <Container>
        <SectionHeader
          kicker="// framework 6Ps"
          title={
            <>
              Os 6 Pilares das <span className="text-acid">Vendas Escaláveis</span>
            </>
          }
          description="17+ anos condensados em 6 pilares. Falha em um, vendas travam. Todos alinhados, vira máquina."
        />
        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {pilares.map((p) => (
            <Card key={p.code} className="flex flex-col gap-3">
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-xs uppercase tracking-[0.22em] text-fire">
                  {p.code}
                </span>
                <h3 className="heading-3">{p.name}</h3>
              </div>
              <p className="body-sm text-fg-2">{p.description}</p>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
