-- Bug nalezen 2026-07-22 při testování docs/sql/016: `orders` nemá pro `anon`
-- žádnou RLS policy pro UPDATE, a Supabase/PostgREST u UPDATE bez shody
-- nehází chybu - `supabase.from('orders').update(...)` pod anon klíčem
-- (src/lib/supabase.ts) prostě potichu upraví 0 řádků. `/api/stripe-webhook`
-- běží pod anon klíčem, takže nastavení `status = 'Zaplaceno'` po úspěšné
-- platbě (starý kód, existující od začátku) i nový `stock_released` flag
-- (docs/sql/016) touhle cestou nikdy reálně nezapsaly - webhook by tiše
-- neúčinkoval, jakmile se v produkci zaregistruje.
--
-- Neřešeno širokou RLS policy pro anon UPDATE na orders - to by dovolilo
-- komukoli se znalostí orderId (objevuje se v URL /dekujeme?orderId=...)
-- přepsat libovolná pole objednávky (cenu, adresu, status) přímo přes
-- Supabase REST API. Místo toho dvě úzce zaměřené SECURITY DEFINER RPC,
-- stejný vzor jako reserve_stock/release_stock/redeem_discount_code.

create or replace function mark_order_paid(p_order_id uuid)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  update orders set status = 'Zaplaceno' where id = p_order_id;
end;
$$;
grant execute on function mark_order_paid(uuid) to anon, authenticated;

create or replace function set_order_stock_released(p_order_id uuid, p_released boolean)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  update orders set stock_released = p_released where id = p_order_id;
end;
$$;
grant execute on function set_order_stock_released(uuid, boolean) to anon, authenticated;
