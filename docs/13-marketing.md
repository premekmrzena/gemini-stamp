# 13. Marketing

> Stav popsaný podle skutečného kódu a rozhodnutí k 2026-08-13 (průběžně doplňováno během dne). Tuto sekci aktualizovat při každé změně kampaní/landing pages/cílení.

## Souhrn
Post-launch marketing běží dvoukolejně: **Trasa A** (technické doladění eshopu) a **Trasa B** (přivedení prvních zákazníků) – podrobný, průběžně aktualizovaný plán obou tras je v artefaktu "Poštovní itinerář" (Claude Artifact, ne v repu). Tahle sekce dokumentuje jen tu část Trasy B, která se propsala do kódu a je trvale relevantní: cílové skupiny, kampaňové landing pages a seznam registračních nástrojů.

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

## Registrace a nástroje
Nástroje potřebné k rozjezdu kampaní – většina zatím nezaložená, viz aktuální stav v artefaktu "Poštovní itinerář".

| Nástroj | Účel | Odkaz |
|---|---|---|
| Google Search Console | Indexace, sitemap | https://search.google.com/search-console/welcome |
| Bing Webmaster Tools | Indexace (Bing) | https://www.bing.com/webmasters |
| Google Merchant Center | Produktový feed pro Shopping/Performance Max | https://merchants.google.com |
| Google Ads | Search kampaně, segmentace | https://ads.google.com |
| Google Analytics (GA4) | Propojení GA4 → Ads (Admin → Product links) | https://analytics.google.com |
| Meta Business Suite / Events Manager | Instagram profil, Meta Pixel | https://business.facebook.com |
| Xiaohongshu (小红书/RED) | Objevovací platforma pro čínský segment | https://www.xiaohongshu.com |
| Naver Ads | Placená inzerce (Korea) | https://searchad.naver.com |
| LINE Ads Platform | Placená inzerce (Japonsko) | https://www.linebiz.com/jp/service/line-ad/ |
| Kakao Moment | Placená inzerce (Korea) | https://moment.kakao.com |
| Stripe – platební metody | Kontrola WeChat Pay/Alipay dostupnosti | https://dashboard.stripe.com/settings/payment_methods |
| Resend Audiences | Newsletter/e-mail capture | https://resend.com/audiences |

## Návaznost na existující infrastrukturu
- **GA4 e-commerce trychtýř** (`view_item → purchase`) + Consent Mode v2 – hotové a živě ověřené na hlavním webu, viz [sekce 12](12-analytika.md); od 13. 8. běží (pageview + Consent Mode) i na obou kampaňových stránkách, viz výše. Ecommerce eventy (`view_item`/`add_to_cart`/...) se ale odehrávají až na `/vytvorit-arch` a dál v checkoutu, ne na landing pages samotných – ty mají jen pageview.
- **Product/Organization/BreadcrumbList JSON-LD** na každé indexovatelné stránce, viz [sekce 7](07-seo.md) – základ pro Merchant Center feed.
- **Odběrné místo In Arte Veritas** (Malá Strana, viz [[project_pickup_partner_arte_veritas]]) – přímo v turistické zóně u Karlova mostu, relevantní i jako levný offline kanál (signage/QR kód) pro kolemjdoucí turisty.
- **Sitemap** (`src/app/sitemap.ts`) obsahuje všech 6 URL `/prague-souvenir` variant (kořen + 5 pevných jazyků) + `/prague-gift`.

## Otevřené body
- Sociální profily (Instagram, Xiaohongshu) zatím nezaložené – landing pages jsou hotové a měří, ale nemají kam organicky odkazovat ani přes co spustit placenou inzerci na Meta.
- Google Ads/Merchant Center/GA4↔Ads propojení zatím nezaložené.
- Platební metody pro čínský segment (WeChat Pay/Alipay) – nerozhodnuto, jestli/jak řešit.
- Dedikovaný OG banner 1200×630 (viz [sekce 7](07-seo.md), Otevřené body) by se hodil i pro sdílení kampaňových landing pages, zatím se používá `hero01.png`/`hero02.png` v poměru 4:3.
- KO/JA/ZH mutace **celého** storefrontu (next-intl) zůstávají vědomě odložené – `/prague-souvenir` je záměrně jen dílčí, levný první krok, ne náhrada plné lokalizace. Viz [sekce 9](09-jazykove-mutace.md).
- JA/ZH-Hans/ZH-Hant/KO texty na `/prague-souvenir` čekají na kontrolu rodilým mluvčím (strojový překlad).
- Logo SVG má starý text "Creative Stamp", ne "My Creative Stamp" – napříč celým webem, grafický asset, čeká na rozhodnutí uživatele.
