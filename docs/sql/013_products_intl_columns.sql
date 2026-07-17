-- Mezinárodní verze eshopu (EN teď, KO/JA/ZH-Hans/ZH-Hant později, viz
-- docs/09-jazykove-mutace.md). Překlady textových polí jako sloupce s
-- jazykovou příponou (ne samostatná product_translations tabulka - cílová
-- sada jazyků je uzavřená a známá dopředu, migrace se dělá jednou pro
-- všechny najednou). Stávající name/short_description/detailed_description
-- a price/sale_price zůstávají beze změny a fungují jako CZ referenční
-- obsah a CZ cena.
alter table products
  add column name_en text,
  add column short_description_en text,
  add column detailed_description_en text,
  add column name_ko text,
  add column short_description_ko text,
  add column detailed_description_ko text,
  add column name_ja text,
  add column short_description_ja text,
  add column detailed_description_ja text,
  add column name_zh_hans text,
  add column short_description_zh_hans text,
  add column detailed_description_zh_hans text,
  add column name_zh_hant text,
  add column short_description_zh_hant text,
  add column detailed_description_zh_hant text,
  add column price_eur numeric,
  add column sale_price_eur numeric;
