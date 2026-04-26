import 'server-only';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/server/services/session';
import { createDraftPost } from '@/server/services/blog-cms';

/**
 * Cria um draft mínimo e redireciona pro editor `/admin/blog/[id]`.
 * Server component sem UI — efeito colateral de navegação.
 */
export default async function AdminBlogNewPage() {
  const admin = await requireAdmin();
  const post = await createDraftPost(admin.id);
  redirect(`/admin/blog/${post.id}`);
}
