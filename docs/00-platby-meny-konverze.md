Masterplan pro nastavení plateb

Idea a nastavení na eshopu:
Chci abychom z důvodu lepších konverzí (prokázáno na datech) pro zákazníky s domovskou měnou CNY, JPY, KRW, TWD na eshopu ukazovali ceny v jejich měnách. V tomto případě budu chtít všude u techto cen ikonku "i" s textem "Koncová cena, nic neplatíte za konverzi ve svojí bance, ani poplatek v platební bráně." 
Ostatním zákazníkům ukazujeme ceny v EUR.
- Jak poznám domovskou měnu zákazníka? Existují automatizované signály, ale navrhuji ještě navíc v košíku před platbou selectbox pro ruční výběr měny. (Variantou je zobrazit zákazníkovi modal okno po příchodu na web s výběrem měny, pokud signály naznačují, že jeho domovskou měnou je CNY, JPY, KRW, TWD - ale nevím, jestli to je dobrý nápad). 
- Ceny budou vycházet z nastavených kurzů v adminu, do kterých schováme poplatek Stripe za konverzi cca 2%.

Nastavení Stripe
Mám na Stripe dva účty a to CZK a EUR. Pokud bude zákazník platit v měně CNY, JPY, KRW, TWD provede Stripe konverzi na Settlement default (Settlement currency), což bude CZK. Za konverzi si účtuje cca 2% fee, které poneseme my. Ostatní platby v EUR se nebudou ve Stripe konvertovat a připíšou se na EUR účet (multi-currency settlement pro EUR). Pozn. Vypnout "Adaptive Pricing"!

Banka
- Převod CZK ze Stripe na CZK účet v bance.
- Převod EUR ze Stripe na EUR účet v bance a následně konverze přes WISE na CZK, pokud bude potřeba.

Pozor na čínský jüan (CNY) a platební metody
Pokud cílíš na Čínu a nastavíš CNY, klasické platby kartou (Visa/Mastercard) mají v Číně minimální penetraci. Většina zákazníků tyto karty vůbec nevlastní. Aby ti nastavení CNY přineslo reálné prodeje, je téměř nutností aktivovat si ve Stripe asijské peněženky, primárně Alipay a WeChat Pay. Obě metody Stripe nativně podporuje

---

## Analýza rizik a doporučení (Claude, 2026-08-06)

> **Rozhodnutí:** nápad je platný a v e-commerce běžný (ukázat konečnou cenu v domovské měně, poplatek za konverzi schovat do kurzu), ale zásah je výrazně větší, než na první pohled vypadá - prochází platbami, fakturací, dopravou i právní rovinou. **Řešit až po ostrém spuštění Stripe** (launch 2026-08-12, viz `project_launch_date_2026-08-12`), ne souběžně s ním - jinak se testuje nový nestabilní povrch přesně v okamžiku, kdy platby musí fungovat na 100 %. Výjimka: **čínské peněženky (Alipay/WeChat Pay) jde zapojit jako samostatný, mnohem menší úkol už teď před launchem** - viz poslední sekce níže.

### 1. Currency dnes reálně sahá jen na CZK/EUR - většina práce je tady
Typ, který řídí checkout, je `Currency = 'CZK' | 'EUR'` (`src/types/database.ts:13`). `CurrencyCode` (CZK/USD/KRW/JPY/CNY/TWD) a tabulka `exchange_rates` už existují, ale zatím jen pro *zobrazovací* přepočty (poštovné do EUR, Zonos USD) - ne jako reálná platební měna objednávky. Aby zákazník mohl v CNY/JPY/KRW/TWD skutečně **platit**, musí se currency-aware udělat mj.:
- `getOrderCurrency()` (`currency.ts:10`) - dnes odvozuje měnu z locale (cs→CZK, jinak EUR). Měna bude muset být nezávislý stav (výběr/cookie), ne odvozený z jazyka.
- `formatPrice()` (`currency.ts:16`) - JPY a KRW nemají desetinná místa, TWD/CNY ano. Potřeba `Intl.NumberFormat` per měna.
- `shippingCurrency.ts` - dnes jen CZK/EUR, poštovné do Asie zatím neumí přepočítat vůbec.
- `computeDiscountAmount` (`pricing.ts:23`) - slevové kódy typu `fixed` (`docs/sql/004_discount_codes.sql:4`) mají hodnotu v jedné měně; „fixed 100" v JPY je jiná částka než 100 v EUR.
- `idoklad.ts:14` - `CURRENCY_IDS: Record<string,number> = { CZK:1, EUR:2 }` s tichým fallbackem `?? 1` (řádky 241/340). Objednávka v nové měně by se dnes **tiše vyfakturovala jako CZK**.

**Konkrétní bug čekající na produkci:** `create-payment-intent/route.ts:36` posílá Stripe `amount: Math.round(order.total_price * 100)`. To sedí pro CZK/EUR, ale **JPY a KRW jsou u Stripe „zero-decimal" měny** - bez currency-aware větve hrozí buď 100x přeplatek, nebo 100x podúčtování.

### 2. Dva Stripe účty? Ne - jeden účet stačí (ověřeno 2026-08-06)
Původně jsme počítali se dvěma oddělenými Stripe účty (CZK/EUR), protože v prvním plánu to tak bylo zadané. Po ověření v Dashboardu se ukázalo, že to není potřeba: uživatel má **jeden** živý účet s **EUR jako default settlement currency** a **CZK jako druhou vyplácecí měnou** (vlastní bankovní účet napojený na ten samý účet, Dashboard → Settlement currencies) - obě měny se tak vyplácí přímo, bez Stripe konverze/fee. Krátce jsme kód i env proměnné rozdělili na dva účty (`_CZK`/`_EUR` varianty), pak to vrátili zpět na jeden - viz [sekce 1](01-technicka-infrastruktura.md#platby--stripe) pro finální (jednoduchý) stav. `src/lib/stripe.ts` teď jen líně staví jednoho Stripe klienta, žádný routing podle měny.

**Pro budoucí CNY/JPY/KRW/TWD platby** (velký plán výše) tohle znamená ověřit totéž znovu: dá se některá z těch měn přidat jako další settlement currency na ten samý účet (bez konverze), nebo Stripe u nich konverzi na EUR/CZK vynutí vždy? To rozhoduje, jestli se ~2% fee skutečně dá "schovat do kurzu" (fee reálně vzniká), nebo jestli ho lze úplně obejít. Zjistit až se k té části dostaneme, po launchi.

### 3. Byznys/právní úskalí formulace „i" bublinky
„Konečná cena, nic neplatíte za konverzi" + schovaná ~2% marže v kurzu je technicky pravda (žádný extra poplatek na checkoutu), ale je to funkčně blízko tomu, čemu se říká **Dynamic Currency Conversion (DCC)** - praxe se špatnou pověstí u regulátorů i spotřebitelů právě proto, že "žádný poplatek" bývalo tvrzeno u horšího než tržního kurzu. Doporučení: formulovat jako "cena je pevná a neměnná, žádné skryté poplatky při platbě", ne "neplatíte nic za konverzi". Zároveň ruční kurz bez napojení na API (stejný vzor jako dnešní CZK/USD kurzy) se bude v čase kazit - buď se sežere marže pohybem kurzu, nebo bude cena nekonkurenčně vysoká (opak cíle). Potřeba vlastník a cadence aktualizace.

### 4. UX detekce měny
IP geolokace / `Accept-Language` jsou nespolehlivé (VPN, diaspora, defaultní EN prohlížeč) - brát jen jako hint, ne rozhodnutí. Explicitní select box (navrženo v plánu výše) je správně - uložit volbu (cookie), neptát se/nedetekovat znovu při každé návštěvě. Modal při příchodu nedělat - u falešně pozitivní detekce otravuje většinu a je to proti cíli (konverze).

### 5. Celní odbavení do Asie - KRITICKÝ bod, ne automaticky vyřešený
Předpoklad "celní deklaraci řešíme jako CN22 přes API České pošty" **není potvrzený** - `docs/10-doprava-a-celni-prohlaseni.md` (sekce "Technické detaily") popisuje, že samostatné `/letterWithCN22*` endpointy naši existující VL/EM zásilku odmítají, a jestli stávající elektronické celní prohlášení (`parcelCustomsDeclaration`) je funkční ekvivalent CN22, je **needs-confirm od ČP** (dotaz odeslán 2026-08-05, odpověď zatím nedorazila). Navíc jednotlivé cílové země mohou mít vlastní dodatečný požadavek nad rámec ČP - přesná analogie k tomu, proč byl pro USA/Portoriko potřeba samostatný Zonos Declaration ID. Konkrétně **Jižní Korea vyžaduje u naprosté většiny osobních zásilek příjemcův PCCC (Personal Customs Clearance Code)** - bez něj zásilka uvázne na korejské celnici. Jestli podobný požadavek platí i pro Čínu/Japonsko/Taiwan, zatím neověřeno. Tenhle bod je teď zapsaný jako kritický v [sekci 6](06-odlozene-ulohy.md#platby-a-infrastruktura) - platba bez vyřešené celní strany by znamenala inkasované peníze a nedoručenou zásilku.

### 6. Čínské peněženky (Alipay/WeChat Pay) - proveditelné už PŘED launchem
Na rozdíl od zbytku plánu tohle nevyžaduje přechod na CNY jako platební měnu - Stripe umožňuje Alipay i WeChat Pay v prezentační měně EUR (případně CZK), takže lze zapojit nezávisle na celém multi-currency plánu:
- `StripePaymentForm.tsx` už používá `PaymentElement` + `confirmPayment` s `return_url` (řádky 35-41) - přesně mechanismus, který redirect platby (Alipay/WeChat) potřebují, UI flow se nemusí měnit.
- Mezera: `create-payment-intent/route.ts:37` má natvrdo `payment_method_types: ['card']`. Potřeba přidat `alipay`/`wechat_pay` (nebo `automatic_payment_methods: { enabled: true }`) + zapnout obě metody ve Stripe Dashboardu.
- WeChat Pay u Stripe historicky potřebuje navíc `payment_method_options.wechat_pay.client` (web) při potvrzení platby - ne jen dashboard toggle, drobná úprava kódu.
- **Nutno ověřit co nejdřív** (ne předpokládat): aktivace Alipay/WeChat Pay ve Stripe Dashboardu může vyžadovat schválení/review ze strany Stripe, což se nemusí stihnout do 6 dnů do launche - zkontrolovat stav v Dashboardu (Settings → Payment methods) hned.

---

## Stripe live spuštění dokončeno (2026-08-06)

Bod 2 výše (jeden účet, ne dva) je teď potvrzený i reálným provozem, ne jen nastavením v Dashboardu:

- Live klíče (`STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`) nastavené v `.env.local` i Vercel Production.
- Live webhook zaregistrovaný (`https://mycreativestamp.com/api/stripe-webhook`, 3 eventy).
- Ověřeno v Dashboardu (Settings → Bank accounts and currencies): EUR default + CZK settlement currency, obě přes Air Bank, Settlement fee u CZK `FREE`. Payout: Automatic/Weekly (pondělí), Accelerated (3 pracovní dny), Statement descriptor `My Creative Stamp`, Minimum balance vypnuté (vědomě, lze zapnout později při vyšším obratu).
- Před testem vymazána všechna testovací data (objednávky, `custom_stamps`, `discount_codes`, 2 Blob soubory, 2 iDoklad faktury přes `DELETE /v3/IssuedInvoices/{id}` - účet je neplátce DPH, mazání testovacích dokladů je vědomě opakovaný postup), `sold_count` vynulován a `stock_quantity` sjednocen na 100 ks u všech 45 produktů.
- **Reálný end-to-end test úspěšný**: objednávka 30 Kč (CZK) a 1 € (EUR), obě `Zaplaceno`, iDoklad faktura (číselná řada nově od `20260001`) doručena e-mailem u obou včetně CZK přepočtu na EUR faktuře (kurz z `exchange_rates`, jen informativní řádek).
- **Otevřeno**: výplata do banky ještě neproběhla (Accelerated = 3 pracovní dny + nejbližší týdenní cyklus) - potřeba potvrdit, že CZK i EUR přistály na správný účet bez konverze, pak rozhodnout o refundaci/ponechání testovacích 30 Kč + 1 €. Sledovat v [sekci 1](01-technicka-infrastruktura.md#zjištěné-nedodělky--otevřené-body).
- **Gotcha zjištěná při testu**: Stripe má pro CZK minimální částku charge kolem 15 Kč - testovací produkt musí mít cenu nad touhle hranicí, jinak `create-payment-intent` selže rovnou při vytváření PaymentIntentu.
