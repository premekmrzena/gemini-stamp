import { cache } from 'react';
import type { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import ProductDetailClient from './ProductDetailClient';
import Breadcrumbs from '@/components/Breadcrumbs';
import { SITE_URL } from '@/lib/site';

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
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return { title: 'Produkt nenalezen' };
  }

  const description = product.short_description || `${product.name} – sběratelský produkt My Creative Stamp.`;

  return {
    title: product.name,
    description,
    alternates: { canonical: `/produkt/${id}` },
    openGraph: {
      title: product.name,
      description,
      url: `/produkt/${id}`,
      images: [{ url: product.image_url }],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Získání ID z URL (pravidla Next.js 15+)
  const resolvedParams = await params;
  const productId = resolvedParams.id;

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
  let relatedProducts: any[] = [];

  // Kontrola, zda máme v poli related_stamp_id nějaká ID
  const hasRelatedIds = product.related_stamp_id && 
                        Array.isArray(product.related_stamp_id) && 
                        product.related_stamp_id.length > 0;

  if (hasRelatedIds) {
    // Stáhneme všechna ID, která jsi ručně vybral v DB
    const { data: related, error: relatedError } = await supabase
      .from('products')
      .select('id, name, price, sale_price, image_url')
      .in('id', product.related_stamp_id);

    if (related && !relatedError) {
      relatedProducts = related;
    }
  }

  // FALLBACK: Pokud jsi nic nevybral (nebo se nic nenašlo), ukážeme 3 nejnovější jiné známky
  if (relatedProducts.length === 0) {
    const { data: fallback } = await supabase
      .from('products')
      .select('id, name, price, sale_price, image_url')
      .neq('id', product.id) // Vynecháme aktuální produkt
      .order('created_at', { ascending: false })
      .limit(3);
    
    if (fallback) relatedProducts = fallback;
  }

  const categoryLabel = categoryLabels[product.category] || product.category;
  // Kreativní archy nemají vlastní stránku kategorie – vstupním bodem je editor.
  const categoryHref = product.category === 'kreativni-archy' ? '/vytvorit-arch' : `/kategorie/${product.category}`;

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.short_description || undefined,
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
          { label: product.name },
        ]}
      />
      <ProductDetailClient product={product} relatedProducts={relatedProducts} />
    </>
  );
}