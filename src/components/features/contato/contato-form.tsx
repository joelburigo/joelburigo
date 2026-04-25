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
      <div className="text-center py-10">
        <div className="kicker mb-3" style={{ color: 'var(--jb-acid)' }}>
          // ENVIADO
        </div>
        <p className="font-display text-2xl text-cream mb-2">Mensagem recebida.</p>
        <p className="font-sans text-fg-2">Retorno direto do Joel em até 2 dias úteis.</p>
      </div>
    );
  }

  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label
            htmlFor="name"
            className="mb-2 block font-mono text-[11px] uppercase tracking-[0.22em] text-fg-3"
          >
            Nome *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            className="w-full border border-[var(--jb-hair-strong)] bg-ink px-4 py-3 font-sans text-cream placeholder:text-fg-muted transition-colors focus:border-acid focus:outline-none"
            placeholder="Seu nome completo"
          />
        </div>
        <div>
          <label
            htmlFor="email"
            className="mb-2 block font-mono text-[11px] uppercase tracking-[0.22em] text-fg-3"
          >
            Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            className="w-full border border-[var(--jb-hair-strong)] bg-ink px-4 py-3 font-sans text-cream placeholder:text-fg-muted transition-colors focus:border-acid focus:outline-none"
            placeholder="seu@email.com"
          />
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label
            htmlFor="phone"
            className="mb-2 block font-mono text-[11px] uppercase tracking-[0.22em] text-fg-3"
          >
            WhatsApp
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            className="w-full border border-[var(--jb-hair-strong)] bg-ink px-4 py-3 font-sans text-cream placeholder:text-fg-muted transition-colors focus:border-acid focus:outline-none"
            placeholder="(48) 99999-9999"
          />
        </div>
        <div>
          <label
            htmlFor="subject"
            className="mb-2 block font-mono text-[11px] uppercase tracking-[0.22em] text-fg-3"
          >
            Assunto *
          </label>
          <select
            id="subject"
            name="subject"
            required
            defaultValue=""
            className="w-full border border-[var(--jb-hair-strong)] bg-ink px-4 py-3 font-sans text-cream transition-colors focus:border-acid focus:outline-none"
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
          className="mb-2 block font-mono text-[11px] uppercase tracking-[0.22em] text-fg-3"
        >
          Mensagem *
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={6}
          className="w-full border border-[var(--jb-hair-strong)] bg-ink px-4 py-3 font-sans text-cream placeholder:text-fg-muted transition-colors focus:border-acid focus:outline-none"
          placeholder="Conta teu desafio atual, faturamento, momento da empresa..."
        />
      </div>

      <button type="submit" className="btn-primary min-h-[48px]" disabled={status === 'sending'}>
        <span>{status === 'sending' ? 'Enviando...' : 'Enviar mensagem'}</span>
        <span aria-hidden="true">→</span>
      </button>
      {status === 'error' && (
        <p className="text-fire font-mono text-[11px]">Erro ao enviar. Tenta de novo ou usa email/WhatsApp.</p>
      )}
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-fg-muted">
        * Campos obrigatórios
      </p>
    </form>
  );
}
