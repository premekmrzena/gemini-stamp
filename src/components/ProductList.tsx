import ProductCard, { ProductType } from '@/components/ProductCard';

export default function ProductList({ products }: { products: ProductType[] }) {
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
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-[24px]">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
