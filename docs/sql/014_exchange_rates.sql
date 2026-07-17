-- Kurzy pro přepočet mezinárodní ceny (EUR, products.price_eur/sale_price_eur)
-- do měny dané jazykové mutace. Ručně editované v adminu (záložka "Kurzy
-- měn"), žádné napojení na kurzovní API - přepočet ceny na eshopu se počítá
-- za běhu (viz src/lib/pricing.ts), do products se nic nezapisuje. Jeden
-- řádek na měnu, ne jeden konfigurační řádek - kurzy se aktualizují
-- nezávisle na sobě. rate_to_eur je zpočátku NULL, dokud admin nezadá
-- reálnou hodnotu; appka musí NULL kurz ošetřit (cenu v dané měně neukazovat).
create table exchange_rates (
  currency_code text primary key check (currency_code in ('KRW', 'JPY', 'CNY', 'TWD')),
  rate_to_eur numeric,
  updated_at timestamptz not null default now()
);

insert into exchange_rates (currency_code, rate_to_eur) values
  ('KRW', null),
  ('JPY', null),
  ('CNY', null),
  ('TWD', null);

alter table exchange_rates enable row level security;

-- Kurz není citlivá hodnota (veřejně dohledatelná), anon smí jen číst pro
-- přepočet ceny na veřejném eshopu.
create policy "exchange_rates_anon_select" on exchange_rates
  for select
  to anon
  using (true);

create policy "exchange_rates_authenticated_all" on exchange_rates
  for all
  to authenticated
  using (true)
  with check (true);
