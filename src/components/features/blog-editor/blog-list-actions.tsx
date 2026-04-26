'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { MoreHorizontal, Trash2, Eye, EyeOff } from 'lucide-react';

interface Props {
  postId: string;
  status: 'draft' | 'published' | 'scheduled';
}

export function BlogListActions({ postId, status }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function togglePublish() {
    setOpen(false);
    const action = status === 'published' ? 'unpublish' : 'publish';
    const res = await fetch(`/api/admin/blog/${postId}/publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    if (!res.ok) {
      alert('Erro ao alternar publicação');
      return;
    }
    startTransition(() => router.refresh());
  }

  async function remove() {
    setOpen(false);
    if (!confirm('Apagar definitivamente este post? Não dá pra desfazer.')) return;
    const res = await fetch(`/api/admin/blog/${postId}`, { method: 'DELETE' });
    if (!res.ok) {
      alert('Erro ao deletar');
      return;
    }
    startTransition(() => router.refresh());
  }

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Mais ações"
        disabled={isPending}
        className="text-fg-3 hover:text-acid p-1 transition-colors disabled:opacity-50"
      >
        <MoreHorizontal className="size-4" />
      </button>
      {open && (
        <div
          className="bg-ink-2 absolute right-0 top-full z-20 mt-1 w-48 border border-[var(--jb-hair-strong)] shadow-[4px_4px_0_var(--jb-fire)]"
          onMouseLeave={() => setOpen(false)}
        >
          <button
            type="button"
            onClick={togglePublish}
            className="text-fg-1 hover:bg-ink hover:text-acid flex w-full items-center gap-2 px-3 py-2 text-left text-xs"
          >
            {status === 'published' ? (
              <>
                <EyeOff className="size-3.5" /> Despublicar
              </>
            ) : (
              <>
                <Eye className="size-3.5" /> Publicar agora
              </>
            )}
          </button>
          <button
            type="button"
            onClick={remove}
            className="text-fire hover:bg-fire hover:text-ink flex w-full items-center gap-2 px-3 py-2 text-left text-xs"
          >
            <Trash2 className="size-3.5" /> Apagar
          </button>
        </div>
      )}
    </div>
  );
}
