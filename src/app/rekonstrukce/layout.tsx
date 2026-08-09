import type { Metadata } from 'next';
import '../globals.css';
import { poppins } from '@/lib/fonts';
import { SITE_URL } from '@/lib/site';

// Vlastní root layout (Next.js "multiple root layouts") - viz stejná poznámka
// v src/app/admin/layout.tsx. Gate stránka je vždy česky, bez ohledu na
// next-intl mutace storefrontu, a je noindex, takže lang tu na SEO nemá vliv.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
};

export default function RekonstrukceLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="cs">
      <body className={`${poppins.className} flex flex-col min-h-screen bg-[#0F172A]`}>
        {children}
      </body>
    </html>
  );
}
