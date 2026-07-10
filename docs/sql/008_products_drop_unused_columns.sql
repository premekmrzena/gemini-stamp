-- Nevratné smazání dvou sloupců products na výslovné přání uživatele (2026-07-10).
-- print_sheets bylo prázdné u všech produktů. stamp_type ("Typ známky") ale mělo
-- vyplněnou hodnotu u 8 z 11 produktů (Loreta Praha, Mucha, Umění Evropy,
-- Slavní umělci...) – tahle data se tímto zahazují natrvalo, uživatel to
-- vědomě potvrdil.
alter table products drop column if exists print_sheets;
alter table products drop column if exists stamp_type;
