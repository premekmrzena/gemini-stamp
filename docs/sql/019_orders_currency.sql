-- Měna, ve které byla objednávka vytvořena a zaplacena (fáze 4a, EUR ceny
-- pro zahraniční zákazníky - viz docs/09-jazykove-mutace.md). Bez tohohle
-- sloupce by admin/e-maily nemohly rozlišit, jestli je total_price v Kč,
-- nebo v EUR.
alter table orders add column currency text not null default 'CZK'
  check (currency in ('CZK', 'EUR'));
-- DEFAULT při ADD COLUMN dobackfilluje existující řádky automaticky (byly
-- historicky všechny CZK), žádný samostatný UPDATE není potřeba.
