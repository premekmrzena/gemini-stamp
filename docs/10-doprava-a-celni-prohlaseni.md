# 10. Doprava (Česká pošta) a celní prohlášení

> Stav k 2026-08-03. Napojení na nAPI B2B-ZSK České pošty běží zatím jen proti **demo** prostředí — žádná reálná zásilka zatím nevznikla, admin flow je funkční a otestovaný, ale vědomě se nepřepnul na ostrý provoz. Zonos Declaration ID (USA/Portoriko, sekce 3) je zapojené v kódu a účet je hotový, ale reálné volání zatím neproběhlo.

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
- **Odesílatel na štítku/podání**: `parcelServiceHeader.senderAddress` (schéma `Address` – `companyName`/`street`/`houseNumber`/`city`/`zipCode`/`isoCountry`) – **sourozenec** `parcelServiceHeaderCom`, ne pole uvnitř něj (`parcelServiceHeaderCom` používá schéma `LetterHeader`, který `senderAddress` vůbec nezná – uvnitř dá `400`/"Object instance has properties which are not allowed by the schema"). Konstanta `SENDER_ADDRESS` v `ceskaPostaShipment.ts` (stejná adresa jako `ZONOS_ORIGIN_ADDRESS` v `zonos.ts`, ale samostatná konstanta pro jiný účel). Bez tohohle pole ČP doplní odesílatele podle údajů zaregistrovaných k podacímu místu (`locationNumber`) – u téhle smlouvy to bylo osobní jméno, ne `DVKS s.r.o.` (zjištěno 2026-08-05 z reálně vytištěného štítku).
  - **Neověřeno na živo (2026-08-05)**: se správně umístěným `senderAddress` request v demu prošel (`200`, žádná schema chyba), ale na vytištěném štítku se objevila **jiná** firma než obě očekávané – `Holubí Pošta s.r.o., Korunní 1, Praha 10` (v kódu ani v docs se nikde nevyskytuje). Nejpravděpodobnější vysvětlení: **demo prostředí ČP `senderAddress` ignoruje a vždy vytiskne svou fixní testovací firmu**, bez ohledu na to, co se pošle – ne bug na naší straně. **Potřeba ověřit až na živém prostředí**, jakmile dorazí live přístupy od ČP (viz [sekce 6](06-odlozene-ulohy.md)) – teprve tam uvidíme, jestli se `DVKS s.r.o.` skutečně propíše.

**Tisk adresního štítku** (`GET /api/admin/print-shipping-label`, tlačítko „Vytisknout štítek" v dashboardu) volá `/parcelPrinting` s `idForm 20` ("adresní štítek bianco – 4x, A4"). Původně nastaveno na `idForm 101` ("Harmonizovaný štítek") – to je ale určené pro balíkové zásilky (Balík Do ruky apod.), ne pro dopisové produkty (`RR`/`VL`/`EM` prefixy, které eshop používá), ČP na ně vracela `378 INVALID_PREFIX_COMBINATION`. Ověřeno živě proti demu 2026-08-05 na reálných sledovacích číslech – `idForm 20` funguje spolehlivě pro **`RR` (Doporučené psaní) a `VL` (Cenné psaní)**, `idForm 103` (A6) taky.

- **`EM` (EMS) zatím nemá funkční `idForm` – otevřený bod.** `20`/`100`–`103` vrací `378 INVALID_PREFIX_COMBINATION`. `idForm 40` projde bez chyby (`responseCode 1 OK`), ale vytiskne nesmyslný/rozbitý dokument (skoro prázdná stránka, osobní jméno místo firmy, osamocené slovo „Chad" místo adresy příjemce – žádný čárový kód) – **nepoužívat**, jen prošlo validací, obsahově je to špatně. Přesná mapa prefix→idForm není v OpenAPI schématu (jen odkaz na "byznys dokumentaci" ČP), další systematické zkoušení (jako u `category: '91'` výše) riskuje další podobně rozbité výstupy, dokud nebude jasnější zdroj pravdy – lepší se zeptat obchodního zástupce ČP až budou live přístupy, než dál hádat. **Dotaz na ČP odeslán 2026-08-05.**

**CN22 celní nálepka pro `VL`/`EM` – prozkoumáno, nejde o snadný doplněk.** ZSK API má samostatný pár endpointů `/letterWithCN22` (POST, asynchronní podání) + `/letterWithCN22/idTransaction/{id}` (GET výsledek) + `/letterWithCN22Printing` (tisk) – na první pohled vypadá jako cesta k fyzické CN22 nálepce k naší `VL`/`EM` zásilce. Živě otestováno proti demu s odkazem na existující `VL800017039CZ` kód (`letterParams.parcelCode`) + `letterCustomsDeclaration` (stejná pole jako náš `parcelCustomsDeclaration`) – **API to rovnou odmítlo** (`BATCH_INVALID`): `MISSING_ADDRESSEE`/`MISSING_ADDRESSEE_CITY` (chce kompletní adresu znovu, ne jen odkaz na existující `/parcelService` zásilku), `INVALID_PREFIX` (náš `VL` kód tomuhle systému nesedí – vrácený `parcelCode` byl prázdný). Vypadá to na **úplně samostatný systém** ("OLZ" v popisu endpointu), ne nadstavbu nad `/parcelService`.

Důležité: naše `VL`/`EM` zásilky **už dnes posílají celní data elektronicky** přes `parcelCustomsDeclaration` v `/parcelService` (kategorie/celní hodnota/zboží/HS kód, viz výše) – vytištěný štítek má i „Udaná cena" na sobě. Možné (ale needs-confirm), že tohle už je funkční ekvivalent CN22 (elektronická celní deklarace/ITMATT místo papírové nálepky, běžný posun po roce 2021) a `/letterWithCN22` je jiný/paralelní produkt (např. pro podání bez ZSK smlouvy na přepážce). **Needs-confirm od ČP** – dotaz zahrnutý do stejné zprávy jako `idForm` pro EMS výše, odesláno 2026-08-05. Neimplementovat naslepo – celní deklarace je compliance oblast, chybný postup by mohl reálně poškodit doručení zásilky do zahraničí, ne jen vytisknout ošklivé PDF.

## 3. Zonos Declaration ID (USA/Portoriko)

Od 1.7.2026 vyžaduje Česká pošta pro zásilky do USA/Portorika (kromě zboží ≥ 800 USD, jiný celní režim mimo tenhle flow) `declarationId` získané od externí firmy **Zonos**. Zapojeno 2026-08-03 do admin flow „Vytvořit zásilku" (`ShipmentModal.tsx`).

**Účet**: registrace přes ČP-specifický odkaz (`https://account.zonos.com/register?key=...`), platební karta v Zonos Dashboard → Settings → Billing (z ní se strhává clo), API klíč z Account → Integrations (`ZONOS_API_KEY`, hlavička `credentialToken`). Origin adresa (odesílatel) je nastavená přímo v Zonosu i jako konstanta v kódu: `Nad studánkou 393, Světice, 251 01, CZ`.

**Skutečný tvar GraphQL API** (ověřeno introspekcí proti živému schématu 2026-08-03 — liší se od staršího zjednodušeného PDF návodu od Zonosu, který popisoval jedinou mutaci): `src/lib/zonos.ts`, dvoukrokové volání:

1. **`landedCostCalculateWorkflow`** — jedna GraphQL request obsahující víc sesterských `*Workflow` mutací najednou (`partyCreateWorkflow` + `itemCreateWorkflow` + `shipmentRatingCreateWorkflow` + `landedCostCalculateWorkflow`), které se server-side samy provážou (žádné explicitní `rootId`/`cartId` mezi nimi netřeba, pokud běží ve stejné requestu). Vrací `LandedCost` s `id` a `amountSubtotals` (duties/taxes/fees/shipping/items/landedCostTotal) — jen "quote", žádný finanční dopad.
2. **`declarationCreateWorkflow`** — samostatná request, `input: { landedCostIds: [<id z kroku 1>], source: 'POST' }` → vrací `Declaration.id` = Declaration ID pro ČP. **Tady se autorizuje karta** (zadrží se částka, nestrhne) — Declaration ID platí jen **5 dní**.

**Přepočet měny**: Zonos i ČP (`customValCur`) vyžadují u USA/Portorika USD. Kurz je ruční (stejný vzor jako CZK) — nový řádek v `exchange_rates` (`029_exchange_rates_usd.sql`), admin ho zadává v záložce "Kurzy měn". `convertCustomsItemsToUsd()` (`src/lib/customsDeclaration.ts`) převádí `order.currency` (CZK nebo EUR) → USD, s CZK jako mezikrokem přes EUR když je potřeba.

**Admin flow**: `ShipmentModal.tsx` u zásilek do US/PR ukáže tlačítko "Získat Declaration ID (Zonos)" (`POST /api/admin/create-zonos-declaration`), teprve po úspěchu se odemkne "Podat u České pošty" (`declarationId` se pošle v těle na `/api/admin/create-shipment`, `buildParcelServiceRequest()` ho vloží do `parcelCustomsDeclaration.declarationId` + přepne `customValCur` na `USD`).

**Vedlejší oprava (2026-08-03)**: `customValCur` byl dřív natvrdo `'CZK'` pro VŠECHNY mezinárodní zásilky, i když skutečné objednávky (produkční `en` locale) mají hodnoty v EUR — opraveno na `order.currency`, ověřeno regresním testem (`buildParcelServiceRequest` pro ne-US zemi vrací teď `customValCur` podle skutečné měny objednávky, chování pro US/PR beze změny).

## 4. Otevřené body

- **Živý provoz ČP**: zatím se volá jen `env: 'demo'` (`POST /api/admin/create-shipment` čte `CESKA_POSTA_API_ENV`, default `'demo'`) — na `'live'` přepnout až bude jasné, že integrace funguje spolehlivě, a doplnit `CESKA_POSTA_LIVE_CUSTOMER_ID`/`POST_CODE`/`LOCATION_NUMBER` (live účet je zatím nemá).
- **Zonos živé ověření**: kód napsaný a ověřený introspekcí schématu + regresním testem `buildParcelServiceRequest`, ale **reálné `declarationCreateWorkflow` volání (skutečná autorizace karty) zatím neproběhlo** — čeká na první opravdovou objednávku do USA/Portorika. Přesný tvar `amountSubtotals` (klíče v odpovědi) taky zatím jen podle schématu, ne živě ověřený.
- **`ZONOS_ORIGIN_ADDRESS`** v `src/lib/zonos.ts` je natvrdo zadaná konstanta (potvrzena uživatelem) — pokud se výdejní/podací adresa změní, upravit i tady.
- **Kombinace `Services` kódů**: ověřeno jen pro jednoduchý případ (1 položka, běžná váha) — u složitějších zásilek (víc položek, extrémní váha/hodnota) není jisté, jestli aktuální kombinace (`['50']`/`['7']`/`['43']`) zůstává správná, nebo jestli by měl přibýt další kód (např. `44` „Zboží s VDD" u vyšší celní hodnoty, vyžaduje MRN kód).
- **`resultParcelCustomsGoods[].sequence`** v odpovědi ČP neodpovídá poslané hodnotě (offset o 1) — nebránilo úspěchu v testech, ale nevysvětleno, sledovat při zásilkách s víc položkami.
- **`weight`/`customVal` v `parcelCustomGoods[]`** — není jisté, jestli má jít hodnota za kus nebo za celou položku; implementováno jako za celou položku (jednotka × počet), needs-confirm u ČP.
