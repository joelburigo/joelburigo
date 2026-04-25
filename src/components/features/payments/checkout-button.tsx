'use client';

import * as React from 'react';
import { Button, type ButtonProps } from '@/components/ui/button';

export type CheckoutProductSlug =
  | 'vss'
  | 'advisory-sessao'
  | 'advisory-sprint'
  | 'advisory-conselho';

interface CheckoutButtonProps {
  productSlug: CheckoutProductSlug;
  label?: string;
  className?: string;
  variant?: Extract<ButtonProps['variant'], 'fire' | 'primary'>;
  size?: ButtonProps['size'];
  payer?: {
    email?: string;
    name?: string;
    whatsapp?: string;
  };
}

interface CheckoutResponse {
  checkoutUrl?: string;
  preferenceId?: string;
  error?: string;
}

const DEFAULT_LABEL: Record<CheckoutProductSlug, string> = {
  vss: 'QUERO O VSS · R$ 1.997',
  'advisory-sessao': 'AGENDAR SESSÃO · R$ 997',
  'advisory-sprint': 'CONTRATAR SPRINT · R$ 7.500',
  'advisory-conselho': 'ASSINAR CONSELHO · R$ 15K/MÊS',
};

export function CheckoutButton({
  productSlug,
  label,
  className,
  variant = 'fire',
  size = 'lg',
  payer,
}: CheckoutButtonProps) {
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const finalLabel = label ?? DEFAULT_LABEL[productSlug];

  const onClick = async () => {
    if (loading) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productSlug, payer }),
      });
      const data: CheckoutResponse = await res.json().catch(() => ({}));
      if (!res.ok || !data.checkoutUrl) {
        const msg = data.error || `Checkout falhou (${res.status})`;
        console.error('[checkout-button]', msg, data);
        setErrorMsg('Não rolou. Tenta de novo.');
        setLoading(false);
        return;
      }
      window.location.href = data.checkoutUrl;
    } catch (err) {
      console.error('[checkout-button] network error', err);
      setErrorMsg('Não rolou. Tenta de novo.');
      setLoading(false);
    }
  };

  return (
    <span className={className}>
      <Button
        type="button"
        variant={variant}
        size={size}
        onClick={onClick}
        disabled={loading}
        aria-busy={loading}
      >
        {loading ? 'CARREGANDO…' : finalLabel}
      </Button>
      <span role="status" aria-live="polite" className="sr-only">
        {loading ? 'Iniciando checkout…' : ''}
      </span>
      {errorMsg && (
        <span
          role="alert"
          aria-live="assertive"
          className="mono text-fire mt-3 block"
          style={{ fontSize: '0.8rem' }}
        >
          ⚠ {errorMsg}
        </span>
      )}
    </span>
  );
}
