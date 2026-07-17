# 9. Jazykové mutace a ceny podle mutace

> **Pracovní dokument – plán se teprve ladí, nic z tohoto ještě není implementováno.** Na rozdíl od ostatních sekcí (01–08), které popisují skutečný stav kódu, tahle sekce zachycuje rozhodnutí a otevřené otázky během plánování. Až se něco reálně postaví, přesune se to do odpovídající sekce (nejspíš nová 01x-jazykove-mutace jako "stav popsaný podle kódu") a tahle sekce buď zanikne, nebo z ní zůstane jen historie rozhodnutí. Založeno 2026-07-17.

## Cíl a priorita
- Eshop je dnes celý česky, jedna doména (`mycreativestamp.com`), aktuálně za pre-launch gate ([sekce 8](08-pre-launch-gate.md)).
- **Primární a nejbližší cíl: anglická verze jako produkční.** Eshop je cílený na cizince (ne na ČR trh).
- **CZ verze se teď veřejně nespouští, ale zůstává živá jako referenční jazyk** (upřesněno 2026-07-17): úpravy textů (názvy, popisy) probíhají vždy nejdřív v CZ, i když CZ doména zatím neběží – teprve poté se pořizuje/vkládá překlad do ostatních mutací. CZ tedy není "zamrzlý" stav, ale zdroj pravdy pro obsah, ze kterého se překládá.
- Budoucí (ne teď, ale architektura by na ně měla být připravená): korejština, japonština, čínština – **potvrzeno 2026-07-17: obě varianty, zjednodušená `zh-Hans` i tradiční `zh-Hant`.**

## Domény
- **Rozhodnuto 2026-07-17: `mycreativestamp.com` zůstává mezinárodní doména** – EN teď, KO/JA/ZH později. Pre-launch gate ([sekce 8](08-pre-launch-gate.md)) a DNS/Vercel nastavení na `.com` se nemění, jen se přepíná jazyk/obsah, který za gatem je.
- **CZ se přesune na novou, zatím neurčenou doménu**, až se k CZ verzi vědomě vrátíme. Do té doby CZ veřejně vůbec neběží (viz Cíl a priorita výše) – registrace nové domény a její DNS/Vercel/gate nastavení není potřeba řešit hned.
- Jedna Next.js aplikace / jeden Vercel projekt se dvěma+ doménami (next-intl umí per-doménu mapování locale bez prefixu), nebo dvě oddělené deploy? → sklání se to k jedné appce/více doménám (sdílený kód, sdílená DB), potvrdit až se bude CZ doména reálně řešit.

## Ceny podle mutace
- **CZ má vlastní, nezávislou cenu** – nastavuje se ručně v adminu, nepřepočítává se z ničeho.
- **Ostatní mutace (EN, KO, JA, ZH) sdílí jednu základní cenu v EUR** (rozhodnuto 2026-07-17). EN teď zobrazuje přímo tuhle EUR cenu (je to zároveň základní měna, není co přepočítávat). Až přibudou KO/JA/ZH, cena se pro každou mutaci **přepočítá a zobrazí v místní měně** (KRW/JPY/CNY) – ne že by všude zůstávalo EUR.
- **Zdroj kurzu: žádné API, kurz se nastavuje ručně** (revidováno 2026-07-17 – původní návrh na kurzovní API + cron byl zbytečná komplikace pro měsíční frekvenci aktualizace). Kurz (EUR → cílová měna) se ručně zapíše, typicky editovatelné políčko v adminu, a aktualizuje se podle potřeby (orientačně jednou za měsíc), bez automatizace/cronu/závislosti na třetí straně.
- **Měny cílových mutací** (rozhodnuto 2026-07-17): KO → KRW, JA → JPY, ZH-Hans → CNY, ZH-Hant → **TWD** (Tchaj-wan, ne HKD). EN zůstává přímo v EUR (základní měna, není co přepočítávat). Celkem tedy 4 kurzy k ručnímu nastavení.
- **Kurzy se editují v adminu, nová záložka "Kurzy měn"** (rozhodnuto 2026-07-17) – 4 políčka (EUR→KRW, EUR→JPY, EUR→CNY, EUR→TWD), stejný vzor jako ostatní admin záložky (produkty, objednávky...). Tabulka `exchange_rates` – jeden řádek na měnu (`currency_code` PK, `rate_to_eur` numeric, `updated_at`), RLS: `anon` smí jen číst (potřeba pro přepočet ceny na eshopu), `authenticated` (admin) plný CRUD – žádný důvod hodnotu tajit jako u `discount_codes`, je to veřejně dohledatelný kurz.
- **Přepočet ceny do KRW/JPY/CNY/TWD se počítá za běhu (on-the-fly), ne ukládá do DB** (rozhodnuto 2026-07-17, po zvážení obou variant). Žádné materializované sloupce typu `price_krw` – jen `price_eur`/`sale_price_eur` na produktu + aktuální koeficient z `exchange_rates`, násobení a zaokrouhlení proběhne až při čtení/vypisování produktů. Důvod: o řád jednodušší (žádný hromadný `UPDATE` přes všechny produkty při změně kurzu, žádné riziko nekonzistence z nedokončeného přepočtu) a zapadá to do existující `src/lib/pricing.ts`, kde už dnes žije logika slev (`sale_price`) – přepočet podle měny/mutace tam přibude jako další krok.
- **Zaokrouhlování cen po přepočtu: standardní** (rozhodnuto 2026-07-17) – běžné zaokrouhlení na měnou danou přesnost (desetiny/setiny), žádné speciální "hezké ceny" (9.99 apod.).
- Dopad na `products`: dnešní `price`/`sale_price` ([sekce 3](03-databaze.md#products)) jsou v Kč a odpovídají CZ. Bude potřeba druhý pár sloupců pro mezinárodní základní cenu v EUR (`price_eur`/`sale_price_eur`) – to je jediný cenový přírůstek na `products`, žádné sloupce per cílová měna.

## Technické řešení (routing a obsah)
- **next-intl v4** se segmentovým routingem `src/app/[locale]/...` – hotovo 2026-07-17. `(store)`, `(checkout)` a `dekujeme` přesunuty pod `[locale]` (`git mv`, žádné úpravy importů díky `@/*` aliasu). `/admin`, `/api` a `/rekonstrukce` zůstávají mimo – nejsou a nebudou lokalizované.
- **Rozsah `routing.ts`**: `locales: ['en', 'ko', 'ja', 'zh-Hans', 'zh-Hant']`, `defaultLocale: 'en'`, `localePrefix: 'as-needed'` (výchozí `en` bez prefixu v URL, zachovává dnešní bezprefixové cesty). **CZ v tomhle poli záměrně není** – poběží na samostatné doméně (viz "Domény" výše), to je oddělená budoucí práce (možná i oddělený deploy), ne locale v týhle appce.
- **`src/proxy.ts`**: next-intl middleware (`createMiddleware(routing)`) sloučen s pre-launch gate ([sekce 8](08-pre-launch-gate.md)) do jedné `proxy()` funkce – gate běží první a má přednost (nezměněné chování), teprve když projde (nebo je vypnutý), běží locale-routing, a to jen mimo `/admin`, `/api`, `/rekonstrukce`.
- **Kořenový `app/layout.tsx`** (nad `[locale]`, sdílený i s adminem/gate) má `lang="en"` napevno – nemůže číst `params.locale` (parametry se v Next.js kumulují odshora dolů, kořen nic z `[locale]` neuvidí) a volání next-intl API by vynutilo dynamické renderování celého webu. Skutečný `lang` a `NextIntlClientProvider` řeší nový `app/[locale]/layout.tsx` (s `setRequestLocale()`, aby zůstalo zachované statické generování stránek).
- **Interní odkazy (`next/link`) zatím nejsou přepnuté na locale-aware `src/i18n/navigation.ts`** – díky `localePrefix: 'as-needed'` fungují beze změny, dokud je aktivní jen výchozí `en` bez prefixu. Až se aktivují KO/JA/ZH (fáze 5), bude potřeba je přepnout, jinak by přepínání jazyka ztrácelo prefix při kliku na interní odkaz.
- Ověřeno v prohlížeči (dočasná testovací stránka, smazána po ověření): `/en/...` a `/` fungují identicky (beze změny), `/ko/...` zachovává prefix, chybějící překlad se degraduje na název klíče místo pádu, `/admin`, `/api`, `/rekonstrukce` next-intl routing vůbec neprochází. `tsc --noEmit` i `next build` čisté, všech 5 mutací se generuje staticky (SSG přes `generateStaticParams`).
- **Překlad je reálně rozdělený na dva nezávislé systémy** (rozhodnuto 2026-07-17):
  1. **Obsah produktů** (název, popisy) – žije v `products` (viz níže), edituje se **v adminu**, průběžně, per produkt.
  2. **Systémové UI texty (tlačítka, menu, patička...) i statické informační stránky** (`jak-nakupovat`, `co-je-kreativni-arch`, `kontakt`, homepage copy) – žijí v **next-intl message souborech** (`messages/{locale}.json`, zatím prázdné `{}` u všech, obsah přijde ve fázi 4), ne v adminu. Překládají se jako součást vývoje/úpravy dané stránky (CZ a EN text vznikají spolu), ne jako běžící admin úloha – tyhle stránky se podle zavedeného vzoru ([feedback_static_page_pattern] v paměti) i tak mění zřídka. Sem patří i **názvy kategorií a `product_topic`** (Známky/Archy/Umění...) – je to malá pevná množina hodnot, ne volný text, takže se překládá přes slovník v message souborech, ne po řádcích v DB.

## Dopad na databázi (obsahové překlady produktů)
- **Rozhodnuto 2026-07-17: sloupce s příponou jazyka na `products`**, ne samostatná `product_translations` tabulka. Důvod obratu oproti prvnímu návrhu: cílová sada jazyků je uzavřená a známá dopředu (CZ + EN + KO + JA + ZH-Hans + ZH-Hant, žádné "časem možná přibude další"), takže hlavní výhoda překladové tabulky (přidávání jazyků bez zásahu do schématu) tu neplatí – migrace se udělá **jednou, pro všechny jazyky najednou**. Sloupce navíc znamenají jeden `UPDATE` na uložení (žádná druhá tabulka, žádný JOIN ve výpisech/detailu/sitemapě), což je jednodušší na kód i na admin formulář.
- Nové sloupce (jen pro 3 textová pole, která se překládají – `name`, `short_description`, `detailed_description`): přípona `_en`, `_ko`, `_ja`, `_zh_hans`, `_zh_hant` → 15 nových nullable text sloupců na `products`. Stávající `name`/`short_description`/`detailed_description` zůstávají beze změny a fungují jako CZ text (žádná migrace dat, žádné riziko pro dnešní CZ obsah).
- **Admin UX**: `ProductFormModal` dostane přepínač/taby jazyků (CZ | EN | KO | JA | ZH-Hans | ZH-Hant). CZ hodnoty se zobrazují vedle/nad polem pro cílový jazyk (pro referenci při překladu), uložení zůstává jeden save celého formuláře.
- Cenové sloupce viz sekce "Ceny podle mutace" výše – to je oddělené od textových překladů (jedna základní cena v EUR pro všechny mezinárodní mutace, ale zvlášť sada textů pro každý jazyk).

## Otevřené otázky (shrnutí k rozhodnutí)
1. ~~Doménové rozdělení~~ → rozhodnuto (`.com` = mezinárodní, CZ dostane novou doménu později).
2. ~~Měna mezinárodní ceny~~ → rozhodnuto (základ EUR, přepočet do místní měny podle mutace).
3. ~~Zdroj kurzu~~ → rozhodnuto (žádné API, ruční nastavení v adminu, cca měsíční aktualizace).
4. ~~Rozsah čínštiny~~ → rozhodnuto (`zh-Hans` i `zh-Hant`, obě varianty, měna TWD pro `zh-Hant`).
5. ~~`product_translations` vs. sloupce s příponou~~ → rozhodnuto (sloupce s příponou, viz "Dopad na databázi").
6. ~~Zaokrouhlování cen~~ → rozhodnuto (standardní zaokrouhlení).
7. ~~CZ obsah – zamrzlý, nebo živý?~~ → rozhodnuto (viz "Cíl a priorita" – CZ je referenční jazyk, zůstává živý).
8. ~~Struktura `exchange_rates` + ukládat, nebo počítat ceny za běhu~~ → rozhodnuto (jeden řádek na měnu, přepočet on-the-fly v `pricing.ts`, viz "Ceny podle mutace").

Všechny otevřené otázky jsou zatím rozhodnuté – plán je připravený k dalšímu kroku (DB migrace), viz "Postup / fáze" níže.

## Postup / fáze (návrh, ladit dál)
1. ~~Navrhnout a spustit DB migraci~~ → **hotovo 2026-07-17**: [`docs/sql/013_products_intl_columns.sql`](sql/013_products_intl_columns.sql) a [`docs/sql/014_exchange_rates.sql`](sql/014_exchange_rates.sql) provedeny v Supabase, zapsáno do [sekce 3](03-databaze.md) a `src/types/database.ts` (`Product` doplněn o překladové/EUR sloupce, nový typ `ExchangeRate`).
2. ~~Rozšířit `ProductFormModal` a admin o "Kurzy měn"~~ → **hotovo 2026-07-17**: jazykové taby v `ProductFormModal` (CZ vedle cílového jazyka, pole Cena/Zlevněná cena EUR), nová admin záložka "Kurzy měn" (`src/app/admin/dashboard/page.tsx`) s editací 4 kurzů, `convertFromEur()` v `src/lib/pricing.ts`. Ověřeno v prohlížeči včetně reálného uložení do Supabase.
3. ~~Scaffoldovat next-intl routing~~ → **hotovo 2026-07-17**, viz "Technické řešení" níže pro detail rozhodnutí učiněných při stavbě.
4. **Přeložit a spustit EN jako produkční – rozepsáno na pod-kroky (2026-07-17), realizace postupně později:**
   - **4a. Ceny a platby v EUR** (základ, dělat první – bez toho nemá zbytek smysl): zapojit `convertFromEur()`/EUR ceny do `ProductCard`, `ProductDetailClient`, výpisu kategorie a košíku/checkoutu (dnes všude jen `price`/`sale_price` v Kč). Přepnout `currency: 'czk'` na `'eur'` v `src/app/api/create-payment-intent/route.ts` – ověřit, že Stripe testovací účet umí EUR. Dopočítat i `shipping_cost`/`payment_cost` v EUR (dnes napevno v Kč).
   - **4b. Systémové UI texty**: vytáhnout hardcoded české texty (Header, Footer, tlačítka, formuláře, checkout) do `messages/en.json` (a při té příležitosti i `messages/cs.json` jako zdroj), zapojit `useTranslations` do komponent. Součástí i přepnutí interních `next/link` na locale-aware `src/i18n/navigation.ts` (dnes fungují jen díky `localePrefix: 'as-needed'`, u KO/JA/ZH by ztrácely prefix).
   - **4c. Statické informační stránky**: `jak-nakupovat`, `co-je-kreativni-arch`, `kontakt` (marketingový obsah) a **`obchodni-podminky`/`ochrana-osobnich-udaju`** (právní texty – tady zvážit revizi rodilým mluvčím/právníkem, ne jen strojový překlad).
   - **4d. Obsah produktů**: pro každý aktivní produkt vyplnit EN název/popisy přes jazykové taby v adminu (viz krok 2). Slovník pro `CATEGORY_LABELS`/`TOPIC_LABELS` v message souborech (malá pevná množina, ne DB).
   - **4e. E-maily**: `src/lib/email.ts` má předmět i tělo objednávky/expedice česky natvrdo – potřeba EN verze šablon.
   - **4f. SEO a spuštění**: `sitemap.ts`/`robots.ts` a `openGraph.locale` (dnes `cs_CZ`) počítají jen s CZ – aktualizovat pro EN. Na závěr vypnout `MAINTENANCE_MODE` a udělat reálný end-to-end test (testovací platba, odeslání e-mailu).
5. Až budou prioritou další jazyky: KO/JA/ZH – jen vyplnění existujících sloupců/message souborů, schéma/routing už je připravené.
