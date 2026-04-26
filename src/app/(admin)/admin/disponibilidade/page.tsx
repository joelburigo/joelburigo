import 'server-only';
import type { Metadata } from 'next';
import { and, asc, eq, gte } from 'drizzle-orm';
import { db } from '@/server/db/client';
import { availability_overrides, availability_windows } from '@/server/db/schema';
import { requireAdmin } from '@/server/services/session';
import {
  AvailabilityEditor,
  type SerializedOverride,
  type SerializedWindow,
} from '@/components/features/admin/availability-editor';

export const metadata: Metadata = {
  title: 'Disponibilidade · Admin · Joel Burigo',
  robots: { index: false, follow: false },
};

function pastSince(daysAgo: number): Date {
  // Encapsulado fora do componente: react-hooks/purity entende que chamadas
  // ao componente devem ser puras, mas helpers locais podem ler o relógio.
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - daysAgo);
  return d;
}

export default async function AdminDisponibilidadePage() {
  const admin = await requireAdmin();
  const since = pastSince(7); // mostra exceções recentes + futuras

  const [windows, overrides] = await Promise.all([
    db
      .select()
      .from(availability_windows)
      .where(eq(availability_windows.owner_id, admin.id))
      .orderBy(asc(availability_windows.weekday), asc(availability_windows.start_time)),
    db
      .select()
      .from(availability_overrides)
      .where(
        and(
          eq(availability_overrides.owner_id, admin.id),
          gte(availability_overrides.starts_at, since)
        )
      )
      .orderBy(asc(availability_overrides.starts_at)),
  ]);

  const serializedWindows: SerializedWindow[] = windows.map((w) => ({
    id: w.id,
    weekday: w.weekday,
    startTime: w.start_time,
    endTime: w.end_time,
    timezone: w.timezone,
    active: w.active,
  }));

  const serializedOverrides: SerializedOverride[] = overrides.map((o) => ({
    id: o.id,
    startsAt: o.starts_at.toISOString(),
    endsAt: o.ends_at.toISOString(),
    kind: o.kind === 'extra' ? 'extra' : 'block',
    reason: o.reason,
  }));

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <span className="font-mono text-[10px] tracking-[0.22em] text-fire uppercase">
          // ADMIN_DISPONIBILIDADE
        </span>
        <h1 className="heading-1 text-cream">Disponibilidade</h1>
        <p className="body-sm text-fg-3">
          Janelas recorrentes (semana padrão) e exceções pontuais. Esses dados alimentam o cálculo
          de slots disponíveis pra Advisory e mentorias 1:1.
        </p>
      </header>

      <AvailabilityEditor
        initialWindows={serializedWindows}
        initialOverrides={serializedOverrides}
      />
    </div>
  );
}
