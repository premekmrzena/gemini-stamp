import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.createArch' });
  return {
    title: t('title'),
    description: t('description'),
    alternates: { canonical: '/vytvorit-arch' },
  };
}

export default function VytvoritArchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
