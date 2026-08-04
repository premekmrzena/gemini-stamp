'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { supabase } from '@/lib/supabase';
import ProductList from '@/components/ProductList';
import Breadcrumbs from '@/components/Breadcrumbs';
import TrustBadges from '@/components/TrustBadges';
import { getOrderCurrency, getLocalizedEffectivePrice, Currency } from '@/lib/currency';
import { Product, ProductTopic } from '@/types/database';
import { CATEGORY_GROUPS, INDEXABLE_CATEGORY_SLUGS } from '@/lib/categoryContent';

type SortableProduct = {
  name: string;
  price: number;
  sale_price: number | null;
  price_eur: number | null;
  sale_price_eur: number | null;
  sold_count: number | null;
};

type TopicFilterKey = 'vse' | ProductTopic;

const TOPIC_FILTER_KEYS: TopicFilterKey[] = ['vse', 'umeni', 'pamatky', 'znamky', 'archy'];

type SortKey = 'doporucene' | 'price_asc' | 'price_desc' | 'name_asc' | 'bestseller';

const SORT_KEYS: SortKey[] = ['doporucene', 'price_asc', 'price_desc', 'name_asc', 'bestseller'];

// price_asc/price_desc berou currency navíc (getLocalizedEffectivePrice vrací
// Infinity, když produktu chybí EUR cena, ať spadne na konec řazení).
const SORT_COMPARATORS: Record<SortKey, ((a: SortableProduct, b: SortableProduct, currency: Currency) => number) | null> = {
  doporucene: null,
  price_asc: (a, b, currency) => getLocalizedEffectivePrice(a, currency) - getLocalizedEffectivePrice(b, currency),
  price_desc: (a, b, currency) => getLocalizedEffectivePrice(b, currency) - getLocalizedEffectivePrice(a, currency),
  name_asc: (a, b) => a.name.localeCompare(b.name, 'cs'),
  bestseller: (a, b) => (b.sold_count ?? 0) - (a.sold_count ?? 0),
};

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const locale = useLocale();
  const currency = getOrderCurrency(locale);
  const slug = typeof params?.slug === 'string' ? params.slug : '';
  const t = useTranslations('category');

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>('doporucene');
  const [topicFilter, setTopicFilter] = useState<TopicFilterKey>('vse');

  const current = INDEXABLE_CATEGORY_SLUGS.includes(slug)
    ? { title: t(`content.${slug}.title`), description: t(`content.${slug}.description`) }
    : { title: slug, description: t('defaultDescription') };

  const categoriesToFetch = useMemo(() => CATEGORY_GROUPS[slug] || [slug], [slug]);
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
  }, [slug, categoriesToFetch]);

  const filteredProducts = useMemo(() => {
    if (topicFilter === 'vse') return products;
    return products.filter((p) => Array.isArray(p.product_topic) && p.product_topic.includes(topicFilter));
  }, [products, topicFilter]);

  const sortedProducts = useMemo(() => {
    const compare = SORT_COMPARATORS[sortKey];
    return compare ? [...filteredProducts].sort((a, b) => compare(a, b, currency)) : filteredProducts;
  }, [filteredProducts, sortKey, currency]);

  if (slug === 'kreativni-archy') return null;

  if (!slug && loading) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-secondary">{t('loading')}</div>;
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
                  {SORT_KEYS.map((key) => (
                    <option key={key} value={key}>{t(`sortOptions.${key}`)}</option>
                  ))}
                </select>
                {showTopicFilter && (
                  <select
                    value={topicFilter}
                    onChange={(e) => setTopicFilter(e.target.value as TopicFilterKey)}
                    className="bg-black400 border border-black300/30 rounded-[8px] px-3 h-[40px] style-body text-secondary outline-none focus:border-primary transition-all cursor-pointer"
                  >
                    {TOPIC_FILTER_KEYS.map((key) => (
                      <option key={key} value={key}>{t(`topicFilter.${key}`)}</option>
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
