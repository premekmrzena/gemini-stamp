import type { Metadata } from 'next';
import { CATEGORY_CONTENT } from '@/lib/categoryContent';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const content = CATEGORY_CONTENT[slug];

  if (!content) {
    return { title: 'Kategorie' };
  }

  return {
    title: content.title,
    description: content.description,
    alternates: { canonical: `/kategorie/${slug}` },
    openGraph: {
      title: content.title,
      description: content.description,
      url: `/kategorie/${slug}`,
    },
  };
}

export default function CategoryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
