import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import Button from '@/components/Button';

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
    // Celá sekce má tmavé pozadí jako Hero sekce
    <section className="bg-[#0F172A] text-[#FDFBF7] w-full px-[24px] md:px-[44px] lg:px-[84px] py-16 lg:py-24">
      
      <div className="max-w-[1440px] mx-auto">
        <h2 className="text-[28px] lg:text-[36px] font-semibold tracking-[-0.02em] text-center mb-12">
          Nejprodávanější produkty
        </h2>

        {/* Grid: 1 sloupec mobil, 2 tablet, 4 desktop [cite: 3] */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[24px]">
          
          {products?.map((product, index) => {
            // --- MOCK DATA PRO DESIGN ---
            // Simulujeme data, která zatím v DB nemáme, abychom viděli design
            const isTop = index === 0;
            const isNovinka = index < 2;
            const isJenUNas = !isTop && !isNovinka;
            const hasDiscount = index === 1; // Druhý produkt bude ve slevě
            const originalPrice = hasDiscount ? product.price + 150 : null;
            const stockCount = index === 0 ? 5 : 15; // První produkt má méně než 10 ks
            // -----------------------------

            return (
              <div 
                key={product.id} 
                // Zde definujeme zaoblení 16px [cite: 3] a tmavé pozadí. 
                // Group přidáváme pro hover efekty (oranžový rámeček a změna barvy tagu)
                className="group relative bg-[#0F172A] border border-[#2B3755] rounded-[16px] p-[24px] flex flex-col hover:border-[#FF6B35] hover:bg-[#1E2638] transition-all duration-300"
              >
                {/* 1. Link přes celou kartu (vede na detail) */}
                <Link href={`/produkt/${product.id}`} className="absolute inset-0 z-0 rounded-[16px]" aria-label={`Detail produktu ${product.name}`}></Link>

                {/* 2. TAGY shora dolů (Shop-tag: 11px, Light, tracking 5%) [cite: 3] */}
                <div className="flex justify-center gap-2 mb-6 relative z-10 pointer-events-none">
                  {isTop && (
                    <span className="bg-[#62BBE2] text-[#0F172A] px-3 py-1 rounded-full text-[11px] font-light tracking-[0.05em]">
                      TOP 1
                    </span>
                  )}
                  {isNovinka && (
                    <span className="bg-[#F9B420] text-[#0F172A] px-3 py-1 rounded-full text-[11px] font-light tracking-[0.05em]">
                      novinka
                    </span>
                  )}
                  {isJenUNas && (
                    <span className="bg-[#D1D6DF] text-[#0F172A] px-3 py-1 rounded-full text-[11px] font-light tracking-[0.05em]">
                      jen u nás
                    </span>
                  )}
                </div>

                {/* 3. OBRÁZEK (fixní výška 144px mobil/tablet, 218px desktop) */}
                <div className="relative w-full h-[144px] lg:h-[218px] bg-white rounded-md mb-6 flex-shrink-0 z-10 pointer-events-none overflow-hidden flex items-center justify-center">
                  <Image 
                    src={product.image_url || '/images/product-image_0001.jpg'} 
                    alt={product.name}
                    fill
                    className="object-contain p-2"
                  />
                </div>

                {/* 4. TEXTY (Název a Popis) */}
                {/* Flex-grow zajistí, že cena a tlačítko budou vždy zarovnané dole */}
                <div className="flex flex-col flex-grow items-center text-center relative z-10 pointer-events-none">
                  {/* H4 desktop: 19px, SemiBold [cite: 3] */}
                  <h3 className="text-[19px] font-semibold leading-[1.2] tracking-[-0.02em] mb-4">
                    {product.name}
                  </h3>
                  
                  {/* Body Desktop: 15px, Regular [cite: 3] */}
                  <p className="text-[15px] font-normal leading-[1.6] text-white/70 mb-6 line-clamp-3">
                    {product.description}
                  </p>
                </div>

                {/* 5. CENA, SKLAD a TLAČÍTKO (zarovnáno vždy dole) */}
                <div className="mt-auto flex flex-col items-center relative z-10">
                  
                  {/* Blok ceny */}
                  <div className="flex flex-col items-center mb-6 h-[48px] justify-end">
                    {hasDiscount && (
                      <span className="text-[15px] text-[#8B95AC] line-through decoration-[#8B95AC] mb-1">
                        Cena {originalPrice} Kč
                      </span>
                    )}
                    {/* Shop-price Desktop: 21px, SemiBold, success barva [cite: 3] */}
                    <span className="text-[21px] font-semibold tracking-[-0.02em] text-[#059669] leading-none">
                      Cena {product.price} Kč
                    </span>
                  </div>

                  {/* Skladovost s hover efektem na tagu (změna na yellow #F9B420) [cite: 3] */}
                  <div className="flex items-center gap-2 mb-6 text-[15px]">
                    <span className="text-[#FDFBF7]">Skladem</span>
                    <span className="bg-[#2B3755] text-white px-2 py-1 rounded-full text-[11px] font-light tracking-[0.05em] group-hover:bg-[#F9B420] group-hover:text-[#0F172A] transition-colors duration-300">
                      {stockCount > 10 ? 'více než 10 ks' : 'méně než 10 ks'}
                    </span>
                  </div>

                  {/* Tlačítko - pointer-events-auto umožňuje na něj kliknout, i když je přes kartu přehozený neviditelný Link */}
                  <div className="w-full pointer-events-auto">
                    {/* Zde by v reálu byla akce addToCart, zatím jen design */}
                    <Button variant="outlined" className="w-full !py-[12px]">
                      Do košíku
                    </Button>
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