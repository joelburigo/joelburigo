'use client';

import * as React from 'react';

/**
 * Pinga `/api/mentorias/[id]/presenca` quando o user abre a página E
 * a mentoria está `live`. Idempotente no backend (ON CONFLICT DO NOTHING).
 *
 * Renderiza nada — apenas side-effect.
 */
export function PresenceTracker({ id, enabled }: { id: string; enabled: boolean }) {
  React.useEffect(() => {
    if (!enabled) return;
    fetch(`/api/mentorias/${id}/presenca`, { method: 'POST' }).catch((err) => {
      console.error('[presence-tracker]', err);
    });
  }, [id, enabled]);
  return null;
}
