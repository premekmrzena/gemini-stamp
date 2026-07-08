# 1. Technická infrastruktura

> Stav popsaný podle skutečného kódu k 2026-06-16. Tuto sekci aktualizovat při každé změně technologie/integrace.

## Stack
- **Next.js 16.2.0** (App Router, TypeScript, dev server běží přes Turbopack)
- **React 19.2.4**
- **Tailwind CSS 4**
- **Fabric.js 7.3.1** – canvas engine pro `StampEditor` (editor fotek a textu na razítkách)
- **JSZip** – klientské balení tiskových archů do ZIP v adminu (`/admin/dashboard`)
- **ESLint 9**

## Hosting & deployment
- **Vercel** – hosting produkce, buildy přes `next build`
- **GitHub** – `premekmrzena/gemini-stamp`, branch `main` je produkční větev (push na `main` = nový deploy na Vercelu)
- Žádný `vercel.json` v repu – konfigurace je výchozí/přes Vercel dashboard

## Databáze – Supabase
- Klient: `src/lib/supabase.ts`, inicializován s `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` (anon klíč, žádné RLS bypass na serveru)
- Tabulky: `products`, `orders`, `custom_stamps` – detailní sloupce viz interní poznámky k databázi
- Next.js Image je nakonfigurován (`next.config.ts`) ať smí stahovat obrázky z `*.supabase.co/storage/v1/object/public/**`

## Platby – Stripe
- Knihovny: `stripe` (server), `@stripe/stripe-js` + `@stripe/react-stripe-js` (klient)
- Měna: CZK
- Flow:
  1. `POST /api/create-order` – server validuje obsah košíku a ceny **vždy proti DB** (nikdy neduvěřuje ceně z klienta), spočítá dopravu/platbu, uloží objednávku do `orders` se statusem `Nová`
  2. `POST /api/create-payment-intent` – server načte `total_price` objednávky z DB (opět nedůvěřuje klientovi) a vytvoří Stripe PaymentIntent (`automatic_payment_methods: enabled`)
  3. Klient dokončí platbu přes Stripe Elements (`clientSecret`)
  4. Stripe zavolá `POST /api/stripe-webhook` na event `payment_intent.succeeded` → server ověří podpis a nastaví status objednávky na `Zaplaceno`
- **Webhook v Stripe Dashboardu zatím není zaregistrovaný** – záměrně, protože projekt běží na testovacím Stripe účtu/dočasné doméně. Před produkčním spuštěním nutno: zaregistrovat endpoint `https://FINALNI-DOMENA/api/stripe-webhook`, vybrat event `payment_intent.succeeded`, doplnit `STRIPE_WEBHOOK_SECRET`.

## Úložiště souborů – Vercel Blob
- `POST /api/upload-stamp` – nahrává vlastní razítka (náhled/tisk) do Vercel Blob, `access: 'public'`
- Validace: max 20 MB, povolené typy `image/jpeg`, `image/png`, `image/webp`, sanitizace názvu souboru
- Next.js Image povoluje doménu `*.public.blob.vercel-storage.com`

## E-maily – Resend
- Knihovny: `resend`, `@react-email/components`, `@react-email/render`
- Šablony: `src/components/emails/OrderConfirmationEmail`, `src/components/emails/ShippingNotificationEmail`
- Odesílání potvrzení objednávky je zabudované přímo v `POST /api/create-order` (fire-and-forget, chyba se jen loguje, neblokuje vytvoření objednávky) přes `src/lib/email.ts`
- Notifikaci o odeslání zásilky spouští admin manuálně v dashboardu (zadání sledovacího čísla → `POST /api/send-shipping-notification`), viz [sekce 5](05-administrace.md#2-záložka-objednávky)
- **Odesílá se z `onboarding@resend.dev`** – to je Resendí sandbox/testovací doména. Pro produkci je nutné ve Resendu zverifikovat vlastní doménu a změnit `from` adresu (na obou místech v `src/lib/email.ts`).

## Proměnné prostředí (`.env.local` / Vercel env)
| Proměnná | Účel |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase projekt URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon klíč (client + server) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe veřejný klíč (klient) |
| `STRIPE_SECRET_KEY` | Stripe tajný klíč (server) |
| `STRIPE_WEBHOOK_SECRET` | Ověření podpisu Stripe webhooku |
| `RESEND_API_KEY` | Odesílání e-mailů |
| `BLOB_READ_WRITE_TOKEN` | Zápis do Vercel Blob |

## Zjištěné nedodělky / otevřené body
- **Stripe webhook** není zaregistrovaný v Dashboardu – čeká na finální produkční doménu (viz výše)
- **E-maily jedou ze sandbox domény** `onboarding@resend.dev` – nutno před spuštěním nastavit vlastní ověřenou doménu v Resendu (sandbox typicky umí odeslat jen na ověřenou adresu vlastníka Resend účtu, ne libovolnému zákazníkovi)

## Změny
- 2026-07-03: Vstup do výběru šablony sjednocen – menu položka „Kreativní archy“ (`Header.tsx`, desktop i mobil) vede na `/vytvorit-arch` místo `/kategorie/kreativni-archy` (ta jako route dál existuje, jen na ni menu neodkazuje). Karty šablon na `/vytvorit-arch` teď zobrazují cenu dotaženou ze Supabase podle `productId` (stejná logika slevy jako jinde, `src/lib/pricing.ts`) a celá karta (mimo tlačítko „Vybrat šablonu“) odkazuje na detail produktu `/produkt/{productId}` – samostatný textový odkaz „Detail šablony“ i lightboxový náhled obrázku na kartě byly nahrazeny tímto klikem na celou kartu. Viz [sekce 4](04-popis-eshopu.md#1-homepage) a [sekce 4](04-popis-eshopu.md#3-editor-kreativní-archy).
- 2026-07-03: Hero slider (`Hero.tsx`) – zdrojové obrázky slideru vyměněny za 2x rozlišení (1400×788 px místo 700×394 px), na `<Image fill>` doplněn `sizes` prop (dřív chyběl, obrázek se tak stahoval v nedostatečném rozlišení pro danou šířku kontejneru). Oprava Ken Burns efektu (`animate-kenburns`): animace neaktivních slidů se nově explicitně pozastavuje (`animationPlayState`), takže neuběhne na pozadí dřív, než se slide zobrazí; refy pro desktop a mobilní verzi slideru (dvě volání stejné render funkce) byly dřív sdílené v jednom poli a přepisovaly se navzájem – teď jsou oddělené podle varianty.
- 2026-07-01: Flow „Začít tvořit“ pro kategorii `kreativni-archy` – karta produktu (`src/components/StartCreatingButton.tsx`) i detail produktu místo „Do košíku“ vedou rovnou do editoru (`/vytvorit-arch?productId=...`), který přeskočí výběr šablony. Na `/vytvorit-arch` přibyl i odkaz „Detail šablony“ nad tlačítkem výběru. Detail produktu kreativních archů skrývá známkářské parametry (typ známky, datum vydání, designér, rytec) a titulek „Detailní popis známky“ je nově u všech kategorií jen „Detailní popis“ – viz [sekce 4](04-popis-eshopu.md#1-homepage)
- 2026-07-01: Slevy na produktech – nový sloupec `products.sale_price` (migrace `docs/sql/003_products_sale_price.sql`, spuštěna), efektivní cena se počítá přes `src/lib/pricing.ts` a je vynucená i server-side v `/api/create-order`. Zobrazení přeškrtnuté ceny na homepage, detailu produktu i v adminu, nové pole ve `ProductFormModal` – viz [sekce 3](03-databaze.md), [sekce 4](04-popis-eshopu.md#1-homepage), [sekce 5](05-administrace.md#3-záložka-homepage-produkty)
- 2026-07-01: Recenze na homepage (`ReviewStrip.tsx`) jsou na mobilu/tabletu vodorovně swipovatelné (scroll-snap); štítky produktu (`ProductCard.tsx`) posunuté k pravému okraji karty bez zaoblení na vnější straně
- 2026-06-16: Dashboard – formulář na produkty (`ProductFormModal`), hlídání nízkého skladu, rychlý „další krok“ stavu objednávky, souhrnné karty (průměrná hodnota, čeká na odeslání), hromadný ZIP export tiskových archů, sledovací číslo zásilky + e-mail
- 2026-06-16: Migrace `docs/sql/002_orders_tracking_number.sql` spuštěna v Supabase – `orders.tracking_number` existuje a je funkční
- 2026-06-16: Smazán nepoužívaný endpoint `POST /api/send-confirmation` (duplicita s `src/lib/email.ts`, nikde se nevolal)
- 2026-06-16: Plný životní cyklus objednávky (13 stavů) zapracován do kódu i dokumentace – viz [sekce 2](02-stavy-objednavky.md)
- 2026-06-16: Schéma DB zdokumentováno a sjednoceno s kódem, `orders.status` a `custom_stamps.product_id` mají nově DB constrainty – viz [sekce 3](03-databaze.md)
- 2026-06-16: Oprava `StampEditor.tsx` – `print_url` dříve ukazoval na stejný (zmenšený, s šablonou) obrázek jako `preview_url`. Teď se generuje samostatný plnorozlišný tiskový soubor bez obrázku šablony – viz [sekce 4](04-popis-eshopu.md)
