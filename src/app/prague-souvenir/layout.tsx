import type { Metadata } from 'next';
import { Suspense } from 'react';
import '../globals.css';
import { poppins } from '@/lib/fonts';
import { SITE_URL, SITE_NAME } from '@/lib/site';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import AnalyticsPageview from '@/components/AnalyticsPageview';
import CampaignCookieConsent from '@/components/CampaignCookieConsent';

// Vlastní root layout (Next.js "multiple root layouts") - stejný vzor jako
// src/app/admin/layout.tsx a src/app/rekonstrukce/layout.tsx. Tahle stránka
// stojí mimo next-intl [locale] routing záměrně (viz proxy.ts
// LOCALE_EXEMPT_PATHS) - jazyk si přepíná sama v klientovi (jedna URL pro
// všechny kampaně JA/ZH-Hans/ZH-Hant/KO/EN), ne přes next-intl locale prefix.
// html lang zůstává "en" (výchozí/fallback obsah stránky), i když viditelný
// text může být kterýkoli ze 4 asijských jazyků - stejná kompromisní logika
// jako u /admin a /rekonstrukce, kde lang taky neodpovídá dynamicky měněnému
// obsahu, jen tady na rozdíl od nich stránka JE indexovaná (robots below).
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: `A Souvenir From Prague — ${SITE_NAME}`,
  description:
    'Design your own sheet of postage stamps with your own travel photos — a personal, one-of-a-kind souvenir from the Czech Republic. Ships worldwide, or pick it up in person in Prague.',
  alternates: { canonical: '/prague-souvenir' },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'A Souvenir From Prague',
    description: 'Design your own sheet of postage stamps with your own travel photos.',
    url: `${SITE_URL}/prague-souvenir`,
    siteName: SITE_NAME,
    images: [{ url: `${SITE_URL}/images/hero02.png`, width: 1400, height: 1050 }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'A Souvenir From Prague',
    description: 'Design your own sheet of postage stamps with your own travel photos.',
    images: [`${SITE_URL}/images/hero02.png`],
  },
};

export default function PragueSouvenirLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${poppins.className} flex flex-col min-h-screen bg-black`}>
        {/* GA4 + Consent Mode v2 - do 2026-08-13 tahle stránka neměla ŽÁDNÉ
            měření (žila mimo [locale], kde GoogleAnalytics/AnalyticsPageview/
            CookieConsent normálně bydlí). Bez tohohle by kampaně cílené sem
            nešlo vůbec vyhodnotit. Vlastní (ne next-intl) CookieConsent verze,
            viz komentář v tom souboru. */}
        <GoogleAnalytics />
        <Suspense fallback={null}>
          <AnalyticsPageview />
        </Suspense>
        {children}
        <CampaignCookieConsent />
      </body>
    </html>
  );
}
