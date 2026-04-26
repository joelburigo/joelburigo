'use client';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export function NewPostButton() {
  return (
    <Link
      href="/admin/blog/new"
      className="bg-acid text-ink shadow-[4px_4px_0_var(--jb-fire)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_var(--jb-fire)] active:translate-x-0 active:translate-y-0 active:shadow-[2px_2px_0_var(--jb-fire)] inline-flex items-center gap-2 px-5 py-3 font-display text-xs font-black uppercase tracking-wider transition-all"
    >
      <Plus className="size-4" /> Novo post
    </Link>
  );
}
