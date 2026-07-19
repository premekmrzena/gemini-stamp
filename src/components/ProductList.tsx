import ProductCard, { ProductType } from '@/components/ProductCard';

type ProductListProps = {
  products: ProductType[];
  title?: string;
};

export default function ProductList({ products, title }: ProductListProps) {
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[24px]">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
