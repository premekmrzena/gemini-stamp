# 12. Analytika (GA4)

> Stav popsaný podle skutečného kódu k 2026-08-04. Tuto sekci aktualizovat při každé změně trackingu.

## Souhrn
GA4 pageview tracking + Consent Mode v2 + 4 ecommerce eventy (`view_item`, `add_to_cart`, `begin_checkout`, `purchase`) jsou hotové, zapojené a živě ověřené přes Playwright (viz níže). GA4 tak umí reportovat celý konverzní trychtýř včetně tržeb.

## Ecommerce eventy
| Event | Kde se spouští | Zdroj dat |
|---|---|---|
| `view_item` | `produkt/[id]/ProductDetailClient.tsx`, `useEffect` při mountu (klíčováno na `product.id`) | lokalizovaná cena/název produktu |
| `add_to_cart` | centrálně v `CartContext.addToCart()` – pokrývá všechna 3 místa, odkud se volá (`ProductDetailClient`, `AddToCartButton`, `vytvorit-arch/page.tsx`) | `CartItem` předaný do `addToCart()` |
| `begin_checkout` | `kosik/page.tsx`, při přechodu z kroku 1 (košík) na krok 2 (doprava); `useRef` guard – pošle se jen jednou za návštěvu košíku | `cartItems`/`cartTotalAfterDiscount` + `coupon` z `CartContext` |
| `purchase` | `dekujeme/page.tsx` (`ThankYouContent`), po dokončení objednávky | `transaction_id`=orderId, `value`/`currency` z query parametrů (`total`, `currency` – server-autoritativní částka z `create-order`), `items` z `cartItems` |

Helpery: `gtagViewItem`, `gtagAddToCart`, `gtagBeginCheckout`, `gtagPurchase` v `src/lib/gtag.ts`.

**`purchase` – dva gotchas vyřešené při implementaci:**
1. **Hydratační race.** `/dekujeme` se navštěvuje plným reloadem (`window.location.href` u převodu, Stripe `return_url` u karty), takže `CartContext` tahá `cartItems` z `localStorage` až ve vlastním `useEffect` – a React fire-uje efekty od nejhlubšího potomka k rodiči, takže efekt v `ThankYouContent` běží dřív než hydratace v `CartContext`. Řešení: efekt čeká (`if (cartItems.length === 0) return;`), dokud `cartItems` nejsou hydratované, jinak by `purchase` odešel s prázdným `items: []`.
2. **Autoritativní částka.** `total`/`currency` se předávají přes query parametry na `/dekujeme` (z `useCheckout.ts` i `StripePaymentForm.tsx`), ne z `CartContext.cartTotal` – ten neobsahuje dopravu/platební příplatek/slevu, jen součet položek.
3. **Dedup.** `sessionStorage` klíč `mcs_ga_purchase_sent` s orderId – refresh/návrat na `/dekujeme` nesmí odeslat `purchase` znovu.

4. **Slevový kód a `begin_checkout`.** `DiscountCodeInput` je součástí `OrderSummary`, která je vidět už na kroku 1 (košík) – zákazník tak může slevový kód uplatnit dřív, než klikne na „Další krok“ (přechod na krok 2, kdy se `begin_checkout` posílá). Proto `value` musí být `cartTotalAfterDiscount`, ne `cartTotal` (tu použitou verzi nahlásil Gemini při paralelní kontrole 2026-08-04) – navíc se přidal `coupon` parametr s kódem, pokud je uplatněný. Pozor: pokud se zákazník vrátí zpět na krok 1 a uplatní/zruší kód až po prvním odeslání `begin_checkout`, event se podruhé nepošle (`useRef` guard) – hodnota z prvního odeslání se nepřepočítá. Vědomě přijatý kompromis, neřeší se.

**Ověřeno živě 2026-08-04** přes Playwright (headless Chromium, `site_access` cookie pro obejití pre-launch gate, patchnutý `window.gtag` pro zachycení všech volání) – celý flow produkt → košík → adresa → objednávka převodem (i se slevovým kódem u `begin_checkout`), všechny eventy odešly se správnými daty. **Pozor:** tenhle test reálně proběhl přes `/api/create-order` u platby převodem, což spustilo živé vytvoření zálohové faktury v iDokladu (`createProformaForOrder`) – 2 testovací objednávky (a s nimi 2 proforma faktury v iDokladu) vznikly při ověřování. Testovací řádky v `orders` byly smazané, **zálohové faktury v iDokladu ale ne** – je potřeba je tam dohledat a smazat/zneplatnit ručně (order ID `00de26bd-0591-4f05-b47c-58050a450a8e` a `f6a2e28a-9333-4cf4-93d9-b2af9a51a292`, e-mail `test.ga4@example.com`, 209 Kč).

## Zapojené soubory
| Soubor | Role |
|---|---|
| `src/lib/gtag.ts` | `GA_MEASUREMENT_ID` z env, `gtagPageview()`, `gtagConsentUpdate()` |
| `src/app/[locale]/GoogleAnalytics.tsx` | Vkládá gtag.js + Consent Mode v2 default (`beforeInteractive`) + init (`afterInteractive`) |
| `src/components/AnalyticsPageview.tsx` | Client komponenta, na každou změnu `pathname`/`searchParams` pošle `gtag('config', ..., { page_path })` – nutné kvůli App Router klientské navigaci bez reloadu |
| `src/components/CookieConsent.tsx` | Cookie lišta (accept/reject), ukládá volbu do `localStorage` (`mcs_cookie_consent`), volá `gtagConsentUpdate()` |
| `src/app/[locale]/layout.tsx` | Skládá dohromady `<GoogleAnalytics />`, `<AnalyticsPageview />`, `<CookieConsent />` |

## Měřicí ID
`NEXT_PUBLIC_GA_MEASUREMENT_ID=G-GEWCN5GTW2` – nastaveno v `.env.local` i na Vercelu v produkci. **Ověřeno 2026-08-04**: produkční HTML z `mycreativestamp.com` (staženo s `site_access` cookie kvůli pre-launch gate) obsahuje `gtag.js` se správným ID, a GA4 Realtime report reálně zachytává provoz z produkce.

## Consent Mode v2 – jak to funguje
1. `GoogleAnalytics.tsx` v `beforeInteractive` scriptu nastaví `dataLayer`/`gtag` a hned zavolá `gtag('consent', 'default', ...)` se vším na `denied` a `wait_for_update: 500`. Tohle musí proběhnout dřív, než se načte samotný `gtag.js`, jinak by GA mohl odeslat hit dřív, než známe volbu uživatele.
2. `gtag.js` + `gtag('config', ...)` se načtou v `afterInteractive`.
3. `CookieConsent.tsx` při mountu zkontroluje `localStorage`:
   - pokud volba už existuje a `analytics: true` → hned zavolá `gtagConsentUpdate(true)`.
   - pokud volba neexistuje → po 2s zobrazí lištu; kliknutím na přijmout/odmítnout se uloží volba a zavolá `gtagConsentUpdate(analytics)`.
4. `gtagConsentUpdate(analyticsGranted, marketingGranted)` mění `analytics_storage` podle `analyticsGranted` a `ad_storage`/`ad_user_data`/`ad_personalization` společně podle `marketingGranted` (svázané do jednoho "marketing" účelu – reklama/remarketing, rozlišovat je na 3 samostatné přepínače by jen mátlo). Lišta (`CookieConsent.tsx`) nabízí 2 nezávislé kategorie (checkboxy) + 3 akce: „Odmítnout vše", „Přijmout vše", „Uložit výběr" (uloží aktuální stav checkboxů). Starší jednokategoriové uložené volby (`{ analytics: boolean }` bez `marketing`) se čtou s `marketing: false` (viz `readConsent()`).

**Historie:** do 2026-08-04 měla lišta jen jeden přepínač (jen analytics) a `gtagConsentUpdate` uměl nastavit jen `analytics_storage` – `ad_storage`/`ad_user_data`/`ad_personalization` byly natvrdo `denied` bez jakékoli cesty k `granted`, přestože text v `ochrana-osobnich-udaju` (sekce 7) i `moreInfo` na liště už tehdy mluvily obecně o „marketingových cookies" (nahlásil Gemini při paralelní kontrole). Opraveno rozšířením na 2 kategorie – teď odpovídá text realitě a zároveň je připravená infrastruktura pro budoucí remarketing/Google Ads tagy (ty jen budou číst stejný consent state, lištu už není nutné znovu upravovat). Živě ověřeno přes Playwright: „Uložit výběr" s jen zaškrtnutým Marketingem → `analytics_storage: denied`, `ad_*: granted`; „Přijmout vše" → všechny 4 `granted`; reload stránky nezobrazí lištu znovu a rovnou reaplikuje uložený consent.

## Pageview tracking
`AnalyticsPageview` řeší SPA navigaci – `gtag('config', GA_MEASUREMENT_ID, { page_path })` se volá i při klientských přechodech mezi stránkami (Next.js App Router nedělá full reload).

## Otevřené body
- **iDoklad testovací proforma faktury** z ověření výše – smazat/zneplatnit ručně (viz detaily v sekci Ecommerce eventy).
- **Umístění `beforeInteractive` scriptu.** `GoogleAnalytics.tsx` běží v `src/app/[locale]/layout.tsx`, ne v kořenovém `app/layout.tsx`. Next.js dokumentace říká, že `beforeInteractive` má spolehlivě fungovat jen v kořenovém layoutu. Prakticky nevadí, dokud je skoro celý web pod `[locale]`, ale přesun do kořene by přinesl GA i na `/admin`/`/rekonstrukce`. Vědomě neřešeno, viz [sekce 6](06-odlozene-ulohy.md).
