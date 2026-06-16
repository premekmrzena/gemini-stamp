# 2. Stavy objednávky

> Stav popsaný podle skutečného kódu k 2026-06-16.

## Definice
Typ `OrderStatus` je definován v `src/types/database.ts`. Seznam stavů + jejich barevné skupiny pro admin dashboard jsou v `ORDER_STATUSES` v `src/lib/constants.ts`.

| Stav | Skupina (barva v adminu) | Kdy nastává |
|---|---|---|
| `Nová` | neutrální | Objednávka vytvořena (`POST /api/create-order`), výchozí stav |
| `Připravujeme` | neutrální | Manuálně v adminu – objednávka se zpracovává |
| `Zaplaceno` | neutrální | Automaticky přes Stripe webhook (`payment_intent.succeeded`) |
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

Mimo `Nová` (vytvoření objednávky) a `Zaplaceno` (Stripe webhook) se všechny stavy nastavují **pouze manuálně** v adminu — v kódu není žádná automatizace pro doručení, vyzvednutí, reklamace ani vrácení peněz.

## Kde se to nastavuje v kódu
- `src/app/api/create-order/route.ts` – nová objednávka vždy se statusem `Nová`
- `src/app/api/stripe-webhook/route.ts` – po úspěšné platbě nastaví `Zaplaceno`
- `src/app/admin/dashboard/page.tsx` – v detailu objednávky select „Změnit stav“ s libovolnou hodnotou z `ORDER_STATUSES`, barva štítku/selectu se odvozuje od `group` (`neutral` / `success` / `danger`)

## Otevřené body
- Žádné notifikační e-maily při změně stavu (zákazník se o `Odesláno`, `Doručeno` atd. nedozví automaticky) – zatím se posílá jen potvrzení při vytvoření objednávky
- Žádná validace přechodů mezi stavy (z adminu lze nastavit jakýkoli stav v jakémkoli pořadí, např. z `Nová` přímo na `Uzavřeno`)
