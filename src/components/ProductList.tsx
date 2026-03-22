import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
// IMPORT NAŠEHO NOVÉHO TLAČÍTKA
import AddToCartButton from '@/components/AddToCartButton';

export default async function ProductList() {
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Chyba při načítání produktů:', error);
    return (
      <div className="text-center py-20 text-red-500">
        Jejda, produkty se nepodařilo načíst.<br/>
        <strong>Detail chyby: {error.message}</strong>
      </div>
    );
  }

  return (
    <section className="bg-[#0F172A] text-[#FDFBF7] w-full px-[24px] md:px-[44px] lg:px-[84px]">
      
      <div className="max-w-[1440px] mx-auto">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[24px]">
          
          {products?.map((product, index) => {
            const isTop = index === 0;
            const isNovinka = index < 2;
            const isJenUNas = !isTop && !isNovinka;
            const hasDiscount = index === 1;
            const originalPrice = hasDiscount ? product.price + 150 : null;
            const stockCount = index === 0 ? 5 : 15;

            return (
              <div 
                key={product.id} 
                className="group relative bg-[#0F172A] border border-[#8B95AC] rounded-[16px] p-[24px] flex flex-col hover:bg-[#2B3755] transition-all duration-300"
              >
                <Link href={`/produkt/${product.id}`} className="absolute inset-0 z-0 rounded-[16px]" aria-label={`Detail produktu ${product.name}`}></Link>

                {/* TAGY - Zde je použita třída style-product-tag */}
                <div className="absolute top-[30px] right-[24px] z-20 flex flex-col items-end gap-2 pointer-events-none">
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

                <div className="relative w-full h-[144px] lg:h-[218px] bg-transparent mb-6 flex-shrink-0 z-10 pointer-events-none overflow-hidden flex items-center justify-center">
                  <Image 
                    src={product.image_url || '/images/product-image_0001.jpg'} 
                    alt={product.name}
                    fill
                    className="object-contain"
                  />
                </div>

                <div className="flex flex-col flex-grow items-center text-center relative z-10 pointer-events-none">
                  {/* H4 Titulek */}
                  <h3 className="style-h4 mb-4">
                    {product.name}
                  </h3>
                  
                  {/* Popis (Body) */}
                  <p className="style-body text-white/70 mb-6 line-clamp-3">
                    {product.description}
                  </p>
                </div>

                <div className="mt-auto flex flex-col items-center relative z-10">
                  
                  <div className="flex flex-col items-center mb-6 h-[48px] justify-end pointer-events-none">
                    {/* Stará cena (Body) */}
                    {hasDiscount && (
                      <span className="style-body relative inline-block text-[#8B95AC] mb-1">
                        Cena {originalPrice} Kč
                        <span className="absolute left-[-5%] top-1/2 w-[110%] h-[1.5px] bg-[#8B95AC] -rotate-12 transform origin-center"></span>
                      </span>
                    )}
                    {/* Nová cena (Product-price) */}
                    <span className="style-product-price text-[#059669]">
                      Cena {product.price} Kč
                    </span>
                  </div>

                  {/* Skladem (Body a Product-tag) */}
                  <div className="flex items-center gap-2 mb-6 pointer-events-none">
                    <span className="style-body text-[#FDFBF7]">Skladem</span>
                    <span className="style-product-tag bg-[#2B3755] text-white px-2 py-1 rounded-full group-hover:bg-[#F9B420] group-hover:text-[#0F172A] transition-colors duration-300">
                      {stockCount > 10 ? 'více než 10 ks' : 'méně než 10 ks'}
                    </span>
                  </div>

                  {/* <-- NAHRADILI JSME STATICKÉ TLAČÍTKO NOVOU KOMPONENTOU --> */}
                  <div className="w-full pointer-events-auto flex justify-center z-30 relative">
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