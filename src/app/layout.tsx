import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { SITE_URL, SITE_NAME, SITE_DEFAULT_TITLE, SITE_DEFAULT_DESCRIPTION } from '@/lib/site';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_DEFAULT_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DEFAULT_DESCRIPTION,
  openGraph: {
    type: 'website',
    locale: 'cs_CZ',
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

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // lang je natvrdo "en": tenhle kořenový layout leží nad [locale] segmentem
  // (sdílí ho i /admin, /api, /rekonstrukce), takže nemá k dispozici
  // params.locale (parametry se v Next.js kumulují odshora dolů, ne naopak)
  // a číst mutaci přes next-intl API by tenhle sdílený layout vynutilo
  // dynamické renderování úplně všeho. Skutečný jazyk stránky nastavuje
  // app/[locale]/layout.tsx přes NextIntlClientProvider.
  return (
    <html lang="en">
      <body className={`${poppins.className} flex flex-col min-h-screen bg-[#0F172A]`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <CartProvider>
          {/* Header a Footer odsud zmizely, aby se nepletly do checkoutu */}
          {children}
        </CartProvider>
      </body>
    </html>
  );
}