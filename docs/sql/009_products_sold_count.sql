-- Počítadlo prodaných kusů na produktu, pro řazení "Nejprodávanější" v eshopu.
-- Průběžně inkrementováno při vytvoření objednávky (viz /api/create-order),
-- ne dopočítáváno z historie objednávek při každém načtení kategorie.
alter table products add column sold_count integer not null default 0;

-- Atomický increment (chrání proti souběhu při paralelních objednávkách).
-- security definer, protože create-order běží pod anon klíčem a products
-- nemá pro anon UPDATE policy.
create or replace function increment_product_sold_count(p_product_id uuid, p_qty integer)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  update products set sold_count = sold_count + p_qty where id = p_product_id;
end;
$$;
grant execute on function increment_product_sold_count(uuid, integer) to anon, authenticated;
