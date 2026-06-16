# 5. Administrace

> Pohled admina, který zpracovává objednávky a správu produktů. Popis odpovídá skutečnému stavu kódu k 2026-06-16 — `src/app/admin/dashboard/page.tsx` je jediná admin obrazovka v aplikaci, formulář na produkty žije v `src/components/admin/ProductFormModal.tsx`.

## 1. Přístup

`/admin/dashboard` je chráněný přihlášením přes Supabase Auth (e-mail + heslo, `supabase.auth.signInWithPassword`). Žádná samoregistrace ani role/oprávnění v aplikaci — kdokoli s platným Supabase Auth účtem se po přihlášení dostane do celého dashboardu. Účty se vytvářejí přímo v Supabase (Authentication), ne v appce.

Dashboard má dvě záložky: **Objednávky** a **Homepage produkty**.

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

Tlačítko **„Nový produkt“** nahoře otevře `ProductFormModal` prázdný; ikona tužky u řádku ho otevře předvyplněný daným produktem (edit). Formulář pokrývá celé schéma `products` (`name`, `category`, `price`, `weight_grams`, `stock_quantity`, `is_active`, `tag_new`, `short_description`, `detailed_description`, `catalog_number`, `stamp_type`, `release_date`, `dimensions_mm`, `designer`, `engraver`) + upload `image_url`/`gallery_images` přes `/api/upload-stamp` (stejná cesta jako u editoru archů). Uložení dělá `insert`/`update` do Supabase a optimisticky promítne výsledek do tabulky. Pole `tag_top`, `tag_last_pieces`, `related_stamp_id`, `print_sheets` se v tomto formuláři needitují — `tag_top`/`tag_last_pieces` zůstávají v tabulce níž, `related_stamp_id`/`print_sheets` se zatím neřeší vůbec (needitují se nikde v appce).

Tabulka všech produktů (řazená od nejnovějšího). Sloupec **Sklad** zvýrazní nízký stav (`stock_quantity <= 5`, oranžově) a vyprodáno (`stock_quantity <= 0`, červeně) — jen vizuální upozornění, nic se neděje automaticky. U každého produktu lze dál měnit **zobrazovací příznaky**:

| Akce | Co dělá | Sloupec v DB |
|---|---|---|
| Výběr „TOP rank“ (1–6 nebo „–“) | Pořadí mezi TOP produkty na homepage | `tag_top` |
| Tlačítko „Ano/Ne“ u Poslední kusy | Zapne/vypne štítek „poslední kusy“ | `tag_last_pieces` |
| Tlačítko „Zobrazeno/Skryto“ | Zapne/vypne viditelnost na homepage | `show_on_homepage` |

Tyto tři příznaky se uloží ihned (optimistické promítnutí do tabulky + update do Supabase), bez tlačítka „Uložit“ — na rozdíl od formuláře produktu výše, kde se ukládá najednou.

## 4. Fakturace

Fakturace (vystavení daňového dokladu) se řeší mimo appku, plánovaně přes eDoklad API (zatím nenapojeno). Appka už ale sbírá vše, co k tomu eDoklad bude potřebovat: `orders.billing_company_name`/`billing_company_id`/`billing_company_tax_id` (IČO/DIČ, vyplní se jen pokud zákazník zadá firemní údaje v košíku) + plnou fakturační adresu a rozpad položek (`cart_items`). Žádné UI ani API endpoint pro fakturaci v appce zatím není.

## Otevřené body
- Žádná role/oprávnění — kdokoli s Supabase Auth účtem vidí a může měnit vše (objednávky i produkty)
- `related_stamp_id` a `print_sheets` se needitují v žádném UI (ani v `ProductFormModal`, ani jinde) — pokud se mají využívat, je potřeba je do formuláře doplnit
- Žádné notifikace ani audit log akcí admina (kdo a kdy změnil stav/produkt)
- eDoklad napojení na fakturaci zatím chybí (viz sekce 4 výše)
