'use client';

import { useState } from 'react';
import { toast } from 'sonner';

export function ShareButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function onClick() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('URL copiada');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Não consegui copiar. Copia manualmente.');
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="border border-[var(--jb-hair-strong)] bg-transparent px-6 py-3 font-mono text-[11px] tracking-[0.22em] text-cream uppercase transition-colors hover:border-[var(--jb-acid)] hover:text-acid"
    >
      {copied ? '✓ COPIADA' : '⤴ COMPARTILHAR'}
    </button>
  );
}
