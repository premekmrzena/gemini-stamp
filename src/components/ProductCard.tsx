'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import AddToCartButton from '@/components/AddToCartButton';
import StartCreatingButton from '@/components/StartCreatingButton';
import { getSalePrice } from '@/lib/pricing';
import { getOrderCurrency, getLocalizedPrice, formatPrice } from '@/lib/currency';
import { getLocalizedProductField } from '@/lib/product-i18n';
import { ProductCategory } from '@/types/database';

export type ProductType = {
  id: string;
  name: string;
  short_description: string | null;
  name_en?: string | null;
  short_description_en?: string | null;
  name_ko?: string | null;
  short_description_ko?: string | null;
  name_ja?: string | null;
  short_description_ja?: string | null;
  name_zh_hans?: string | null;
  short_description_zh_hans?: string | null;
  name_zh_hant?: string | null;
  short_description_zh_hant?: string | null;
  price: number;
  sale_price: number | null;
  price_eur: number | null;
  sale_price_eur: number | null;
  image_url: string;
  stock_quantity: number;
  category: ProductCategory;
  tag_new: boolean;
  tag_top: number | null;
  tag_last_pieces: boolean;
  weight_grams: number;
};

export default function ProductCard({ product }: { product: ProductType }) {
  const locale = useLocale();
  const t = useTranslations('cart');
  const tProduct = useTranslations('product');
  const isTop = !!product.tag_top;
  const isNovinka = product.tag_new;
  const isJenUNas = !isTop && !isNovinka;
  const currency = getOrderCurrency(locale);
  const localizedPrice = getLocalizedPrice(product, currency);
  const salePrice = localizedPrice ? getSalePrice(localizedPrice.price, localizedPrice.salePrice) : null;
  const isCreativeArch = product.category === 'kreativni-archy';
  const localizedName = getLocalizedProductField(product, locale, 'name');
  const localizedDescription = getLocalizedProductField(product, locale, 'short_description');

  return (
    <div
      className="group relative bg-[#0F172A] border border-black300/30 rounded p-[24px] flex flex-col active:bg-black500 active:scale-[0.98] active:z-10 md:hover:bg-black500 md:hover:scale-[1.02] md:hover:z-10 transition-all duration-300"
      onContextMenu={(e) => e.preventDefault()}
    >
      <Link
        href={`/produkt/${product.id}`}
        className="absolute inset-0 z-20 rounded cursor-pointer"
        aria-label={tProduct('detailAria', { name: localizedName })}
      />

      <div className="absolute top-[28px] right-0 z-30 flex flex-col items-end gap-1 pointer-events-none">
        {isTop && (
          <span className="style-product-tag bg-tag-top text-black pl-3 pr-4 py-1 rounded-l-full shadow-sm">
            TOP {product.tag_top}
          </span>
        )}
        {isNovinka && (
          <span className="style-product-tag bg-tag-novinka text-black pl-3 pr-4 py-1 rounded-l-full shadow-sm">
            {tProduct('badges.new')}
          </span>
        )}
        {product.tag_last_pieces && (
          <span className="style-product-tag bg-tag-posledni-kusy text-black pl-3 pr-4 py-1 rounded-l-full shadow-sm">
            {tProduct('badges.lastPieces')}
          </span>
        )}
        {isJenUNas && !product.tag_last_pieces && (
          <span className="style-product-tag bg-black200 text-black pl-3 pr-4 py-1 rounded-l-full shadow-sm">
            {tProduct('badges.onlyHere')}
          </span>
        )}
      </div>

      <div className="relative w-full h-[158px] md:h-[120px] lg:h-[170px] bg-transparent mb-4 flex-shrink-0 z-10 overflow-hidden flex items-center justify-center select-none pointer-events-none">
        <Image
          src={product.image_url || '/images/product-image_0001.jpg'}
          alt={localizedName}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-contain"
          onDragStart={(e) => e.preventDefault()}
        />
      </div>

      <div className="flex flex-col flex-grow items-center text-center relative z-10 pointer-events-none select-none">
        <h3 className="style-h4 mb-2 line-clamp-2 min-h-[2.8em]">{localizedName}</h3>
        <p className="style-body text-secondary/70 mb-4 line-clamp-3">{localizedDescription}</p>
      </div>

      <div className="mt-auto flex flex-col items-center relative z-30">
        <div className="flex flex-col items-center mb-4 pointer-events-none select-none">
          {!localizedPrice ? (
            <span className="style-product-price text-black300">{t('unavailable')}</span>
          ) : salePrice ? (
            <span className="style-product-price flex items-center gap-2">
              <span className="text-black300 line-through">{formatPrice(localizedPrice.price, currency)}</span>
              <span className="text-success">{formatPrice(salePrice, currency)}</span>
            </span>
          ) : (
            <span className="style-product-price text-success">
              {formatPrice(localizedPrice.price, currency)}
            </span>
          )}
        </div>

        <div className="w-full flex justify-center pointer-events-auto">
          {!localizedPrice ? null : isCreativeArch ? (
            <StartCreatingButton productId={product.id} />
          ) : (
            <AddToCartButton product={{ ...product, name: localizedName, price: salePrice ?? localizedPrice.price }} />
          )}
        </div>
      </div>
    </div>
  );
}
