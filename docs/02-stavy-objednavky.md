# 2. Stavy objednávky

> Stav popsaný podle skutečného kódu k 2026-06-16, aktualizováno o stav „Čekáme na platbu“ a přeměnu „Nová“ na časový badge k 2026-07-26.

## Definice
Typ `OrderStatus` je definován v `src/types/database.ts`. Seznam stavů + jejich barevné skupiny pro admin dashboard jsou v `ORDER_STATUSES` v `src/lib/constants.ts`.

| Stav | Skupina (barva v adminu) | Kdy nastává |
|---|---|---|
| `Nová` | neutrální | **Appka ho od 2026-07-26 už sama nezapisuje** — v DB zůstává jen u historických objednávek z doby před touto změnou. V adminu se nezobrazuje jako badge stavu, ale jako samostatný dočasný badge „Nová“ vedle skutečného stavu (viz níže) |
| `Čekáme na platbu` | neutrální | Objednávka vytvořena (`POST /api/create-order`), výchozí stav od 2026-07-26 — nahrazuje dřívější `Nová` jako první reálný stav |
| `Připravujeme` | neutrální | Manuálně v adminu – objednávka se zpracovává |
| `Zaplaceno` | neutrální | Automaticky přes Stripe webhook (`payment_intent.succeeded`) u platby kartou; u bankovního převodu manuálně v adminu (nebo automaticky po spárování iDoklad platby, viz [sekce 5](05-administrace.md#5-fakturace)) |
| `Odesláno` | neutrální | Manuálně v adminu – zásilka odeslána |
| `K vyzvednutí` | neutrální | Manuálně v adminu – připraveno k osobnímu odběru |
| `Doručeno` | úspěch (zelená) | Manuálně v adminu |
| `Vyzvednuto` | úspěch (zelená) | Manuálně v adminu – osobní odběr proběhl |
| `Zrušeno` | nebezpečí (červená) | Manuálně v adminu |
| `Vráceno` | nebezpečí (červená) | Manuálně v adminu – zákazník vrátil zboží |
| `Vráceny peníze` | úspěch (zelená) | Manuálně v adminu – refundace dokončena |
| `Ztracená zásilka` | nebezpečí (červená) | Manuálně v adminu |
| `Reklamace` | nebezpečí (červená) | Manuálně v adminu |
| `Uzavřeno` | úspěch (zelená) | Manuálně v adminu – finální stav, objednávka vyřízena |

Mimo `Čekáme na platbu` (vytvoření objednávky) a `Zaplaceno` (Stripe webhook u platby kartou) se všechny stavy nastavují **pouze manuálně** v adminu — v kódu není žádná automatizace pro doručení, vyzvednutí, reklamace ani vrácení peněz.

## „Nová“ jako časový badge, ne stav (od 2026-07-26)

Dřív `create-order` nastavoval u **všech** objednávek (kartou i převodem) status `Nová`. U karty ho Stripe webhook obvykle do pár vteřin přepsal na `Zaplaceno`, ale u bankovního převodu (jen CZ) objednávka reálně **čekala na platbu** — jenže se to jmenovalo stejně jako čerstvě vytvořená objednávka, takže nešlo v přehledu rozeznat „právě vytvořeno“ od „pořád čeká na peníze“.

Řešení: `create-order` teď nastavuje rovnou `Čekáme na platbu` (obě platební metody). `Nová` se v adminu (`src/app/admin/dashboard/page.tsx`) přeměnila na **dočasný badge počítaný z `created_at`** (`isFreshOrder()`, okno 24 hodin od vytvoření) — zobrazuje se vedle skutečného stavu (`Čekáme na platbu` nebo `Zaplaceno`), ne místo něj. U platby kartou tak admin typicky uvidí `Nová` + `Zaplaceno` vedle sebe prakticky ihned (webhook je rychlejší než těch 24 hodin); u převodu `Nová` + `Čekáme na platbu`, dokud platba nedorazí nebo neuplyne první den.

`Čekáme na platbu` a `Zaplaceno` mají navíc v seznamu objednávek jemně odlišné podbarvení řádku/karty (`getOrderRowBg()` — `bg-tag-novinka/5` vs. `bg-success/5`), nezávislé na barvě samotného badge (ta zůstává podle `group` v `ORDER_STATUSES`).

DB `CHECK` constraint (`orders_status_check`, `docs/sql/025_orders_status_waiting_payment.sql`) `Nová` pořád povoluje kvůli historickým řádkům, appka ho ale od 2026-07-26 nikdy sama nezapisuje.

## Kde se to nastavuje v kódu
- `src/app/api/create-order/route.ts` – nová objednávka vždy se statusem `Čekáme na platbu`
- `src/app/api/stripe-webhook/route.ts` – po úspěšné platbě kartou nastaví `Zaplaceno` (`mark_order_paid` RPC)
- `src/app/admin/dashboard/page.tsx` – v detailu objednávky select „Změnit stav“ s libovolnou hodnotou z `ORDER_STATUSES`, barva štítku/selectu se odvozuje od `group` (`neutral` / `success` / `danger`); `isFreshOrder()`/`NewOrderBadge` a `getOrderRowBg()` řeší dočasný badge a podbarvení popsané výše

## Notifikační e-maily podle stavu (rozšířeno 2026-08-05 na všechny stavy kromě dvou)
`src/app/admin/dashboard/page.tsx`'s `updateOrderStatus()` po úspěšné změně stavu zavolá `POST /api/admin/notify-order-status`, který podle `STATUS_EMAIL_NOTIFICATIONS` pošle e-mail pro každý stav kromě `Nová` a `Odesláno` (infrastruktura viz [sekce 1](01-technicka-infrastruktura.md#e-maily--resend), obsah šablon a přehled spouštěčů viz [sekce 11](11-emaily.md)). `Odesláno` má vlastní oddělenou cestu přes sledovací číslo (`ShipmentModal`/ruční zadání → `/api/send-shipping-notification`), ne přes tenhle mechanismus. `Nová` e-mail nespouští tudy (je to jen výchozí stav při vytvoření, zákazník dostane potvrzení objednávky samostatně přes `OrderConfirmationEmail`).

## Otevřené body
- Žádná validace přechodů mezi stavy (z adminu lze nastavit jakýkoli stav v jakémkoli pořadí, např. z `Čekáme na platbu` přímo na `Uzavřeno`)
