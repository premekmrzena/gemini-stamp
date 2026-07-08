import { DiscountType } from '@/types/database';

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
