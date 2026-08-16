import { Currency } from '@/types/database';

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

// ad_storage/ad_user_data/ad_personalization se svazují do jednoho "marketing"
// souhlasu (remarketing/Google Ads) - jde o jeden účel (reklama), rozlišovat
// je v UI na 3 samostatné přepínače by jen mátlo bez reálného přínosu.
export function gtagConsentUpdate(analyticsGranted: boolean, marketingGranted: boolean) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  const marketingValue = marketingGranted ? 'granted' : 'denied';
  window.gtag('consent', 'update', {
    analytics_storage: analyticsGranted ? 'granted' : 'denied',
    ad_storage: marketingValue,
    ad_user_data: marketingValue,
    ad_personalization: marketingValue,
  });
}

export function gtagPageview(url: string) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function' || !GA_MEASUREMENT_ID) return;
  window.gtag('config', GA_MEASUREMENT_ID, { page_path: url });
}

export type GaItem = {
  item_id: string;
  item_name: string;
  price: number;
  quantity?: number;
};

function gtagEvent(name: string, params: Record<string, unknown>) {
  // Bez consent souhlasu je window.gtag pořád funkce (nastavená v beforeInteractive
  // scriptu), jen GA interně eventy zahodí podle 'consent' stavu - není nutná
  // vlastní kontrola souhlasu tady.
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  window.gtag('event', name, params);
}

export function gtagViewItem(item: GaItem, currency: Currency) {
  gtagEvent('view_item', {
    currency,
    value: item.price,
    items: [item],
  });
}

export function gtagAddToCart(item: GaItem, currency: Currency) {
  gtagEvent('add_to_cart', {
    currency,
    value: item.price * (item.quantity ?? 1),
    items: [item],
  });
}

export function gtagBeginCheckout(items: GaItem[], value: number, currency: Currency, coupon?: string | null) {
  gtagEvent('begin_checkout', { currency, value, items, ...(coupon ? { coupon } : {}) });
}

export function gtagPurchase(
  orderId: string,
  value: number,
  currency: Currency,
  items: GaItem[],
  coupon?: string | null
) {
  gtagEvent('purchase', {
    transaction_id: orderId,
    currency,
    value,
    items,
    ...(coupon ? { coupon } : {}),
  });
}
