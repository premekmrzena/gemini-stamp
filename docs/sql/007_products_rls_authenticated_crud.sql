-- Oprava: "new row violates row-level security policy for table products" při
-- vytváření nového produktu v adminu. Tabulka products už měla RLS zapnuté a
-- authenticated zjevně mohl číst/upravovat (tag_top, show_on_homepage apod.
-- fungovaly), ale chyběla mu politika pro INSERT (a nejspíš DELETE) -> default
-- deny. Tahle politika nic neruší, jen doplňuje plný CRUD pro authenticated,
-- stejný vzor jako u discount_codes (docs/sql/004_discount_codes.sql).
drop policy if exists "products_authenticated_all" on products;
create policy "products_authenticated_all" on products
  for all
  to authenticated
  using (true)
  with check (true);
