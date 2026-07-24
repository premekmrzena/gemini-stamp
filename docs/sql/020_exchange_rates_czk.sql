-- CZK řádek slouží k přepočtu provozních nákladů (poštovné) do EUR, viz
-- src/lib/shippingCurrency.ts - JINÝ účel než KRW/JPY/CNY/TWD (budoucí
-- zobrazovací ceny pro KO/JA/ZH mutace, viz docs/09-jazykove-mutace.md).
-- Stejná sémantika rate_to_eur ("1 EUR = X CZK"), stejná admin záložka
-- "Kurzy měn", ale vizuálně oddělené v UI ať se nepletou dohromady.
alter table exchange_rates drop constraint exchange_rates_currency_code_check;
alter table exchange_rates add constraint exchange_rates_currency_code_check
  check (currency_code in ('CZK', 'KRW', 'JPY', 'CNY', 'TWD'));

insert into exchange_rates (currency_code, rate_to_eur) values ('CZK', null)
  on conflict (currency_code) do nothing;
