-- Obecné ruční pořadí produktů ve výpisech (homepage, kategorie), nezávislé
-- na tag_top (které řadí jen TOP produkty mezi sebou 1-6). Když je vyplněné,
-- má přednost před tag_top/tag_new/created_at řazením. Nižší číslo = výš.
alter table products add column sort_order integer;
