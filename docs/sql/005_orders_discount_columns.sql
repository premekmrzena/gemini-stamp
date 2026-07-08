-- Uplatněný slevový kód a jeho hodnota v Kč na objednávce (přehled/reporting v adminu)
alter table orders add column discount_code text;
alter table orders add column discount_amount numeric not null default 0;
