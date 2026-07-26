-- Historie časových razítek stavu objednávky (audit dashboardu 2026-07-26) - admin
-- chce vidět, kdy se který stav nastavil, ne jen aktuální stav. Loguje se triggerem
-- na `orders`, ne z app kódu na jednotlivých místech (dashboard, Stripe webhook přes
-- mark_order_paid, budoucí kód) - trigger je jediné místo, které vidí VŠECHNY cesty,
-- kterými se `status` může změnit, takže historie nebude nikdy neúplná jen proto, že
-- se přidá nový call site.
--
-- Existující objednávky nebudou mít zpětnou historii (nejde ji rekonstruovat) -
-- časová osa u nich začne až první změnou stavu po spuštění téhle migrace.
create table order_status_history (
  id bigint generated always as identity primary key,
  order_id uuid not null references orders(id) on delete cascade,
  status text not null,
  changed_at timestamptz not null default now()
);

create index order_status_history_order_id_idx on order_status_history(order_id);

alter table order_status_history enable row level security;

-- Admin-only data (zobrazuje se jen v detailu objednávky v dashboardu) - anon nemá
-- žádnou policy (default deny), authenticated smí jen číst (zápis dělá výhradně trigger
-- přes SECURITY DEFINER, ne appka přímo).
create policy "order_status_history_authenticated_select" on order_status_history
  for select
  to authenticated
  using (true);

create or replace function log_order_status_change()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if (TG_OP = 'INSERT') or (OLD.status is distinct from NEW.status) then
    insert into order_status_history (order_id, status, changed_at) values (NEW.id, NEW.status, now());
  end if;
  return NEW;
end;
$$;

create trigger orders_log_status_change
after insert or update on orders
for each row execute function log_order_status_change();
