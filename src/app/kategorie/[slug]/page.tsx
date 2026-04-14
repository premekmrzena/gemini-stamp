'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import ProductList from '@/components/ProductList';

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // KONFIGURACE KATEGORIÍ (Zde měň texty a odkazy na videa)
  const categoryContent: Record<string, { title: string; description: string; videoUrl: string }> = {
    'znamky': {
      title: 'Poštovní známky',
      description: 'Zde doplň svůj vlastní text pro kategorii Poštovní známky. Tento text nahrazuje původní Lorem Ipsum.',
      videoUrl: '/videos/znamky.mp4' // Cesta k souboru nebo YouTube embed link
    },
    'kreativni-archy': {
      title: 'Kreativní archy',
      description: 'Zde doplň svůj vlastní text pro kategorii Kreativní archy.',
      videoUrl: '' // Pokud necháš prázdné, zůstane placeholder
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

  // Pomocná proměnná pro aktuální obsah
  const current = categoryContent[slug] || { 
    title: slug, 
    description: 'Popis kategorie se připravuje...', 
    videoUrl: '' 
  };

  useEffect(() => {
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
    if (slug) fetchCategoryProducts();
  }, [slug]);

  return (
    <div className="min-h-screen bg-[#0F172A] pb-20">
      
      {/* SEKCE S TITULKEM A VIDEEM */}
      <section className="px-[24px] md:px-[44px] lg:px-[84px] py-8 md:py-12">
        <div className="max-w-[1440px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* TEXTOVÁ ČÁST */}
            <div>
              <h1 className="style-h1 text-[#FDFBF7] mb-6 lowercase first-letter:uppercase leading-tight">
                {current.title}
              </h1>
              <p className="style-body text-white/70 max-w-xl">
                {current.description}
              </p>
            </div>

            {/* VIDEO ČÁST */}
            <div className="relative aspect-video w-full overflow-hidden rounded-[16px] border border-[#8B95AC] bg-[#2B3755]">
              <div className="absolute inset-0 flex items-center justify-center">
                {current.videoUrl ? (
                  current.videoUrl.includes('youtube.com') || current.videoUrl.includes('vimeo.com') ? (
                    <iframe src={current.videoUrl} className="w-full h-full" allowFullScreen />
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

      {/* SEZNAM PRODUKTŮ */}
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