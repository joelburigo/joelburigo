'use client';

import { useEffect, useState } from 'react';

export function StatusBarTop() {
  const [time, setTime] = useState('--:--:-- BRT');

  useEffect(() => {
    const tick = () => {
      const now = new Intl.DateTimeFormat('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'America/Sao_Paulo',
        hour12: false,
      }).format(new Date());
      setTime(`${now} BRT`);
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="hidden items-center justify-between border-b border-[var(--jb-hair)] px-10 py-2 font-mono text-[11px] uppercase tracking-[0.22em] text-fg-muted md:flex">
      <div className="flex items-center gap-3">
        <span className="dot-live" />
        <span>SYS ONLINE</span>
        <span className="text-[var(--jb-hair-strong)]">·</span>
        <span>@joelburigo</span>
        <span className="text-[var(--jb-hair-strong)]">·</span>
        <span>EXP. 2004</span>
        <span className="text-[var(--jb-hair-strong)]">·</span>
        <span>GROWTH EST. 2008</span>
      </div>
      <div className="flex items-center gap-3">
        <span>FLORIANÓPOLIS/SC</span>
        <span className="text-[var(--jb-hair-strong)]">·</span>
        <span className="text-acid">{time}</span>
      </div>
    </div>
  );
}
