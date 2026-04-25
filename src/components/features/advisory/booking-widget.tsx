'use client';

import Script from 'next/script';

const BOOKING_ID = 'IxxmHsXDAkSzsx3C6SyE';

export function BookingWidget() {
  return (
    <>
      <iframe
        src={`https://api.gsh.digital/widget/booking/${BOOKING_ID}`}
        style={{ width: '100%', border: 'none', overflow: 'hidden', minHeight: '600px' }}
        title="Agendamento de sessão"
      />
      <Script src="https://api.gsh.digital/js/form_embed.js" strategy="afterInteractive" />
    </>
  );
}
