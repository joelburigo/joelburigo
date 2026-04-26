'use client';

import * as React from 'react';
import { Copy, Check, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CopyButtonProps {
  value: string;
  label?: string;
  mask?: boolean;
  className?: string;
}

export function CopyButton({ value, label, mask = false, className }: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false);
  const [revealed, setRevealed] = React.useState(!mask);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error('[copy-button] clipboard falhou', err);
    }
  }

  const display = mask && !revealed ? '••••••••••••••' : value;

  return (
    <div
      className={cn(
        'flex items-center gap-2 border border-[var(--jb-hair)] bg-ink-2 px-3 py-2 font-mono text-[11px]',
        className
      )}
    >
      {label ? (
        <span className="text-fg-3 tracking-[0.18em] uppercase">{label}</span>
      ) : null}
      <code className="text-cream truncate flex-1">{display}</code>
      {mask ? (
        <button
          type="button"
          onClick={() => setRevealed((r) => !r)}
          className="text-fg-3 hover:text-acid"
          aria-label={revealed ? 'Esconder' : 'Mostrar'}
        >
          {revealed ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
        </button>
      ) : null}
      <button
        type="button"
        onClick={handleCopy}
        className="text-fg-3 hover:text-acid"
        aria-label="Copiar"
      >
        {copied ? <Check className="size-3.5 text-acid" /> : <Copy className="size-3.5" />}
      </button>
    </div>
  );
}
