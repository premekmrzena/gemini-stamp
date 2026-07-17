import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Vytvořit Kreativní arch',
  description: 'Vyberte si šablonu, nahrajte vlastní fotografie a text a vytvořte si originální Kreativní arch se skutečnými poštovními známkami.',
  alternates: { canonical: '/vytvorit-arch' },
};

export default function VytvoritArchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
