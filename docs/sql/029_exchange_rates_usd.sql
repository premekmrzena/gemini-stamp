-- USD řádek slouží k přepočtu celní hodnoty zásilek do USA/Portorika pro Zonos
-- Declaration ID (src/lib/zonos.ts) - JINÝ účel než KRW/JPY/CNY/TWD (budoucí
-- zobrazovací ceny pro KO/JA/ZH mutace) i než CZK (přepočet poštovného).
-- Stejná sémantika rate_to_eur ("1 EUR = X USD"), stejná admin záložka
-- "Kurzy měn", ale vizuálně oddělené v UI ať se nepletou dohromady.
alter table exchange_rates drop constraint exchange_rates_currency_code_check;
alter table exchange_rates add constraint exchange_rates_currency_code_check
  check (currency_code in ('CZK', 'USD', 'KRW', 'JPY', 'CNY', 'TWD'));

insert into exchange_rates (currency_code, rate_to_eur) values ('USD', null)
  on conflict (currency_code) do nothing;
