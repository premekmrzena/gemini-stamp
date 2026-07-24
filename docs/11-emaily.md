# 11. Transakční e-maily

> Stav popsaný podle skutečného kódu k 2026-07-24. Doplňuje [sekci 1](01-technicka-infrastruktura.md#e-maily--resend) (infrastruktura/Resend) a [sekci 2](02-stavy-objednavky.md#notifikační-e-maily-podle-stavu-od-2026-07-24) (mapování na stavy objednávky) o pohled na obsah šablon – kde se text edituje a jaký jazyk se používá.

## Přehled
Žádný CMS ani editor e-mailů v adminu – šablony jsou React komponenty v `src/components/emails/`, vyrenderované na server-side HTML přes `@react-email/render` a odeslané přes Resend (`src/lib/email.ts`, funkce `send*`). Text je napsaný přímo v JSX, stylování jen inline (`style={{...}}`), protože e-mailoví klienti externí CSS/Tailwind třídy nerespektují – viz komentář v `EmailLayout.tsx`.

## Šablony a kdy se odesílají

| Šablona (`src/components/emails/`) | Kdy se pošle | Kdo/co to spouští |
|---|---|---|
| `OrderConfirmationEmail` | Ihned po vytvoření objednávky – **jen u platby převodem** (obsahuje QR kód a bankovní údaje) | `POST /api/create-order` |
| `OrderConfirmationEmail` | Po úspěšné platbě kartou (`payment_intent.succeeded`) | `POST /api/stripe-webhook` (`sendOrderConfirmationForCardPayment`) |
| `PaymentReceivedEmail` | Admin ručně nastaví stav `Zaplaceno` (typicky ruční potvrzení platby převodem – kartou jde potvrzení vždy přes řádek výše) | `POST /api/admin/notify-order-status` |
| `ReadyForPickupEmail` | Admin ručně nastaví stav `K vyzvednutí` | `POST /api/admin/notify-order-status` |
| `OrderCancelledEmail` | Admin ručně nastaví stav `Zrušeno` | `POST /api/admin/notify-order-status` |
| `RefundedEmail` | Admin ručně nastaví stav `Vráceny peníze` | `POST /api/admin/notify-order-status` |
| `ShippingNotificationEmail` | Admin zadá sledovací číslo zásilky u objednávky | `POST /api/send-shipping-notification` (`handleSaveTrackingNumber` v dashboardu) |

Zbylé stavy objednávky (`Připravujeme`, `Doručeno`, `Vyzvednuto`, `Uzavřeno`, `Vráceno`, `Ztracená zásilka`, `Reklamace`) e-mail nespouští – mapování je v `STATUS_EMAIL_NOTIFICATIONS` (`src/app/admin/dashboard/page.tsx`).

## Kde upravit text šablony
Přímo v JSX daného souboru, žádné oddělené textové/message soubory:
- **Předmět e-mailu** – řetězec u `resend.emails.send({ subject: ... })` v `src/lib/email.ts`, jedna funkce `send*` na šablonu.
- **Tělo e-mailu** – text je vepsaný přímo mezi JSX tagy v příslušné komponentě (`<h2>`, `<p>`, `<div>`...), např. text „Děkujeme za vaši objednávku!“ je natvrdo v `OrderConfirmationEmail.tsx`. Proměnné hodnoty (jméno, číslo objednávky, částka...) přicházejí jako props z `send*` funkce, statický text kolem nich se mění editací JSX.
- **Společné části** (logo, rámeček, patička s adresou) – `EmailLayout.tsx`, sdílí ho všech 6 šablon.

## Logo (přidáno 2026-07-24)
`EmailLayout.tsx` zobrazuje logo jako `<img>` místo dřívějšího textového H1 „My Creative Stamp“. Zdrojové SVG (`public/images/creative-stamp_logo.svg`) e-mailoví klienti (hlavně desktopový Outlook) běžně nezobrazí spolehlivě, proto je z něj vyexportovaná rastrová `public/images/creative-stamp_logo-email.png` (352×92 px, @2x pro retinu, průhledné pozadí) a načítá se přes absolutní URL (`${SITE_URL}/images/creative-stamp_logo-email.png`) – e-mail si ji stáhne z veřejného webu, na rozdíl od QR kódu platby (ten je unikátní pro každou objednávku, takže jde do e-mailu jako CID příloha, ne přes URL). Pokud se logo v budoucnu předělá, je potřeba znovu vyexportovat PNG (`sharp` je už v `node_modules`) a nahradit soubor – SVG samotné do šablon nepoužívat.

## Překlad – rozhodnuto 2026-07-24: jen anglicky, žádná volba jazyka
**Šablony jsou teď natvrdo anglicky** (předměty i těla, `src/lib/email.ts` + `src/components/emails/*.tsx`) – dřívější čeština byla nahrazena beze zbytku, žádná dvoujazyčnost/lokalizace zapojená není. Vědomé rozhodnutí, ne dočasný stav:
- **`en` je jediný reálný zákaznický jazyk webu** (viz [sekce 9](09-jazykove-mutace.md#domény) – `en` je produkční `defaultLocale`, `cs` je jen interní `/cs` náhled za pre-launch gate, ne plnohodnotná mutace pro zákazníky). Dvoujazyčná infrastruktura pro e-maily (sloupec `orders.locale`, zachycení jazyka při checkoutu, protažení přes `create-order`/`stripe-webhook`/admin, `next-intl` messages) by tedy sloužila jazyku, který dnes nikdo reálně nevyužije – zvažováno a zavrženo jako zbytečná komplexita předem.
- Ceny v e-mailech zůstávají v Kč (`toLocaleString('cs-CZ')` + `Kč`) stejně jako zbytek checkoutu – to čeká na fázi **4a** (EUR ceny, viz [sekce 9](09-jazykove-mutace.md#postup--fáze-návrh-ladit-dál)), není to součást tohohle e-mailového textu.
- **Až se bude řešit skutečná CZ mutace** (nová doména, viz [sekce 9](09-jazykove-mutace.md#domény)), bude potřeba se k vícejazyčným e-mailům vrátit – tou dobou nejspíš stejným vzorem jako zbytek appky (`next-intl`), s tím, že šablony se renderují server-side mimo request/React kontext (`render()` z `@react-email/render` volané z API routes), takže `useTranslations` hook nepůjde použít přímo – headless `createTranslator` z next-intl (funguje mimo React strom) je pro tenhle případ přirozenější cesta.
