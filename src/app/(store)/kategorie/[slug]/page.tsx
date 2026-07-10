'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import ProductList from '@/components/ProductList';
import Breadcrumbs from '@/components/Breadcrumbs';

export default function CategoryPage() {
  const params = useParams();
  const slug = typeof params?.slug === 'string' ? params.slug : '';

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const categoryContent: Record<string, { title: string; description: string; videoUrl: string }> = {
    'znamky': {
      title: 'Poštovní známky',
      description: 'Vstupte do světa, kde se setkávají majestátní evropská historie, architektura, nadčasové umění a hluboká mystika. Česká filatelistická škola je celosvětově uznávaným fenoménem, proslulým nedostižnou precizností tradiční ruční rytiny. Každá známka v této exkluzivní kolekci není jen obyčejným kouskem papíru, ale mistrovským uměleckým dílem a cenným artefaktem, který vypráví ty nejsilnější příběhy starého kontinentu.',
      videoUrl: '/videos/znamky.mp4'
    },
    'znamkove-archy': {
      title: 'Známkové archy',
      description: 'Zde doplň svůj vlastní text pro kategorii Známkové archy.',
      videoUrl: ''
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

  // Známky a Známkové archy se na eshopu vypisují společně na obou slugech.
  const categoryGroups: Record<string, string[]> = {
    'znamky': ['znamky', 'znamkove-archy'],
    'znamkove-archy': ['znamky', 'znamkove-archy'],
  };
  const categoriesToFetch = categoryGroups[slug] || [slug];

  useEffect(() => {
    if (!slug) return;
    async function fetchCategoryProducts() {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .in('category', categoriesToFetch)
        .eq('is_active', true)
        .order('tag_top', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false });
      if (!error) setProducts(data || []);
      setLoading(false);
    }
    fetchCategoryProducts();
  }, [slug]);

  if (!slug && loading) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-secondary">Načítám...</div>;
  }

  return (
    <div className="min-h-screen bg-black pb-20">
      <Breadcrumbs items={[{ label: current.title }]} />
      <section className="py-8 md:py-12">
        <div className="layout-container">
          {slug === 'kreativni-archy' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

              <div>
                <h1 className="style-h1 text-secondary mb-6 lowercase first-letter:uppercase leading-tight">
                  {current.title}
                </h1>
                <p className="style-body text-secondary/70 max-w-xl">
                  {current.description}
                </p>
              </div>

              <div className="relative aspect-video w-full overflow-hidden rounded-[16px] border border-black300 bg-black400">
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
                      <span className="text-secondary/30 style-body italic text-center">
                        Zde bude vysvětlující video pro kategorii {current.title}
                      </span>
                    </div>
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="flex flex-col items-center text-center">
              <h1 className="style-h1 text-secondary mb-6 lowercase first-letter:uppercase leading-tight">
                {current.title}
              </h1>
              <p className="style-body text-secondary/70 max-w-xl">
                {current.description}
              </p>
            </div>
          )}
        </div>
      </section>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary-hover" />
        </div>
      ) : (
        <ProductList products={products} />
      )}
    </div>
  );
}
