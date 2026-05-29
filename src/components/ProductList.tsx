'use client';

import Image from 'next/image';
import Link from 'next/link';
import AddToCartButton from '@/components/AddToCartButton';

type ProductType = {
  id: string;
  name: string;
  short_description: string;
  price: number;
  image_url: string;
  stock_quantity: number;
  tag_new: boolean;
  tag_top: boolean;
  weight_grams: number;
};

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[24px]">

          {products.map((product) => {
            const isTop = product.tag_top;
            const isNovinka = product.tag_new;
            const isJenUNas = !isTop && !isNovinka;
            const stockCount = product.stock_quantity;

            return (
              <div
                key={product.id}
                className="group relative bg-black border border-black300 rounded-[16px] p-[24px] flex flex-col hover:bg-black400 transition-all duration-300"
                onContextMenu={(e) => e.preventDefault()}
              >
                <Link
                  href={`/produkt/${product.id}`}
                  className="absolute inset-0 z-20 rounded-[16px] cursor-pointer"
                  aria-label={`Detail produktu ${product.name}`}
                />

                <div className="absolute top-[30px] right-[24px] z-30 flex flex-col items-end gap-2 pointer-events-none">
                  {isTop && (
                    <span className="style-product-tag bg-tag-top text-black px-3 py-1 rounded-full shadow-sm">
                      TOP 1
                    </span>
                  )}
                  {!isTop && isNovinka && (
                    <span className="style-product-tag bg-tag-novinka text-black px-3 py-1 rounded-full shadow-sm">
                      novinka
                    </span>
                  )}
                  {isJenUNas && (
                    <span className="style-product-tag bg-black200 text-black px-3 py-1 rounded-full shadow-sm">
                      jen u nás
                    </span>
                  )}
                </div>

                <div className="relative w-full h-[144px] lg:h-[218px] bg-transparent mb-6 flex-shrink-0 z-10 overflow-hidden flex items-center justify-center select-none pointer-events-none">
                  <Image
                    src={product.image_url || '/images/product-image_0001.jpg'}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-contain"
                    onDragStart={(e) => e.preventDefault()}
                  />
                </div>

                <div className="flex flex-col flex-grow items-center text-center relative z-10 pointer-events-none select-none">
                  <h3 className="style-h4 mb-4">{product.name}</h3>
                  <p className="style-body text-secondary/70 mb-6 line-clamp-3">{product.short_description}</p>
                </div>

                <div className="mt-auto flex flex-col items-center relative z-30">
                  <div className="flex flex-col items-center mb-6 h-[48px] justify-end pointer-events-none select-none">
                    <span className="style-product-price text-success">
                      Cena {product.price} Kč
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-6 pointer-events-none select-none">
                    <span className="style-body text-secondary">Skladem</span>
                    <span className="style-product-tag bg-black400 text-secondary px-2 py-1 rounded-full group-hover:bg-tag-novinka group-hover:text-black transition-colors duration-300">
                      {stockCount > 10 ? 'více než 10 ks' : 'méně než 10 ks'}
                    </span>
                  </div>

                  <div className="w-full flex justify-center pointer-events-auto">
                    <AddToCartButton product={product} />
                  </div>
                </div>
              </div>
            );
          })}

        </div>
      </div>
    </section>
  );
}
