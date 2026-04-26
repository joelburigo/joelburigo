'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface RescheduleModalProps {
  sessionId: string;
  defaultTimezone: string;
}

interface SlotInput {
  date: string; // yyyy-MM-dd
  time: string; // HH:MM
}

const EMPTY_SLOT: SlotInput = { date: '', time: '' };

function detectClientTimezone(fallback: string): string {
  if (typeof window === 'undefined') return fallback;
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || fallback;
  } catch {
    return fallback;
  }
}

export function RescheduleModal({ sessionId, defaultTimezone }: RescheduleModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [slots, setSlots] = useState<SlotInput[]>([{ ...EMPTY_SLOT }]);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function updateSlot(idx: number, patch: Partial<SlotInput>) {
    setSlots((prev) => prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
  }

  function addSlot() {
    if (slots.length >= 3) return;
    setSlots((prev) => [...prev, { ...EMPTY_SLOT }]);
  }

  function removeSlot(idx: number) {
    setSlots((prev) => prev.filter((_, i) => i !== idx));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;

    const valid = slots.filter((s) => s.date && s.time);
    if (valid.length === 0) {
      toast.error('Informe pelo menos uma data + horário propostos.');
      return;
    }

    const timezone = detectClientTimezone(defaultTimezone);
    const proposedSlots = valid.map((s) => ({
      // Combina como ISO local (sem TZ) e deixa o servidor interpretar via clientTimezone do payload.
      // Estratégia simples: monta Date local e envia ISO UTC; o owner recebe em sao_paulo via display.
      startsAt: new Date(`${s.date}T${s.time}:00`).toISOString(),
      timezone,
    }));

    setSubmitting(true);
    try {
      const res = await fetch('/api/advisory/reschedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          proposedSlots,
          reason: reason.trim() || undefined,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (res.status === 401) {
        toast.error('Você precisa estar logado pra solicitar remarcação.');
        router.push(`/entrar?next=/sessao/${sessionId}`);
        return;
      }
      if (!res.ok || !data.ok) {
        throw new Error(data.error ?? 'falha');
      }
      toast.success('Pedido enviado. Joel responde em até 24h por email.');
      setOpen(false);
      setSlots([{ ...EMPTY_SLOT }]);
      setReason('');
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error('Não consegui enviar agora. Tenta novamente em alguns segundos.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary">SOLICITAR REMARCAÇÃO</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Solicitar remarcação</DialogTitle>
          <DialogDescription>
            Proponha até 3 horários alternativos. Joel responde em até 24h por email confirmando um
            deles.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-6" aria-busy={submitting}>
          <div className="flex flex-col gap-4">
            {slots.map((slot, idx) => (
              <div
                key={idx}
                className="bg-ink border-[var(--jb-hair)] flex flex-col gap-3 border p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-acid font-mono text-xs uppercase">
                    // proposta {idx + 1}
                  </span>
                  {slots.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSlot(idx)}
                      className="text-fg-3 hover:text-fire font-mono text-xs uppercase transition-colors"
                    >
                      remover
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor={`date-${idx}`}>Data</Label>
                    <Input
                      id={`date-${idx}`}
                      type="date"
                      value={slot.date}
                      onChange={(e) => updateSlot(idx, { date: e.target.value })}
                      disabled={submitting}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor={`time-${idx}`}>Horário</Label>
                    <Input
                      id={`time-${idx}`}
                      type="time"
                      value={slot.time}
                      onChange={(e) => updateSlot(idx, { time: e.target.value })}
                      disabled={submitting}
                    />
                  </div>
                </div>
              </div>
            ))}

            {slots.length < 3 && (
              <button
                type="button"
                onClick={addSlot}
                disabled={submitting}
                className={cn(
                  'border-fire text-fire hover:bg-fire/10 border border-dashed py-3 font-mono text-sm uppercase transition-colors',
                  'disabled:cursor-not-allowed disabled:opacity-50'
                )}
              >
                + adicionar proposta
              </button>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="reschedule-reason">Motivo (opcional)</Label>
            <Textarea
              id="reschedule-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex: imprevisto na agenda, viagem, ..."
              rows={3}
              disabled={submitting}
              maxLength={2000}
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={submitting}
            >
              CANCELAR
            </Button>
            <Button type="submit" variant="fire" disabled={submitting} aria-busy={submitting}>
              {submitting ? 'ENVIANDO...' : 'ENVIAR PEDIDO'} <span className="font-mono">→</span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
