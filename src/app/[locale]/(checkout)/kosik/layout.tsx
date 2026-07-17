import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Košík',
  robots: { index: false, follow: false },
};

export default function KosikLayout({ children }: { children: React.ReactNode }) {
  return children;
}
