'use client';

import Image from 'next/image';
import Link from 'next/link';
import AddToCartButton from '@/components/AddToCartButton';
import StartCreatingButton from '@/components/StartCreatingButton';
import { getSalePrice } from '@/lib/pricing';
import { ProductCategory } from '@/types/database';

export type ProductType = {
  id: string;
  name: string;
  short_description: string;
  price: number;
  sale_price: number | null;
  image_url: string;
  stock_quantity: number;
  category: ProductCategory;
  tag_new: boolean;
  tag_top: number | null;
  tag_last_pieces: boolean;
  weight_grams: number;
};

export default function ProductCard({ product }: { product: ProductType }) {
  const isTop = !!product.tag_top;
  const isNovinka = product.tag_new;
  const isJenUNas = !isTop && !isNovinka;
  const salePrice = getSalePrice(product.price, product.sale_price);
  const isCreativeArch = product.category === 'kreativni-archy';


  return (
    <div
      className="group relative bg-[#0F172A] border border-black300/30 rounded p-[24px] flex flex-col active:bg-black500 active:scale-[0.98] active:z-10 md:hover:bg-black500 md:hover:scale-[1.02] md:hover:z-10 transition-all duration-300"
      onContextMenu={(e) => e.preventDefault()}
    >
      <Link
        href={`/produkt/${product.id}`}
        className="absolute inset-0 z-20 rounded cursor-pointer"
        aria-label={`Detail produktu ${product.name}`}
      />

      <div className="absolute top-[28px] right-0 z-30 flex flex-col items-end gap-1 pointer-events-none">
        {isTop && (
          <span className="style-product-tag bg-tag-top text-black pl-3 pr-4 py-1 rounded-l-full shadow-sm">
            TOP {product.tag_top}
          </span>
        )}
        {isNovinka && (
          <span className="style-product-tag bg-tag-novinka text-black pl-3 pr-4 py-1 rounded-l-full shadow-sm">
            novinka
          </span>
        )}
        {product.tag_last_pieces && (
          <span className="style-product-tag bg-tag-posledni-kusy text-black pl-3 pr-4 py-1 rounded-l-full shadow-sm">
            poslední kusy
          </span>
        )}
        {isJenUNas && !product.tag_last_pieces && (
          <span className="style-product-tag bg-black200 text-black pl-3 pr-4 py-1 rounded-l-full shadow-sm">
            jen u nás
          </span>
        )}
      </div>

      <div className="relative w-full h-[158px] md:h-[120px] lg:h-[170px] bg-transparent mb-4 flex-shrink-0 z-10 overflow-hidden flex items-center justify-center select-none pointer-events-none">
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
        <h3 className="style-h4 mb-2 line-clamp-2 min-h-[2.8em]">{product.name}</h3>
        <p className="style-body text-secondary/70 mb-4 line-clamp-3">{product.short_description}</p>
      </div>

      <div className="mt-auto flex flex-col items-center relative z-30">
        <div className="flex flex-col items-center mb-4 pointer-events-none select-none">
          {salePrice ? (
            <span className="style-product-price flex items-center gap-2">
              <span className="text-black300 line-through">{product.price} Kč</span>
              <span className="text-success">{salePrice} Kč</span>
            </span>
          ) : (
            <span className="style-product-price text-success">
              Cena {product.price} Kč
            </span>
          )}
        </div>

        <div className="w-full flex justify-center pointer-events-auto">
          {isCreativeArch ? (
            <StartCreatingButton productId={product.id} />
          ) : (
            <AddToCartButton product={{ ...product, price: salePrice ?? product.price }} />
          )}
        </div>
      </div>
    </div>
  );
}
