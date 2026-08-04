import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { SITE_URL } from '@/lib/site';

type BreadcrumbItem = {
  label: string;
  href?: string;
};

export default function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const t = useTranslations('breadcrumbs');
  const all: BreadcrumbItem[] = [{ label: t('home'), href: '/' }, ...items];

  // BreadcrumbList structured data pro rich results ve vyhledávání - poslední
  // položka (aktuální stránka) záměrně bez "item" URL, Google to tak i chce
  // (https://developers.google.com/search/docs/appearance/structured-data/breadcrumb).
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: all.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.label,
      ...(item.href ? { item: `${SITE_URL}${item.href === '/' ? '' : item.href}` } : {}),
    })),
  };

  return (
    <nav className="bg-[#0F172A]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="layout-container py-3">
        <ol className="flex items-center gap-1.5 flex-wrap">
          {all.map((item, i) => {
            const isLast = i === all.length - 1;
            return (
              <li key={i} className="flex items-center gap-1.5">
                {i > 0 && <span className="style-label text-secondary/20">/</span>}
                {isLast || !item.href ? (
                  <span className="style-label text-secondary/50">{item.label}</span>
                ) : (
                  <Link
                    href={item.href}
                    className="style-label text-secondary/40 hover:text-secondary/70 transition-colors"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
