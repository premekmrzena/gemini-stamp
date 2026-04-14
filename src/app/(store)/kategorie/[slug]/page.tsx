'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import ProductList from '@/components/ProductList';

export default function CategoryPage() {
  const params = useParams();
  // slug může být string nebo string[], zajistíme, že máme string
  const slug = typeof params?.slug === 'string' ? params.slug : '';
  
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const categoryContent: Record<string, { title: string; description: string; videoUrl: string }> = {
    'znamky': {
      title: 'Poštovní známky',
      description: 'Zde doplň svůj vlastní text pro kategorii Poštovní známky.',
      videoUrl: '/videos/znamky.mp4'
    },
    'kreativni-archy': {
      title: 'Kreativní archy',
      description: 'Zde doplň svůj vlastní text pro kategorii Kreativní archy.',
      videoUrl: 'https://www.youtube.com/embed/QBu6UyzPdHA' 
    },
    'fdc': {
      title: 'First Day Cover (FDC)',
      description: 'Zde doplň svůj vlastní text pro kategorii FDC.',
      videoUrl: ''
    },
    'plakety': {
      title: 'Dárkové plakety',
      description: 'Zde doplň svůj vlastní text pro kategorii Dárkové plakety.',
      videoUrl: ''
    }
  };

  const current = categoryContent[slug] || { 
    title: slug, 
    description: 'Popis kategorie se připravuje...', 
    videoUrl: '' 
  };

  useEffect(() => {
    // Pokud slug ještě není k dispozici (router se inicializuje), nic neděláme
    if (!slug) return;

    async function fetchCategoryProducts() {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', slug)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (!error) setProducts(data || []);
      setLoading(false);
    }

    fetchCategoryProducts();
  }, [slug]);

  // Pokud router ještě nepředal slug, zobrazíme loader místo chyby
  if (!slug && loading) {
    return <div className="min-h-screen bg-[#0F172A] flex items-center justify-center text-white">Načítám...</div>;
  }

  return (
    <div className="min-h-screen bg-[#0F172A] pb-20">
      <section className="px-[24px] md:px-[44px] lg:px-[84px] py-8 md:py-12">
        <div className="max-w-[1440px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div>
              <h1 className="style-h1 text-[#FDFBF7] mb-6 lowercase first-letter:uppercase leading-tight">
                {current.title}
              </h1>
              <p className="style-body text-white/70 max-w-xl">
                {current.description}
              </p>
            </div>

            <div className="relative aspect-video w-full overflow-hidden rounded-[16px] border border-[#8B95AC] bg-[#2B3755]">
              <div className="absolute inset-0 flex items-center justify-center">
                {current.videoUrl ? (
                  current.videoUrl.includes('youtube.com') || current.videoUrl.includes('youtu.be') ? (
                    <iframe 
                      src={current.videoUrl} 
                      className="w-full h-full border-0" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen 
                    />
                  ) : (
                    <video src={current.videoUrl} controls className="w-full h-full object-cover" />
                  )
                ) : (
                  <div className="p-8 flex items-center justify-center">
                    <span className="text-white/30 style-body italic text-center">
                      Zde bude vysvětlující video pro kategorii {current.title}
                    </span>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#FF7F51]"></div>
        </div>
      ) : (
        <ProductList products={products} />
      )}
    </div>
  );
}