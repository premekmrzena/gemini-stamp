import type { Metadata } from 'next';
import { Suspense } from 'react';
import '../globals.css';
import { poppins } from '@/lib/fonts';
import { SITE_URL } from '@/lib/site';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import AnalyticsPageview from '@/components/AnalyticsPageview';
import CampaignCookieConsent from '@/components/CampaignCookieConsent';

// Neveřejná stránka pro cestovní kanceláře (odkaz jen z e-mailů, ?ref=ck-xxx
// podle agentury). Vlastní root layout mimo next-intl [locale] - stejný vzor
// jako /prague-souvenir, viz proxy.ts LOCALE_EXEMPT_PATHS. Na rozdíl od
// kampaňových stránek je noindex a není v sitemapě: "neveřejná" = nikam
// neodkazovaná, ne tajná (odkaz se dá přeposlat). GA4 zůstává zapojené, aby
// šlo z page_view (včetně ?ref=) poznat, která agentura odkaz otevřela.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  robots: { index: false, follow: false },
};

export default function PartnersLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${poppins.className} flex flex-col min-h-screen bg-white`}>
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
