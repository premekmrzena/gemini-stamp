-- Automatické snížení skladu při vytvoření objednávky (viz docs/09-jazykove-mutace.md
-- není relevantní - jde o checkout audit, 2026-07-22). Dřív create-order jen kontroloval
-- stock_quantity, nikdy ho nesnižoval.
--
-- reserve_stock(p_items) je all-or-nothing pro celý košík v jedné transakci: UPDATE
-- s podmínkou "stock_quantity >= qty" v jednom atomickém příkazu řeší i race condition
-- (dva zákazníci klikající "Zaplatit" na poslední kus současně) - "FOR UPDATE" by
-- vyžadovalo zvlášť SELECT, tenhle UPDATE stačí sám. Když jedna položka v košíku
-- selže, RAISE EXCEPTION vrátí celou funkci (a tedy i dřívější UPDATEy v tomtéž
-- volání) zpět - objednávka se nevytvoří, žádná položka se nesníží napůl.
--
-- release_stock(p_items) je symetrická kompenzace pro vzácný případ, kdy reserve_stock
-- uspěje, ale samotný insert do orders pak přesto selže (viz src/app/api/create-order/route.ts).
--
-- Netýká se custom_stamps (vlastní razítka/archy) - jejich šablonové produkty se
-- netisknou z fyzického skladu, stock_quantity se u nich v appce vůbec nepoužívá
-- (viz vytvorit-arch/page.tsx, který čte jen is_active/price/sold_count).

create or replace function reserve_stock(p_items jsonb)
returns void
language plpgsql security definer set search_path = public
as $$
declare
  item jsonb;
  v_product_id uuid;
  v_qty integer;
  v_name text;
  v_available integer;
begin
  for item in select * from jsonb_array_elements(p_items)
  loop
    v_product_id := (item->>'product_id')::uuid;
    v_qty := (item->>'qty')::integer;

    update products
    set stock_quantity = stock_quantity - v_qty
    where id = v_product_id and stock_quantity >= v_qty
    returning name, stock_quantity into v_name, v_available;

    if not found then
      select name, stock_quantity into v_name, v_available from products where id = v_product_id;
      raise exception 'INSUFFICIENT_STOCK:%:%:%',
        coalesce(v_name, v_product_id::text), coalesce(v_available, 0), v_qty;
    end if;
  end loop;
end;
$$;
grant execute on function reserve_stock(jsonb) to anon, authenticated;

create or replace function release_stock(p_items jsonb)
returns void
language plpgsql security definer set search_path = public
as $$
declare
  item jsonb;
begin
  for item in select * from jsonb_array_elements(p_items)
  loop
    update products
    set stock_quantity = stock_quantity + (item->>'qty')::integer
    where id = (item->>'product_id')::uuid;
  end loop;
end;
$$;
grant execute on function release_stock(jsonb) to anon, authenticated;
