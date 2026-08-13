# 13. Marketing

> Stav popsaný podle skutečného kódu a rozhodnutí k 2026-08-13. Tuto sekci aktualizovat při každé změně kampaní/landing pages/cílení.

## Souhrn
Post-launch marketing běží dvoukolejně: **Trasa A** (technické doladění eshopu) a **Trasa B** (přivedení prvních zákazníků) – podrobný, průběžně aktualizovaný plán obou tras je v artefaktu "Poštovní itinerář" (Claude Artifact, ne v repu). Tahle sekce dokumentuje jen tu část Trasy B, která se propsala do kódu a je trvale relevantní: cílové skupiny, kampaňové landing pages a seznam registračních nástrojů.

## Cílové skupiny
Dvě samostatně měřené skupiny, každá s vlastní kampaňovou landing page (viz níže) – záměrně oddělené, aby šel jejich výkon v GA4/Ads porovnat bez míchání provozu.

| Skupina | Landing page | Jazyky | Poznámka |
|---|---|---|---|
| Asijský turista v ČR (Japonsko/Čína/Korea), chce si odvézt osobní suvenýr | `/prague-souvenir` | EN/JA/ZH-Hans/ZH-Hant/KO (přepínač) | Kreativní arch sedí dobře – vizuální, snadno pochopitelný, osobní |
| Západní turista v ČR | `/prague-gift` | jen EN | Copy záměrně totožné s EN variantou `/prague-souvenir` – jediná proměnná v porovnání má být zdroj provozu, ne text |

**Platformy specifické pro asijský segment** (mimo západní standard, viz `/prague-souvenir`):
- **Japonsko** – LINE (messaging i ads), Twitter/X drží mnohem silnější pozici než jinde v Asii
- **Čína** – Xiaohongshu/RED (小红书), de facto Pinterest pro „co koupit na cestách" – pravděpodobně nejrelevantnější kanál pro tenhle segment
- **Korea** – Naver (ne Google) je dominantní vyhledávač, KakaoTalk vlastní messaging+ads platforma

**Známé omezení:** WeChat Pay pro CZ Stripe účet nepodporováno, Alipay jen v EUR (viz [[project_stripe_alt_payment_methods]]) – čínští turisté kartu často nepreferují, zatím nevyřešeno.

## Kampaňové landing pages
`src/app/prague-souvenir/` a `src/app/prague-gift/` – obě **mimo next-intl `[locale]` routing**, vlastní root layout (Next.js "multiple root layouts", stejný vzor jako `/admin` a `/rekonstrukce`, viz [sekce 9](09-jazykove-mutace.md)).

- **`/prague-souvenir`** – klientská komponenta, jazyk se přepíná v prohlížeči: `?lang=` parametr v URL > `navigator.language` > anglický fallback (hydratačně bezpečné – server vždy vrátí EN, přepnutí až po mountu, stejný vzor jako `TrustBadges.tsx`).
- **`/prague-gift`** – čistě server komponenta, jen anglicky, žádná detekce jazyka.
- Obě mají CTA vedoucí na existující `/vytvorit-arch` (anglický checkout beze změny) – `/prague-souvenir` k tomu u tlačítka zobrazuje poznámku "checkout continues in English" v aktivním jazyce.
- Hero/showcase obrázky (`hero01.png`/`hero02.png`) jsou existující marketingové assety z homepage – web už dřív vizuálně cílil přesně na asijské turisty. Mezi oběma stránkami prohozené (hero01↔hero02), ať nejsou vizuálně identické.

**`proxy.ts` – `LOCALE_EXEMPT_PATHS`:** obě cesty musí být vyjmuté z next-intl middleware. Bez toho by next-intl podle `Accept-Language` (ja/zh/ko) přesměrovával na neexistující `/ja/prague-souvenir` apod. – stejná třída bugu jako [[feedback_proxy_locale_redirect_loop]] (redirect loop z 2026-08-13), jen na nové cestě. `MAINTENANCE_MODE` gate na obě cesty dál platí (ověřeno – rewrite na `/rekonstrukce` funguje beze změny).

**`.font-cjk` (globals.css):** Poppins (`src/lib/fonts.ts`, `subsets: ['latin']`) nemá čínské/japonské/korejské znaky – bez explicitního systémového CJK font stacku (PingFang/Hiragino/Yu Gothic/Malgun Gothic/Noto Sans CJK...) se JA/ZH/KO text vykresloval jako prázdné čtverečky (tofu), objeveno až screenshotem. Aplikováno podmíněně na obsah `/prague-souvenir` (podle aktivního jazyka) a natvrdo na jazykový přepínač (vlastní název jazyka musí být čitelný bez ohledu na to, který jazyk je zrovna aktivní). Platí pro jakýkoli budoucí CJK text v appce, ne jen tuhle stránku.

**POZOR:** JA/ZH-Hans/ZH-Hant/KO texty na `/prague-souvenir` jsou strojový překlad, neověřený rodilým mluvčím – stejná kategorie rizika jako EN právní texty (VOP/GDPR). Než se do kampaní nalije větší rozpočet, stálo by za to nechat je zkontrolovat.

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
- **GA4 e-commerce trychtýř** (`view_item → purchase`) + Consent Mode v2 – hotové a živě ověřené, viz [sekce 12](12-analytika.md). Cookie lišta už rozlišuje "marketing" souhlas, takže Meta Pixel/budoucí remarketing tagy se dají zapojit bez zásahu do lišty.
- **Product/Organization/BreadcrumbList JSON-LD** na každé indexovatelné stránce, viz [sekce 7](07-seo.md) – základ pro Merchant Center feed.
- **Odběrné místo In Arte Veritas** (Malá Strana, viz [[project_pickup_partner_arte_veritas]]) – přímo v turistické zóně u Karlova mostu, relevantní i jako levný offline kanál (signage/QR kód) pro kolemjdoucí turisty.

## Otevřené body
- Sociální profily (Instagram, Xiaohongshu) zatím nezaložené – landing pages jsou hotové, ale nemají kam organicky odkazovat ani přes co spustit placenou inzerci na Meta.
- Google Ads/Merchant Center/GA4↔Ads propojení zatím nezaložené.
- Platební metody pro čínský segment (WeChat Pay/Alipay) – nerozhodnuto, jestli/jak řešit.
- Dedikovaný OG banner 1200×630 (viz [sekce 7](07-seo.md), Otevřené body) by se hodil i pro sdílení kampaňových landing pages, zatím se používá `hero01.png`/`hero02.png` v poměru 4:3.
- KO/JA/ZH mutace **celého** storefrontu (next-intl) zůstávají vědomě odložené – `/prague-souvenir` je záměrně jen dílčí, levný první krok, ne náhrada plné lokalizace. Viz [sekce 9](09-jazykove-mutace.md).
