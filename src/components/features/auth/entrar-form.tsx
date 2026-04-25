'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Turnstile } from '@/components/features/turnstile';

interface Props {
  next: string;
  initialError?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ERROR_LABELS: Record<string, string> = {
  session_expired: 'Sua sessão expirou. Entre de novo.',
  invalid_token: 'Link inválido ou já usado. Pede um novo abaixo.',
  missing_token: 'Link sem token. Pede um novo abaixo.',
};

export function EntrarForm({ next, initialError }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const initialMessage = initialError ? ERROR_LABELS[initialError] ?? null : null;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;

    const value = email.trim().toLowerCase();
    if (!EMAIL_RE.test(value)) {
      toast.error('Email inválido. Confere e tenta de novo.');
      return;
    }
    if (!turnstileToken) {
      toast.error('Aguarde a verificação anti-spam carregar.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: value, cf_turnstile_token: turnstileToken }),
      });
      if (!res.ok) {
        throw new Error('Falha no envio');
      }
      const params = new URLSearchParams({ email: value });
      if (next && next !== '/area') params.set('next', next);
      router.push(`/verificar?${params.toString()}`);
    } catch (err) {
      console.error(err);
      toast.error('Não consegui enviar agora. Tenta de novo em alguns segundos.');
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <span className="kicker text-acid">// ENTRAR</span>
        <h1 className="text-display-md text-cream">ENTRAR</h1>
        <p className="body-lg text-fg-2">Você recebe um link no email. Sem senha.</p>
      </header>

      {initialMessage && (
        <div
          role="alert"
          className="border-fire bg-fire/10 text-cream border-l-4 px-4 py-3 font-mono text-sm"
        >
          {initialMessage}
        </div>
      )}

      <form
        onSubmit={onSubmit}
        className="bg-ink-2 border-acid flex flex-col gap-6 border p-8 shadow-[6px_6px_0_var(--jb-acid)]"
        aria-busy={loading}
      >
        <input type="hidden" name="next" value={next} />
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            placeholder="voce@empresa.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </div>
        <Turnstile onVerify={setTurnstileToken} onExpire={() => setTurnstileToken(null)} />
        <Button type="submit" variant="fire" disabled={loading} aria-busy={loading}>
          {loading ? 'ENVIANDO...' : 'RECEBER LINK'} <span className="font-mono">→</span>
        </Button>
        <p className="mono text-fg-muted">
          // O link expira em 15 minutos e funciona uma vez só.
        </p>
      </form>
    </div>
  );
}
