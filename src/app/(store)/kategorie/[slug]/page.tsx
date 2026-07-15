'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import ProductList from '@/components/ProductList';
import Breadcrumbs from '@/components/Breadcrumbs';
import TrustBadges from '@/components/TrustBadges';
import { getEffectivePrice } from '@/lib/pricing';
import { ProductTopic } from '@/types/database';

type SortableProduct = { name: string; price: number; sale_price: number | null; sold_count: number | null };

const TOPIC_FILTER_OPTIONS: Record<'vse' | ProductTopic, string> = {
  vse: 'Vše',
  umeni: 'Umění',
  pamatky: 'Památky',
  znamky: 'Známky',
  archy: 'Archy',
};

type TopicFilterKey = keyof typeof TOPIC_FILTER_OPTIONS;

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
  const router = useRouter();
  const slug = typeof params?.slug === 'string' ? params.slug : '';

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>('doporucene');
  const [topicFilter, setTopicFilter] = useState<TopicFilterKey>('vse');

  const categoryContent: Record<string, { title: string; description: string }> = {
    'znamky': {
      title: 'Poštovní známky',
      description: 'Nahlédněte do světa české známkové tvorby, která je celosvětově uznávaným fenoménem, proslulým nedostižnou precizností tradiční ruční rytiny. Každá známka je hodnotnou ceninou a sběratelským unikátem. Emise známek se vytiskly ve velmi omezené sérii a již nikdy nebudou dotiskuty. Každá známka je mistrovským uměleckým dílem, které vypráví ty nejsilnější příběhy starého kontinentu.',
    },
    'znamkove-archy': {
      title: 'Známkové archy',
      description: 'Zde doplň svůj vlastní text pro kategorii Známkové archy.',
    },
    'fdc': {
      title: 'First Day Cover (FDC)',
      description: 'Zde doplň svůj vlastní text pro kategorii FDC.',
    },
    'plakety': {
      title: 'Dárkové plakety',
      description: 'Zde doplň svůj vlastní text pro kategorii Dárkové plakety.',
    }
  };

  const current = categoryContent[slug] || {
    title: slug,
    description: 'Popis kategorie se připravuje...',
  };

  // Známky a Známkové archy se na eshopu vypisují společně na obou slugech.
  const categoryGroups: Record<string, string[]> = {
    'znamky': ['znamky', 'znamkove-archy'],
    'znamkove-archy': ['znamky', 'znamkove-archy'],
  };
  const categoriesToFetch = categoryGroups[slug] || [slug];
  const showTopicFilter = slug === 'znamky' || slug === 'znamkove-archy';

  // Kreativní archy nemají vlastní stránku kategorie – nahrazeno editorem na /vytvorit-arch.
  useEffect(() => {
    if (slug === 'kreativni-archy') router.replace('/vytvorit-arch');
  }, [slug, router]);

  useEffect(() => {
    if (!slug || slug === 'kreativni-archy') return;
    async function fetchCategoryProducts() {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .in('category', categoriesToFetch)
        .eq('is_active', true)
        .order('sort_order', { ascending: true, nullsFirst: false }) // Ruční pořadí má přednost přede vším
        .order('tag_top', { ascending: true, nullsFirst: false })
        .order('tag_new', { ascending: false }) // Novinky hned pod TOP produkty
        .order('created_at', { ascending: false });
      if (!error) setProducts(data || []);
      setLoading(false);
    }
    fetchCategoryProducts();
  }, [slug]);

  const filteredProducts = useMemo(() => {
    if (topicFilter === 'vse') return products;
    return products.filter((p) => Array.isArray(p.product_topic) && p.product_topic.includes(topicFilter));
  }, [products, topicFilter]);

  const sortedProducts = useMemo(() => {
    const compare = SORT_OPTIONS[sortKey].compare;
    return compare ? [...filteredProducts].sort(compare) : filteredProducts;
  }, [filteredProducts, sortKey]);

  if (slug === 'kreativni-archy') return null;

  if (!slug && loading) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-secondary">Načítám...</div>;
  }

  return (
    <div className="min-h-screen bg-black pb-20">
      <Breadcrumbs items={[{ label: current.title }]} />
      <section className="py-8 md:py-12">
        <div className="layout-container">
          <div className="flex flex-col items-center text-center">
            <h1 className="style-h1 text-secondary mb-6 lowercase first-letter:uppercase leading-tight">
              {current.title}
            </h1>
            <p className="style-body text-secondary/70 max-w-[43rem]">
              {current.description}
            </p>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary-hover" />
        </div>
      ) : (
        <>
          {products.length > 0 && (
            <div className="layout-container flex flex-wrap items-center justify-center md:justify-between gap-3 mb-4">
              <TrustBadges />
              <div className="flex flex-wrap items-center justify-center gap-3">
                <select
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value as SortKey)}
                  className="bg-black400 border border-black300/30 rounded-[8px] px-3 h-[40px] style-body text-secondary outline-none focus:border-primary transition-all cursor-pointer"
                >
                  {Object.entries(SORT_OPTIONS).map(([value, { label }]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                {showTopicFilter && (
                  <select
                    value={topicFilter}
                    onChange={(e) => setTopicFilter(e.target.value as TopicFilterKey)}
                    className="bg-black400 border border-black300/30 rounded-[8px] px-3 h-[40px] style-body text-secondary outline-none focus:border-primary transition-all cursor-pointer"
                  >
                    {Object.entries(TOPIC_FILTER_OPTIONS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          )}
          <ProductList products={sortedProducts} />
        </>
      )}
    </div>
  );
}
