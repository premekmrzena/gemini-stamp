import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Děkujeme za objednávku',
  robots: { index: false, follow: false },
};

export default function DekujemeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
