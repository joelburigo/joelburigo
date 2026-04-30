'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { MoreHorizontal, Trash2, Pencil } from 'lucide-react';
import Link from 'next/link';

interface Props {
  id: string;
}

export function TestimonialListActions({ id }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function remove() {
    setOpen(false);
    if (!confirm('Apagar definitivamente este depoimento?')) return;
    const res = await fetch(`/api/admin/testimonials/${id}`, { method: 'DELETE' });
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
          className="bg-ink-2 absolute right-0 top-full z-20 mt-1 w-44 border border-[var(--jb-hair-strong)] shadow-[4px_4px_0_var(--jb-fire)]"
          onMouseLeave={() => setOpen(false)}
        >
          <Link
            href={`/admin/testimonials/${id}`}
            className="text-fg-1 hover:bg-ink hover:text-acid flex w-full items-center gap-2 px-3 py-2 text-left text-xs"
          >
            <Pencil className="size-3.5" /> Editar
          </Link>
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
