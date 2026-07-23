-- Zrušení blokace nákupu při nedostatku skladu (2026-07-22). Sklad je od teď jen
-- informace pro doplňování, ne tvrdý limit prodeje - viz docs/sql/015_products_reserve_stock.sql,
-- kde UPDATE ... where stock_quantity >= v_qty dřív odmítl objednávku, když skladem
-- nebylo dost kusů.
--
-- reserve_stock teď odečítá bez podmínky na stock_quantity, takže může klesnout
-- do záporu - záporná hodnota ukazuje, o kolik kusů je poptávka vyšší než sklad
-- (kolik doobjednat, aby se sklad vrátil na 0). RAISE EXCEPTION zůstává jen pro
-- případ, že by product_id vůbec neexistoval (mělo by být vyloučeno validací
-- v create-order/route.ts před voláním RPC, ale funkce zůstává samostatně bezpečná).
--
-- release_stock beze změny - symetrická kompenzace zůstává funkční i se zápornými hodnotami.

create or replace function reserve_stock(p_items jsonb)
returns void
language plpgsql security definer set search_path = public
as $$
declare
  item jsonb;
  v_product_id uuid;
  v_qty integer;
begin
  for item in select * from jsonb_array_elements(p_items)
  loop
    v_product_id := (item->>'product_id')::uuid;
    v_qty := (item->>'qty')::integer;

    update products
    set stock_quantity = stock_quantity - v_qty
    where id = v_product_id;

    if not found then
      raise exception 'PRODUCT_NOT_FOUND:%', v_product_id;
    end if;
  end loop;
end;
$$;
grant execute on function reserve_stock(jsonb) to anon, authenticated;
