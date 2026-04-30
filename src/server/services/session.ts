import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { db } from '@/server/db/client';
import {
  users,
  user_profiles,
  type User,
  type UserProfile,
} from '@/server/db/schema';
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
 * caso não haja sessão. `nextPath` define o `?next=` (default `/app/area`).
 */
export async function requireUser(nextPath = '/app/area'): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    const next = encodeURIComponent(nextPath);
    redirect(`/entrar?next=${next}`);
  }
  return user;
}

/**
 * Como `requireUser`, mas exige `role === 'admin'`. Senão joga pra `/app/area`.
 */
export async function requireAdmin(): Promise<User> {
  const user = await requireUser('/admin');
  if (user.role !== 'admin') {
    redirect('/app/area');
  }
  return user;
}

/**
 * Considera "onboarded" quando todos os 6 Ps em `user_profiles` estão preenchidos.
 * Sprint 2 não tem flag dedicada — inferimos do conteúdo (zero migração).
 */
export function isProfileOnboarded(profile: UserProfile | null | undefined): boolean {
  if (!profile) return false;
  const fields: Array<keyof UserProfile> = [
    'produto_md',
    'pessoas_md',
    'precificacao_md',
    'processos_md',
    'performance_md',
    'propaganda_md',
  ];
  return fields.every((key) => {
    const v = profile[key];
    return typeof v === 'string' && v.trim().length > 0;
  });
}

/**
 * Garante user logado + perfil 6Ps completo. Se faltar onboarding,
 * redireciona pra `/app/onboarding`. Use no `(app)/app/area` (e demais rotas
 * protegidas que dependem do perfil).
 *
 * Retorna o perfil atual (sempre existe — criamos um row vazio na primeira chamada).
 */
export async function requireOnboarded(): Promise<{
  user: User;
  profile: UserProfile;
}> {
  const user = await requireUser();
  const [existing] = await db
    .select()
    .from(user_profiles)
    .where(eq(user_profiles.user_id, user.id))
    .limit(1);

  let profile = existing;
  if (!profile) {
    const [created] = await db
      .insert(user_profiles)
      .values({ user_id: user.id })
      .returning();
    profile = created!;
  }

  // Admins não fazem onboarding 6Ps (é fluxo de aluno VSS) — bypass.
  if (user.role !== 'admin' && !isProfileOnboarded(profile)) {
    redirect('/app/onboarding');
  }

  return { user, profile };
}
