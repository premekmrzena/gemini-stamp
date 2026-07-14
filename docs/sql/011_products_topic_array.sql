-- products.product_topic mění se ze scalar enum na pole enum hodnot,
-- aby jeden produkt mohl patřit do víc témat zároveň (např. Umění i Známky).
alter table products
  alter column product_topic type product_topic[]
  using (case when product_topic is null then null else array[product_topic]::product_topic[] end);
