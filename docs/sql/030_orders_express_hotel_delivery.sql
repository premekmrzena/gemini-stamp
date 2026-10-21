-- Expres doručení na hotel v Praze (docs/14-plan-marketing-2026-10.md, bod 3), 2026-10-21.
--
-- Nová doprava "Expres na hotel (Praha)" (id 'expres-hotel' v src/lib/constants.ts) potřebuje
-- u objednávky hotel, datum odjezdu hosta a vypočtený den doručení (src/lib/expressDelivery.ts).
-- create-order je vyplňuje jen u téhle dopravy, u ostatních zůstávají null.
--
-- POZOR: spustit v Supabase SQL editoru DŘÍV, než se nasadí kód - bez sloupců by insert
-- expres objednávky spadl (ostatní objednávky tyhle klíče vůbec neposílají).

alter table orders add column if not exists hotel_name text;
alter table orders add column if not exists departure_date date;
alter table orders add column if not exists express_delivery_date date;
