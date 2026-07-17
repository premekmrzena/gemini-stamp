import { DiscountType } from '@/types/database';

// Přepočte cenu v EUR do cílové měny podle ručně nastaveného kurzu
// (exchange_rates.rate_to_eur). Kurz může být zatím nenastavený (null),
// dokud ho admin nevyplní v záložce "Kurzy měn" - v tom případě cenu
// v dané měně nejde zobrazit.
export function convertFromEur(amountEur: number, rateToEur: number | null): number | null {
  if (rateToEur == null) return null;
  return Math.round(amountEur * rateToEur * 100) / 100;
}

// Spočítá výši slevy v Kč pro daný mezisoučet. Nikdy nevrátí víc, než je
// mezisoučet (fixní sleva vyšší než košík se ořízne, ne do záporu).
export function computeDiscountAmount(
  subtotal: number,
  discount: { type: DiscountType; value: number } | null
): number {
  if (!discount || subtotal <= 0) return 0;
  const raw = discount.type === 'percentage' ? (subtotal * discount.value) / 100 : discount.value;
  return Math.min(Math.max(raw, 0), subtotal);
}

// Vrátí platnou zlevněnou cenu, pokud existuje a je nižší než původní cena
export function getSalePrice(price: number, salePrice: number | null | undefined): number | null {
  if (salePrice == null || salePrice <= 0 || salePrice >= price) return null;
  return salePrice;
}

// Cena, kterou zákazník reálně zaplatí
export function getEffectivePrice(price: number, salePrice: number | null | undefined): number {
  return getSalePrice(price, salePrice) ?? price;
}
