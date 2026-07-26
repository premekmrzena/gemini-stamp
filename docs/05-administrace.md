# 5. Administrace

> Pohled admina, který zpracovává objednávky a správu produktů. Popis odpovídá skutečnému stavu kódu k 2026-06-16, doplněno o slevu k 2026-07-01, o slevové kódy k 2026-07-08, o formátovaný detailní popis k 2026-07-11 a o vyhledávání/filtr/řazení produktů a přejmenování záložky k 2026-07-12, o pole „Téma (filtr Známky)“ k 2026-07-14, o pole „Ruční pořadí“ (`sort_order`) k 2026-07-15, o tlačítko „Vytvořit zásilku“ (nAPI B2B-ZSK) k 2026-07-23, o UX/vizuální audit + záložky Kurzy měn a Statistika k 2026-07-26 — `src/app/admin/dashboard/page.tsx` je jediná admin obrazovka v aplikaci, formulář na produkty žije v `src/components/admin/ProductFormModal.tsx`, formulář na slevové kódy v `src/components/admin/DiscountCodeFormModal.tsx`.

## 1. Přístup

`/admin/dashboard` je chráněný přihlášením přes Supabase Auth (e-mail + heslo, `supabase.auth.signInWithPassword`). Žádná samoregistrace ani role/oprávnění v aplikaci — kdokoli s platným Supabase Auth účtem se po přihlášení dostane do celého dashboardu. Účty se vytvářejí přímo v Supabase (Authentication), ne v appce.

Dashboard má pět záložek: **Objednávky**, **Produkty** (do 2026-07-12 „Homepage produkty“ – tabulka odjakživa zobrazovala úplně všechny produkty, ne jen homepage výběr, jen název neodpovídal), **Slevové kódy**, **Kurzy měn** (ruční kurzy pro mezinárodní ceny, viz [sekce 9](09-jazykove-mutace.md)) a od 2026-07-26 **Statistika** (viz níže).

**Vizuální audit 2026-07-26:** logo `creative-stamp_logo.svg` nahradilo textový nadpis „E-shop Dashboard“ (stejný soubor jako v `Header.tsx`), zaoblení rohů sjednoceno na `rounded-[4px]` napříč dashboardem i modaly (`ProductFormModal`/`DiscountCodeFormModal`/`ShipmentModal`) — stejná konvence jako zbytek e-shopu. Lišta záložek je vodorovně scrollovatelná na mobilu (`overflow-x-auto` + `.scrollbar-hide`). Všechny čtyři starší tabulky (Objednávky, Produkty, Slevové kódy, Kurzy měn) mají teď i mobilní variantu — nad `md` breakpointem klasická `<table>`, pod ním svislé karty se stejnými daty a akcemi.

## 2. Záložka Objednávky

Nahoře čtyři souhrnné karty — obrat, počet objednávek, průměrná hodnota objednávky a počet objednávek „čeká na odeslání“ (stav `Zaplaceno` nebo `Připravujeme`). Všechny se počítají jen z objednávek odpovídajících aktuálnímu filtru data (filtr nad tabulkou, datum se porovnává podle `created_at`).

Nad tabulkou je tlačítko **„Stáhnout tiskové archy (ZIP)“** — vezme všechny položky s `item_type === 'custom'` napříč aktuálně filtrovanými objednávkami, stáhne jejich `print_url` z `custom_stamps` (dávkově, viz níže) a zabalí do jednoho ZIP (`jszip`, klientsky). Pojmenování souborů v ZIPu: `{posledních6znakůID objednávky}_{pořadí položky}.png`.

**Detekce Kreativního archu (`isCustomStampItem`, oprava 2026-07-26):** dřív se hledalo slovo „vlastní“ v názvu položky — u anglických objednávek (fáze 4a/4b i18n) se ale ukládá název `"Custom design: ..."`, takže tahle detekce od zavedení EN checkoutu tiše selhávala a anglické objednávky s archem neměly žádné tlačítko na stažení. Teď se používá spolehlivý, jazykově nezávislý sloupec `item_type: 'product' | 'custom'` (`CartItemSnapshot`), stejný jako v checkoutu/`create-order`/Stripe webhooku.

Tabulka objednávek (řazená od nejnovější): zákazník + ID, **datum** (`created_at`), stav (barevný štítek podle skupiny `neutral`/`success`/`danger` z `ORDER_STATUSES`, viz [sekce 2](02-stavy-objednavky.md)), částka a sloupec Archy. Objednávky obsahující Kreativní arch mají levý oranžový accent border + badge „Kreativní arch“; pokud má objednávka přesně jednu takovou položku, řádek (i mobilní karta) nese rovnou dvě ikonová tlačítka pro rychlé stažení tiskového PNG a náhledu, bez nutnosti otevírat detail. Klik kamkoli jinam na řádek otevře detail v modálu.

Tiskové URL (`custom_stamps.print_url`) se dotahují **dávkově pro všechny objednávky najednou** hned po načtení seznamu (ne až při otevření konkrétního detailu) — jedna mapa `itemId → print_url` sdílená seznamem, detailem i hromadným ZIP exportem. Náhled (`item.image_url` v `cart_items`) je shodný s `custom_stamps.preview_url` uloženým v okamžiku vytvoření objednávky, takže se stahuje bez jakéhokoli dalšího DB dotazu.

### Detail objednávky
- **Změna stavu** — vedle selectu se všemi 13 stavy (od 2026-07-26 seřazenými podle skutečného toku objednávky, ne náhodně) je tlačítko „Další krok“ s návrhem následujícího stavu v typické cestě objednávky (`getNextStatus`, dvě varianty podle `shipping_method`: osobní odběr → `Nová→Zaplaceno→Připravujeme→K vyzvednutí→Vyzvednuto→Uzavřeno`, doprava → `...→Odesláno→Doručeno→Uzavřeno`). Mimo tuto cestu (Zrušeno, Vráceno, Reklamace...) tlačítko nic nenabízí, jde jen přes select. Uložení je okamžité (`updateOrderStatus`), bez potvrzení a bez validace přechodu (lze přeskočit libovolně přes select)
- **Historie stavů** (od 2026-07-26) — svislá časová osa se všemi dosavadními stavy objednávky a přesným časem změny. Plní se DB triggerem na `orders` (`docs/sql/021_order_status_history.sql`, tabulka `order_status_history`) — loguje se každá změna `status` bez ohledu na to, jestli ji vyvolá dashboard, Stripe webhook (`mark_order_paid`) nebo cokoli budoucího, takže časová osa nemůže "zapomenout" na změnu udělanou mimo dashboard. Objednávky vytvořené před spuštěním migrace nemají zpětnou historii.
- **Sledovací číslo zásilky** (přepracováno 2026-07-26) — primárně jen ke čtení. Skutečný zdroj čísla je tlačítko „Vytvořit zásilku“ níže (ČP ho vygeneruje samo); po úspěšném podání appka teď navíc rovnou pošle e-mail se sledovacím číslem (dřív to fungovalo jen přes ruční zadání, podání přes ČP e-mail neposílalo vůbec). Ruční textové pole zůstává jen jako fallback za odkazem „Zadat ručně“ (přeprava mimo ČP, historické objednávky, oprava překlepu) — uloží `orders.tracking_number` a zavolá stejnou sdílenou funkci pro `/api/send-shipping-notification` (Resend, šablona `ShippingNotificationEmail`). Vyžaduje migraci `docs/sql/002_orders_tracking_number.sql` (sloupec `tracking_number` v `orders`)
- **Vytvořit zásilku** (od 2026-07-23, skryté pro osobní odběr) — tlačítko otevře `ShipmentModal`, náhled adresáta/váhy/dopravy a u mezinárodních zásilek i celního prohlášení (HS kódy dle kategorie produktu). Tlačítko „Podat u České pošty (demo)“ skutečně zavolá nAPI B2B-ZSK (zatím jen demo prostředí) a po úspěchu zapíše vrácené číslo zásilky do stejného pole `tracking_number` jako ruční zadání výše, a rovnou pošle zákazníkovi e-mail se sledovacím číslem. Detail v [sekci 10](10-doprava-a-celni-prohlaseni.md)
- **Vytisknout štítek** (od 2026-07-26, zobrazí se jakmile existuje `tracking_number`) — `GET /api/admin/print-shipping-label?orderId=...` zavolá `POST /parcelPrinting` (nAPI B2B-ZSK) s už podaným číslem zásilky a vrátí PDF štítku k přímému tisku (`idForm: 101` = běžný A4 tisk, ne štítková/Zebra tiskárna — snadno změnitelné, viz komentář u `LABEL_FORM_ID`)
- **Tiskový arch** (od 2026-07-26, zobrazí se jen u objednávek s Kreativním archem) — přímé tlačítko na stažení tiskového PNG přímo v horní akční sekci detailu, vedle Faktury a Sledovacího čísla — navíc k tlačítku u konkrétní položky níže (stejný vzor zdvojení jako u Faktury)
- Kontaktní údaje zákazníka a doručovací adresa
- **Položky objednávky** — u každé položky název, množství × cena, mezisoučet
- **Stažení tiskových podkladů** — u položek s `item_type === 'custom'` (Kreativní arch) tlačítko „Stáhnout tiskové PNG“ (odkazuje na `print_url` z `custom_stamps`, plné rozlišení 4130×2550 px bez šablony na pozadí — viz [sekce 4](04-popis-eshopu.md#3-editor-kreativní-archy)) a od 2026-07-26 i „Stáhnout náhled“ (`item.image_url` ze snapshotu objednávky, bez DB dotazu)
- Platební metoda a celková cena k úhradě

Admin jednotlivý tiskový soubor stáhne a pošle do tiskárny manuálně, nebo použije hromadný ZIP export výše — appka ale stále nepředává soubory tiskárně automaticky.

## 2a. Záložka Statistika (od 2026-07-26)

Vlastní filtr rozsahu dat (7/30/90 dní, Letos, Vše — nezávislý na jednodenním filtru v Objednávkách), tři KPI karty (obrat po měnách, počet objednávek, průměrná hodnota) a čtyři grafy postavené na `recharts`:
- **Tržby v čase** — samostatný liniový graf pro každou měnu přítomnou v období (nikdy ne dvě osy v jednom grafu — CZK a EUR mají řádově jiné hodnoty).
- **Objednávky v čase** — sloupcový graf, počet objednávek po dnech.
- **Prodej podle produktu** — top 8 podle tržby, agregováno podle názvu položky v košíku. Zjednodušení v1: nejde přes `custom_stamps.product_id` na skutečný produkt, takže CZ a EN název stejné šablony Kreativního archu vyjdou jako dva různé řádky.
- **Objednávky podle země** — top 8 podle skutečné doručovací adresy (`getDeliveryAddress()`, ne rovnou `billing_country`).

Barvy grafů: oranžová (`primary`) pro peněžní metriky, modrá (`tag-top`) pro počty — čistě konvence pro rychlou orientaci, žádná kategoriální paleta (každý graf je jednosériový).

## 3. Záložka Produkty

Nad tabulkou je od 2026-07-12 textové vyhledávání (podle `name`/`catalog_number`), select filtru kategorie a select řazení (nejnovější/název A–Z/Z–A/cena nejnižší/nejvyšší/sklad nejnižší/nejvyšší) – všechno čistě client-side (`useMemo`) nad produkty, které se stejně vždy načítají celé najednou, žádný nový dotaz do Supabase. Sloupec Kategorie zobrazuje čitelný název (Známky, Známkové archy…) místo syrové hodnoty enumu.

Tlačítko **„Nový produkt“** nahoře otevře `ProductFormModal` prázdný; ikona tužky u řádku ho otevře předvyplněný daným produktem (edit). Formulář pokrývá **celé** schéma `products` (`name`, `category`, `product_topic`, `price`, `sale_price`, `weight_grams`, `stock_quantity`, `is_active`, `tag_new`, `tag_last_pieces`, `tag_top`, `sort_order`, `show_on_homepage`, `short_description`, `detailed_description`, `catalog_number`, `release_date`, `dimensions_mm`, `designer`, `engraver`, `related_stamp_id`) + upload `image_url`/`gallery_images` přes `/api/upload-stamp` (stejná cesta jako u editoru archů). Pole **„Témata (filtr Známky)“** je od 2026-07-14 klikací seznam pilulek (Umění/Památky/Známky/Archy, `TOPIC_LABELS`, stejný vzor jako „Související produkty“) – lze vybrat víc témat najednou, ukládá se jako `product_topic[]`. Nezávislé na kategorii, jediné jeho využití je tematický filtr na `/kategorie/znamky` (viz [sekce 4](04-popis-eshopu.md)); ostatní kategorie ho zatím nijak nevyužívají. Pole **„Detailní popis“** je od 2026-07-11 obyčejná textarea, do které admin může psát přímo HTML tagy (`<h3>`, `<h4>`, `<strong>`, `<ul>`/`<ol>`/`<li>`, `<p>`, `<br>` – nápověda je přímo pod polem); cokoli jiného se na frontendu při zobrazení odstraní, viz [sekce 4](04-popis-eshopu.md#1-homepage). Pole **„Ruční pořadí“** (`sort_order`, od 2026-07-15, `docs/sql/012_products_sort_order.sql`) je volitelné číslo – když je vyplněné, má přednost před `tag_top`/`tag_new`/`created_at` ve výpisech na homepage i v kategoriích (nižší číslo = výš); prázdné = automatické řazení podle štítků a data, viz [sekce 4](04-popis-eshopu.md#1-homepage). Nezávislé na `tag_top`, který řadí jen mezi sebou TOP produkty 1–6. Pole **„Zlevněná cena (Kč)“** je nepovinné (prázdné = bez slevy); sleva se na webu i v košíku aktivuje jen když je vyplněná, kladná a nižší než `price` (`src/lib/pricing.ts`) – jinak se produkt chová, jako by slevu neměl. **„Související produkty“** je od 2026-07-10 klikací seznam názvů všech ostatních produktů (dostává je z tabulky produktů v dashboardu jako prop `allProducts`, žádný extra dotaz) – vybrané se uloží jako `related_stamp_id`; když nevybereš nic, detail produktu si sám dotáhne 3 nejnovější jiné produkty jako fallback (viz [sekce 4](04-popis-eshopu.md)). Uložení dělá `insert`/`update` do Supabase a optimisticky promítne výsledek do tabulky.

Tabulka všech produktů (řazená od nejnovějšího) zobrazuje u ceny i slevu, pokud je nastavená (přeškrtnutá původní cena vedle zlevněné). Sloupec **Sklad** zvýrazní nízký stav (`stock_quantity <= 5`, oranžově) a vyprodáno (`stock_quantity <= 0`, červeně) — jen vizuální upozornění, nic se neděje automaticky. U každého produktu lze navíc přímo v tabulce (bez otevření formuláře) rychle měnit stejné tři **zobrazovací příznaky**, které jsou od 2026-07-10 i ve formuláři výše — obojí zapisuje do stejných sloupců, jen tabulka to dělá ihned (bez tlačítka „Uložit“):

| Akce | Co dělá | Sloupec v DB |
|---|---|---|
| Výběr „TOP rank“ (1–6 nebo „–“) | Pořadí mezi TOP produkty na homepage | `tag_top` |
| Tlačítko „Ano/Ne“ u Poslední kusy | Zapne/vypne štítek „poslední kusy“ | `tag_last_pieces` |
| Tlačítko „Zobrazeno/Skryto“ | Zapne/vypne viditelnost na homepage | `show_on_homepage` |

Tyto tři příznaky se uloží ihned (optimistické promítnutí do tabulky + update do Supabase), bez tlačítka „Uložit“ — na rozdíl od formuláře produktu výše, kde se ukládá najednou.

Vedle tužky (edit) je od 2026-07-10 i ikona koše — **trvalé smazání produktu** (`DELETE` do Supabase, `products` RLS to authenticated roli povoluje, viz [sekce 3](03-databaze.md)). Potvrzuje se prostým `window.confirm`, žádné undo. Pokud je produkt navázaný na existující zákaznický arch (`custom_stamps.product_id`, `FK NOT NULL`), DB mazání odmítne (kód `23503`) a appka to admina upozorní s návrhem produkt radši jen deaktivovat (`is_active` na ne) místo mazání. Objednávky samotné (`orders.cart_items`) na `products.id` nejsou navázané FK vazbou, takže smazání produktu historické objednávky nijak nerozbije, jen z nich zmizí možnost dohledat aktuální detail produktu.

## 4. Záložka Slevové kódy

Tlačítko **„Nový kód“** otevře `DiscountCodeFormModal` (stejný vzor jako `ProductFormModal`) — kód, typ slevy (procenta / pevná částka v Kč), hodnota, volitelný max. počet použití (prázdné = neomezeno), platnost od (volitelná) a do (povinná), příznak aktivní. Kód se před uložením vždy převede na velká písmena a ořízne, protože ověřování na frontendu i v RPC funkci `validate_discount_code` porovnává case-insensitive (`upper(trim())`) — musí sedět přesně.

Tabulka kódů zobrazuje typ/hodnotu, platnost, poměr použití (`used_count / max_uses`, `∞` pokud bez limitu) a stav (Aktivní / Neaktivní / Vypršel — poslední se počítá klientsky z `valid_until`, není to samostatný DB sloupec). Žádné tvrdé mazání — jen `is_active` přepínač ve formuláři, stejně jako u produktů. Sloupec `used_count` se needituje, spravuje ho výhradně RPC funkce `redeem_discount_code` při dokončení objednávky.

Bezpečnost: tabulka `discount_codes` má RLS bez policy pro `anon` (veřejný web nikdy nesmí přečíst seznam kódů přímo), admin k ní má přístup jen díky přihlášené (`authenticated`) Supabase Auth session. Zákaznické ověřování/uplatnění kódu v košíku jde výhradně přes dvě `SECURITY DEFINER` RPC funkce — viz [sekce 3](03-databaze.md#discount_codes-neprovedeno--čeká-na-spuštění-migrace) a [sekce 4](04-popis-eshopu.md).

## 5. Fakturace

Napojeno na iDoklad API v3 (`src/lib/idoklad.ts`), OAuth2 client_credentials (`IDOKLAD_APPLICATION_ID`/`IDOKLAD_CLIENT_ID`/`IDOKLAD_CLIENT_SECRET` v env — application_id se registruje samostatně na `developer.idoklad.cz`, je jiná hodnota než client_id/secret z Nastavení iDokladu). Účet je neplátce DPH, takže všechny položky faktury jedou bez DPH členění (`VatRateType: Zero`, `VatCodeId: null`) — pro plátce DPH by bylo potřeba doplnit mapování sazeb.

Dvě zcela oddělené cesty podle způsobu platby (rozhodnuto 2026-07-25 po konzultaci s uživatelem, viz [[project_idoklad_invoicing]] v paměti) — platba kartou nejde nikdy spárovat s bankovním výpisem (Stripe posílá výplaty dávkově, ponížené o poplatky), platba převodem naopak jde spárovat přes variabilní symbol:

### Platba kartou (Stripe)
`createInvoiceForOrder(orderId, { markAsPaid: true, paymentOptionId: 2 })` se volá ve `stripe-webhook/route.ts` hned po `payment_intent.succeeded`, před `mark_order_paid`. Faktura se rovnou označí jako uhrazená (`PUT /IssuedDocumentPayments/FullyPay/{id}`) — jinak by v iDokladu zbytečně visela jako "Neuhrazeno", i když se u nás žádná bankovní platba nikdy nespáruje.

### Platba převodem (jen CZK, jen CZ verze) — zálohová faktura
1. **Při vytvoření objednávky** (`create-order/route.ts`) se hned vystaví **zálohová faktura** (`createProformaForOrder()`, `ProformaInvoices` API skupina) s variabilním symbolem shodným s tím na QR platbě/v e-mailu (`getVariableSymbol()`, `src/lib/czechQrPayment.ts`). PDF zálohové faktury se přiloží do úvodního potvrzovacího e-mailu spolu s QR kódem.
2. **Jakmile iDoklad platbu spáruje** (bankovní účet Air Bank připojený na automatické stahování výpisů — zatím nenapojeno, nebo ruční potvrzení přímo v iDokladu), pošle webhook `PaymentCreated`/`ProformaInvoice` na `/api/idoklad-webhook`. Ten zálohovou fakturu vyúčtuje (`PUT /ProformaInvoices/{id}/Account`) — iDoklad z ní automaticky sestaví finální daňový doklad (položky původní faktury MINUS už přijatá záloha = 0 Kč k doplacení, `PaymentStatus: Paid`) — nastaví `orders.status = 'Zaplaceno'` a pošle e-mail s finální fakturou.
3. **Ruční admin fallback** (dokud Air Bank není napojená, nebo pro jistotu): admin může kliknout na "Zaplaceno" v dashboardu i bez čekání na webhook — `/api/admin/notify-order-status` pak zavolá `payAndFinalizeProforma()` (označí zálohovou fakturu jako uhrazenou + rovnou vyúčtuje), stejný výsledek jako webhook.

**Webhook bezpečnost:** HMAC-SHA256 podpis v hlavičce `X-idoklad-signature`, ověřovaný proti `IDOKLAD_WEBHOOK_SECRET` (`verifyWebhookSignature()`). Route je vyjmutá z pre-launch gate (`src/proxy.ts`, stejně jako `/api/stripe-webhook`), protože ji volá iDoklad, ne prohlížeč s cookie.

**Registrace webhooku (uživatelský krok, ne kód):** 1) na `developer.idoklad.cz` → detail aplikace (`Next-js2-ClientCredentials`) → záložka Webhooks → přidat URL `https://mycreativestamp.com/api/idoklad-webhook` + nastavit stejný secret jako `IDOKLAD_WEBHOOK_SECRET` → získá se `PublicId`. 2) Zavolat `POST /v3/Webhooks` s `{ActionType: 4 (PaymentCreated), EntityType: 1 (ProformaInvoice), PublicId}` pro aktivaci. Funguje jen na živé veřejně dostupné doméně, nejde otestovat lokálně (ověřeno end-to-end simulovaným voláním s platným podpisem, ne reálným iDoklad-originem).

**Idempotence:** `orders.idoklad_invoice_id`/`idoklad_proforma_id` jsou guard proti duplicitě (Stripe i iDoklad webhooky umí stejný event doručit vícekrát). Zápis jde přes RPC (`set_order_idoklad_invoice`/`set_order_idoklad_proforma`, `docs/sql/022`/`023`), ne přímý `.update()` — `orders` nemá anon RLS UPDATE policy (stejný důvod jako `mark_order_paid`/`release_stock`, viz [sekce 2](02-stavy-objednavky.md)).

**Kontakt a položky (společné pro obě cesty):** kontakt odběratele se dohledá/založí v iDokladu (dedup podle IČO u firem, podle e-mailu u fyzických osob — pozor, filtr `~eq~` v iDoklad API se NESMÍ obalovat uvozovkami navzdory příkladu v jejich dokumentaci), země/CountryId se mapuje z `COUNTRY_SHIPPING_INFO` (iso2), položky = `cart_items` + samostatná řádka za dopravu/platbu (pokud > 0) + záporná řádka slevy (pokud byl použit slevový kód).

**E-mail zákazníkovi:** PDF (zálohové i finální) faktury se stahuje z iDokladu (`getInvoicePdf()`/`getProformaPdf()`) a přikládá jako příloha přímo do e-mailu (`sendOrderConfirmation`/`sendPaymentReceived`) — zákazník ho dostane automaticky, bez zásahu admina. Stažení PDF je jen "best effort" — pokud selže, e-mail se stejně odešle bez přílohy (nesmí zablokovat doručení potvrzení).

**Admin UI:** v detailu objednávky panel "Faktura" — pokud existuje `idoklad_invoice_number`, odkaz "Stáhnout PDF" (proxy přes `/api/admin/idoklad-invoice-pdf`, appka PDF neukládá, stahuje ho z iDokladu na vyžádání); pokud je jen rozvystavená zálohová faktura, info hláška + tlačítko "Potvrdit platbu a vystavit fakturu" (ruční fallback výš); jinak "Vystavit fakturu" (úplně bez zálohové faktury, přímá cesta).

## Otevřené body
- Žádná role/oprávnění — kdokoli s Supabase Auth účtem vidí a může měnit vše (objednávky i produkty)
- Audit log od 2026-07-26 existuje jen pro **změny stavu objednávky** (`order_status_history`) — úpravy produktů, slevových kódů a kurzů se pořád nikam nezaznamenávají (kdo a kdy je změnil)
- Statistika „Prodej podle produktu“ agreguje podle názvu položky v košíku, ne podle skutečného `product_id` — CZ/EN název stejné šablony Kreativního archu se počítá jako dva různé produkty (viz sekce 2a)
