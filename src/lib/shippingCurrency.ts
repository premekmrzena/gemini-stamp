import { getShippingOptions, getMinInternationalPrice, PAYMENT_OPTIONS, ShippingOption, PaymentOption } from '@/lib/constants';
import { convertFromEur, convertToEur } from '@/lib/pricing';
import { Currency } from '@/lib/currency';

export type PricedShippingOptions =
  | { ok: true; options: ShippingOption[] }
  | { ok: false; reason: 'RATE_MISSING' };

// Jediné místo, kde se počítá EUR cena dopravy - volané shodně z klienta
// (kosik/page.tsx, jen pro odhad před odesláním) i ze serveru (create-order,
// autoritativně). CZK tabulky v constants.ts zůstávají zdroj pravdy (skutečné
// poštovné od České pošty), EUR se odvozuje kurzem (rate_to_eur = "1 EUR = X
// CZK", stejná sémantika jako u KRW/JPY/CNY/TWD).
export function getShippingOptionsInCurrency(
  weightGrams: number,
  subtotal: number,
  country: string,
  currency: Currency,
  czkPerEur: number | null
): PricedShippingOptions {
  if (currency === 'CZK') {
    return { ok: true, options: getShippingOptions(weightGrams, subtotal, country) };
  }

  if (czkPerEur == null) return { ok: false, reason: 'RATE_MISSING' };
  const rate: number = czkPerEur;

  // Round-trip, ne bug: pojistný příplatek u Cenného psaní (getCennePsaniPrice
  // v constants.ts) je vázaný na SKUTEČNOU Kč hodnotu zásilky, takže se subtotal
  // musí nejdřív převést do Kč, spočítat CZK ceny přes nezměněné getShippingOptions,
  // a až výsledné ceny převést zpátky do EUR pro zobrazení/účtování zákazníkovi.
  const subtotalCzk = convertFromEur(subtotal, rate) ?? 0;
  const czkOptions = getShippingOptions(weightGrams, subtotalCzk, country);
  const options = czkOptions.map((option) => ({
    ...option,
    price: convertToEur(option.price, rate) ?? option.price,
  }));
  return { ok: true, options };
}

export function getMinInternationalPriceInCurrency(
  weightGrams: number,
  subtotal: number,
  currency: Currency,
  czkPerEur: number | null
): { ok: true; price: number } | { ok: false; reason: 'RATE_MISSING' } {
  if (currency === 'CZK') {
    return { ok: true, price: getMinInternationalPrice(weightGrams, subtotal) };
  }

  if (czkPerEur == null) return { ok: false, reason: 'RATE_MISSING' };
  const rate: number = czkPerEur;

  const subtotalCzk = convertFromEur(subtotal, rate) ?? 0;
  const minCzk = getMinInternationalPrice(weightGrams, subtotalCzk);
  return { ok: true, price: convertToEur(minCzk, rate) ?? minCzk };
}

// Obě PAYMENT_OPTIONS mají price: 0 (žádná EUR konverze potřeba), tahle
// funkce jen filtruje 'prevod' (bankovní převod) pryč pro EUR objednávky -
// uživatel nemá EUR bankovní účet, takže tahle platební metoda tam nedává
// smysl. CZK/cs objednávky nabízí obě možnosti beze změny.
export function getPaymentOptionsInCurrency(currency: Currency): PaymentOption[] {
  if (currency === 'CZK') return PAYMENT_OPTIONS;
  return PAYMENT_OPTIONS.filter((option) => option.id !== 'prevod');
}
