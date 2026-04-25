import type { Metadata } from 'next';
import { SlideDeck } from '@/components/features/presentation/slide-deck';

export const metadata: Metadata = {
  title: 'Apresentação Comercial | Joel Burigo',
  description: 'Apresentação comercial modular dos produtos e serviços Joel Burigo.',
  robots: { index: false, follow: false },
};

export default function ApresentacaoPage() {
  return <SlideDeck />;
}
