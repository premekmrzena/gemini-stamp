-- Bug nalezen 2026-07-27: potvrzovací email u platby kartou (stripe-webhook
-- route.ts, sendOrderConfirmationForCardPayment) chodil zákazníkovi 2-3x.
-- Stará pojistka kontrolovala `orders.status === 'Zaplaceno'`, ale status se
-- přepíná (mark_order_paid) až PO odeslání emailu. Když Stripe doručení
-- retryuje (timeout kolem 20s, řetězec iDoklad faktura + PDF + email snadno
-- trvá déle), souběžné/navazující vyvolání webhooku ještě vidí starý status
-- a email pošle znovu.
--
-- Řešení: atomický claim přes vlastní sloupec, stejný SECURITY DEFINER
-- vzor jako mark_order_paid (017) - `where confirmation_email_sent_at is
-- null` zaručí, že jen jedno souběžné volání "vyhraje" a smí email poslat.

alter table orders add column if not exists confirmation_email_sent_at timestamptz;

create or replace function claim_order_confirmation_email(p_order_id uuid)
returns boolean
language plpgsql security definer set search_path = public
as $$
declare
  claimed boolean;
begin
  update orders set confirmation_email_sent_at = now()
    where id = p_order_id and confirmation_email_sent_at is null;
  claimed := found;
  return claimed;
end;
$$;
grant execute on function claim_order_confirmation_email(uuid) to anon, authenticated;
