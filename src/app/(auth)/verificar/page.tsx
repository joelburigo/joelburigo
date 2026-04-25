import type { Metadata } from 'next';
import { DevStub } from '@/components/patterns/dev-stub';

export const metadata: Metadata = {
  title: 'Verificando acesso',
  robots: { index: false, follow: false },
};

export default function VerificarPage() {
  return (
    <DevStub
      sprint={1}
      route="/verificar?t=<token>"
      title="Verificando seu link de acesso"
      description="Sprint 1 implementa: lookup do token em magic_links, marca used_at, gera JWT, set-cookie jb_session, redirect pra /area ou ?next=..."
      backHref="/entrar"
      backLabel="Voltar pra entrar"
    />
  );
}
