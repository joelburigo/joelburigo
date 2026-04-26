'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export function NewMentoriaDialog() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const title = String(fd.get('title') ?? '').trim();
    const topic = String(fd.get('topic') ?? '').trim() || undefined;
    const scheduledLocal = String(fd.get('scheduled_at') ?? '');
    const duration_min = Number(fd.get('duration_min') ?? 90);

    if (!title || !scheduledLocal) {
      setError('Título e data são obrigatórios.');
      setBusy(false);
      return;
    }

    // datetime-local não traz TZ — assume horário do navegador do admin (Joel = SP).
    const scheduled_at = new Date(scheduledLocal).toISOString();

    try {
      const res = await fetch('/api/admin/mentorias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, topic, scheduled_at, duration_min }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) {
        setError(json.error ?? 'Erro ao criar mentoria.');
        setBusy(false);
        return;
      }
      setOpen(false);
      router.refresh();
    } catch (err) {
      console.error(err);
      setError('Falha de rede.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="primary" size="sm">
          <Plus className="size-4" />
          Nova mentoria
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova mentoria</DialogTitle>
          <DialogDescription>
            Cria o live input no Cloudflare Stream e gera RTMP key pra OBS.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="title">Título</Label>
            <Input id="title" name="title" required maxLength={200} placeholder="Ex: Posicionamento na prática" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="topic">Tópico / pauta</Label>
            <Textarea id="topic" name="topic" maxLength={2000} rows={3} placeholder="O que vai ser destravado?" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="scheduled_at">Data e hora</Label>
              <Input id="scheduled_at" name="scheduled_at" type="datetime-local" required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="duration_min">Duração (min)</Label>
              <Input
                id="duration_min"
                name="duration_min"
                type="number"
                min={15}
                max={600}
                defaultValue={90}
                required
              />
            </div>
          </div>
          {error ? (
            <p className="font-mono text-[11px] text-fire-hot tracking-[0.18em] uppercase">
              {error}
            </p>
          ) : null}
          <DialogFooter>
            <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={busy}>
              {busy ? 'Criando…' : 'Criar mentoria'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
