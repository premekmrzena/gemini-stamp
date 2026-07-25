-- Napojení na iDoklad API (fakturace), viz src/lib/idoklad.ts. idoklad_invoice_id je
-- potřeba pro zpětné dotahování PDF, idoklad_invoice_number jen pro zobrazení v adminu.
-- idoklad_invoice_id zároveň slouží jako idempotency guard - vytvoření faktury se
-- přeskočí, pokud už na objednávce je.
alter table orders add column idoklad_invoice_id integer;
alter table orders add column idoklad_invoice_number text;
