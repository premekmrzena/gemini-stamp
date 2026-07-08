# 3. Databáze (Supabase)

> Skutečné schéma vytažené z Supabase (OpenAPI introspekce přes `service_role` klíč) k 2026-06-16, doplněno o `products.sale_price` k 2026-07-01. Liší se od `src/types/database.ts` v bodech popsaných níže – ty už jsou opravené v kódu.

## `products`
| Sloupec | Typ | Povinné při insertu | Default |
|---|---|---|---|
| id | uuid (PK) | ano | `gen_random_uuid()` |
| name | text | ano | – |
| short_description | text | ne (nullable) | – |
| detailed_description | text | ne (nullable) | – |
| price | integer | ano | – |
| sale_price | numeric | ne (nullable) | – |
| weight_grams | integer | ano | `0` |
| image_url | text | ano | – |
| gallery_images | text[] | ne (nullable) | – |
| category | enum `product_category` (`znamky`, `kreativni-archy`, `fdc`, `plakety`) | ano | – |
| stock_quantity | integer | ano | `0` |
| is_active | boolean | ano | `true` |
| tag_new | boolean | ano | `false` |
| tag_last_pieces | boolean | ano | `false` |
| tag_top | **integer** (TOP rank 1–6) | ne (nullable) | – |
| catalog_number | text | ne (nullable) | – |
| stamp_type | text | ne (nullable) | – |
| release_date | date | ne (nullable) | – |
| print_sheets | text | ne (nullable) | – |
| dimensions_mm | text | ne (nullable) | – |
| designer | text | ne (nullable) | – |
| engraver | text | ne (nullable) | – |
| related_stamp_id | uuid[] | ne (nullable) | – |
| created_at | timestamptz | ano | `now()` |
| show_on_homepage | boolean | ne (nullable) | `false` |

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
| discount_code | text, uplatněný slevový kód (NEPROVEDENO, viz migrace níže) | ne (nullable) | – |
| discount_amount | numeric, výše slevy v Kč (NEPROVEDENO, viz migrace níže) | ano | `0` |

## `discount_codes` (NEPROVEDENO – čeká na spuštění migrace)
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
- `docs/sql/003_products_sale_price.sql` – provedeno 2026-07-01, doplnil `products.sale_price` (numeric, nullable) pro slevy, viz [sekce 4](04-popis-eshopu.md#1-homepage) a [sekce 5](05-administrace.md#3-záložka-homepage-produkty).
- `docs/sql/004_discount_codes.sql` – NEPROVEDENO (čeká na spuštění v Supabase SQL editoru), zavádí tabulku `discount_codes`, RLS (anon bez přístupu, authenticated plný CRUD) a dvě `SECURITY DEFINER` RPC funkce `validate_discount_code`/`redeem_discount_code` pro bezpečné ověření/uplatnění kódu z veřejného klienta bez rizika vypsání všech kódů.
- `docs/sql/005_orders_discount_columns.sql` – NEPROVEDENO, doplňuje `orders.discount_code` a `orders.discount_amount` pro uložení uplatněné slevy na objednávce.
