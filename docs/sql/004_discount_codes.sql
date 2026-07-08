create table discount_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  type text not null check (type in ('percentage', 'fixed')),
  value numeric not null check (value > 0),
  max_uses integer check (max_uses is null or max_uses > 0),
  used_count integer not null default 0,
  valid_from timestamptz,
  valid_until timestamptz not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- anon nesmí tabulku číst/zapisovat přímo (jinak jde vypsat všechny kódy
-- přes REST), authenticated (přihlášený admin) má plný CRUD jako u products.
alter table discount_codes enable row level security;

create policy "authenticated_full_access" on discount_codes
  for all to authenticated using (true) with check (true);
-- Pro anon záměrně žádná policy => RLS vše zamítá.

-- Ověří kód, vrátí typ/hodnotu jen když je platný (bez odhalení jiných kódů)
create or replace function validate_discount_code(p_code text)
returns table (is_valid boolean, code_type text, code_value numeric, message text)
language plpgsql security definer set search_path = public
as $$
declare v_row discount_codes%rowtype;
begin
  select * into v_row from discount_codes where code = upper(trim(p_code)) limit 1;
  if not found then
    return query select false, null::text, null::numeric, 'Neplatný slevový kód';
  elsif not v_row.is_active then
    return query select false, null::text, null::numeric, 'Tento kód již není aktivní';
  elsif v_row.valid_from is not null and v_row.valid_from > now() then
    return query select false, null::text, null::numeric, 'Tento kód ještě není platný';
  elsif v_row.valid_until < now() then
    return query select false, null::text, null::numeric, 'Platnost kódu vypršela';
  elsif v_row.max_uses is not null and v_row.used_count >= v_row.max_uses then
    return query select false, null::text, null::numeric, 'Kód byl již vyčerpán';
  else
    return query select true, v_row.type, v_row.value, 'OK';
  end if;
end;
$$;
grant execute on function validate_discount_code(text) to anon, authenticated;

-- Atomicky navýší used_count, jen pokud kód v okamžiku uplatnění stále platí
-- (chrání proti souběhu u max_uses). Volá se po úspěšném insertu objednávky.
create or replace function redeem_discount_code(p_code text)
returns table (success boolean)
language plpgsql security definer set search_path = public
as $$
declare v_updated integer;
begin
  update discount_codes set used_count = used_count + 1
  where code = upper(trim(p_code)) and is_active = true
    and valid_until >= now() and (valid_from is null or valid_from <= now())
    and (max_uses is null or used_count < max_uses);
  get diagnostics v_updated = row_count;
  return query select (v_updated > 0);
end;
$$;
grant execute on function redeem_discount_code(text) to anon, authenticated;
