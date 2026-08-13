import type { Metadata } from 'next';
import '../globals.css';
import { poppins } from '@/lib/fonts';
import { SITE_URL, SITE_NAME } from '@/lib/site';

// Sesterská kampaňová stránka k /prague-souvenir (viz ten layout pro plné
// vysvětlení vzoru "multiple root layouts" + proxy.ts LOCALE_EXEMPT_PATHS).
// Tahle je pro DRUHOU cílovou skupinu - západní turisté v ČR (2026-08-13,
// project_prague_gift_landing) - samostatná URL kvůli čistému A/B měření
// v GA4/Ads, ne jazyková varianta téže kampaně. Jen anglicky, žádný přepínač.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: `A Gift From Prague — ${SITE_NAME}`,
  description:
    'Design your own sheet of postage stamps with your own travel photos — a personal, one-of-a-kind souvenir from the Czech Republic. Ships worldwide, or pick it up in person in Prague.',
  alternates: { canonical: '/prague-gift' },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'A Gift From Prague',
    description: 'Design your own sheet of postage stamps with your own travel photos.',
    url: `${SITE_URL}/prague-gift`,
    siteName: SITE_NAME,
    images: [{ url: `${SITE_URL}/images/hero01.png`, width: 1400, height: 1050 }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'A Gift From Prague',
    description: 'Design your own sheet of postage stamps with your own travel photos.',
    images: [`${SITE_URL}/images/hero01.png`],
  },
};

export default function PragueGiftLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${poppins.className} flex flex-col min-h-screen bg-black`}>
        {children}
      </body>
    </html>
  );
}
