export type LocalizableProductField = 'name' | 'short_description' | 'detailed_description';

// Volnější než Pick<Product, ...> - volající dodá jen pole relevantní pro to, co
// zrovna zobrazuje (karta produktu např. nepotřebuje detailed_description_*).
type LocalizableProduct = {
  name: string;
  short_description?: string | null;
  detailed_description?: string | null;
  name_en?: string | null;
  short_description_en?: string | null;
  detailed_description_en?: string | null;
  name_ko?: string | null;
  short_description_ko?: string | null;
  detailed_description_ko?: string | null;
  name_ja?: string | null;
  short_description_ja?: string | null;
  detailed_description_ja?: string | null;
  name_zh_hans?: string | null;
  short_description_zh_hans?: string | null;
  detailed_description_zh_hans?: string | null;
  name_zh_hant?: string | null;
  short_description_zh_hant?: string | null;
  detailed_description_zh_hant?: string | null;
};

// next-intl locale -> přípona překladového sloupce na products (docs/sql/013_products_intl_columns.sql).
// 'cs' (interní pracovní náhled, viz feedback_static_page_pattern v paměti) nemá vlastní
// sloupec - CZ text je přímo v base poli name/short_description/detailed_description.
const LOCALE_COLUMN_SUFFIX: Partial<Record<string, string>> = {
  en: 'en',
  ko: 'ko',
  ja: 'ja',
  'zh-Hans': 'zh_hans',
  'zh-Hant': 'zh_hant',
};

// Text produktu v aktuální mutaci s fallbackem na CZ (base sloupec), dokud překlad
// není vyplněný v adminu (docs/09-jazykove-mutace.md, krok 4d).
export function getLocalizedProductField(product: LocalizableProduct, locale: string, field: 'name'): string;
export function getLocalizedProductField(
  product: LocalizableProduct,
  locale: string,
  field: 'short_description' | 'detailed_description'
): string | null;
export function getLocalizedProductField(
  product: LocalizableProduct,
  locale: string,
  field: LocalizableProductField
): string | null {
  const baseValue = product[field] ?? null;
  const suffix = LOCALE_COLUMN_SUFFIX[locale];
  if (!suffix) return baseValue;

  const localizedValue = (product[`${field}_${suffix}` as keyof LocalizableProduct] ?? null) as string | null;
  return localizedValue && localizedValue.trim() !== '' ? localizedValue : baseValue;
}
