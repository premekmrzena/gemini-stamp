import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import GoogleAnalytics from './GoogleAnalytics';
import AnalyticsPageview from '@/components/AnalyticsPageview';
import CookieConsent from '@/components/CookieConsent';

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
    <NextIntlClientProvider locale={locale}>
      <GoogleAnalytics />
      <Suspense fallback={null}>
        <AnalyticsPageview />
      </Suspense>
      {children}
      <CookieConsent />
    </NextIntlClientProvider>
  );
}
