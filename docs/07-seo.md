# 7. SEO

> Stav popsaný podle skutečného kódu k 2026-07-16. Tuto sekci aktualizovat při každé změně metadat/sitemapy/brandingu.

## Základ – `src/lib/site.ts`
Jediné místo, odkud se odvozuje doména a název značky:
- `SITE_URL` = `https://mycreativestamp.com` (finální produkční doména)
- `SITE_NAME` = `My Creative Stamp`
- `SITE_DEFAULT_TITLE` / `SITE_DEFAULT_DESCRIPTION` – výchozí title/description pro homepage a jako fallback

**Branding:** projekt se dřív pracovně jmenoval „Gemini Stamp" (a na pár místech nesystematicky jen „Creative Stamp"). K 2026-07-16 sjednoceno na **My Creative Stamp** ve veškerém uživatelsky viditelném obsahu (metadata, JSON-LD, e-maily, alt texty, obchodní podmínky, ochrana osobních údajů, kontakt, admin). Kontaktní e-mail sjednocen na `info@mycreativestamp.com`.

Interní/technické identifikátory (npm balíček `package.json`/`package-lock.json` → `"name": "gemini-stamp"`, `.devcontainer/devcontainer.json`, GitHub repo `premekmrzena/gemini-stamp`) **zůstaly beze změny** – nejsou vidět uživatelům ani vyhledávačům a přejmenování GitHub repa je samostatný krok mimo kód (změnil by remote URL). Zmíněno v [sekci 1](01-technicka-infrastruktura.md).

## Metadata – architektura
- **`src/app/layout.tsx`** – `metadataBase: new URL(SITE_URL)`, `title.template: '%s | My Creative Stamp'` + `title.default`, výchozí `openGraph`/`twitter` karty (obrázek zatím `/images/hero01.png`, viz Otevřené body), `robots: { index: true, follow: true }`, Organization JSON-LD (`<script type="application/ld+json">` v `<body>`).
- Každá stránka pod tím nastavuje **jen krátký title** (např. `'Kontakt'`) – suffix `| My Creative Stamp` doplňuje automaticky `title.template`. Pokud se přidává nová stránka s vlastním `metadata`, title se **nesmí** psát s plným suffixem, jinak vznikne duplicita (`Kontakt | My Creative Stamp | My Creative Stamp`).
- `alternates: { canonical: '/cesta' }` je nastavené explicitně na každé indexovatelné stránce – Next `<link rel="canonical">` sám od sebe negeneruje, bez explicitního nastavení by v `<head>` chyběl úplně.

### Metadata po routách
| Route | Kde se nastavuje | Poznámka |
|---|---|---|
| `/` | `(store)/page.tsx` | Dědí title/description z `layout.tsx`, jen `canonical: '/'` |
| `/kontakt`, `/jak-nakupovat`, `/co-je-kreativni-arch`, `/obchodni-podminky`, `/ochrana-osobnich-udaju` | vlastní `export const metadata` v `page.tsx` | Statický title/description/canonical |
| `/kategorie/[slug]` | `kategorie/[slug]/layout.tsx` (`generateMetadata`) | `page.tsx` je klientská komponenta (`'use client'`), takže metadata musí sedět v odděleném server `layout.tsx` vedle ní. Obsah kategorií (title/description) je v `src/lib/categoryContent.ts` – sdílené mezi `layout.tsx` (metadata) a `page.tsx` (UI), aby nebyl duplicitně na dvou místech. |
| `/produkt/[id]` | `produkt/[id]/page.tsx` (`generateMetadata`) | Server komponenta, dotaz do Supabase přes `getProduct` obalený v `cache()` z `react` – stejný produkt se pro metadata i tělo stránky stáhne jen jednou. Title = název produktu, description = `short_description` (fallback na generický text), OG image = `product.image_url`. |
| `/vytvorit-arch` | `(checkout)/vytvorit-arch/layout.tsx` | `page.tsx` je klientská komponenta, metadata proto v odděleném `layout.tsx` (stejný vzor jako u kategorie). |
| `/kosik`, `/dekujeme`, `/admin/*` | `layout.tsx` v příslušné složce | `robots: { index: false, follow: false }` – nemá smysl je indexovat (košík, děkovací stránka s parametry objednávky, administrace). |

## `robots.ts` a `sitemap.ts`
- **`src/app/robots.ts`** – povoluje `/`, disallow `/admin`, `/api`, `/kosik`, `/dekujeme`. Odkazuje na `${SITE_URL}/sitemap.xml`.
- **`src/app/sitemap.ts`** – generuje se dynamicky (`revalidate = 3600`):
  - statické stránky (homepage, `/co-je-kreativni-arch`, `/jak-nakupovat`, `/vytvorit-arch`, `/kontakt`, `/obchodni-podminky`, `/ochrana-osobnich-udaju`)
  - kategorie ze `INDEXABLE_CATEGORY_SLUGS` (`src/lib/categoryContent.ts`) – `znamky`, `znamkove-archy`, `fdc`, `plakety`. **`kreativni-archy` záměrně chybí** – ta route jen přesměrovává na `/vytvorit-arch` (viz [sekce 4](04-popis-eshopu.md)), nemá vlastní obsah k indexování.
  - všechny produkty s `is_active = true` (`lastModified` = `created_at` – v DB zatím není `updated_at` sloupec, takže datum poslední úpravy produktu sitemap nezná přesně).

## Structured data (JSON-LD)
- **Organization** – `src/app/layout.tsx`, na každé stránce (name, url, logo, kontaktní e-mail).
- **Product** – `produkt/[id]/page.tsx`, per produkt (name, description, image, sku = `catalog_number` nebo `id`, `offers` s cenou/měnou CZK/dostupností podle `stock_quantity`).

## Otevřené body
- **OG obrázek je zatím `/images/hero01.png`** (poměr 4:3) – použitý jako výchozí `openGraph`/`twitter` obrázek v `layout.tsx`. Pro sdílení na sociálních sítích by měl vzniknout dedikovaný banner **1200×630 px** (ideálně přes `opengraph-image.tsx`/`ImageResponse`, ne statický soubor, kdyby se měl obsahově lišit stránku od stránky).
- **Google Search Console / Bing Webmaster Tools** – po ostrém nasazení na `mycreativestamp.com` nutno zaregistrovat property a odeslat `sitemap.xml`.
- **`lastModified` u produktů** je jen `created_at` – pokud přibude sloupec `updated_at`, přepnout na něj v `sitemap.ts` pro přesnější signalizaci změn crawlerům.

## Změny
- 2026-07-16: Založeno kompletní SEO nastavení – `metadataBase`/title template/OG/Twitter v `layout.tsx`, `robots.ts`, `sitemap.ts`, `generateMetadata` pro kategorie a produkty (přes oddělené `layout.tsx` u klientských stránek), canonical URL na všech indexovatelných stránkách, `noindex` na košíku/děkovací stránce/adminu, Organization + Product JSON-LD. Zároveň přejmenován branding z pracovního „Gemini Stamp" na finální **My Creative Stamp** napříč celou appkou (metadata, e-maily, alt texty, právní dokumenty, kontakt).
