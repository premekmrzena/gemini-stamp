-- Nový stav "Čekáme na platbu" (audit stavového modelu 2026-07-26, viz [[project_dashboard_redesign_2026-07-26]]).
-- `create-order` dřív u VŠECH objednávek (kartou i převodem) nastavoval status 'Nová' -
-- u platby kartou to obvykle během pár vteřin přepsal Stripe webhook na 'Zaplaceno', ale
-- u bankovního převodu (jen CZ) objednávka reálně čekala na platbu, jen se to jmenovalo
-- stejně jako čerstvě vytvořená objednávka. Teď 'create-order' nastavuje rovnou
-- 'Čekáme na platbu' pro obě metody - u karty ho webhook typicky během okamžiku přepíše
-- na 'Zaplaceno', u převodu tam zůstává, dokud platba nedorazí/admin nepotvrdí.
--
-- 'Nová' zůstává v seznamu povolených hodnot kvůli historickým objednávkám (appka ho
-- už nikdy nezapisuje, ale staré řádky s ním v DB existují) - v adminu je z reálného
-- stavu přeměněná na dočasný "čerstvá objednávka" badge počítaný z `created_at`
-- (viz `isFreshOrder` v `src/app/admin/dashboard/page.tsx`), ne na samostatný krok toku.
alter table orders drop constraint orders_status_check;
alter table orders add constraint orders_status_check
  check (status in (
    'Nová', 'Čekáme na platbu', 'Připravujeme', 'Zaplaceno', 'Odesláno', 'K vyzvednutí',
    'Doručeno', 'Vyzvednuto', 'Zrušeno', 'Vráceno', 'Vráceny peníze',
    'Ztracená zásilka', 'Reklamace', 'Uzavřeno'
  ));

alter table orders alter column status set default 'Čekáme na platbu';
