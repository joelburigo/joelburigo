import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { Header } from '@/components/layouts/header';
import { Footer } from '@/components/layouts/footer';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function CheckoutLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="grow">{children}</main>
      <Footer />
    </div>
  );
}
