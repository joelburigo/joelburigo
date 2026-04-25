import 'server-only';
import { eq } from 'drizzle-orm';
import { db } from '@/server/db/client';
import { diagnostico_submissions, type DiagnosticoSubmission } from '@/server/db/schema';

/**
 * Busca uma submissão de diagnóstico 6Ps pelo ULID público.
 * Retorna `null` quando não encontrado.
 */
export async function getDiagnosticoById(
  id: string
): Promise<DiagnosticoSubmission | null> {
  if (!id || typeof id !== 'string') return null;
  const rows = await db
    .select()
    .from(diagnostico_submissions)
    .where(eq(diagnostico_submissions.id, id))
    .limit(1);
  return rows[0] ?? null;
}
