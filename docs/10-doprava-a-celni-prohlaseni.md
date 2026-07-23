# 10. Doprava (Česká pošta) a celní prohlášení

> Stav k 2026-07-23. Napojení na nAPI B2B-ZSK České pošty běží zatím jen proti **demo** prostředí — žádná reálná zásilka zatím nevznikla, admin flow je funkční a otestovaný, ale vědomě se nepřepnul na ostrý provoz.

## 1. Checkout — krok 2 (Doprava)

`ShippingStep.tsx` nabízí tři možnosti dopravy:

- **Osobní odběr (Praha)** — zdarma, adresa Jindřišská 126/15.
- **Česká republika** (Doporučené psaní, Prioritní) — cena podle váhy zásilky (87–109 Kč dle tabulky v `getShippingOptions()`, `src/lib/constants.ts`), navíc skryté navýšení 10 % na obal (`PACKAGING_MARKUP`, nikde se zákazníkovi neuvádí).
- **Mezinárodní doprava** — od 2026-07-23 vlastní radio button (ne statický nadpis). Zobrazuje orientační cenu „od X Kč" (nejnižší cena napříč všemi podporovanými zeměmi pro váhu aktuálního košíku, `getMinInternationalPrice()`) a text „Pro finální cenu musíte vybrat cílovou zemi. Celní prohlášení za vás uděláme zdarma." Po zaškrtnutí se pod textem (bez oddělující linky, odsazeno stejně jako text) zobrazí select cílové země — teprve po výběru země se objeví konkrétní nabízené produkty (Cenné psaní do zahraničí a/nebo EMS, podle toho, co ČP pro danou zemi provozuje). Linka odděluje produkty jen když jsou k dispozici oba zároveň.

**Seznam zemí (`INTERNATIONAL_COUNTRIES`/`COUNTRY_SHIPPING_INFO`, `src/lib/constants.ts`)** obsahuje **145 zemí** — všechny, kam ČP aktuálně provozuje Cenné psaní a/nebo EMS (zdroj: oficiální přehled ČP `docs/Prehled-zahranicnich-sluzeb_1_7_2026_CZ-EN.xlsx`, ne ruční odhad). Každá země má ISO-2 kód, příznak dostupnosti Cenného psaní (+ cenovou skupinu evropská/mimoevropská) a EMS cenovou skupinu (100–107) — obě služby jsou u některých zemí nepovinné (ne každá země má obě). Anglické názvy zemí pro EN verzi webu jsou vytažené ze stejného xlsx (sloupec s anglickým názvem), ne přeložené ručně — `checkout.countries` v `messages/cs.json`/`messages/en.json`.

Interní stav `selectedShipping` má mezistav `'mezinarodni'` (rozcestník bez ceny — zvolení jen otevře select země, není to kupovatelná položka). Tlačítko „Další krok" validuje `shippingOptions.some(o => o.id === selectedShipping)`, takže nejde pokračovat, dokud zákazník nedovybere konkrétní produkt (Cenné psaní/EMS).

## 2. Admin — „Vytvořit zásilku"

V detailu objednávky (`src/app/admin/dashboard/page.tsx`) je tlačítko **„Vytvořit zásilku"** (skryté pro osobní odběr), otevírá `ShipmentModal.tsx`:

- Zobrazí adresáta, váhu a zvolenou dopravu.
- U mezinárodních zásilek (Cenné psaní/EMS) navíc náhled **celního prohlášení** — položky s HS kódy, dohledanými podle kategorie produktu (`getCustomsHsCode()`, `src/lib/constants.ts`):

  | Kategorie produktu | HS kód | Zdroj |
  |---|---|---|
  | `znamky`, `znamkove-archy` | `970400` | sběratelské známky, neplatné jako poštovné v cílové zemi (ne cenina) |
  | `kreativni-archy`, `fdc` | `491191` | tiskovina — u FDC je nalepená známka znehodnocená nalepením, přestává být cenina |
  | `plakety` | `970300` | jediná shoda v číselníku ČP |

  Ověřeno živým dotazem na `/customsContent` (B2B-CIS API), ne odhadem.
- Tlačítko **„Podat u České pošty (demo)"** skutečně zavolá `POST /api/admin/create-shipment`, který sestaví a odešle request na `/parcelService` (nAPI B2B-ZSK) a po úspěchu zapíše vrácené `parcelCode` do `orders.tracking_number` (stejné pole jako ruční zadání sledovacího čísla).

### Technické detaily (nAPI B2B-ZSK)

- Auth: `src/lib/ceska-posta.ts` — HMAC-SHA256 (`Api-Token` + `Authorization` + `Authorization-Timestamp` [+ `Authorization-Content-SHA256` u POST]), vlastní TLS CA (PostSignum) přes `undici.Agent`. `getCeskaPostaConfig(env)` čte `CESKA_POSTA_{DEMO|LIVE}_*` env proměnné.
- `ceskaPostaRequest(env, service, path, init)` — `service` je `'zsk'` (zásilky) nebo `'cis'` (číselníky/CIS, použito na dohledání HS kódu výše).
- `src/lib/ceskaPostaShipment.ts` — `buildParcelServiceRequest()` sestaví celý request:
  - **Prefix** (`getShipmentPrefix()`): `RR` = Doporučené psaní, `VL` = Cenné psaní, `EM` = EMS. Zjištěno z `docs/td-hromadne-podani-zasilek-smluvnim-podavatelem.pdf` (Příloha 1) — pozor, `EE` (taky EMS) je jen pro nesmluvní klienty na přepážce, ne pro API.
  - **Services**: `RR` → `['50']` (Doporučená zásilka, u RR je jedna ze služeb 50–60 vždy povinná), `VL` → `['7']` (Udaná cena), `EM` → `['43']` (Zboží/Dárek).
  - **Celní prohlášení** (`parcelCustomsDeclaration`, jen VL/EM): `category: '91'` — **ne** hodnota z Zonos dokumentace (11/91 pro USA flow), to je jiné číslo patřící čistě ČP. Zjištěno systematickým vyzkoušením 01–99 proti demo API, jediná funkční hodnota. `parcelCustomGoods[].weight` musí být **string** (ne number), jinak ČP vrátí 400.
  - **Adresa**: ISO kód země bere `getCountryIsoCode()` přímo z `COUNTRY_SHIPPING_INFO[country].iso2` (jedno místo pravdy se seznamem zemí výše). `billing_address_line1`/`shipping_address_line1` je jedno volné textové pole, `splitAddressLine()` je heuristicky rozdělí na `street`/`houseNumber` (poslední token s číslicí = číslo popisné) — u mezinárodních adres to podle testů nevadí (ČP je tak přísně nevaliduje jako tuzemské), u tuzemských (RR) může nepřesný split narazit na přísnější RUIAN validaci.
  - **Hlavička podání**: `customerID` + `postCode` + `locationNumber` musí být vyplněné **všechny tři najednou** (samotné `postCode` dá `INVALID_LOCATION`, samotné `locationNumber` dá `INVALID_POST_CODE`) — nová env proměnná `CESKA_POSTA_DEMO_LOCATION_NUMBER`.
- Minimální udaná cena u Cenného psaní: **1 Kč** (potvrzeno obchodním zástupcem ČP).

## 3. Otevřené body

- **Živý provoz**: zatím se volá jen `env: 'demo'` (`POST /api/admin/create-shipment` čte `CESKA_POSTA_API_ENV`, default `'demo'`) — na `'live'` přepnout až bude jasné, že integrace funguje spolehlivě, a doplnit `CESKA_POSTA_LIVE_CUSTOMER_ID`/`POST_CODE`/`LOCATION_NUMBER` (live účet je zatím nemá).
- **USA/Portoriko**: od 1.7.2026 vyžadují `declarationId` z externího **Zonos API** (`declarationCreateWorkflow`, GraphQL) vloženého do `parcelCustomsDeclaration.declarationId` — zdokumentováno (registrace, request/response tvar), ale **nikde v kódu nezapojeno**. Bez toho kroku ČP zásilky do USA/Portorika pravděpodobně odmítne. Vyžaduje založení Zonos účtu s platební kartou (musí udělat majitel eshopu, ne přes API).
- **Kombinace `Services` kódů**: ověřeno jen pro jednoduchý případ (1 položka, běžná váha) — u složitějších zásilek (víc položek, extrémní váha/hodnota) není jisté, jestli aktuální kombinace (`['50']`/`['7']`/`['43']`) zůstává správná, nebo jestli by měl přibýt další kód (např. `44` „Zboží s VDD" u vyšší celní hodnoty, vyžaduje MRN kód).
- **`resultParcelCustomsGoods[].sequence`** v odpovědi ČP neodpovídá poslané hodnotě (offset o 1) — nebránilo úspěchu v testech, ale nevysvětleno, sledovat při zásilkách s víc položkami.
- **`weight`/`customVal` v `parcelCustomGoods[]`** — není jisté, jestli má jít hodnota za kus nebo za celou položku; implementováno jako za celou položku (jednotka × počet), needs-confirm u ČP.
