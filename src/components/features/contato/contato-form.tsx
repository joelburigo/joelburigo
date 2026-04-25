'use client';

import { useState } from 'react';

export function ContatoForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('sending');
    const fd = new FormData(e.currentTarget);
    const data = Object.fromEntries(fd.entries());
    try {
      const res = await fetch('/api/forms/contato', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Falha no envio');
      setStatus('sent');
      e.currentTarget.reset();
    } catch {
      setStatus('error');
    }
  }

  if (status === 'sent') {
    return (
      <div className="py-10 text-center">
        <div className="kicker mb-3" style={{ color: 'var(--jb-acid)' }}>
          // ENVIADO
        </div>
        <p className="font-display text-cream mb-2 text-2xl">Mensagem recebida.</p>
        <p className="text-fg-2 font-sans">Retorno direto do Joel em até 2 dias úteis.</p>
      </div>
    );
  }

  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label
            htmlFor="name"
            className="text-fg-3 mb-2 block font-mono text-[11px] tracking-[0.22em] uppercase"
          >
            Nome *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            className="bg-ink text-cream placeholder:text-fg-muted focus:border-acid w-full border border-[var(--jb-hair-strong)] px-4 py-3 font-sans transition-colors focus:outline-none"
            placeholder="Seu nome completo"
          />
        </div>
        <div>
          <label
            htmlFor="email"
            className="text-fg-3 mb-2 block font-mono text-[11px] tracking-[0.22em] uppercase"
          >
            Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            className="bg-ink text-cream placeholder:text-fg-muted focus:border-acid w-full border border-[var(--jb-hair-strong)] px-4 py-3 font-sans transition-colors focus:outline-none"
            placeholder="seu@email.com"
          />
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label
            htmlFor="phone"
            className="text-fg-3 mb-2 block font-mono text-[11px] tracking-[0.22em] uppercase"
          >
            WhatsApp
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            className="bg-ink text-cream placeholder:text-fg-muted focus:border-acid w-full border border-[var(--jb-hair-strong)] px-4 py-3 font-sans transition-colors focus:outline-none"
            placeholder="(48) 99999-9999"
          />
        </div>
        <div>
          <label
            htmlFor="subject"
            className="text-fg-3 mb-2 block font-mono text-[11px] tracking-[0.22em] uppercase"
          >
            Assunto *
          </label>
          <select
            id="subject"
            name="subject"
            required
            defaultValue=""
            className="bg-ink text-cream focus:border-acid w-full border border-[var(--jb-hair-strong)] px-4 py-3 font-sans transition-colors focus:outline-none"
          >
            <option value="" disabled>
              Selecione...
            </option>
            <option value="vss">Vendas Sem Segredos (VSS)</option>
            <option value="advisory">Advisory</option>
            <option value="imprensa">Imprensa / Palestra</option>
            <option value="other">Outro</option>
          </select>
        </div>
      </div>
      <div>
        <label
          htmlFor="message"
          className="text-fg-3 mb-2 block font-mono text-[11px] tracking-[0.22em] uppercase"
        >
          Mensagem *
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={6}
          className="bg-ink text-cream placeholder:text-fg-muted focus:border-acid w-full border border-[var(--jb-hair-strong)] px-4 py-3 font-sans transition-colors focus:outline-none"
          placeholder="Conta teu desafio atual, faturamento, momento da empresa..."
        />
      </div>

      <button type="submit" className="btn-primary min-h-[48px]" disabled={status === 'sending'}>
        <span>{status === 'sending' ? 'Enviando...' : 'Enviar mensagem'}</span>
        <span aria-hidden="true">→</span>
      </button>
      {status === 'error' && (
        <p className="text-fire font-mono text-[11px]">
          Erro ao enviar. Tenta de novo ou usa email/WhatsApp.
        </p>
      )}
      <p className="text-fg-muted font-mono text-[11px] tracking-[0.22em] uppercase">
        * Campos obrigatórios
      </p>
    </form>
  );
}
