import { cache } from 'react';
import type { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import ProductDetailClient from './ProductDetailClient';
import Breadcrumbs from '@/components/Breadcrumbs';
import { SITE_URL } from '@/lib/site';
import { Product } from '@/types/database';
import { getLocalizedProductField } from '@/lib/product-i18n';

const RELATED_PRODUCT_COLUMNS =
  'id, name, name_en, name_ko, name_ja, name_zh_hans, name_zh_hant, price, sale_price, image_url';

type RelatedProduct = Pick<
  Product,
  'id' | 'name' | 'name_en' | 'name_ko' | 'name_ja' | 'name_zh_hans' | 'name_zh_hant' | 'price' | 'sale_price' | 'image_url'
>;

const categoryLabels: Record<string, string> = {
  'znamky': 'Poštovní známky',
  'znamkove-archy': 'Známkové archy',
  'kreativni-archy': 'Kreativní archy',
  'fdc': 'First Day Cover (FDC)',
  'plakety': 'Dárkové plakety',
};

// Vypne cachování pro 100% aktuálnost dat
export const revalidate = 0;

// cache() sdílí jeden dotaz mezi generateMetadata a stránkou samotnou.
const getProduct = cache(async (productId: string) => {
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .single();
  return data;
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}): Promise<Metadata> {
  const { id, locale } = await params;
  const product = await getProduct(id);

  if (!product) {
    return { title: 'Produkt nenalezen' };
  }

  const name = getLocalizedProductField(product, locale, 'name');
  const shortDescription = getLocalizedProductField(product, locale, 'short_description');
  const description = shortDescription || `${name} – sběratelský produkt My Creative Stamp.`;

  return {
    title: name,
    description,
    alternates: { canonical: `/produkt/${id}` },
    openGraph: {
      title: name,
      description,
      url: `/produkt/${id}`,
      images: [{ url: product.image_url }],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  // Získání ID z URL (pravidla Next.js 15+)
  const resolvedParams = await params;
  const productId = resolvedParams.id;
  const locale = resolvedParams.locale;

  // 1. Stáhneme detail hlavního produktu
  const product = await getProduct(productId);

  if (!product) {
    return (
      <div className="w-full min-h-[50vh] flex flex-col items-center justify-center bg-[#0F172A] text-[#FDFBF7]">
        <h2 className="style-h2 mb-4">Produkt nenalezen</h2>
        <p className="style-body text-[#8B95AC]">Omlouváme se, ale tato známka už v databázi pravděpodobně není.</p>
      </div>
    );
  }

  // 2. LOGIKA PRO SOUVISEJÍCÍ PRODUKTY (ARRAY VERSION)
  let relatedProducts: RelatedProduct[] = [];

  // Kontrola, zda máme v poli related_stamp_id nějaká ID
  const hasRelatedIds = product.related_stamp_id && 
                        Array.isArray(product.related_stamp_id) && 
                        product.related_stamp_id.length > 0;

  if (hasRelatedIds) {
    // Stáhneme všechna ID, která jsi ručně vybral v DB
    const { data: related, error: relatedError } = await supabase
      .from('products')
      .select(RELATED_PRODUCT_COLUMNS)
      .in('id', product.related_stamp_id);

    if (related && !relatedError) {
      relatedProducts = related;
    }
  }

  // FALLBACK: Pokud jsi nic nevybral (nebo se nic nenašlo), ukážeme 3 nejnovější jiné známky
  if (relatedProducts.length === 0) {
    const { data: fallback } = await supabase
      .from('products')
      .select(RELATED_PRODUCT_COLUMNS)
      .neq('id', product.id) // Vynecháme aktuální produkt
      .order('created_at', { ascending: false })
      .limit(3);
    
    if (fallback) relatedProducts = fallback;
  }

  const categoryLabel = categoryLabels[product.category] || product.category;
  // Kreativní archy nemají vlastní stránku kategorie – vstupním bodem je editor.
  const categoryHref = product.category === 'kreativni-archy' ? '/vytvorit-arch' : `/kategorie/${product.category}`;
  const localizedName = getLocalizedProductField(product, locale, 'name');
  const localizedShortDescription = getLocalizedProductField(product, locale, 'short_description');

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: localizedName,
    description: localizedShortDescription || undefined,
    image: product.image_url,
    sku: product.catalog_number || product.id,
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/produkt/${product.id}`,
      priceCurrency: 'CZK',
      price: product.sale_price ?? product.price,
      availability: product.stock_quantity > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <Breadcrumbs
        items={[
          { label: categoryLabel, href: categoryHref },
          { label: localizedName },
        ]}
      />
      <ProductDetailClient product={product} relatedProducts={relatedProducts} />
    </>
  );
}