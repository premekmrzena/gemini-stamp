-- Sledovací číslo zásilky, vyplňuje admin v dashboardu při odeslání objednávky
alter table orders
  add column tracking_number text;
