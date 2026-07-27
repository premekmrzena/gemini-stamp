-- Bug nalezen 2026-07-27: admin dashboard (page.tsx) neumí přepnout status
-- objednávky ani doplnit tracking_number - `supabase.from('orders').update(...)`
-- pod authenticated session vrací PATCH .../orders 405 (Method Not Allowed).
--
-- Na rozdíl od dřívějšího anon bugu (017: anon UPDATE grant měl, ale chyběla mu
-- RLS policy, takže update tiše upravil 0 řádků bez chyby) tohle je o úroveň
-- níž - `authenticated` roli chybí samotný UPDATE grant na tabulce, takže
-- PostgREST PATCH metodu pro tuhle tabulku/roli vůbec nenabízí (405 dřív, než
-- se vůbec dostane k vyhodnocení RLS). Žádná dosavadní migrace v docs/sql
-- tohle nikdy explicitně nenastavila, přestože docs/03-databaze.md:79
-- předpokládal "authenticated má plný CRUD".
--
-- authenticated = přihlášený admin (Supabase Auth login v dashboardu), ne
-- veřejná role - široká UPDATE policy tady nehrozí zneužitím přes URL jako
-- u anon (proto tam byly úzké SECURITY DEFINER RPC), takže přímý grant + policy.

grant update on orders to authenticated;

drop policy if exists "orders_authenticated_update" on orders;
create policy "orders_authenticated_update" on orders
  for update
  to authenticated
  using (true)
  with check (true);
