import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

const CATEGORY_META: { key: 'stamps' | 'sheets' | 'fdc' | 'plaques'; href: string; image: string; featured?: boolean }[] = [
  { key: 'stamps', href: '/kategorie/znamky', image: '/images/jak-nakupovat_znamky.jpg' },
  { key: 'sheets', href: '/vytvorit-arch', image: '/images/jak-nakupovat_kreativni-archy.jpg', featured: true },
  { key: 'fdc', href: '/kategorie/fdc', image: '/images/jak-nakupovat_FDC.jpg' },
  { key: 'plaques', href: '/kategorie/plakety', image: '/images/jak-nakupovat_plakety.jpg' },
];

function CategoryImage({
  src,
  alt,
  className = 'w-full',
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <div className={`${className} relative min-w-0 min-h-0 aspect-[4/3] rounded-[4px] overflow-hidden`}>
      <Image src={src} alt={alt} fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw" className="object-cover" />
    </div>
  );
}

// Sdílený pás "Co si u nás můžete koupit" - žije na /jak-nakupovat (obalený
// section+border tam na místě) i na homepage pod ProductList (bez section
// wrapperu, mezera řeší gap na homepage).
export default function PurchaseCategoriesSection() {
  const t = useTranslations('home.purchaseCategories');
  return (
    <div className="layout-container">
      <h2 className="style-h2 text-secondary text-center mb-4">{t('title')}</h2>
      <p className="style-body text-secondary/50 text-center max-w-[43rem] mx-auto mb-8">
        {t('intro')}{' '}
        <Link href="/co-je-kreativni-arch" className="style-body-bold text-primary hover:underline">
          {t('exploreLink')}
        </Link>
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {CATEGORY_META.map((cat, i) => {
          const title = t(`${cat.key}.title`);
          return (
            <Link
              key={cat.href}
              href={cat.href}
              className={`group flex flex-col items-center text-center px-4 py-6 rounded-[4px] border active:bg-black500 active:scale-[0.98] active:z-10 md:hover:bg-black500 md:hover:scale-[1.02] md:hover:z-10 transition-all duration-300 ${
                cat.featured ? 'border-primary/50 bg-[#0B1120]' : 'border-black300/30'
              }`}
            >
              <div className="flex flex-row items-center gap-2 mb-4 md:flex-col md:gap-0">
                <div className="w-9 h-9 lg:w-[34px] lg:h-[34px] rounded-full bg-success text-[#0B1120] flex items-center justify-center font-semibold text-[22px] lg:text-[24px] shrink-0 md:mb-3">
                  {i + 1}
                </div>
                <h3 className="style-h3 text-secondary group-hover:text-primary transition-colors">{title}</h3>
              </div>
              <div className="relative w-[80%] mb-4">
                <CategoryImage src={cat.image} alt={title} className="w-full" />
                {cat.featured && (
                  <span className="absolute top-2 right-0 style-product-tag bg-primary text-black pl-3 pr-4 py-1 rounded-l-full shadow-sm">
                    {t('featuredBadge')}
                  </span>
                )}
              </div>
              <p className="style-body text-secondary/60">{t(`${cat.key}.text`)}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
