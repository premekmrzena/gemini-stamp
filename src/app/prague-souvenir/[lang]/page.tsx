import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CONTENT, isLangCode, LANGS } from '../content';
import LandingContent from '../LandingContent';
import { SITE_URL } from '@/lib/site';

// Pevná URL na konkrétní jazyk (/prague-souvenir/ja, /zh-Hans, /zh-Hant, /ko, /en) -
// pro Google Ads final URL/QR kódy/sdílení, kde chceš rovnou konkrétní jazyk bez
// spoléhání na navigator.language. Kořenová /prague-souvenir (bez segmentu) zůstává
// auto-detekující varianta, viz její page.tsx.

export function generateStaticParams() {
  return LANGS.map(({ code }) => ({ lang: code }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLangCode(lang)) return {};

  const c = CONTENT[lang];
  return {
    metadataBase: new URL(SITE_URL),
    title: c.heroTitle,
    description: c.heroSubtitle,
    alternates: { canonical: `/prague-souvenir/${lang}` },
    robots: { index: true, follow: true },
    openGraph: {
      title: c.heroTitle,
      description: c.heroSubtitle,
      url: `${SITE_URL}/prague-souvenir/${lang}`,
      images: [{ url: `${SITE_URL}/images/hero02.png`, width: 1400, height: 1050 }],
      type: 'website',
    },
  };
}

export default async function PragueSouvenirLangPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLangCode(lang)) notFound();

  return <LandingContent lang={lang} linkBasePath="/prague-souvenir" />;
}
