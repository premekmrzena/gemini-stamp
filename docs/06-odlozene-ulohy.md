# 6. Odložené úlohy

> Přehled věcí, o kterých víme, že v appce chybí nebo nejsou dotažené, ale vědomě jsme je odložili na později. Cíl této sekce je nezapomenout na ně, ne je řešit hned. Stav k 2026-06-16.

## Platby a infrastruktura

| Co chybí | Proč je to odložené | Co bude potřeba, až na to přijde čas |
|---|---|---|
| **Stripe webhook nezaregistrovaný** v Stripe Dashboardu | Projekt zatím běží na testovacím Stripe účtu. Doména je už finální (`mycreativestamp.com`), takže registraci lze provést kdykoli | V Stripe Dashboardu (Developers → Webhooks) zaregistrovat `https://mycreativestamp.com/api/stripe-webhook`, eventy `payment_intent.succeeded`, `payment_intent.payment_failed` a `payment_intent.canceled` (poslední dva od 2026-07-22 kvůli automatickému vrácení skladu), doplnit `STRIPE_WEBHOOK_SECRET` do env. Detail v [sekci 1](01-technicka-infrastruktura.md#platby--stripe). |
| **Aktivace ostrého Stripe účtu** | Zatím testovací klíče/testovací karty, plán 2026-07-22 přejít na živý provoz | Přepnout `STRIPE_SECRET_KEY`/`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` z testovacích na live klíče (Vercel env), zaregistrovat live webhook (viz řádek výše, live režim má vlastní `STRIPE_WEBHOOK_SECRET`), reálný end-to-end test platby s malou částkou. |
| **Napojení na API dopravce naostro** | 2026-07-23: admin tlačítko „Vytvořit zásilku“ skutečně volá nAPI B2B-ZSK České pošty a funguje — ale zatím jen proti **demo** prostředí, viz [sekce 10](10-doprava-a-celni-prohlaseni.md#3-otevřené-body) | Přepnout `CESKA_POSTA_API_ENV` na `live`, doplnit `CESKA_POSTA_LIVE_CUSTOMER_ID`/`POST_CODE`/`LOCATION_NUMBER` (live účet je zatím nemá), reálný end-to-end test s malou zásilkou. |
| **Zonos Declaration ID — živé ověření** | Účet založený, kód zapojený (viz [sekce 3](10-doprava-a-celni-prohlaseni.md#3-zonos-declaration-id-usaportoriko)) a ověřený introspekcí schématu + regresním testem, ale reálné `declarationCreateWorkflow` volání (skutečná autorizace karty) zatím neproběhlo | Až přijde první opravdová objednávka do USA/Portorika, projít flow živě v adminu a potvrdit tvar `amountSubtotals` v odpovědi. |
| **Vercel produkční `RESEND_API_KEY` na starém klíči** | Doména `mycreativestamp.com` ověřená a `EMAIL_FROM` přepnuté 2026-07-24 (hotovo) — jen produkční env proměnná ještě ukazuje na starší `full_access` klíč "Onboarding", ne na nový `mycreativestamp-production` (`sending_access`) | Ve Vercelu (Project → Settings → Environment Variables) přepsat `RESEND_API_KEY` na nový klíč, redeploy. Pak smazat starý klíč "Onboarding" v Resend dashboardu (do té doby ho nemazat, produkce ho pořád používá). Detail v [sekci 1](01-technicka-infrastruktura.md#e-maily--resend). |
| **iDoklad licence brzy vyprší** | Zjištěno 2026-07-25 při napojování fakturace (viz [sekce 5](05-administrace.md#5-fakturace)) — OAuth token obsahuje `"license_status":"WillExpireSoon"`. Bez platné licence přestane API vystavování faktur fungovat | Zkontrolovat/obnovit předplatné v iDoklad účtu (mimo appku, přímo na idoklad.cz), jinak `createInvoiceForOrder()` začne selhávat. |
| **Air Bank nepřipojená k iDokladu + webhook nezaregistrovaný** | 2026-07-25: kompletní proforma+webhook flow napsaný a živě otestovaný end-to-end (simulovaným voláním s platným podpisem), viz [sekce 5](05-administrace.md#5-fakturace) — ale reálné napojení na Air Bank v iDokladu ještě není hotové a webhook není zaregistrovaný, takže se zatím nic nespáruje automaticky (funguje jen ruční admin fallback "Potvrdit platbu a vystavit fakturu") | 1) V iDokladu (Nastavení → bankovní účty) připojit Air Bank na automatické stahování výpisů. 2) Na `developer.idoklad.cz` → detail aplikace `Next-js2-ClientCredentials` → záložka Webhooks → přidat URL `https://mycreativestamp.com/api/idoklad-webhook` + secret shodný s `IDOKLAD_WEBHOOK_SECRET` → získat `PublicId`. 3) Zavolat `POST /v3/Webhooks` s `{ActionType: 4, EntityType: 1, PublicId}` pro aktivaci (může provést Claude, jen potřebuje `PublicId` z kroku 2). |
| **Tisk štítku pro EMS (`EM` prefix) nefunguje** | Oprava tisku štítků 2026-08-05 (viz [sekce 10](10-doprava-a-celni-prohlaseni.md#2-admin--vytvořit-zásilku)) našla funkční `idForm` jen pro `RR`/`VL`, ne pro `EM` — vyzkoušené kódy buď vrací `378 INVALID_PREFIX_COMBINATION`, nebo (idForm 40) projdou, ale vytisknou nesmyslný dokument | Dotaz odeslán ČP 2026-08-05, čeká se na odpověď — další slepé zkoušení kódů proti demu riskuje další rozbité výstupy. |
| **CN22 celní nálepka pro `VL`/`EM` — nejasné, jestli je potřeba** | Prozkoumáno 2026-08-05 (viz [sekce 10](10-doprava-a-celni-prohlaseni.md#technické-detaily-napi-b2b-zsk)) — samostatné endpointy `/letterWithCN22*` existují, ale odmítají odkaz na naši existující zásilku (chtějí kompletní novou adresu, `INVALID_PREFIX` na náš `VL` kód). Možné, že naše stávající elektronické celní prohlášení (`parcelCustomsDeclaration` v `/parcelService`) už stačí | Dotaz odeslán ČP 2026-08-05 spolu s EMS dotazem výše — needs-confirm, neimplementovat naslepo (celní/compliance oblast). |
| **Odesílatel na štítku — ověřit na živo** | 2026-08-05: `senderAddress` (`DVKS s.r.o.`) teď posíláme schématicky správně, ale demo prostředí ho ignoruje a tiskne svou fixní testovací firmu (viz [sekce 10](10-doprava-a-celni-prohlaseni.md#2-admin--vytvořit-zásilku)) | Po přepnutí na `live` vytisknout zkušební štítek a potvrdit, že se `DVKS s.r.o.` skutečně propíše. |

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

## Marketing a analytika

| Co chybí | Poznámka |
|---|---|
| **GA4 `beforeInteractive` script možná ve špatném layoutu** | `GoogleAnalytics.tsx` (Consent Mode v2 default) běží v `src/app/[locale]/layout.tsx`, ne v kořenovém `app/layout.tsx`. Next.js dokumentace říká, že `beforeInteractive` má spolehlivě fungovat jen v kořenovém layoutu. Prakticky nevadí, dokud je skoro celý web pod `[locale]`, ale přesun do kořene by zase přinesl GA i na `/admin`/`/rekonstrukce`. Rozhodnout vědomě, až bude čas. |

## Jak s touto sekcí pracovat
Když se na některou z těchto úloh dostane řada, smazat řádek odsud a popsat hotové řešení v příslušné číslované sekci (01–05), případně založit novou sekci. Tahle stránka má zůstat krátká — jen seznam, ne návod.
