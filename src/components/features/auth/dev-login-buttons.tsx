/**
 * Botões de quick-login DEV-only. Renderizado em /entrar.
 * Server component decide visibilidade pela env (NODE_ENV !== 'production').
 */
const PROFILES: Array<{ id: 'admin' | 'vss' | 'lead'; label: string; hint: string }> = [
  { id: 'admin', label: 'ADMIN · Joel', hint: 'role=admin · acesso /admin' },
  { id: 'vss', label: 'CLIENTE VSS', hint: 'entitlement vss ativo' },
  { id: 'lead', label: 'LEAD (sem compra)', hint: 'sem entitlement' },
];

export function DevLoginButtons() {
  return (
    <div className="border-acid mt-12 border-2 p-6">
      <div className="text-acid mb-4 font-mono text-[11px] tracking-[0.22em]">
        // DEV ONLY · QUICK LOGIN
      </div>
      <div className="grid gap-3">
        {PROFILES.map((p) => (
          <a
            key={p.id}
            href={`/api/dev/login?as=${p.id}`}
            className="border-acid hover:bg-acid hover:text-ink flex items-center justify-between border-2 px-4 py-3 font-mono text-[12px] uppercase tracking-[0.18em] transition-colors"
          >
            <span>{p.label}</span>
            <span className="text-fg-muted text-[10px] normal-case tracking-normal">{p.hint}</span>
          </a>
        ))}
      </div>
      <p className="text-fg-muted mt-4 font-mono text-[10px]">
        bloqueado em produção. ENTRAR direto em /app/area como o user escolhido.
      </p>
    </div>
  );
}
