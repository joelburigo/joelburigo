'use client';

import * as React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface AutosaveTextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange' | 'value'> {
  initialValue: string;
  onSave: (value: string) => Promise<void>;
  debounceMs?: number;
}

export function AutosaveTextarea({
  initialValue,
  onSave,
  debounceMs = 2000,
  className,
  ...props
}: AutosaveTextareaProps) {
  const [value, setValue] = React.useState(initialValue);
  const [status, setStatus] = React.useState<'idle' | 'dirty' | 'saving' | 'saved' | 'error'>(
    'idle'
  );
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSaved = React.useRef(initialValue);

  React.useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const next = e.target.value;
    setValue(next);
    setStatus('dirty');
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      if (next === lastSaved.current) return;
      setStatus('saving');
      try {
        await onSave(next);
        lastSaved.current = next;
        setStatus('saved');
        setTimeout(() => setStatus('idle'), 1500);
      } catch {
        setStatus('error');
      }
    }, debounceMs);
  }

  const statusLabel: Record<typeof status, string> = {
    idle: '',
    dirty: 'editando…',
    saving: 'salvando…',
    saved: 'salvo',
    error: 'erro ao salvar',
  };

  return (
    <div className="flex flex-col gap-1">
      <Textarea
        value={value}
        onChange={handleChange}
        className={cn('min-h-[160px]', className)}
        aria-busy={status === 'saving'}
        {...props}
      />
      <span
        className={cn(
          'font-mono text-[10px] tracking-[0.22em] uppercase',
          status === 'error' ? 'text-fire' : 'text-fg-muted'
        )}
      >
        {statusLabel[status]}
      </span>
    </div>
  );
}
