-- Zlevněná cena produktu. Když je vyplněná a nižší než price, zobrazí se
-- na webu přeškrtnutá původní cena a vedle sale_price; v košíku/objednávce
-- se použije jako reálná fakturovaná cena.
alter table products
  add column sale_price numeric;
