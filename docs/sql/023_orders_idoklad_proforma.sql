-- Zálohová faktura (proforma) pro platbu převodem, viz src/lib/idoklad.ts createProformaForOrder().
-- Vzniká hned při vytvoření objednávky (ne až při "Zaplaceno"), idoklad_proforma_id je
-- idempotency guard + slouží k dohledání objednávky z iDoklad webhooku (EntityId v payloadu).
alter table orders add column idoklad_proforma_id integer;

-- Stejný důvod jako set_order_idoklad_invoice (docs/sql/022) - orders nemá anon RLS UPDATE policy.
create or replace function set_order_idoklad_proforma(p_order_id uuid, p_proforma_id integer)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  update orders set idoklad_proforma_id = p_proforma_id where id = p_order_id;
end;
$$;
grant execute on function set_order_idoklad_proforma(uuid, integer) to anon, authenticated;
