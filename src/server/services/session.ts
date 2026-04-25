import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { db } from '@/server/db/client';
import { users, type User } from '@/server/db/schema';
import { verifySession } from '@/lib/jwt';
import { SESSION } from '@/lib/jwt';

/**
 * Lê cookie `jb_session`, valida JWT e busca user no DB.
 * Retorna `null` se cookie ausente, JWT inválido ou user inexistente.
 *
 * Edge-incompatível por causa do `db` (server-only).
 */
export async function getCurrentUser(): Promise<User | null> {
  const store = await cookies();
  const token = store.get(SESSION.cookieName)?.value;
  if (!token) return null;

  const payload = await verifySession(token);
  if (!payload) return null;

  const [user] = await db.select().from(users).where(eq(users.id, payload.sub)).limit(1);
  return user ?? null;
}

/**
 * Mesma lógica de `getCurrentUser`, mas redireciona pra `/entrar?next=...`
 * caso não haja sessão. `nextPath` define o `?next=` (default `/area`).
 */
export async function requireUser(nextPath = '/area'): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    const next = encodeURIComponent(nextPath);
    redirect(`/entrar?next=${next}`);
  }
  return user;
}

/**
 * Como `requireUser`, mas exige `role === 'admin'`. Senão joga pra `/area`.
 */
export async function requireAdmin(): Promise<User> {
  const user = await requireUser('/admin');
  if (user.role !== 'admin') {
    redirect('/area');
  }
  return user;
}
