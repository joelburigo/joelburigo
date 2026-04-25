'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface Props {
  email: string;
}

const COOLDOWN_SEC = 60;

export function ReenviarButton({ email }: Props) {
  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => {
      setCooldown((c) => (c <= 1 ? 0 : c - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  async function onClick() {
    if (loading || cooldown > 0) return;
    setLoading(true);
    try {
      const res = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error('falha');
      toast.success('Link reenviado. Confere o email.');
      setCooldown(COOLDOWN_SEC);
    } catch (err) {
      console.error(err);
      toast.error('Não consegui reenviar agora. Tenta de novo em segundos.');
    } finally {
      setLoading(false);
    }
  }

  const disabled = loading || cooldown > 0;
  const label = loading
    ? 'ENVIANDO...'
    : cooldown > 0
      ? `AGUARDE ${cooldown}s`
      : 'REENVIAR LINK';

  return (
    <Button
      type="button"
      variant="secondary"
      onClick={onClick}
      disabled={disabled}
      aria-busy={loading}
    >
      {label}
    </Button>
  );
}
