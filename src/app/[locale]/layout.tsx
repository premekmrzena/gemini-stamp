import { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import '../globals.css';
import { routing } from '@/i18n/routing';
import { CartProvider } from '@/context/CartContext';
import { poppins } from '@/lib/fonts';
import { SITE_URL, SITE_NAME, SITE_DEFAULT_TITLE, SITE_DEFAULT_DESCRIPTION } from '@/lib/site';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import AnalyticsPageview from '@/components/AnalyticsPageview';
import CookieConsent from '@/components/CookieConsent';
import CartToast from '@/components/CartToast';

// Tohle je teď kořenový layout storefrontu (Next.js "multiple root layouts" -
// viz docs/internationalization.md "The root layout can be under a dynamic
// segment"). Dřív byl <html> jen v nadřazeném app/layout.tsx, který ale ležel
// i nad /admin a /rekonstrukce a neměl přístup k params.locale, takže lang byl
// natvrdo "en" bez ohledu na mutaci. /admin a /rekonstrukce mají teď vlastní
// root layout (nejde mít dva <html> tagy zanořené v sobě), takže duplikují pár
// řádků (font, globals.css) - je to cena za to, že tenhle layout může konečně
// nastavit lang podle skutečné locale.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_DEFAULT_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DEFAULT_DESCRIPTION,
  openGraph: {
    type: 'website',
    // 'en' je výchozí produkční mutace (routing.ts) - fallback pro stránky bez
    // vlastní openGraph metadata musí odpovídat produkčnímu jazyku, ne CZ.
    locale: 'en_US',
    siteName: SITE_NAME,
    title: SITE_DEFAULT_TITLE,
    description: SITE_DEFAULT_DESCRIPTION,
    images: ['/images/hero01.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_DEFAULT_TITLE,
    description: SITE_DEFAULT_DESCRIPTION,
    images: ['/images/hero01.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/images/creative-stamp_logo.svg`,
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'info@mycreativestamp.com',
    contactType: 'customer service',
  },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Připne locale pro tenhle request, aby šly stránky pod [locale] dál
  // staticky generovat (viz next-intl docs ke `setRequestLocale`) místo
  // aby použití next-intl API vynutilo dynamické renderování.
  setRequestLocale(locale);

  return (
    <html lang={locale}>
      <body className={`${poppins.className} flex flex-col min-h-screen bg-[#0F172A]`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <CartProvider>
          <NextIntlClientProvider locale={locale}>
            <GoogleAnalytics />
            <Suspense fallback={null}>
              <AnalyticsPageview />
            </Suspense>
            {/* Header a Footer odsud zmizely, aby se nepletly do checkoutu */}
            {children}
            <CookieConsent />
            <CartToast />
          </NextIntlClientProvider>
        </CartProvider>
      </body>
    </html>
  );
}
