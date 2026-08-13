import { supabase } from '@/lib/supabase';
import { SITE_URL, SITE_NAME } from '@/lib/site';
import { getLocalizedPrice } from '@/lib/currency';
import { getLocalizedProductField } from '@/lib/product-i18n';
import { Product } from '@/types/database';

// Google Merchant Center product feed (RSS 2.0 + namespace `g:`), viz
// https://support.google.com/merchants/answer/7052112. Merchant Center si
// tohle URL sám pravidelně stahuje (naplánovaný fetch v jeho nastavení) -
// žádné ruční přidávání produktů. Bypassuje next-intl/gate middleware díky
// tečce v cestě (`\.` v proxy.ts matcheru), stejný trik jako sitemap.xml.
export const revalidate = 3600;

const FEED_COLUMNS =
  'id, name, name_en, short_description, short_description_en, category, image_url, price, sale_price, price_eur, sale_price_eur, is_active, catalog_number';

type FeedProduct = Pick<
  Product,
  | 'id'
  | 'name'
  | 'name_en'
  | 'short_description'
  | 'short_description_en'
  | 'category'
  | 'image_url'
  | 'price'
  | 'sale_price'
  | 'price_eur'
  | 'sale_price_eur'
  | 'is_active'
  | 'catalog_number'
>;

// Volný text (ne Google Product Taxonomy ID) - jen orientační pro kampaně,
// není to povinné pole. Stejné popisky jako messages/en.json product.categoryLabels.
const CATEGORY_LABELS: Record<string, string> = {
  znamky: 'Postage stamps',
  'znamkove-archy': 'Stamp sheets',
  fdc: 'First Day Cover (FDC)',
  plakety: 'Gift plaques',
};

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function formatEur(amount: number): string {
  return `${amount.toFixed(2)} EUR`;
}

export async function GET() {
  const { data: products } = await supabase
    .from('products')
    .select(FEED_COLUMNS)
    .eq('is_active', true)
    // Kreativní archy nemají samostatnou "koupit" stránku - vstupním bodem je
    // editor (/vytvorit-arch), ne přímé přidání do košíku z /produkt/[id].
    // Google chce, aby link vedl rovnou na koupitelnou položku, viz
    // ProductDetailClient.tsx (isCreativeArch).
    .neq('category', 'kreativni-archy');

  const items = ((products || []) as FeedProduct[])
    .map((product) => {
      const localizedPrice = getLocalizedPrice(product, 'EUR');
      // Bez EUR ceny (nevyplněná v adminu) produkt do feedu nepatří - stejné
      // pravidlo jako u Product JSON-LD na /produkt/[id].
      if (!localizedPrice) return null;

      const title = getLocalizedProductField(product, 'en', 'name');
      const description =
        getLocalizedProductField(product, 'en', 'short_description') ||
        `${title} - collectible product from ${SITE_NAME}.`;
      const hasSale = localizedPrice.salePrice != null && localizedPrice.salePrice < localizedPrice.price;

      return `
    <item>
      <g:id>${escapeXml(product.id)}</g:id>
      <title>${escapeXml(title)}</title>
      <description>${escapeXml(description)}</description>
      <link>${escapeXml(`${SITE_URL}/produkt/${product.id}`)}</link>
      <g:image_link>${escapeXml(product.image_url)}</g:image_link>
      <g:condition>new</g:condition>
      <!-- Sklad je jen informativní a nikdy neblokuje nákup (viz
           project_stock_informational v paměti) - aktivní produkt je proto
           vždy "in stock", ať skladová evidence ukazuje cokoli. -->
      <g:availability>in stock</g:availability>
      <g:price>${formatEur(localizedPrice.price)}</g:price>
      ${hasSale ? `<g:sale_price>${formatEur(localizedPrice.salePrice as number)}</g:sale_price>` : ''}
      <g:brand>${escapeXml(SITE_NAME)}</g:brand>
      <!-- catalog_number je filatelistické katalogové číslo, ne GTIN/MPN -
           bez skutečného identifikátoru musí být tohle "no", jinak Google
           položku zamítne kvůli chybějícímu GTIN. -->
      <g:identifier_exists>no</g:identifier_exists>
      ${product.category && CATEGORY_LABELS[product.category] ? `<g:product_type>${escapeXml(CATEGORY_LABELS[product.category])}</g:product_type>` : ''}
    </item>`;
    })
    .filter(Boolean)
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${escapeXml(SITE_NAME)}</title>
    <link>${escapeXml(SITE_URL)}</link>
    <description>Product feed for ${escapeXml(SITE_NAME)} - Google Merchant Center</description>${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=UTF-8',
    },
  });
}
