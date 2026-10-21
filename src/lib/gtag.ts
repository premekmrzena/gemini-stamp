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

// Mikrokonverze pro trychtýř landing → editor → košík (docs/14-plan-marketing-2026-10.md,
// bod 8). V GA4 označené jako klíčové události, do Google Ads importované jako
// sekundární konverze - Ads se dál optimalizují jen na purchase.
export function gtagLandingCtaClick(landing: string) {
  gtagEvent('landing_cta_click', { landing });
}

export function gtagSelectTemplate(templateId: string, templateName: string) {
  gtagEvent('select_template', { template_id: templateId, template_name: templateName });
}

export function gtagEditorPhotoUpload(templateId: string) {
  gtagEvent('editor_photo_upload', { template_id: templateId });
}

export function gtagEditorComplete(templateId: string) {
  gtagEvent('editor_complete', { template_id: templateId });
}

// Úvodní page_view odchází dřív, než návštěvník odklikne cookie lištu, tedy s
// odepřeným souhlasem (gcs=G100) - GA4 ho do standardních reportů nezapočítá a
// relace přijde o zdroj (gclid/utm z URL). Po prvním udělení analytického
// souhlasu ho proto pošleme znovu.
export function gtagResendPageview() {
  gtagEvent('page_view', { page_location: window.location.href, page_title: document.title });
}
