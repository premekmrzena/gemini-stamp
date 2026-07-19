import Image from 'next/image';
import Link from 'next/link';

const categories = [
  {
    href: '/kategorie/znamky',
    title: 'Poštovní známky',
    text: 'Sběratelské i klasické známky s českou a evropskou historií, uměním nebo přírodou.',
    image: '/images/jak-nakupovat_znamky.jpg',
  },
  {
    href: '/vytvorit-arch',
    title: 'Kreativní archy',
    text: 'Arch ze skutečných poštovních známek doplněný o vaše vlastní fotografie a text.',
    image: '/images/jak-nakupovat_kreativni-archy.jpg',
    featured: true,
  },
  {
    href: '/kategorie/fdc',
    title: 'First Day Cover (FDC)',
    text: 'Obálky prvního dne vydání se známkou a razítkem k datu, kdy známka poprvé vyšla.',
    image: '/images/jak-nakupovat_FDC.jpg',
  },
  {
    href: '/kategorie/plakety',
    title: 'Dárkové plakety',
    text: 'Reprezentativní plakety k darování nebo jako doplněk sběratelské kolekce.',
    image: '/images/jak-nakupovat_plakety.jpg',
  },
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
  return (
    <div className="layout-container">
      <h2 className="style-h2 text-secondary text-center mb-4">Co si u nás můžete koupit</h2>
      <p className="style-body text-secondary/50 text-center max-w-[43rem] mx-auto mb-8">
        Čtyři kategorie produktů pro sběratele i milovníky originálních dárků. Chcete arch s vlastními fotkami?{' '}
        <Link href="/co-je-kreativni-arch" className="style-body-bold text-primary hover:underline">
          Zjistěte, jak Kreativní arch funguje →
        </Link>
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {categories.map((cat, i) => (
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
              <h3 className="style-h3 text-secondary group-hover:text-primary transition-colors">{cat.title}</h3>
            </div>
            <div className="relative w-[80%] mb-4">
              <CategoryImage src={cat.image} alt={cat.title} className="w-full" />
              {cat.featured && (
                <span className="absolute top-2 right-0 style-product-tag bg-primary text-black pl-3 pr-4 py-1 rounded-l-full shadow-sm">
                  Doporučujeme
                </span>
              )}
            </div>
            <p className="style-body text-secondary/60">{cat.text}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
