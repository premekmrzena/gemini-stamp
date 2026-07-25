-- Stejný bug jako docs/sql/017 (`orders` nemá pro `anon` RLS policy pro UPDATE, přímé
-- `supabase.from('orders').update(...)` pod anon klíčem potichu upraví 0 řádků) - src/lib/idoklad.ts
-- dělal přesně tohle. SECURITY DEFINER RPC, stejný vzor jako mark_order_paid/release_stock.

create or replace function set_order_idoklad_invoice(p_order_id uuid, p_invoice_id integer, p_invoice_number text)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  update orders set idoklad_invoice_id = p_invoice_id, idoklad_invoice_number = p_invoice_number where id = p_order_id;
end;
$$;
grant execute on function set_order_idoklad_invoice(uuid, integer, text) to anon, authenticated;
