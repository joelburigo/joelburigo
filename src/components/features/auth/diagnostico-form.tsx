'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

/**
 * Diagnóstico 6Ps — stub funcional pra Sprint 0.
 * Sprint 1 integra com /api/forms/diagnostico + n8n webhook + agente de scoring.
 */
export function DiagnosticoForm() {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'sent' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('submitting');
    setError(null);

    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd.entries());

    try {
      const res = await fetch('/api/forms/diagnostico', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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
        <span className="kicker">// ENVIADO</span>
        <h2 className="heading-2">Recebi. Agora olha sua caixa.</h2>
        <p className="body text-fg-2">
          Em alguns minutos você recebe o resultado e uma recomendação do próximo passo — VSS ou
          Advisory.
        </p>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <span className="kicker">// diagnóstico 6Ps</span>
        <h2 className="heading-2">Conta sobre sua operação</h2>
      </div>
      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Label htmlFor="nome">Nome</Label>
          <Input id="nome" name="nome" required autoComplete="name" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="empresa">Empresa + segmento</Label>
          <Input id="empresa" name="empresa" required />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="faturamento">Faturamento médio/mês</Label>
          <Input id="faturamento" name="faturamento" placeholder="Ex: R$ 80k" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="gargalo">Qual o maior gargalo hoje?</Label>
          <Textarea
            id="gargalo"
            name="gargalo"
            rows={4}
            placeholder="Em 2-3 frases. Pode ser técnico, comercial, de pessoas, de processo..."
            required
          />
        </div>
        {error && <p className="body-sm text-fire">{error}</p>}
        <Button type="submit" disabled={status === 'submitting'}>
          {status === 'submitting' ? 'Enviando...' : 'Ver meu diagnóstico →'}
        </Button>
        <p className="mono text-fg-muted">// 7 minutos · sem upsell · resultado chega em 5 min</p>
      </form>
    </Card>
  );
}
