import type { ReactNode } from 'react';
import { Header } from '@/components/layouts/header';
import { Footer } from '@/components/layouts/footer';

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="grow">{children}</main>
      <Footer />
    </div>
  );
}
