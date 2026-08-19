# 13. Marketing

> Stav popsaný podle skutečného kódu a rozhodnutí k 2026-08-13 (průběžně doplňováno během dne). Tuto sekci aktualizovat při každé změně kampaní/landing pages/cílení.

## Souhrn
Post-launch marketing běží dvoukolejně: **Trasa A** (technické doladění eshopu) a **Trasa B** (přivedení prvních zákazníků) – podrobný, průběžně aktualizovaný plán obou tras je v artefaktu "Poštovní itinerář" (Claude Artifact, ne v repu). Tahle sekce dokumentuje jen tu část Trasy B, která se propsala do kódu a je trvale relevantní: cílové skupiny, kampaňové landing pages a seznam registračních nástrojů.

## Tři pilíře marketingu (2026-08-16)
Uživatel rozdělil marketing do tří paralelních, samostatně měřitelných pilířů:

1. **Online marketing** – SEO, Google Ads (PMax), Merchant Center, sociální sítě (Instagram, Xiaohongshu organicky) – viz zbytek téhle sekce.
2. **Fyzické letáky pro asijské turisty na ulici** – **probíhá právě teď.** Vlastní slevový kód na leták kvůli měření úspěšnosti kampaně. První běžící kód: `GIFT8` (8 %, univerzální, bez omezení počtu použití, platnost do 2027-08-16) – QR vede na `/prague-souvenir?code=GIFT8&utm_source=letak&utm_medium=offline&utm_campaign=gift8`, kód se v košíku aplikuje automaticky (viz `docs/temp/gift8-letak-qr.md` a `[[project_gift8_flyer_campaign]]` v paměti). GA4 měření funguje bez ručního nastavení (UTM → Traffic acquisition), `purchase` event navíc nese `coupon` (PR #6), takže jde v GA4 filtrovat i skutečné nákupy s kódem, ne jen začátky checkoutu.
3. **Oslovení cestovních kanceláří** (zprostředkovávají asijským turistům cestu do ČR) – **vědomě odloženo, řešit později.** Očekává se vlastní slevový kód specifický pro letáky přes CK (jiný od `GIFT8`, ať jde odlišit výkon kanálu).

## Cílové skupiny
Dvě samostatně měřené skupiny, každá s vlastní kampaňovou landing page (viz níže) – záměrně oddělené, aby šel jejich výkon v GA4/Ads porovnat bez míchání provozu.

| Skupina | Landing page | Jazyky | Poznámka |
|---|---|---|---|
| Asijský turista v ČR (Japonsko/Čína/Korea), chce si odvézt osobní suvenýr | `/prague-souvenir` (+ pevné `/ja`, `/zh-Hans`, `/zh-Hant`, `/ko`, `/en`) | EN/JA/ZH-Hans/ZH-Hant/KO | Kreativní arch sedí dobře – vizuální, snadno pochopitelný, osobní |
| Západní turista v ČR | `/prague-gift` | jen EN | Copy záměrně totožné s EN variantou `/prague-souvenir` – jediná proměnná v porovnání má být zdroj provozu, ne text |

**Platformy specifické pro asijský segment** (mimo západní standard, viz `/prague-souvenir`):
- **Japonsko** – LINE (messaging i ads), Twitter/X drží mnohem silnější pozici než jinde v Asii
- **Čína** – Xiaohongshu/RED (小红书), de facto Pinterest pro „co koupit na cestách" – pravděpodobně nejrelevantnější kanál pro tenhle segment
- **Korea** – Naver (ne Google) je dominantní vyhledávač, KakaoTalk vlastní messaging+ads platforma

**Známé omezení:** WeChat Pay pro CZ Stripe účet nepodporováno, Alipay jen v EUR (viz [[project_stripe_alt_payment_methods]]) – čínští turisté kartu často nepreferují, zatím nevyřešeno.

## Kampaňové landing pages
`src/app/prague-souvenir/` a `src/app/prague-gift/` – obě **mimo next-intl `[locale]` routing**, vlastní root layout (Next.js "multiple root layouts", stejný vzor jako `/admin` a `/rekonstrukce`, viz [sekce 9](09-jazykove-mutace.md)).

### `/prague-souvenir` – struktura a jazyky
Refaktorováno na `content.ts` (data – `LANGS`/`CONTENT`/detekční funkce) + `LandingContent.tsx` (sdílená JSX pro kořen i pevné cesty) + dvě varianty stránky:

- **Kořen `/prague-souvenir`** (`page.tsx`, klientská komponenta) – auto-detekuje jazyk z `navigator.language`:
  - JA/ZH-Hans/ZH-Hant/KO detekováno → `router.replace()` na odpovídající pevnou `/prague-souvenir/{jazyk}` URL, **se zachováním celého query stringu** (kvůli `gclid`/`utm_*` – kdyby na kořen mířila reklama, přesměrování nesmí rozbít atribuci kampaně).
  - EN/nerozpoznáno → zůstává na kořeni, anglicky, s přepínačem jazyků jako záchrannou sítí pro špatnou detekci.
  - Explicitní `?lang=` parametr je samostatný lokální override (zůstat na kořeni, jen přepnout obsah, bez přesměrování) – pro testování konkrétní varianty.
- **Pevné `/prague-souvenir/[lang]`** (`en`/`ja`/`zh-Hans`/`zh-Hant`/`ko`, server komponenta) – žádný přepínač (kdo přijde z cílené reklamy, je už ve správném jazyce), `notFound()` pro cokoli mimo těch 5 kódů, `generateStaticParams`+`generateMetadata` per jazyk (title/description/OG z `CONTENT`). **Doporučené jako Google Ads Final URL per kampaň/jazyk.**
- **`/prague-gift`** – čistě server komponenta, jen anglicky, žádná detekce jazyka, žádný přepínač.
- Obě mají CTA vedoucí na existující `/vytvorit-arch` (anglický checkout beze změny) – `/prague-souvenir` k tomu u tlačítka zobrazuje poznámku "checkout continues in English" v aktivním jazyce.
- Hero/showcase obrázky (`hero01.png`/`hero02.png`) jsou existující marketingové assety z homepage – web už dřív vizuálně cílil přesně na asijské turisty. Mezi oběma stránkami prohozené (hero01↔hero02), ať nejsou vizuálně identické.
- Logo v hlavičce obou stránek: `creative-stamp_logo.svg` (viewBox 262×69, celý wordmark – ikona+text v jednom) vykreslené na 180×47 (zachovaný poměr stran), stejně jako `Header.tsx` (250×69). **Vedlejší nález:** ten SVG má pořád starý text "Creative Stamp"/"Discover the world", ne aktuální "My Creative Stamp" – napříč celým webem (stejný soubor používá i `Header.tsx`), nezasahováno bez zadání uživatele.

### GA4 + Consent Mode (doplněno 2026-08-13, kritická oprava)
Obě stránky **do 13. 8. odpoledne neměly GA4 zapojené vůbec** (žily mimo `[locale]`, kde `GoogleAnalytics`/`AnalyticsPageview`/`CookieConsent` normálně bydlí) – žádná kampaň by se nedala změřit. Opraveno:
- `GoogleAnalytics.tsx` přesunuto z `src/app/[locale]/` do sdíleného `src/components/` (nemá žádnou next-intl závislost).
- Nový `src/components/CampaignCookieConsent.tsx` – anglická verze `CookieConsent.tsx` bez next-intl závislostí (`useTranslations`, next-intl `Link`), stejný `localStorage` klíč `mcs_cookie_consent` jako hlavní web, takže souhlas daný na jednom místě platí i na druhém.
- Oba layouty (`prague-souvenir`, `prague-gift`) teď skládají `GoogleAnalytics` + `AnalyticsPageview` (v `Suspense`) + `CampaignCookieConsent`, stejně jako `[locale]/layout.tsx`.

### Routing – proč to nešlo řešit next-intl mutací
**`proxy.ts` – `LOCALE_EXEMPT_PATHS`/`LOCALE_EXEMPT_PREFIXES`:** obě cesty (a všechny podcesty `/prague-souvenir/*`) musí být vyjmuté z next-intl middleware. Bez toho by next-intl podle `Accept-Language`/cookie přesměrovával na neexistující `/ja/prague-souvenir` apod. `MAINTENANCE_MODE` gate na obě cesty dál platí (ověřeno – rewrite na `/rekonstrukce` funguje beze změny).

**`i18n/routing.ts` – `localeDetection: false`:** odkazy z patičky kampaňových stránek (VOP/GDPR) na neprefixované cesty hlavního webu se u návštěvníka s `Accept-Language: cs/sk` přesměrovávaly přes next-intl na `/cs/...`, kde je proxy.ts (neautorizovaný návštěvník) poslal zpátky na homepage – VOP stránka se reálně nikdy neotevřela. Kořenová příčina byla obecná: next-intl auto-detekuje jazyk z Accept-Language/cookie pro JAKOUKOLI neprefixovanou cestu při fresh page-loadu, a kampaňové stránky (vlastní root layout) dělají fresh page-load při každém odkazu ven. Oprava (`localeDetection: false`) řeší celou třídu bugu najednou – `cs` nikdy neměl být auto-detekovatelný, je to jen interní pracovní náhled. Viz [[feedback_proxy_locale_redirect_loop]] pro plnou historii (včetně dřívější bodové opravy z launche).

**`.font-cjk` (globals.css):** Poppins (`src/lib/fonts.ts`, `subsets: ['latin']`) nemá čínské/japonské/korejské znaky – bez explicitního systémového CJK font stacku (PingFang/Hiragino/Yu Gothic/Malgun Gothic/Noto Sans CJK...) se JA/ZH/KO text vykresloval jako prázdné čtverečky (tofu), objeveno až screenshotem. Aplikováno podmíněně na obsah `/prague-souvenir` (podle aktivního jazyka) a natvrdo na jazykový přepínač (vlastní název jazyka musí být čitelný bez ohledu na to, který jazyk je zrovna aktivní). Platí pro jakýkoli budoucí CJK text v appce, ne jen tuhle stránku.

**POZOR:** JA/ZH-Hans/ZH-Hant/KO texty na `/prague-souvenir` jsou strojový překlad, neověřený rodilým mluvčím – stejná kategorie rizika jako EN právní texty (VOP/GDPR). Než se do kampaní nalije větší rozpočet, stálo by za to nechat je zkontrolovat (viz konkrétní návod v paměti session – r/translator, Fiverr/Gengo, Konfuciova akademie/Japonské centrum v Praze).

## Google Merchant Center feed (doplněno 2026-08-13)
`src/app/feed/google-merchant.xml/route.ts` (`GET /feed/google-merchant.xml`) – RSS 2.0 + `g:` namespace feed generovaný přímo z `products` v Supabase, žádná ruční správa produktů v Merchant Center.

- Vynechává kategorii `kreativni-archy` (nemá vlastní "koupit" stránku – vede do editoru `/vytvorit-arch`, ne přímo do košíku) a produkty bez vyplněné `price_eur`.
- `title`/`description` anglicky (`name_en`/`short_description_en` s fallbackem na CZ), `link` na `/produkt/{id}` (EN výchozí locale, EUR ceny) – stejný zdroj dat jako existující Product JSON-LD (viz [sekce 7](07-seo.md)).
- `g:availability` natvrdo `in stock` u všech aktivních produktů – vědomé rozhodnutí, protože sklad je jen informativní a nikdy neblokuje nákup (viz [sekce 4](04-popis-eshopu.md)), na rozdíl od Product JSON-LD, které gatuje `InStock`/`OutOfStock` podle `stock_quantity` (nekonzistence ponechaná vědomě – u reklamního feedu má "out of stock" reálný dopad na viditelnost, u JSON-LD ne).
- `g:identifier_exists = no` – žádné GTIN/MPN, `catalog_number` je jen filatelistické katalogové číslo.
- `.xml` v cestě záměrně bypassuje next-intl/gate middleware (`proxy.ts` matcher vylučuje jakoukoli cestu s tečkou) – stejný trik jako `sitemap.xml`.
- **Merchant Center nastavení:** Scheduled fetch na tu URL, feed label `CZ` (cílový zákazník je turista fyzicky v ČR), jazyk English, zobrazení ve všech zemích (checkout podporuje doručení do 145 zemí).
- **Napojeno na Google Ads:** GA4 ↔ Ads i Merchant Center ↔ Ads propojené, Ads účet (`dvks.admin@gmail.com`, standardní/expert režim, EUR). Import `purchase` eventu jako primární conversion action vědomě odložen na chvíli zakládání první kampaně.
- **Zbývá ověřit:** jestli Google feed schválil bez disapprovals – nejčastější první potíž bývá chybějící `google_product_category` (feed má zatím jen volný `g:product_type`, ne oficiální taxonomy ID).

## Registrace a nástroje
Nástroje potřebné k rozjezdu kampaní – aktuální stav (✅ hotovo) níže, podrobný průběžný plán v artefaktu "Poštovní itinerář".

| Nástroj | Účel | Stav | Odkaz |
|---|---|---|---|
| Google Search Console | Indexace, sitemap | ✅ hotovo | https://search.google.com/search-console/welcome |
| Bing Webmaster Tools | Indexace (Bing) | ✅ hotovo | https://www.bing.com/webmasters |
| Google Merchant Center | Produktový feed pro Shopping/Performance Max | ✅ hotovo | https://merchants.google.com |
| Google Ads | Search kampaně, segmentace | 2× Performance Max vytvořeno (pozastaveno) | https://ads.google.com |
| Google Analytics (GA4) | Propojení GA4 → Ads (Admin → Product links) | ✅ hotovo (import konverze zbývá) | https://analytics.google.com |
| Meta Business Suite / Events Manager | Instagram profil, Meta Pixel | Instagram ✅, Pixel zbývá | https://business.facebook.com |
| Xiaohongshu (小红书/RED) | Objevovací platforma pro čínský segment | ✅ hotovo | https://www.xiaohongshu.com |
| Naver Ads | Placená inzerce (Korea) | zbývá | https://searchad.naver.com |
| LINE Ads Platform | Placená inzerce (Japonsko) | zbývá | https://www.linebiz.com/jp/service/line-ad/ |
| Kakao Moment | Placená inzerce (Korea) | zbývá | https://moment.kakao.com |
| Stripe – platební metody | Kontrola WeChat Pay/Alipay dostupnosti | nerozhodnuto | https://dashboard.stripe.com/settings/payment_methods |
| Resend Audiences | Newsletter/e-mail capture | zbývá | https://resend.com/audiences |

## Návaznost na existující infrastrukturu
- **GA4 e-commerce trychtýř** (`view_item → purchase`) + Consent Mode v2 – hotové a živě ověřené na hlavním webu, viz [sekce 12](12-analytika.md); od 13. 8. běží (pageview + Consent Mode) i na obou kampaňových stránkách, viz výše. Ecommerce eventy (`view_item`/`add_to_cart`/...) se ale odehrávají až na `/vytvorit-arch` a dál v checkoutu, ne na landing pages samotných – ty mají jen pageview.
- **Product/Organization/BreadcrumbList JSON-LD** na každé indexovatelné stránce, viz [sekce 7](07-seo.md) – stejný zdroj dat (cena, obrázek, dostupnost) jako [Merchant Center feed](#google-merchant-center-feed-doplněno-2026-08-13) výše.
- **Odběrné místo In Arte Veritas** (Malá Strana, viz [[project_pickup_partner_arte_veritas]]) – přímo v turistické zóně u Karlova mostu, relevantní i jako levný offline kanál (signage/QR kód) pro kolemjdoucí turisty.
- **Sitemap** (`src/app/sitemap.ts`) obsahuje všech 6 URL `/prague-souvenir` variant (kořen + 5 pevných jazyků) + `/prague-gift`.

## Otevřené body
- ~~Sociální profily (Instagram, Xiaohongshu) zatím nezaložené~~ **HOTOVO** – oba profily založené.
- ~~Google Search Console / Bing Webmaster Tools~~ **HOTOVO 2026-08-13** – oba zaregistrované, sitemap odeslaná.
- ~~Google Merchant Center~~ **HOTOVO 2026-08-13** – produktový feed zaregistrován, viz [sekce výše](#google-merchant-center-feed-doplněno-2026-08-13).
- ~~Google Ads účet + GA4↔Ads propojení~~ **HOTOVO 2026-08-13** – účet založen, GA4 i Merchant Center propojené s Ads.
- ~~Import GA4 `purchase` konverze + první kampaně~~ **HOTOVO 2026-08-15** – GA4 `purchase` event naimportován jako primární konverzní akce (cestou Konverze → Nová akce → Konverze na webu → GA4 import; účet měl už dřív 3 rozbité duplicitní akce "Nákup"/"Nákup (1)"/"Nákup (2)" se zdrojem "Webové stránky" místo GA4 – ty vyžadovaly samostatný Google Ads gtag, který web nemá, byly smazané). Založeny 2 Performance Max kampaně, obě **pozastavené** (nespuštěné, čerpají 0 rozpočtu):
  - **„Prague Souvenir – Asian tourists"** – Final URL `/prague-souvenir`, jazyky JA/KO/ZH-Hans/ZH-Hant (vědomě bez angličtiny, aby se nepřekrývala s kampaní B), lokalita Česko/Přítomnost, 5 €/den, Maximize conversion value, audience signal: Cesty do Prahy, Dárky na míru, Hotely a ubytování, Vyhlídkové cesty, Prohlídky pamětihodností, Cestování
  - **„Prague Gift – Western tourists"** – Final URL `/prague-gift`, jen English, stejná lokalita/rozpočet/signály, stejná ad copy (headlines/descriptions/hero01+hero02 obrázky) jako kampaň A – vědomě identická kopie, liší se jen Final URL/jazyk/cílovka
  - Podklady/copy pro obě kampaně uložené v `docs/temp/pmax-kampan-a-podklady.md` a `docs/temp/pmax-kampan-b-podklady.md` pro reuse (např. při ladění nebo třetí kampani)
  - **Zbývá před spuštěním:** doplnit platební metodu v Ads účtu (ads.google.com hlásí chybějící platbu). ~~Vyřešit že ~90 % produktů v Merchant Center je pozastaveno/neschváleno~~ **Příčina nalezena a opravena 2026-08-16** – nešlo o feed, ale o to, že `/produkt/[id]` vracela HTTP 500 pro úplně KAŽDÝ produkt na produkci (potvrzeno diagnostikou "Landing page unavailable" i přímým curlem), takže se odkazovaná stránka vůbec nenačetla. Příčina: `isomorphic-dompurify` (jsdom) v `src/lib/sanitize.ts` padal na Vercelu na `ERR_REQUIRE_ESM`, lokálně se to nedalo reprodukovat. Oprava: `isomorphic-dompurify` → `sanitize-html`, PR [#4](https://github.com/premekmrzena/gemini-stamp/pull/4). Po mergi znovu zkontrolovat Merchant Center diagnostiku.
- Platební metody pro čínský segment (WeChat Pay/Alipay) – nerozhodnuto, jestli/jak řešit.
- Dedikovaný OG banner 1200×630 (viz [sekce 7](07-seo.md), Otevřené body) by se hodil i pro sdílení kampaňových landing pages, zatím se používá `hero01.png`/`hero02.png` v poměru 4:3.
- KO/JA/ZH mutace **celého** storefrontu (next-intl) zůstávají vědomě odložené – `/prague-souvenir` je záměrně jen dílčí, levný první krok, ne náhrada plné lokalizace. Viz [sekce 9](09-jazykove-mutace.md).
- JA/ZH-Hans/ZH-Hant/KO texty na `/prague-souvenir` čekají na kontrolu rodilým mluvčím (strojový překlad).
- ~~Logo SVG má starý text "Creative Stamp", ne "My Creative Stamp"~~ **Rozhodnuto 2026-08-16** – uživatel logo (napříč celým webem, grafický asset) vědomě ponechává beze změny, i po vidění vytištěné na letáku GIFT8.
