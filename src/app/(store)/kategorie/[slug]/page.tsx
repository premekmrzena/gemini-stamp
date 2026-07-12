'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import ProductList from '@/components/ProductList';
import Breadcrumbs from '@/components/Breadcrumbs';
import { getEffectivePrice } from '@/lib/pricing';

type SortableProduct = { name: string; price: number; sale_price: number | null; sold_count: number | null };

const SORT_OPTIONS = {
  doporucene: { label: 'Doporučené', compare: null },
  price_asc: { label: 'Cena: od nejnižší', compare: (a: SortableProduct, b: SortableProduct) => getEffectivePrice(a.price, a.sale_price) - getEffectivePrice(b.price, b.sale_price) },
  price_desc: { label: 'Cena: od nejvyšší', compare: (a: SortableProduct, b: SortableProduct) => getEffectivePrice(b.price, b.sale_price) - getEffectivePrice(a.price, a.sale_price) },
  name_asc: { label: 'Název: A–Z', compare: (a: SortableProduct, b: SortableProduct) => a.name.localeCompare(b.name, 'cs') },
  bestseller: { label: 'Nejprodávanější', compare: (a: SortableProduct, b: SortableProduct) => (b.sold_count ?? 0) - (a.sold_count ?? 0) },
} as const satisfies Record<string, { label: string; compare: ((a: SortableProduct, b: SortableProduct) => number) | null }>;

type SortKey = keyof typeof SORT_OPTIONS;

export default function CategoryPage() {
  const params = useParams();
  const slug = typeof params?.slug === 'string' ? params.slug : '';

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>('doporucene');

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

  const sortedProducts = useMemo(() => {
    const compare = SORT_OPTIONS[sortKey].compare;
    return compare ? [...products].sort(compare) : products;
  }, [products, sortKey]);

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
        <>
          {products.length > 0 && (
            <div className="layout-container flex justify-end mb-4">
              <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as SortKey)}
                className="bg-black400 border border-black300/30 rounded-[8px] px-3 h-[40px] style-body text-secondary outline-none focus:border-primary transition-all cursor-pointer"
              >
                {Object.entries(SORT_OPTIONS).map(([value, { label }]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          )}
          <ProductList products={sortedProducts} />
        </>
      )}
    </div>
  );
}
