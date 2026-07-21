import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

type BreadcrumbItem = {
  label: string;
  href?: string;
};

export default function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const t = useTranslations('breadcrumbs');
  const all: BreadcrumbItem[] = [{ label: t('home'), href: '/' }, ...items];

  return (
    <nav className="bg-[#0F172A]">
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
