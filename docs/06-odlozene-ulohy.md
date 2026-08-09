# 6. Odložené úlohy

> Přehled věcí, o kterých víme, že v appce chybí nebo nejsou dotažené, ale vědomě jsme je odložili na později. Cíl této sekce je nezapomenout na ně, ne je řešit hned. Aktualizováno k 2026-08-09.

## Platby a infrastruktura

| Co chybí | Proč je to odložené | Co bude potřeba, až na to přijde čas |
|---|---|---|
| **Napojení na API dopravce naostro** | 2026-07-23: admin tlačítko „Vytvořit zásilku“ skutečně volá nAPI B2B-ZSK České pošty a funguje — ale zatím jen proti **demo** prostředí, viz [sekce 10](10-doprava-a-celni-prohlaseni.md#3-otevřené-body). Ruční založení podacího místa přes web se nepodařilo, uživatel poslal dotaz konzultantovi ČP (2026-08-09, `docs/email-cp-odpoved-2026-08-07.md`) — čeká se na odpověď. | Až dorazí `locationNumber`, přepnout `CESKA_POSTA_API_ENV` na `live`, doplnit `CESKA_POSTA_LIVE_CUSTOMER_ID`/`POST_CODE`/`LOCATION_NUMBER`, reálný end-to-end test s malou zásilkou. |
| **Zonos Declaration ID — živé ověření** | Účet založený, kód zapojený (viz [sekce 3](10-doprava-a-celni-prohlaseni.md#3-zonos-declaration-id-usaportoriko)) a ověřený introspekcí schématu + regresním testem, ale reálné `declarationCreateWorkflow` volání (skutečná autorizace karty) zatím neproběhlo | Až přijde první opravdová objednávka do USA/Portorika, projít flow živě v adminu a potvrdit tvar `amountSubtotals` v odpovědi. |
| **iDoklad licence brzy vyprší** | Zjištěno 2026-07-25 při napojování fakturace (viz [sekce 5](05-administrace.md#5-fakturace)) — OAuth token obsahoval `"license_status":"WillExpireSoon"`, k 2026-08-05 uživatel odhadoval ~48 dní do vypršení (cca polovina září) | Zkontrolovat/obnovit předplatné v iDoklad účtu (mimo appku, přímo na idoklad.cz), jinak `createInvoiceForOrder()` začne selhávat. |
| **Air Bank auto-párování — nastaveno na obou stranách, čeká na první živé ověření** | 2026-08-09: ověřeno přímo přes iDoklad API (bezpečné, jen čtení + jeden podepsaný testovací požadavek na fiktivní ID bez reálného dopadu) — webhook subscription je aktivní (`GET /v3/Webhooks` → `Id 233`, registrováno už 2026-07-25) a produkční `/api/idoklad-webhook` funguje, `IDOKLAD_WEBHOOK_SECRET` ve Vercelu sedí (signed test request vrátil `200 {"received":true}`). Air Bank posílá výpisy e-mailem na iDokladu párovací adresu (`...bank@itsmybill.eu`) v nastavené frekvenci — nastaveno v bance i v iDokladu. `GET /BankStatements` k 2026-08-09 vracel `TotalItems: 0` (žádný výpis zatím nedorazil/nezpracoval se), takže celý řetězec (výpis → párování → webhook → `orders.status = 'Zaplaceno'`) zatím neproběhl živě. | Až přijde první reálná platba převodem, ověřit že se spáruje automaticky a objednávka přejde na "Zaplaceno" bez ručního zásahu (do té doby funguje ruční admin fallback "Potvrdit platbu a vystavit fakturu"). |
| **CN22 pro `VL` — implementováno, ale neověřeno naživo** | 2026-08-07b: `idForm 56` (CN22 tiskne se přes `/parcelPrinting` k existující `VL` zásilce) implementováno vedle štítku, `EM` ho nepotřebuje (`idForm 62`/`63` už tiskne kombinovaný CN23 dokument). Nikdy vizuálně neověřeno v prohlížeči (chyběly admin přihlašovací údaje) | Po přepnutí na live projít objednávku s Cenným psaním do zahraničí a potvrdit oba tisky (štítek + CN22) vizuálně. |
| **Odesílatel na štítku — ověřit na živo** | 2026-08-05: `senderAddress` (`DVKS s.r.o.`) posíláme schématicky správně, ale demo prostředí ho ignoruje a tiskne svou fixní testovací firmu (viz [sekce 10](10-doprava-a-celni-prohlaseni.md#2-admin--vytvořit-zásilku)) | Po přepnutí na `live` vytisknout zkušební štítek a potvrdit, že se `DVKS s.r.o.` skutečně propíše. |
| **Dodatečné celní požadavky zemí mimo EU (KRITICKÉ pro plán plateb v CNY/JPY/KRW/TWD, viz [sekce 0](00-platby-meny-konverze.md))** | Naše elektronické celní prohlášení (`parcelCustomsDeclaration` v `/parcelService`) pokrývá ČP stranu, ale jednotlivé cílové země mohou mít vlastní dodatečný požadavek nad rámec ČP (analogie k Zonos Declaration ID u USA) — např. Jižní Korea vyžaduje u drtivé většiny osobních zásilek příjemcův **PCCC (Personal Customs Clearance Code)**, jinak zásilka uvázne na celnici. Nemáme ověřeno, jestli podobný požadavek platí i pro Čínu/Japonsko/Taiwan. | Než se otevře prodej do CN/JP/KR/TW (viz plán v [sekci 0](00-platby-meny-konverze.md)), ověřit u ČP/celních zdrojů zemi po zemi, jestli existuje obdoba PCCC nebo jiný dodatečný požadavek. |

## Administrace a bezpečnost

| Co chybí | Poznámka |
|---|---|
| **Žádná role/oprávnění** | Kdokoli s platným Supabase Auth účtem vidí a může měnit úplně vše (objednávky i produkty) — žádné rozlišení rolí v appce. |
| **Žádný audit log** | Není vidět, kdo a kdy změnil stav objednávky nebo upravil produkt. |
| **Žádná validace přechodů stavu objednávky** | Z adminu lze nastavit jakýkoli ze 13 stavů v jakémkoli pořadí (např. `Nová` → `Uzavřeno` přímo). Tlačítko „další krok" v dashboardu jen *navrhuje* logický další stav, nic nevynucuje. Detail v [sekci 2](02-stavy-objednavky.md#otevřené-body). |

## Produkty

| Co chybí | Poznámka |
|---|---|
| **Tiskové archy se tiskárně nepředávají automaticky** | Hromadný ZIP export v dashboardu existuje (viz [sekce 5](05-administrace.md#2-záložka-objednávky)), ale soubor admin pošle tiskárně manuálně — žádná automatizace/integrace. |
| **`weight_grams` jsou jen odhady, ne změřené hodnoty** | 2026-08-07d: celý katalog měl `weight_grams` 0 nebo 1 (chybějící data), doplněno odhadem podle kategorie (20-80 g) — ovlivňuje cenovou hladinu dopravy i údaj zobrazený zákazníkovi na detailu produktu. Časem nechat uživatele zvážit aspoň jeden reálný produkt z každé kategorie a hodnoty zpřesnit, hlavně *plakety* (zatím žádný produkt v katalogu, odhad nejnejistější). |

## Marketing a analytika

_Žádné otevřené body._ (GA4 `beforeInteractive` umístění vyřešeno 2026-08-09 — `src/app/[locale]/layout.tsx` je teď sám kořenový layout, viz [sekce 7](07-seo.md).)

## Jak s touto sekcí pracovat
Když se na některou z těchto úloh dostane řada, smazat řádek odsud a popsat hotové řešení v příslušné číslované sekci (01–05), případně založit novou sekci. Tahle stránka má zůstat krátká — jen seznam, ne návod.
