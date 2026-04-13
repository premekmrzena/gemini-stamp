'use client';

import Image from 'next/image';
import Link from 'next/link';
import AddToCartButton from '@/components/AddToCartButton';

// Definujeme typ pro produkt
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
      <div className="text-center py-20 text-white/50">
        Zatím tu nejsou žádné známky.
      </div>
    );
  }

  return (
    <section className="bg-[#0F172A] text-[#FDFBF7] w-full px-[24px] md:px-[44px] lg:px-[84px]">
      
      <div className="max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[24px]">
          
          {products.map((product) => {
            const isTop = product.tag_top;
            const isNovinka = product.tag_new;
            const isJenUNas = !isTop && !isNovinka;
            const hasDiscount = false; 
            const stockCount = product.stock_quantity;

            return (
              <div 
                key={product.id} 
                className="group relative bg-[#0F172A] border border-[#8B95AC] rounded-[16px] p-[24px] flex flex-col hover:bg-[#2B3755] transition-all duration-300"
                onContextMenu={(e) => e.preventDefault()} // Globální zákaz pravého tlačítka na kartě
              >
                {/* HLAVNÍ LINK - nyní jako neviditelná vrstva přes celou kartu (z-20) */}
                <Link 
                  href={`/produkt/${product.id}`} 
                  className="absolute inset-0 z-20 rounded-[16px] cursor-pointer" 
                  aria-label={`Detail produktu ${product.name}`}
                />

                {/* TAGY - z-30 aby byly vidět a nebránily prokliku */}
                <div className="absolute top-[30px] right-[24px] z-30 flex flex-col items-end gap-2 pointer-events-none">
                  {isTop && (
                    <span className="style-product-tag bg-[#62BBE2] text-[#0F172A] px-3 py-1 rounded-full shadow-sm">
                      TOP 1
                    </span>
                  )}
                  {!isTop && isNovinka && (
                    <span className="style-product-tag bg-[#F9B420] text-[#0F172A] px-3 py-1 rounded-full shadow-sm">
                      novinka
                    </span>
                  )}
                  {isJenUNas && (
                    <span className="style-product-tag bg-[#D1D6DF] text-[#0F172A] px-3 py-1 rounded-full shadow-sm">
                      jen u nás
                    </span>
                  )}
                </div>

                {/* OBRÁZEK S OCHRANOU - z-10 (pod linkem) */}
                <div className="relative w-full h-[144px] lg:h-[218px] bg-transparent mb-6 flex-shrink-0 z-10 overflow-hidden flex items-center justify-center select-none pointer-events-none">
                  <Image 
                    src={product.image_url || '/images/product-image_0001.jpg'} 
                    alt={product.name}
                    fill
                    className="object-contain"
                    onDragStart={(e) => e.preventDefault()} // Zákaz přetažení obrázku
                  />
                </div>

                {/* TEXTOVÝ OBSAH - z-10 (pod linkem) */}
                <div className="flex flex-col flex-grow items-center text-center relative z-10 pointer-events-none select-none">
                  <h3 className="style-h4 mb-4">
                    {product.name}
                  </h3>
                  <p className="style-body text-white/70 mb-6 line-clamp-3">
                    {product.short_description}
                  </p>
                </div>

                {/* CENA A TLAČÍTKO - z-30 (aby na tlačítko šlo kliknout přes ten hlavní link) */}
                <div className="mt-auto flex flex-col items-center relative z-30">
                  
                  <div className="flex flex-col items-center mb-6 h-[48px] justify-end pointer-events-none select-none">
                    <span className="style-product-price text-[#059669]">
                      Cena {product.price} Kč
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-6 pointer-events-none select-none">
                    <span className="style-body text-[#FDFBF7]">Skladem</span>
                    <span className="style-product-tag bg-[#2B3755] text-white px-2 py-1 rounded-full group-hover:bg-[#F9B420] group-hover:text-[#0F172A] transition-colors duration-300">
                      {stockCount > 10 ? 'více než 10 ks' : 'méně než 10 ks'}
                    </span>
                  </div>

                  {/* POINTER-EVENTS-AUTO je nutné, aby tlačítko reagovalo i přes link */}
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