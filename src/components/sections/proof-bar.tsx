import { Container } from '@/components/patterns/container';

const defaultStats = [
  { value: '17+', label: 'Anos de vendas B2B' },
  { value: '140+', label: 'MPEs estruturadas' },
  { value: '~R$ 1Bi', label: 'Em vendas geradas' },
  { value: '6', label: 'Pilares (6Ps)' },
];

export function ProofBar({ stats = defaultStats }: { stats?: { value: string; label: string }[] }) {
  return (
    <section className="border-b border-[var(--jb-hair)] bg-ink-2 py-10">
      <Container>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col gap-1">
              <span className="font-display text-3xl font-black uppercase text-acid md:text-4xl">
                {stat.value}
              </span>
              <span className="mono text-fg-3">{stat.label}</span>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
