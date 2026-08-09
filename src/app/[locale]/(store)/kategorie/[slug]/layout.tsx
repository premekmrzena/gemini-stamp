import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { INDEXABLE_CATEGORY_SLUGS } from '@/lib/categoryContent';
import { localeAlternates } from '@/lib/site';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: 'category' });

  if (!INDEXABLE_CATEGORY_SLUGS.includes(slug)) {
    return { title: t('defaultTitle') };
  }

  const title = t(`content.${slug}.title`);
  const description = t(`content.${slug}.description`);

  return {
    title,
    description,
    alternates: { canonical: `/kategorie/${slug}`, languages: localeAlternates(`/kategorie/${slug}`) },
    openGraph: {
      title,
      description,
      url: `/kategorie/${slug}`,
    },
  };
}

export default function CategoryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
