-- Idempotency flag pro automatické vrácení skladu při neúspěšné platbě
-- (src/app/api/stripe-webhook/route.ts). Stripe může pro tentýž PaymentIntent
-- poslat payment_intent.payment_failed víckrát (zákazník zkusí kartu, selže,
-- zkusí znovu ve stejném platebním modalu) - bez týhle pojistky by release_stock
-- při každém selhání znovu přičetl množství zpět a sklad by se nafoukl nad
-- realitu. Jakmile se pro objednávku sklad jednou vrátí, flag to natrvalo
-- zablokuje pro další pokusy o stejnou objednávku.

alter table orders add column stock_released boolean not null default false;
