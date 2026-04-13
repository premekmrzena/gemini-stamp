'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import AddToCartButton from '@/components/AddToCartButton';

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string; // např. "znamky" nebo "fdc"
  
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // PŘEKLADNÍK: Ze systémového názvu na krásný český nadpis
  const categoryTitles: Record<string, string> = {
    'znamky': 'Poštovní známky',
    'kreativni-archy': 'Kreativní archy',
    'fdc': 'First Day Cover (FDC)',
    'plakety': 'Dárkové plakety'
  };

  useEffect(() => {
    async function fetchCategoryProducts() {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', slug) // slug ("znamky") teď přesně odpovídá Enumu v DB
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Chyba při načítání kategorií:', error);
      } else {
        setProducts(data || []);
      }
      setLoading(false);
    }

    if (slug) fetchCategoryProducts();
  }, [slug]);

  return (
    <div className="min-h-screen bg-[#0F172A] text-[#FDFBF7] pt-32 pb-20 px-4 lg:px-[84px]">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12">
          {/* Tady použijeme překladník, pokud slug neznáme, vypíšeme slug */}
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            {categoryTitles[slug] || slug}
          </h1>
          <div className="h-1.5 w-24 bg-[#FF7F51] rounded-full"></div>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-pulse">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-80 bg-[#1E293B] rounded-[32px] border border-[#334155]"></div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <div 
                key={product.id} 
                className="bg-[#1E293B] rounded-[32px] border border-[#334155] p-6 flex flex-col hover:border-[#FF7F51] transition-all group shadow-xl"
              >
                <div className="relative aspect-square mb-6 overflow-hidden rounded-2xl bg-[#0F172A]">
                  <Image 
                    src={product.image_url} 
                    alt={product.name} 
                    fill 
                    className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="flex-grow">
                  <h3 className="text-xl font-bold mb-2 line-clamp-2">{product.name}</h3>
                  <p className="text-[#94A3B8] text-sm mb-4 line-clamp-3 font-light">
                    {product.short_description}
                  </p>
                </div>
                <div className="mt-6 pt-6 border-t border-[#334155] flex items-center justify-between gap-4">
                  <span className="text-2xl font-black text-[#FF7F51]">{product.price} Kč</span>
                  <AddToCartButton product={product} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-[#1E293B] rounded-[40px] border border-[#334155] border-dashed text-[#94A3B8]">
            V kategorii „{categoryTitles[slug] || slug}“ zatím nemáme žádné kousky.
          </div>
        )}
      </div>
    </div>
  );
}