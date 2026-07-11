# 5. Administrace

> Pohled admina, který zpracovává objednávky a správu produktů. Popis odpovídá skutečnému stavu kódu k 2026-06-16, doplněno o slevu k 2026-07-01, o slevové kódy k 2026-07-08 a o formátovaný detailní popis k 2026-07-11 — `src/app/admin/dashboard/page.tsx` je jediná admin obrazovka v aplikaci, formulář na produkty žije v `src/components/admin/ProductFormModal.tsx`, formulář na slevové kódy v `src/components/admin/DiscountCodeFormModal.tsx`.

## 1. Přístup

`/admin/dashboard` je chráněný přihlášením přes Supabase Auth (e-mail + heslo, `supabase.auth.signInWithPassword`). Žádná samoregistrace ani role/oprávnění v aplikaci — kdokoli s platným Supabase Auth účtem se po přihlášení dostane do celého dashboardu. Účty se vytvářejí přímo v Supabase (Authentication), ne v appce.

Dashboard má tři záložky: **Objednávky**, **Homepage produkty** a **Slevové kódy**.

## 2. Záložka Objednávky

Nahoře čtyři souhrnné karty — obrat, počet objednávek, průměrná hodnota objednávky a počet objednávek „čeká na odeslání“ (stav `Zaplaceno` nebo `Připravujeme`). Všechny se počítají jen z objednávek odpovídajících aktuálnímu filtru data (filtr nad tabulkou, datum se porovnává podle `created_at`).

Nad tabulkou je tlačítko **„Stáhnout tiskové archy (ZIP)“** — vezme všechny položky s „vlastní“ v názvu napříč aktuálně filtrovanými objednávkami, stáhne jejich `print_url` z `custom_stamps`, zabalí do jednoho ZIP (`jszip`, klientsky) a spustí stažení. Pojmenování souborů v ZIPu: `{posledních6znakůID objednávky}_{pořadí položky}.png`.

Tabulka objednávek (řazená od nejnovější): zákazník, stav (barevný štítek podle skupiny `neutral`/`success`/`danger` z `ORDER_STATUSES`, viz [sekce 2](02-stavy-objednavky.md)) a částka. Klik na řádek otevře detail v modálu.

### Detail objednávky
- **Změna stavu** — vedle selectu se všemi 13 stavy je tlačítko „Další krok“ s návrhem následujícího stavu v typické cestě objednávky (`getNextStatus`, dvě varianty podle `shipping_method`: osobní odběr → `Nová→Zaplaceno→Připravujeme→K vyzvednutí→Vyzvednuto→Uzavřeno`, doprava → `...→Odesláno→Doručeno→Uzavřeno`). Mimo tuto cestu (Zrušeno, Vráceno, Reklamace...) tlačítko nic nenabízí, jde jen přes select. Uložení je okamžité (`updateOrderStatus`), bez potvrzení a bez validace přechodu (lze přeskočit libovolně přes select)
- **Sledovací číslo zásilky** — pole + tlačítko „Uložit a poslat e-mail“: uloží `orders.tracking_number` a zavolá `/api/send-shipping-notification`, který e-mailem (Resend, šablona `ShippingNotificationEmail`) pošle zákazníkovi číslo zásilky. Vyžaduje migraci `docs/sql/002_orders_tracking_number.sql` (sloupec `tracking_number` v `orders`)
- Kontaktní údaje zákazníka a doručovací adresa
- **Položky objednávky** — u každé položky název, množství × cena, mezisoučet
- **Stažení tiskových podkladů** — pokud název položky obsahuje „vlastní“ (= vlastní kreativní arch z editoru), zobrazí se tlačítko „Stáhnout tiskové PNG“. Odkazuje na `print_url` z `custom_stamps` (plné rozlišení 4130×2550 px, bez šablony na pozadí — viz [sekce 4](04-popis-eshopu.md#3-editor-kreativní-archy)). URL se dotahuje samostatným dotazem do `custom_stamps` při otevření detailu (`customStampsData`), do té doby je u tlačítka jen text „Načítám tiskové podklady z cloudu...“
- Platební metoda a celková cena k úhradě

Admin jednotlivý tiskový soubor stáhne a pošle do tiskárny manuálně, nebo použije hromadný ZIP export výše — appka ale stále nepředává soubory tiskárně automaticky.

## 3. Záložka Homepage produkty

Tlačítko **„Nový produkt“** nahoře otevře `ProductFormModal` prázdný; ikona tužky u řádku ho otevře předvyplněný daným produktem (edit). Formulář pokrývá **celé** schéma `products` (`name`, `category`, `price`, `sale_price`, `weight_grams`, `stock_quantity`, `is_active`, `tag_new`, `tag_last_pieces`, `tag_top`, `show_on_homepage`, `short_description`, `detailed_description`, `catalog_number`, `release_date`, `dimensions_mm`, `designer`, `engraver`, `related_stamp_id`) + upload `image_url`/`gallery_images` přes `/api/upload-stamp` (stejná cesta jako u editoru archů). Pole **„Detailní popis“** je od 2026-07-11 obyčejná textarea, do které admin může psát přímo HTML tagy (`<h3>`, `<h4>`, `<strong>`, `<ul>`/`<ol>`/`<li>`, `<p>`, `<br>` – nápověda je přímo pod polem); cokoli jiného se na frontendu při zobrazení odstraní, viz [sekce 4](04-popis-eshopu.md#1-homepage). Pole **„Zlevněná cena (Kč)“** je nepovinné (prázdné = bez slevy); sleva se na webu i v košíku aktivuje jen když je vyplněná, kladná a nižší než `price` (`src/lib/pricing.ts`) – jinak se produkt chová, jako by slevu neměl. **„Související produkty“** je od 2026-07-10 klikací seznam názvů všech ostatních produktů (dostává je z tabulky produktů v dashboardu jako prop `allProducts`, žádný extra dotaz) – vybrané se uloží jako `related_stamp_id`; když nevybereš nic, detail produktu si sám dotáhne 3 nejnovější jiné produkty jako fallback (viz [sekce 4](04-popis-eshopu.md)). Uložení dělá `insert`/`update` do Supabase a optimisticky promítne výsledek do tabulky.

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

Fakturace (vystavení daňového dokladu) se řeší mimo appku, plánovaně přes eDoklad API (zatím nenapojeno). Appka už ale sbírá vše, co k tomu eDoklad bude potřebovat: `orders.billing_company_name`/`billing_company_id`/`billing_company_tax_id` (IČO/DIČ, vyplní se jen pokud zákazník zadá firemní údaje v košíku) + plnou fakturační adresu a rozpad položek (`cart_items`). Žádné UI ani API endpoint pro fakturaci v appce zatím není.

## Otevřené body
- Žádná role/oprávnění — kdokoli s Supabase Auth účtem vidí a může měnit vše (objednávky i produkty)
- Žádné notifikace ani audit log akcí admina (kdo a kdy změnil stav/produkt)
- eDoklad napojení na fakturaci zatím chybí (viz sekce 5 výše)
