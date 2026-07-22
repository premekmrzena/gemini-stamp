# 6. Odložené úlohy

> Přehled věcí, o kterých víme, že v appce chybí nebo nejsou dotažené, ale vědomě jsme je odložili na později. Cíl této sekce je nezapomenout na ně, ne je řešit hned. Stav k 2026-06-16.

## Platby a infrastruktura

| Co chybí | Proč je to odložené | Co bude potřeba, až na to přijde čas |
|---|---|---|
| **Stripe webhook nezaregistrovaný** v Stripe Dashboardu | Projekt zatím běží na testovacím Stripe účtu. Doména je už finální (`mycreativestamp.com`), takže registraci lze provést kdykoli | V Stripe Dashboardu (Developers → Webhooks) zaregistrovat `https://mycreativestamp.com/api/stripe-webhook`, eventy `payment_intent.succeeded`, `payment_intent.payment_failed` a `payment_intent.canceled` (poslední dva od 2026-07-22 kvůli automatickému vrácení skladu), doplnit `STRIPE_WEBHOOK_SECRET` do env. Detail v [sekci 1](01-technicka-infrastruktura.md#platby--stripe). |
| **Aktivace ostrého Stripe účtu** | Zatím testovací klíče/testovací karty, plán 2026-07-22 přejít na živý provoz | Přepnout `STRIPE_SECRET_KEY`/`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` z testovacích na live klíče (Vercel env), zaregistrovat live webhook (viz řádek výše, live režim má vlastní `STRIPE_WEBHOOK_SECRET`), reálný end-to-end test platby s malou částkou. |
| **Napojení košíku/checkoutu na API dopravce** | Plán 2026-07-22, zatím `getShippingOptions()` v `src/lib/constants.ts` vrací jen 3 pevné možnosti (osobní odběr / ČR / mezinárodní) s natvrdo danou cenou podle váhy | Nahradit nebo doplnit pevné ceny reálným dotazem na zvoleného dopravce (sledovací číslo, skutečná cena podle rozměru/váhy/cíle). Dá se čekat, že se přitom budou měnit CZ texty v `ShippingStep`/`AddressForm` – platí zavedený vzor „CZ a EN text vznikají spolu" (viz [sekce 9](09-jazykove-mutace.md)), po každé změně spustit `npm run check:messages`. |
| **Resend e-maily ze sandbox domény** `onboarding@resend.dev` | Vědomě odloženo 2026-06-16 — vlastní doména se bude řešit později | Zverifikovat doménu v Resendu, změnit `from` adresu na obou místech v `src/lib/email.ts` (`sendOrderConfirmation`, `sendShippingNotification`). Dokud se to nezmění, sandbox pravděpodobně pošle jen na ověřenou adresu vlastníka účtu, ne libovolnému zákazníkovi. Detail v [sekci 1](01-technicka-infrastruktura.md#e-maily--resend). |

## Fakturace

| Co chybí | Proč je to odložené | Co bude potřeba, až na to přijde čas |
|---|---|---|
| **Napojení na iDoklad API** | Uživatel se rozhodl řešit fakturaci samostatně, později (plán napojit brzy po ostrém Stripe, 2026-07-22) | Appka už sbírá vše potřebné: `orders.billing_company_name`/`billing_company_id`/`billing_company_tax_id` (IČO/DIČ) + plná fakturační adresa + `cart_items`. Zbývá navrhnout API integraci (kdy se má doklad vystavit, jaké jsou iDoklad endpointy) a UI/trigger v adminu. Detail v [sekci 5](05-administrace.md#4-fakturace). |

## Administrace a bezpečnost

| Co chybí | Poznámka |
|---|---|
| **Žádná role/oprávnění** | Kdokoli s platným Supabase Auth účtem vidí a může měnit úplně vše (objednávky i produkty) — žádné rozlišení rolí v appce. |
| **Žádný audit log** | Není vidět, kdo a kdy změnil stav objednávky nebo upravil produkt. |
| **Žádná validace přechodů stavu objednávky** | Z adminu lze nastavit jakýkoli ze 13 stavů v jakémkoli pořadí (např. `Nová` → `Uzavřeno` přímo). Tlačítko „další krok" v dashboardu jen *navrhuje* logický další stav, nic nevynucuje. Detail v [sekci 2](02-stavy-objednavky.md#otevřené-body). |
| **Notifikace zákazníkovi jen částečné** | Automaticky se posílá e-mail jen při vytvoření objednávky (`Nová`) a manuálně při zadání sledovacího čísla (typicky u `Odesláno`). Stavy `Doručeno`, `Vyzvednuto`, `Vráceny peníze` atd. zákazníkovi e-mailem nepřijdou. |

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
