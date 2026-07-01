// Vrátí platnou zlevněnou cenu, pokud existuje a je nižší než původní cena
export function getSalePrice(price: number, salePrice: number | null | undefined): number | null {
  if (salePrice == null || salePrice <= 0 || salePrice >= price) return null;
  return salePrice;
}

// Cena, kterou zákazník reálně zaplatí
export function getEffectivePrice(price: number, salePrice: number | null | undefined): number {
  return getSalePrice(price, salePrice) ?? price;
}
