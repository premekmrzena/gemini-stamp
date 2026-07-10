-- Nová hodnota enumu product_category pro kategorii "Známkové archy".
-- Zatím se na eshopu zobrazuje jen samostatně na /kategorie/znamkove-archy;
-- sloučení výpisus kategorií "znamky" (aby šly na jedné stránce) je
-- naplánováno na později, viz docs/04-popis-eshopu.md.
alter type product_category add value if not exists 'znamkove-archy';
