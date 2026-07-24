import { Currency } from '@/types/database';
import { getEffectivePrice } from '@/lib/pricing';

export type { Currency };

// 'cs' je jen interní /cs náhled (viz docs/09-jazykove-mutace.md), ne skutečná
// CZK mutace pro zákazníky - použít JEN pro odvození měny NOVÉHO checkoutu
// podle aktuálního locale prohlížeče. Existující objednávka (admin, e-maily)
// vždy čte order.currency z DB, nikdy si měnu neodvozuje znovu odsud.
export function getOrderCurrency(locale: string): Currency {
  return locale === 'cs' ? 'CZK' : 'EUR';
}

// CZK větev beze změny vůči dosavadnímu chování (žádný přechod na Intl
// currency-style), ať se nezmění vzhled na /cs a v adminu.
export function formatPrice(amount: number, currency: Currency): string {
  if (currency === 'CZK') {
    return `${Math.round(amount).toLocaleString('cs-CZ')} Kč`;
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' }).format(amount);
}

type PriceableProduct = {
  price: number;
  sale_price: number | null;
  price_eur?: number | null;
  sale_price_eur?: number | null;
};

// Na rozdíl od getLocalizedProductField (text) tady NENÍ fallback na CZK
// hodnotu, když EUR cena chybí - vrátit CZK číslo jako by bylo EUR by byl
// vážný cenový bug (~24x přeplatek), ne kosmetická nedodělaná lokalizace.
export function getLocalizedPrice(
  product: PriceableProduct,
  currency: Currency
): { price: number; salePrice: number | null } | null {
  if (currency === 'CZK') {
    return { price: product.price, salePrice: product.sale_price };
  }
  if (product.price_eur == null) return null;
  return { price: product.price_eur, salePrice: product.sale_price_eur ?? null };
}

// Pro řazení podle ceny - Infinity místo NaN, když cena v dané měně chybí,
// ať produkt spadne na konec seznamu místo pádu na chybném porovnání.
export function getLocalizedEffectivePrice(product: PriceableProduct, currency: Currency): number {
  const localized = getLocalizedPrice(product, currency);
  if (!localized) return Infinity;
  return getEffectivePrice(localized.price, localized.salePrice);
}
