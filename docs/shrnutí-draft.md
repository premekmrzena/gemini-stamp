# Shrnutí otevřených úkolů (draft)

> Pracovní seznam pro uživatele, sestavený 2026-08-09. Zdroj pravdy je `docs/06-odlozene-ulohy.md` (a číslované sekce 00–10) — tohle je jen výtah pro rychlou orientaci, mazat/aktualizovat podle potřeby.

## Blokuje ostré spuštění (12. 8.)
- **Česká pošta live přepnutí** – podací místo (`locationNumber`) se nepodařilo založit ručně přes web. Draft odpovědi (`docs/email-cp-odpoved-2026-08-07.md`) odeslán konzultantovi ČP 2026-08-09, čeká se na odpověď. Bez toho nejde přepnout `CESKA_POSTA_API_ENV=live`.

## Doprava / celní (menší resty, ne blokující)
- **CN22 pro Cenné psaní (VL)** je implementované (`idForm 56`), ale nikdy vizuálně neověřené v prohlížeči (chyběly admin přihlašovací údaje) – ověřit po přepnutí na live.
- **`weight_grams` jsou jen odhady**, ne změřené hodnoty – stálo by za to nechat uživatele časem zvážit aspoň jeden reálný produkt, hlavně kategorii *plakety* (zatím žádný produkt v katalogu).
- **Zonos Declaration ID (USA/Portoriko)** – kód hotový, ale reálné `declarationCreateWorkflow` (skutečná autorizace karty) zatím neproběhlo, čeká na první opravdovou objednávku tam.
- **Odesílatel na štítku** (`DVKS s.r.o.`) – v demu se ignoruje a tiskne testovací firma ČP, potvrdit až na live.

## Fakturace (iDoklad)
- **Air Bank není napojená na automatické párování výpisů v iDokladu** + webhook není zaregistrovaný → platba převodem se dnes potvrzuje jen ručně v adminu.
- **iDoklad licence brzy vyprší** (k 2026-08-05 odhad ~48 dní, tj. zhruba polovina září) – obnovit před vypršením.
- Ověřit, že migrace `021_orders_idoklad_invoice.sql` proběhla a 3 env proměnné (`IDOKLAD_*`) jsou skutečně ve Vercel produkci, ne jen lokálně.

## Administrace a bezpečnost
- **Žádné role/oprávnění** – kdokoli s platným Supabase Auth účtem vidí a mění všechno.
- **Žádný audit log** stavů objednávek.
- **Žádná validace přechodů stavu objednávky** – z adminu lze přeskočit rovnou na jakýkoli stav.
- Tiskové archy se tiskárně stále předávají ručně (ZIP export, žádná automatizace).

## SEO (menší, nekritické)
- Chybí dedikovaný OG banner 1200×630 (zatím jen `/images/hero01.png`).
- Registrace Google Search Console / Bing Webmaster Tools po ostrém nasazení.
- `lastModified` produktů v sitemapě je jen `created_at` (chybí `updated_at` sloupec v DB).
- Meta description u kategorií Známky/FDC je delší než doporučené ~160 znaků – čeká na rozhodnutí (zkrátit copy vs. mít zvlášť kratší meta popisek).

## Jazykové mutace a měny — vědomě po launchi
- KO/JA/ZH-Hans/ZH-Hant mají routing připravený, ale prázdné `messages/*.json`.
- Platby v CNY/JPY/KRW/TWD (`docs/00-platby-meny-konverze.md`) – vlastní currency-aware checkout, zero-decimal měny u Stripe, + ověřit dodatečné celní požadavky zemí (např. korejský PCCC).
- EN překlad VOP/GDPR je strojový, zatím neověřený rodilým mluvčím/právníkem.

## Vyřešeno od minulého shrnutí (2026-08-09)
- ~~EMS retest s opravenou váhou produktů~~ – proběhl, OK.
- ~~Draft odpovědi ČP čeká na odeslání~~ – odeslán.
- ~~GA4 `beforeInteractive` možná ve špatném layoutu~~ – vyřešeno restrukturalizací root layoutů (`src/app/[locale]/layout.tsx` je teď sám root layout).
