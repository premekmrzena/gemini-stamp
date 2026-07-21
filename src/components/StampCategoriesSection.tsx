import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Paintbrush } from 'lucide-react';

const CATEGORY_META = [
  { key: 'history', image: '/images/kreativni-archy_komponenta01.png' },
  { key: 'artists', image: '/images/kreativni-archy_komponenta02.png' },
  { key: 'landmarks', image: '/images/kreativni-archy_komponenta03.png' },
  { key: 'heritage', image: '/images/kreativni-archy_komponenta04.png' },
] as const;

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
      <Image src={src} alt={alt} fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw" className="object-contain" />
    </div>
  );
}

// Sdílený pás "Kreativní arch s kouskem historie" - žije na /co-je-kreativni-arch
// (obalený section+border tam na místě) i na homepage nad ProductList (bez
// section wrapperu, mezera řeší gap na homepage), viz docs pro rozhodnutí.
export default function StampCategoriesSection() {
  const t = useTranslations('home.stampCategories');
  return (
    <div className="layout-container">
      <h2 className="style-h2 text-secondary text-center mb-4">{t('title')}</h2>
      <p className="style-body text-secondary/50 text-center max-w-[43rem] mx-auto mb-8">
        {t('intro')}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {CATEGORY_META.map((cat) => {
          const title = t(`${cat.key}.title`);
          return (
            <div key={cat.key} className="flex flex-col items-center text-center p-6 rounded-[4px] border border-white/15 bg-[#0B1120]">
              <h3 className="style-h3 text-secondary mb-4">{title}</h3>
              <CategoryImage src={cat.image} alt={title} className="w-[80%] mb-4" />
              <p className="style-body text-secondary/60 mb-4">{t(`${cat.key}.text`)}</p>
              <Link
                href="/vytvorit-arch"
                className="group/btn style-body font-bold flex items-center justify-center gap-2 p-2 mt-auto text-[#FF6B35] hover:text-[#FF7F51] cursor-pointer"
              >
                <Paintbrush size={18} className="group-hover/btn:scale-110 transition-transform" />
                {t('exploreTemplates')}
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
