# 3. Databáze (Supabase)

> Skutečné schéma vytažené z Supabase (OpenAPI introspekce přes `service_role` klíč) k 2026-06-16, doplněno o `products.sale_price` k 2026-07-01, doplněno o `discount_codes` a `orders.discount_code`/`discount_amount` k 2026-07-08, doplněno o formátovaný `detailed_description` k 2026-07-11, doplněno o `products.sold_count` k 2026-07-12, doplněno o `products.product_topic` k 2026-07-14. Liší se od `src/types/database.ts` v bodech popsaných níže – ty už jsou opravené v kódu.

## `products`
| Sloupec | Typ | Povinné při insertu | Default |
|---|---|---|---|
| id | uuid (PK) | ano | `gen_random_uuid()` |
| name | text | ano | – |
| short_description | text, čistý text (žádné HTML) | ne (nullable) | – |
| detailed_description | text, od 2026-07-11 může obsahovat HTML (`h3`/`h4`/`strong`/`em`/`ul`/`ol`/`li`/`p`/`br`) – sanitizuje se až při renderu, ne při uložení, viz [sekce 4](04-popis-eshopu.md#1-homepage) | ne (nullable) | – |
| price | integer | ano | – |
| sale_price | numeric | ne (nullable) | – |
| weight_grams | integer | ano | `0` |
| image_url | text | ano | – |
| gallery_images | text[] | ne (nullable) | – |
| category | enum `product_category` (`znamky`, `znamkove-archy`, `kreativni-archy`, `fdc`, `plakety`) | ano | – |
| product_topic | enum `product_topic` (`umeni`, `pamatky`, `znamky`, `archy`), od 2026-07-14, nezávislý na `category` – slouží jen jako tematický filtr ve sloučeném výpisu kategorie Známky (viz [sekce 4](04-popis-eshopu.md)) | ne (nullable) | – |
| stock_quantity | integer | ano | `0` |
| is_active | boolean | ano | `true` |
| tag_new | boolean | ano | `false` |
| tag_last_pieces | boolean | ano | `false` |
| tag_top | **integer** (TOP rank 1–6) | ne (nullable) | – |
| catalog_number | text | ne (nullable) | – |
| release_date | date | ne (nullable) | – |
| dimensions_mm | text | ne (nullable) | – |
| designer | text | ne (nullable) | – |
| engraver | text | ne (nullable) | – |
| related_stamp_id | uuid[] | ne (nullable) | – |
| created_at | timestamptz | ano | `now()` |
| show_on_homepage | boolean | ne (nullable) | `false` |
| sold_count | integer, od 2026-07-12, počet prodaných kusů pro řazení „Nejprodávanější“ (viz [sekce 4](04-popis-eshopu.md#1-homepage)) | ano | `0` |

RLS: `anon` může jen číst (veřejný výpis produktů na eshopu), `authenticated` (přihlášený admin) má od 2026-07-10 explicitně plný CRUD (`docs/sql/007_products_rls_authenticated_crud.sql`) – předtím chyběla politika pro `INSERT`/`DELETE`, což se projevilo chybou „new row violates row-level security policy“ při zakládání nového produktu v adminu.

## `orders`
| Sloupec | Typ | Povinné při insertu | Default |
|---|---|---|---|
| id | uuid (PK) | ano | `gen_random_uuid()` |
| created_at | timestamptz | ano | `now()` |
| status | text, `CHECK` na 13 platných hodnot (`orders_status_check`, od 2026-06-16) | ano | `'Nová'` |
| total_price | integer | ano | – |
| shipping_method | text | ano | – |
| shipping_cost | integer | ano | – |
| payment_method | text | ano | – |
| payment_cost | integer | ano | – |
| cart_items | jsonb | ano | – |
| customer_note | text | ne (nullable) | – |
| billing_first_name / billing_last_name / billing_email / billing_phone | text | ano | – |
| billing_company_name / billing_company_id / billing_company_tax_id | text | ne (nullable) | – |
| billing_address_line1 / billing_city / billing_zip / billing_country | text | ano | – |
| billing_address_line2 / billing_region | text | ne (nullable) | – |
| shipping_is_different | boolean | ano | `false` |
| shipping_first_name … shipping_country (celý doručovací blok) | text | ne (nullable) | – |
| discount_code | text, uplatněný slevový kód | ne (nullable) | – |
| discount_amount | numeric, výše slevy v Kč | ano | `0` |

## `discount_codes`
| Sloupec | Typ | Povinné při insertu | Default |
|---|---|---|---|
| id | uuid (PK) | ano | `gen_random_uuid()` |
| code | text, unikátní, porovnává se case-insensitive (`upper(trim())`) | ano | – |
| type | text, `CHECK` na `percentage` / `fixed` | ano | – |
| value | numeric, `CHECK value > 0` | ano | – |
| max_uses | integer, nullable = neomezeno | ne (nullable) | – |
| used_count | integer, spravuje jen RPC funkce `redeem_discount_code` | ano | `0` |
| valid_from | timestamptz, nullable = platí od vytvoření | ne (nullable) | – |
| valid_until | timestamptz | ano | – |
| is_active | boolean | ano | `true` |
| created_at | timestamptz | ano | `now()` |

RLS: `anon` k tabulce nemá žádný přístup (ani čtení), `authenticated` (přihlášený admin) má plný CRUD. Jediný veřejný přístup je přes dvě `SECURITY DEFINER` RPC funkce – `validate_discount_code(p_code)` (ověří kód, vrátí typ/hodnotu jen když je platný) a `redeem_discount_code(p_code)` (atomicky navýší `used_count`). Bez toho by šlo přes anon klíč vypsat všechny kódy včetně jejich hodnoty přímo přes REST API. Viz [sekce 4](04-popis-eshopu.md) a [sekce 5](05-administrace.md).

## `custom_stamps`
| Sloupec | Typ | Povinné při insertu | Default |
|---|---|---|---|
| id | uuid (PK) | ano | `gen_random_uuid()` |
| product_id | uuid (FK → `products.id`), `NOT NULL` od 2026-06-16 | ano | – |
| preview_url | text | ano | – |
| print_url | text | ano | – |
| created_at | timestamptz | ano | `now()` |

## Nalezené nesrovnalosti kód ↔ DB
Opraveno přímo v `src/types/database.ts`:
- **`tag_top`** byl typovaný jako `boolean`, ve skutečnosti je to `integer` (TOP rank 1–6, používá se v adminu jako `tag_top: 1..6 | null`) → opraveno na `number | null`
- **`show_on_homepage`** v DB existuje, ale v TS typu `Product` úplně chyběl → doplněno
- **`category`** byl typovaný jako obecný `string`, DB má skutečný enum se 4 hodnotami → zaveden typ `ProductCategory`
- **`short_description` / `detailed_description`** byly v TS nepovinně null-safe (`string`), DB je nullable → opraveno na `string | null`

Opraveno přímo v DB (migrace `docs/sql/001_orders_status_check.sql`, provedeno 2026-06-16):
- **`orders.status`** dříve nemělo žádné omezení hodnot (čistý `text`) – teď má `CHECK` constraint `orders_status_check` na 13 platných hodnot z `OrderStatus`. Přímý zápis libovolného stringu (SQL editor, jiný klient) už DB odmítne.
- **`custom_stamps.product_id`** dříve bylo nullable, teď má `NOT NULL` – odpovídá tomu, že appkód (`StampEditor.tsx`) ho vždy vyplňuje.

## Provedené SQL migrace
- `docs/sql/001_orders_status_check.sql` – provedeno 2026-06-16 v Supabase SQL editoru, bez dopadu na stávající data.
- `docs/sql/002_orders_tracking_number.sql` – provedeno 2026-06-16, doplnil `orders.tracking_number` (text, nullable) pro sledovací číslo zásilky, viz [sekce 5](05-administrace.md#2-záložka-objednávky).
- `docs/sql/003_products_sale_price.sql` – provedeno 2026-07-01, doplnil `products.sale_price` (numeric, nullable) pro slevy, viz [sekce 4](04-popis-eshopu.md#1-homepage) a [sekce 5](05-administrace.md#3-záložka-produkty).
- `docs/sql/004_discount_codes.sql` – provedeno 2026-07-08, zavádí tabulku `discount_codes`, RLS (anon bez přístupu, authenticated plný CRUD) a dvě `SECURITY DEFINER` RPC funkce `validate_discount_code`/`redeem_discount_code` pro bezpečné ověření/uplatnění kódu z veřejného klienta bez rizika vypsání všech kódů.
- `docs/sql/005_orders_discount_columns.sql` – provedeno 2026-07-08, doplňuje `orders.discount_code` a `orders.discount_amount` pro uložení uplatněné slevy na objednávce.
- `docs/sql/006_products_category_znamkove_archy.sql` – provedeno 2026-07-10, doplňuje do enumu `product_category` novou hodnotu `znamkove-archy` (5. kategorie produktů, viz [sekce 4](04-popis-eshopu.md)).
- `docs/sql/007_products_rls_authenticated_crud.sql` – provedeno 2026-07-10, doplňuje `authenticated` roli politiku pro plný CRUD na `products` (`INSERT`/`DELETE` předtím chyběly, `anon` čtení beze změny).
- `docs/sql/008_products_drop_unused_columns.sql` – provedeno 2026-07-10, smazal sloupce `print_sheets` (bylo prázdné u všech produktů) a `stamp_type` (mělo vyplněnou hodnotu u 8 z 11 produktů – data vědomě zahozena na výslovné přání uživatele). Odstraněno i z `src/types/database.ts`, `ProductFormModal.tsx` a `ProductDetailClient.tsx`.
- `docs/sql/009_products_sold_count.sql` – provedeno 2026-07-12, doplňuje `products.sold_count` (integer, default `0`) a `SECURITY DEFINER` RPC funkci `increment_product_sold_count(p_product_id, p_qty)` (grant pro `anon`/`authenticated`, protože `/api/create-order` běží pod anon klíčem a `products` nemá pro anon `UPDATE` policy). Volá se fire-and-forget po úspěšném vytvoření objednávky, pro každou položku typu `product` i `custom` (u vlastních archů se dohledá `product_id` přes `custom_stamps.products`). Slouží k řazení „Nejprodávanější“ v kategoriích a na `/vytvorit-arch`, viz [sekce 4](04-popis-eshopu.md).
- `docs/sql/010_products_topic.sql` – **zatím neprovedeno**, čeká na spuštění v Supabase SQL editoru. Zavádí enum `product_topic` (`umeni`, `pamatky`, `znamky`, `archy`) a sloupec `products.product_topic` (nullable) pro tematický filtr v kategorii Známky, viz [sekce 4](04-popis-eshopu.md) a [sekce 5](05-administrace.md).
