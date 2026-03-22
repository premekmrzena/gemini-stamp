import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

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
    // ÚPRAVA: Odstraněny všechny py (padding-y) třídy.
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

                <div className="absolute top-[24px] right-[24px] z-20 flex flex-col items-end gap-2 pointer-events-none">
                  {isTop && (
                    <span className="bg-[#62BBE2] text-[#0F172A] px-3 py-1 rounded-full text-[11px] font-light tracking-[0.05em] shadow-sm">
                      TOP 1
                    </span>
                  )}
                  {!isTop && isNovinka && (
                    <span className="bg-[#F9B420] text-[#0F172A] px-3 py-1 rounded-full text-[11px] font-light tracking-[0.05em] shadow-sm">
                      novinka
                    </span>
                  )}
                  {isJenUNas && (
                    <span className="bg-[#D1D6DF] text-[#0F172A] px-3 py-1 rounded-full text-[11px] font-light tracking-[0.05em] shadow-sm">
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
                  <h3 className="text-[16px] md:text-[19px] font-semibold leading-[1.2] tracking-[-0.02em] mb-4">
                    {product.name}
                  </h3>
                  
                  <p className="text-[12px] md:text-[15px] font-normal leading-[1.6] text-white/70 mb-6 line-clamp-3">
                    {product.description}
                  </p>
                </div>

                <div className="mt-auto flex flex-col items-center relative z-10">
                  
                  <div className="flex flex-col items-center mb-6 h-[48px] justify-end pointer-events-none">
                    {hasDiscount && (
                      <span className="text-[15px] text-[#8B95AC] line-through decoration-[#8B95AC] mb-1">
                        Cena {originalPrice} Kč
                      </span>
                    )}
                    <span className="text-[21px] font-semibold tracking-[-0.02em] text-[#059669] leading-none">
                      Cena {product.price} Kč
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-6 text-[15px] pointer-events-none">
                    <span className="text-[#FDFBF7]">Skladem</span>
                    <span className="bg-[#2B3755] text-white px-2 py-1 rounded-full text-[11px] font-light tracking-[0.05em] group-hover:bg-[#F9B420] group-hover:text-[#0F172A] transition-colors duration-300">
                      {stockCount > 10 ? 'více než 10 ks' : 'méně než 10 ks'}
                    </span>
                  </div>

                  <div className="w-full pointer-events-auto flex justify-center">
                    <button className="flex items-center gap-2 text-[#FF6B35] font-semibold text-[16px] hover:text-[#FF7F51] transition-colors group/btn">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover/btn:scale-110 transition-transform">
                        <circle cx="9" cy="21" r="1"></circle>
                        <circle cx="20" cy="21" r="1"></circle>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                      </svg>
                      Do košíku
                    </button>
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