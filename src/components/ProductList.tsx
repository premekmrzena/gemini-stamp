import Link from 'next/link';
import ProductCard, { ProductType } from '@/components/ProductCard';

const CATEGORY_LINKS = [
  { label: 'Známky', href: '/kategorie/znamky' },
  { label: 'Kreativní archy', href: '/vytvorit-arch' },
  { label: 'First day cover', href: '/kategorie/fdc' },
  { label: 'Dárkové plakety', href: '/kategorie/plakety' },
];

type ProductListProps = {
  products: ProductType[];
  title?: string;
  showCategoryLinks?: boolean;
};

export default function ProductList({ products, title, showCategoryLinks }: ProductListProps) {
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-20 text-secondary/50">
        Zatím tu nejsou žádné známky.
      </div>
    );
  }

  return (
    <section className="bg-black text-secondary w-full">
      <div className="layout-container">
        {title && (
          <h2 className="style-h2 text-secondary text-center mb-6 select-none">{title}</h2>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-[24px]">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        {showCategoryLinks && (
          <p className="style-body text-secondary/60 text-center mt-8">
            Další unikáty naleznete v kategorii{' '}
            {CATEGORY_LINKS.map((cat, i) => (
              <span key={cat.href}>
                {i > 0 && ' | '}
                <Link href={cat.href} className="text-primary hover:text-primary-hover transition-colors">
                  {cat.label}
                </Link>
              </span>
            ))}
          </p>
        )}
      </div>
    </section>
  );
}
