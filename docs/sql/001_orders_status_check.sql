-- Vynutí, aby orders.status obsahoval jen platné hodnoty definované v src/types/database.ts (OrderStatus)
alter table orders
  add constraint orders_status_check
  check (status in (
    'Nová', 'Připravujeme', 'Zaplaceno', 'Odesláno', 'K vyzvednutí',
    'Doručeno', 'Vyzvednuto', 'Zrušeno', 'Vráceno', 'Vráceny peníze',
    'Ztracená zásilka', 'Reklamace', 'Uzavřeno'
  ));

-- Každý vlastní arch (custom_stamps) musí mít přiřazený produkt/šablonu
alter table custom_stamps
  alter column product_id set not null;
