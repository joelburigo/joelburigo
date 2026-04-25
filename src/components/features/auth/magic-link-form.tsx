'use client';

import { use, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Props {
  searchParamsPromise: Promise<{ next?: string }>;
}

/**
 * Magic link form — Sprint 0 stub. Sprint 1 conecta com /api/auth/request
 * (gera token, persiste em magic_links, dispara email Brevo).
 */
export function MagicLinkForm({ searchParamsPromise }: Props) {
  const params = use(searchParamsPromise);
  const next = params.next || '/area';
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('sending');
    setError(null);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch('/api/auth/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: fd.get('email'), next }),
      });
      if (!res.ok) throw new Error('Falha no envio');
      setStatus('sent');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    }
  }

  if (status === 'sent') {
    return (
      <Card className="flex flex-col gap-4 text-center">
        <span className="kicker text-acid">// LINK ENVIADO</span>
        <h2 className="heading-2">Confere seu email</h2>
        <p className="body text-fg-2">
          Mandei um link de acesso. Clica nele pra entrar — válido por 15 minutos.
        </p>
        <p className="mono text-fg-muted">// Não chegou? Olha promoções/spam</p>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <span className="kicker">// ENTRAR</span>
        <h1 className="text-display-sm">Acesse sua área</h1>
        <p className="body text-fg-2">
          Sem senha. Coloca seu email e mando um link de acesso.
        </p>
      </div>
      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="voce@empresa.com"
          />
        </div>
        {error && <p className="body-sm text-fire">{error}</p>}
        <Button type="submit" disabled={status === 'sending'}>
          {status === 'sending' ? 'Enviando...' : 'Receber link'} <span className="font-mono">→</span>
        </Button>
        <p className="mono text-fg-muted">// Sprint 1 conecta /api/auth/request</p>
      </form>
    </Card>
  );
}
