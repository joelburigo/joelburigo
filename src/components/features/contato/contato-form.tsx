'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { z } from 'zod';
import { Turnstile } from '@/components/features/turnstile';

const formSchema = z.object({
  nome: z.string().min(2, 'Informe seu nome').max(200),
  email: z.string().email('Email inválido').max(320),
  whatsapp: z.string().max(50).optional(),
  empresa: z.string().max(200).optional(),
  mensagem: z.string().min(10, 'Conta um pouco mais — pelo menos 10 caracteres').max(1000),
});

type FormData = z.infer<typeof formSchema>;

const MAX_MENSAGEM = 1000;

function maskWhatsapp(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length === 0) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

const initialData: FormData = {
  nome: '',
  email: '',
  whatsapp: '',
  empresa: '',
  mensagem: '',
};

const inputCx =
  'bg-ink text-cream placeholder:text-fg-muted focus:border-acid w-full border border-[var(--jb-hair-strong)] px-4 py-3 font-sans transition-colors focus:outline-none';
const labelCx = 'text-fg-3 mb-2 block font-mono text-[11px] tracking-[0.22em] uppercase';

export function ContatoForm() {
  const router = useRouter();
  const [data, setData] = useState<FormData>(initialData);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  function update<K extends keyof FormData>(key: K, value: FormData[K]) {
    setData((d) => ({ ...d, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function onWhatsappChange(e: ChangeEvent<HTMLInputElement>) {
    update('whatsapp', maskWhatsapp(e.target.value));
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;

    const parsed = formSchema.safeParse(data);
    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof FormData, string>> = {};
      for (const issue of parsed.error.issues) {
        const k = issue.path[0] as keyof FormData;
        if (!fieldErrors[k]) fieldErrors[k] = issue.message;
      }
      setErrors(fieldErrors);
      toast.error('Confere os campos marcados.');
      return;
    }

    if (!turnstileToken) {
      toast.error('Aguarde a verificação anti-spam carregar.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/forms/contato', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...parsed.data,
          whatsapp: parsed.data.whatsapp || undefined,
          empresa: parsed.data.empresa || undefined,
          origem: 'contato',
          cf_turnstile_token: turnstileToken,
        }),
      });
      if (res.status === 429) {
        toast.error('Muitas tentativas. Aguarde alguns minutos.');
        setSubmitting(false);
        return;
      }
      if (!res.ok) throw new Error('Falha no envio');
      setData(initialData);
      setErrors({});
      toast.success('Recebemos. Joel responde em até 1 dia útil.');
      router.push('/obrigado');
    } catch (err) {
      console.error('[contato-form]', err);
      toast.error('Erro no envio. Tenta de novo ou usa email/WhatsApp.');
    } finally {
      setSubmitting(false);
    }
  }

  const remaining = MAX_MENSAGEM - data.mensagem.length;

  return (
    <form className="space-y-6" onSubmit={onSubmit} noValidate>
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label htmlFor="nome" className={labelCx}>
            Nome *
          </label>
          <input
            type="text"
            id="nome"
            name="nome"
            required
            autoComplete="name"
            value={data.nome}
            onChange={(e) => update('nome', e.target.value)}
            className={inputCx}
            placeholder="Seu nome completo"
            aria-invalid={!!errors.nome}
            aria-describedby={errors.nome ? 'nome-err' : undefined}
          />
          {errors.nome && (
            <p id="nome-err" className="text-fire mt-2 font-mono text-[11px]">
              {errors.nome}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="email" className={labelCx}>
            Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            autoComplete="email"
            value={data.email}
            onChange={(e) => update('email', e.target.value)}
            className={inputCx}
            placeholder="seu@email.com"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-err' : undefined}
          />
          {errors.email && (
            <p id="email-err" className="text-fire mt-2 font-mono text-[11px]">
              {errors.email}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label htmlFor="whatsapp" className={labelCx}>
            WhatsApp
          </label>
          <input
            type="tel"
            id="whatsapp"
            name="whatsapp"
            autoComplete="tel-national"
            value={data.whatsapp ?? ''}
            onChange={onWhatsappChange}
            className={inputCx}
            placeholder="(48) 99999-9999"
            inputMode="tel"
          />
        </div>
        <div>
          <label htmlFor="empresa" className={labelCx}>
            Empresa
          </label>
          <input
            type="text"
            id="empresa"
            name="empresa"
            autoComplete="organization"
            value={data.empresa ?? ''}
            onChange={(e) => update('empresa', e.target.value)}
            className={inputCx}
            placeholder="Nome da sua empresa"
          />
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label htmlFor="mensagem" className={labelCx + ' mb-0'}>
            Mensagem *
          </label>
          <span
            className={
              'font-mono text-[11px] tracking-[0.18em] uppercase ' +
              (remaining < 50 ? 'text-fire' : 'text-fg-muted')
            }
          >
            {remaining} / {MAX_MENSAGEM}
          </span>
        </div>
        <textarea
          id="mensagem"
          name="mensagem"
          required
          rows={4}
          maxLength={MAX_MENSAGEM}
          value={data.mensagem}
          onChange={(e) => update('mensagem', e.target.value)}
          className={inputCx + ' resize-none'}
          placeholder="Conta teu desafio atual, faturamento, momento da empresa..."
          aria-invalid={!!errors.mensagem}
          aria-describedby={errors.mensagem ? 'mensagem-err' : undefined}
        />
        {errors.mensagem && (
          <p id="mensagem-err" className="text-fire mt-2 font-mono text-[11px]">
            {errors.mensagem}
          </p>
        )}
      </div>

      <input type="hidden" name="origem" value="contato" />

      <Turnstile onVerify={setTurnstileToken} onExpire={() => setTurnstileToken(null)} />

      <div className="flex flex-col items-start gap-3">
        <button
          type="submit"
          className="btn-primary min-h-[48px]"
          disabled={submitting}
          aria-busy={submitting}
        >
          <span>{submitting ? 'Enviando...' : 'Enviar mensagem'}</span>
          <span aria-hidden="true">→</span>
        </button>
        <p className="text-fg-muted font-mono text-[11px] tracking-[0.22em] uppercase">
          * Campos obrigatórios · Joel responde pessoalmente em até 1 dia útil
        </p>
      </div>
    </form>
  );
}
