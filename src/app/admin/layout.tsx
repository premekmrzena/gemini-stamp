import type { Metadata } from 'next';
import '../globals.css';
import { poppins } from '@/lib/fonts';
import { SITE_URL } from '@/lib/site';

// Vlastní root layout (Next.js "multiple root layouts") - dřív visel pod
// společným app/layout.tsx, teď má /admin i /[locale] každý svůj <html>,
// protože jazyk admina (čeština, natvrdo) je nezávislý na next-intl mutacích
// storefrontu. noindex/nofollow, takže lang tu na SEO nemá vliv - je tu jen
// pro správnost a přístupnost.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Administrace',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="cs">
      <body className={`${poppins.className} flex flex-col min-h-screen bg-[#0F172A]`}>
        {children}
      </body>
    </html>
  );
}
