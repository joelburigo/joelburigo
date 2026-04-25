import type { Metadata } from 'next';
import { DevStub } from '@/components/patterns/dev-stub';

export const metadata: Metadata = {
  title: 'Admin · Mentorias',
  robots: { index: false, follow: false },
};

export default function AdminMentoriasPage() {
  return (
    <DevStub
      sprint={4}
      route="/admin/mentorias"
      title="Mentorias VSS — CF Stream Live Input"
      description="Sprint 4 entrega: CRUD de mentorias (scheduled → live → recording_ready → archived). Botão 'Criar Live Input' chama API CF e mostra rtmp_url + stream_key pra colar no OBS. Replay automático visível pros alunos com entitlement VSS."
      backHref="/admin"
      backLabel="Dashboard admin"
    />
  );
}
