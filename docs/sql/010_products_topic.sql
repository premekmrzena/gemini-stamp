-- Nový sloupec products.product_topic pro tematický filtr v kategorii Známky
-- (Vše / Umění / Památky / Známky / Archy). Nezávislé na products.category,
-- který určuje TYP produktu (známka/arch/FDC/plaketa), zatímco product_topic
-- určuje TÉMA v rámci sloučeného výpisu kategorií znamky + znamkove-archy.
create type product_topic as enum ('umeni', 'pamatky', 'znamky', 'archy');

alter table products add column product_topic product_topic;
