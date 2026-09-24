import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { supabase } from '@/lib/supabase';
import { SITE_NAME } from '@/lib/site';
import { CONTENT, isPartnerLang, PartnerLang } from './content';
import PartnerContent from './PartnerContent';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

// Jazyk: explicitní ?lang=cs|en (odkaz v e-mailu) > Accept-Language (čeština/
// slovenština → cs) > angličtina. Rozhoduje se na serveru, aby první vykreslení
// bylo rovnou ve správném jazyce, bez probliknutí.
async function resolveLang(searchParams: SearchParams): Promise<PartnerLang> {
  const { lang } = await searchParams;
  if (isPartnerLang(lang)) return lang;
  const acceptLanguage = (await headers()).get('accept-language') ?? '';
  return /^(cs|sk)\b/i.test(acceptLanguage.trim()) ? 'cs' : 'en';
}

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const c = CONTENT[await resolveLang(searchParams)];
  return { title: `${c.metaTitle} — ${SITE_NAME}`, description: c.metaDescription };
}

export type PriceRange = { czk: [number, number]; eur: [number, number] };

// Rozpětí cen kreativních archů přímo z DB, ať stránka nezastará při změně ceníku.
// Při chybě stránka cenu jen vynechá (guestPriceFallback), nespadne.
async function getCreativeSheetPriceRange(): Promise<PriceRange | null> {
  const { data, error } = await supabase
    .from('products')
    .select('price, price_eur')
    .eq('category', 'kreativni-archy')
    .eq('is_active', true);
  if (error || !data?.length) return null;

  const czk = data.map((p) => Number(p.price)).filter((n) => n > 0);
  const eur = data.map((p) => Number(p.price_eur)).filter((n) => n > 0);
  if (!czk.length || !eur.length) return null;
  return {
    czk: [Math.min(...czk), Math.max(...czk)],
    eur: [Math.min(...eur), Math.max(...eur)],
  };
}

export default async function PartnersPage({ searchParams }: { searchParams: SearchParams }) {
  const [lang, priceRange] = await Promise.all([resolveLang(searchParams), getCreativeSheetPriceRange()]);
  return <PartnerContent initialLang={lang} priceRange={priceRange} />;
}
