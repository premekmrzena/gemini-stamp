# 7. SEO

> Stav popsaný podle skutečného kódu k 2026-08-04. Tuto sekci aktualizovat při každé změně metadat/sitemapy/brandingu.

## Základ – `src/lib/site.ts`
Jediné místo, odkud se odvozuje doména a název značky:
- `SITE_URL` = `https://mycreativestamp.com` (finální produkční doména)
- `SITE_NAME` = `My Creative Stamp`
- `SITE_DEFAULT_TITLE` / `SITE_DEFAULT_DESCRIPTION` – výchozí title/description pro homepage a jako fallback

**Branding:** projekt se dřív pracovně jmenoval „Gemini Stamp" (a na pár místech nesystematicky jen „Creative Stamp"). K 2026-07-16 sjednoceno na **My Creative Stamp** ve veškerém uživatelsky viditelném obsahu (metadata, JSON-LD, e-maily, alt texty, obchodní podmínky, ochrana osobních údajů, kontakt, admin). Kontaktní e-mail sjednocen na `info@mycreativestamp.com`.

Interní/technické identifikátory (npm balíček `package.json`/`package-lock.json` → `"name": "gemini-stamp"`, `.devcontainer/devcontainer.json`, GitHub repo `premekmrzena/gemini-stamp`) **zůstaly beze změny** – nejsou vidět uživatelům ani vyhledávačům a přejmenování GitHub repa je samostatný krok mimo kód (změnil by remote URL). Zmíněno v [sekci 1](01-technicka-infrastruktura.md).

## Metadata – architektura
- **`src/app/[locale]/layout.tsx`** – `metadataBase: new URL(SITE_URL)`, `title.template: '%s | My Creative Stamp'` + `title.default`, výchozí `openGraph`/`twitter` karty (obrázek zatím `/images/hero01.png`, viz Otevřené body), `robots: { index: true, follow: true }`, Organization JSON-LD (`<script type="application/ld+json">` v `<body>`). Od 2026-08-09 je tohle sám kořenový layout (Next.js "multiple root layouts") – dřív nad ním byl společný `src/app/layout.tsx` s natvrdo `<html lang="en">`; teď `<html lang={locale}>` sedí přímo tady, protože layout má přístup k `params.locale`. `/admin` a `/rekonstrukce` mají od stejného data svůj vlastní minimální root layout (`lang="cs"`, bez i18n).
- Každá stránka pod tím nastavuje **jen krátký title** (např. `'Kontakt'`) – suffix `| My Creative Stamp` doplňuje automaticky `title.template`. Pokud se přidává nová stránka s vlastním `metadata`, title se **nesmí** psát s plným suffixem, jinak vznikne duplicita (`Kontakt | My Creative Stamp | My Creative Stamp`).
- `alternates: { canonical: '/cesta' }` je nastavené explicitně na každé indexovatelné stránce – Next `<link rel="canonical">` sám od sebe negeneruje, bez explicitního nastavení by v `<head>` chyběl úplně.
- Od 2026-08-09 má každá z nich navíc `languages: localeAlternates('/cesta')` (`src/lib/site.ts`) → generuje `<link rel="alternate" hreflang="en">` + `hreflang="x-default"` na stejnou URL. Self-reference, ne skutečné jazykové varianty – viz hreflang bod v Otevřených bodech.

### Metadata po routách
| Route | Kde se nastavuje | Poznámka |
|---|---|---|
| `/` | `(store)/page.tsx` | Dědí title/description z `layout.tsx`, jen `canonical: '/'` |
| `/kontakt`, `/jak-nakupovat`, `/co-je-kreativni-arch`, `/obchodni-podminky`, `/ochrana-osobnich-udaju` | vlastní `export const metadata` v `page.tsx` | Statický title/description/canonical |
| `/kategorie/[slug]` | `kategorie/[slug]/layout.tsx` (`generateMetadata`) | `page.tsx` je klientská komponenta (`'use client'`), takže metadata musí sedět v odděleném server `layout.tsx` vedle ní. Obsah kategorií (title/description) je v `src/lib/categoryContent.ts` – sdílené mezi `layout.tsx` (metadata) a `page.tsx` (UI), aby nebyl duplicitně na dvou místech. |
| `/produkt/[id]` | `produkt/[id]/page.tsx` (`generateMetadata`) | Server komponenta, dotaz do Supabase přes `getProduct` obalený v `cache()` z `react` – stejný produkt se pro metadata i tělo stránky stáhne jen jednou. Title = název produktu, description = `short_description` (fallback na generický text), OG image = `product.image_url`. |
| `/vytvorit-arch` | `(checkout)/vytvorit-arch/layout.tsx` | `page.tsx` je klientská komponenta, metadata proto v odděleném `layout.tsx` (stejný vzor jako u kategorie). |
| `/kosik`, `/dekujeme`, `/admin/*` | `layout.tsx` v příslušné složce | `robots: { index: false, follow: false }` – nemá smysl je indexovat (košík, děkovací stránka s parametry objednávky, administrace). |
| `/faq` | vlastní `export const metadata` v `page.tsx` | Statický title/description/canonical. |

**Od 2026-07-16 (i18n):** titulky/popisy výše se od zavedení `next-intl` čtou přes `getTranslations`/`useTranslations` z `messages/{cs,en}.json` (namespace `metadata.*`), ne natvrdo v `page.tsx`. Produkční jazyk je **EN bez URL prefixu** (`routing.ts` `defaultLocale: 'en'`, `localePrefix: 'as-needed'`), `/cs/...` je jen interní pracovní náhled – `proxy.ts` ho zákazníkům (i botům, žádná `site_access` cookie) přesměruje pryč, takže se nikdy nedostane do indexu ani jako duplicitní obsah.

**Kořenový fallback (`src/lib/site.ts`, `src/app/[locale]/layout.tsx`) musí být anglicky**, ne česky – žádná stránka pod `[locale]` si nenastavuje vlastní `twitter` metadata a řada z nich (homepage, kategorie, košík, vytvořit-arch) ani vlastní `openGraph`, takže na tenhle fallback padají. Do 2026-08-04 tam byl omylem český text a `openGraph.locale: 'cs_CZ'` – Twitter card byl česky na celém produkčním (anglickém) webu. Opraveno, viz Změny níže.

**404/soft-404:** `/produkt/[id]` s neexistujícím ID dřív vracelo `200 OK` s textem „produkt nenalezen“ (soft-404, Google Search Console by to hlásil jako chybu). Opraveno voláním `notFound()` z `next/navigation` – renderuje se přes nový `src/app/[locale]/not-found.tsx` (lokalizovaný, `messages.notFound`), vrací skutečný `404` a Next.js k němu automaticky připojí `<meta name="robots" content="noindex">`.

## `robots.ts` a `sitemap.ts`
- **`src/app/robots.ts`** – povoluje `/`, disallow `/admin`, `/api`, `/kosik`, `/dekujeme`. Odkazuje na `${SITE_URL}/sitemap.xml`. `/cs/...` se do robots.txt záměrně nedává – je řešené na úrovni `proxy.ts` (redirect pryč pro kohokoli bez `site_access` cookie, viz výše), takže ho crawler nikdy neuvidí ani nemá šanci zaindexovat.
- **`src/app/sitemap.ts`** – generuje se dynamicky (`revalidate = 3600`):
  - statické stránky (homepage, `/co-je-kreativni-arch`, `/jak-nakupovat`, `/vytvorit-arch`, `/kontakt`, `/faq`, `/obchodni-podminky`, `/ochrana-osobnich-udaju`)
  - kategorie ze `INDEXABLE_CATEGORY_SLUGS` (`src/lib/categoryContent.ts`) – `znamky`, `znamkove-archy`, `fdc`, `plakety`. **`kreativni-archy` záměrně chybí** – ta route jen přesměrovává na `/vytvorit-arch` (viz [sekce 4](04-popis-eshopu.md)), nemá vlastní obsah k indexování. `/kategorie/kreativni-archy` má navíc od 2026-08-04 trvalý (301/308) redirect na `/vytvorit-arch` v `next.config.ts` (`redirects()`) – žádný odkaz na webu tam sice nevede, ale kdyby existoval starý/vnější odkaz, dostane rovnou redirect místo probliknutí prázdné stránky s generickým titulkem.
  - všechny produkty s `is_active = true` (`lastModified` = `created_at` – v DB zatím není `updated_at` sloupec, takže datum poslední úpravy produktu sitemap nezná přesně).

## Structured data (JSON-LD)
- **Organization** – `src/app/[locale]/layout.tsx`, na každé stránce (name, url, logo, kontaktní e-mail).
- **Product** – `produkt/[id]/page.tsx`, per produkt (name, description, image, sku = `catalog_number` nebo `id`, `brand`, `offers` s cenou/měnou CZK nebo EUR dle `locale`/dostupností podle `stock_quantity`).
- **BreadcrumbList** – od 2026-08-04 generuje sdílená komponenta `src/components/Breadcrumbs.tsx` sama (z `items` propu), takže rich-results drobečková navigace ve výsledcích vyhledávání funguje automaticky na všech stránkách, které komponentu používají (produkt, kategorie, kontakt, FAQ, jak-nakupovat, co-je-kreativní-arch, VOP, GDPR).

## Otevřené body
- **OG obrázek je zatím `/images/hero01.png`** (poměr 4:3) – použitý jako výchozí `openGraph`/`twitter` obrázek v `layout.tsx`. Pro sdílení na sociálních sítích by měl vzniknout dedikovaný banner **1200×630 px** (ideálně přes `opengraph-image.tsx`/`ImageResponse`, ne statický soubor, kdyby se měl obsahově lišit stránku od stránky). Produkt má vlastní `og:image` (fotku produktu), tenhle bod se týká jen stránek bez vlastního obrázku (homepage, kategorie, statické stránky).
- **Google Search Console / Bing Webmaster Tools** – po ostrém nasazení na `mycreativestamp.com` nutno zaregistrovat property a odeslat `sitemap.xml`.
- **`lastModified` u produktů** je jen `created_at` – pokud přibude sloupec `updated_at`, přepnout na něj v `sitemap.ts` pro přesnější signalizaci změn crawlerům.
- **Meta description délka** – `category.content.znamky.description` (198 znaků) a `category.content.fdc.description` (250 znaků) v `messages/en.json` přesahují doporučených ~155–160 znaků, Google je ve výsledcích ořízne. Stejný text se ale zobrazuje i jako viditelný úvodní odstavec na stránce kategorie (`kategorie/[slug]/page.tsx`), takže jde o marketingový text, ne čistě technická metadata – zkrácení/rozdělení na samostatný kratší meta description řetězec je rozhodnutí pro obsah, ne automatická oprava.
- **hreflang (`alternates.languages`)** – od 2026-08-09 nastaveno na všech indexovatelných stránkách, ale zatím jen jako self-reference (`en` + `x-default` na stejnou URL) – jediná reálná produkční mutace je `en` (`cs` je jen interní náhled, needitovatelný/needindexovatelný pro boty, ko/ja/zh-* mají prázdné `messages/*.json`, viz [sekce 9](09-jazykove-mutace.md)). Až přibude aspoň druhá reálná zákaznická mutace, doplnit ji do `localeAlternates()` v `src/lib/site.ts` – definice hreflang je centralizovaná tam, není potřeba znovu procházet jednotlivé stránky.

## Změny
- 2026-07-16: Založeno kompletní SEO nastavení – `metadataBase`/title template/OG/Twitter v `layout.tsx`, `robots.ts`, `sitemap.ts`, `generateMetadata` pro kategorie a produkty (přes oddělené `layout.tsx` u klientských stránek), canonical URL na všech indexovatelných stránkách, `noindex` na košíku/děkovací stránce/adminu, Organization + Product JSON-LD. Zároveň přejmenován branding z pracovního „Gemini Stamp" na finální **My Creative Stamp** napříč celou appkou (metadata, e-maily, alt texty, právní dokumenty, kontakt).
- 2026-08-04: Kompletní SEO audit před ostrým spuštěním. Opraveno: kořenový OG/Twitter fallback byl natvrdo česky (`src/lib/site.ts`, `openGraph.locale`) a bez per-page `twitter` metadata se projevoval na celém webu; `/produkt/[id]` s neexistujícím ID vracelo soft-404 (`200` s textem „nenalezeno“) místo skutečného `404` – přidán `notFound()` + nový lokalizovaný `src/app/[locale]/not-found.tsx`; `/faq` chybělo v `sitemap.ts`; `/kategorie/kreativni-archy` dostalo trvalý redirect místo klientského `router.replace`; `Breadcrumbs.tsx` teď generuje i `BreadcrumbList` JSON-LD; `Product` JSON-LD doplněn o `brand`.
- 2026-08-09: Externí audit upozornil na `<html lang="en">` obalující český obsah a chybějící hreflang. `src/app/layout.tsx` (společný root layout bez přístupu k `params.locale`) zrušen, `src/app/[locale]/layout.tsx` je teď sám root layout s `<html lang={locale}>`; `/admin` a `/rekonstrukce` dostaly vlastní root layout s `lang="cs"`. Přidán `alternates.languages` (hreflang `en` + `x-default`, zatím self-reference) na všech 10 indexovatelných stránkách přes nový `localeAlternates()` v `src/lib/site.ts`.
