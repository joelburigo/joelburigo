import 'server-only';

// Helper pra resolver o owner ID da agenda Advisory (admin Joel).
// Cacheia em memória pra evitar SELECT em todo request — single admin no DB.

import { eq } from 'drizzle-orm';
import { db } from '@/server/db/client';
import { users } from '@/server/db/schema';

let cachedOwnerId: string | null = null;

export async function getAdvisoryOwnerId(): Promise<string> {
  if (cachedOwnerId) return cachedOwnerId;
  const [admin] = await db.select().from(users).where(eq(users.role, 'admin')).limit(1);
  if (!admin) {
    throw new Error('[advisory/owner] nenhum admin encontrado — rode pnpm db:seed');
  }
  cachedOwnerId = admin.id;
  return cachedOwnerId;
}
