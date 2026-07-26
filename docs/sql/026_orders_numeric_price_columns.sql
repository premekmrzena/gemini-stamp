-- Bug nalezen 2026-07-26 při živém testu checkoutu: EUR objednávky (fáze 4a) počítají
-- shipping_cost/payment_cost/total_price přes convertToEur(), která zaokrouhluje na 2
-- desetinná místa (centy) - src/lib/pricing.ts. Sloupce orders.total_price/shipping_cost/
-- payment_cost jsou ale `integer`, takže INSERT s hodnotou jako "164.7" spadl na
-- "invalid input syntax for type integer" a EUR checkout nešel vůbec dokončit.
-- CZK objednávky bug nepotkal, protože skutečné Kč ceny/poštovné jsou vždycky celá čísla.
--
-- Řešení: sloupce převedeny na `numeric`, ne zaokrouhlené na celé EUR - total_price musí
-- odpovídat přesně tomu, co se skutečně naúčtuje přes Stripe (create-payment-intent.ts
-- dělá Math.round(order.total_price * 100) pro centy) a co jde na fakturu do iDokladu
-- (idoklad.ts používá shipping_cost/payment_cost přímo jako UnitPrice), zaokrouhlení na
-- celé číslo by tam vytvořilo neshodu mezi účtovanou a evidovanou částkou.
alter table orders
  alter column total_price type numeric using total_price::numeric,
  alter column shipping_cost type numeric using shipping_cost::numeric,
  alter column payment_cost type numeric using payment_cost::numeric;
