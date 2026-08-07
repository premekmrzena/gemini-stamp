import { createHmac, timingSafeEqual } from 'crypto';
import { supabase } from '@/lib/supabase';
import { COUNTRY_SHIPPING_INFO } from '@/lib/constants';
import { getVariableSymbol } from '@/lib/czechQrPayment';
import { CartItemSnapshot } from '@/types/database';

// iDoklad API v3 (fakturace). OAuth2 client_credentials - viz docs/05-administrace.md#5-fakturace.
// Účet je neplátce DPH (VatRegime = 0/NonVatRegime se řídí nastavením účtu, ne tím, co pošleme
// v Items), proto všechny položky jedou s VatRateType Zero / bez DPH členění (viz šablona z
// IssuedInvoices/Default níž).
const IDENTITY_TOKEN_URL = 'https://identity.idoklad.cz/server/v2/connect/token';
const API_BASE = 'https://api.idoklad.cz/v3';

const CURRENCY_IDS: Record<string, number> = { CZK: 1, EUR: 2 };

type IdokladItem = {
  Amount: number;
  Code: string;
  DiscountName: string;
  DiscountPercentage: number;
  InvoiceProformaId: number | null;
  IsTaxMovement: boolean;
  ItemType: number;
  Name: string;
  PriceListItemId: number | null;
  PriceType: number;
  Unit: string;
  UnitPrice: number;
  VatCodeId: number | null;
  VatRate: number;
  VatRateType: number;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type OrderRow = any;

async function getAccessToken(): Promise<string> {
  const params = new URLSearchParams({
    grant_type: 'client_credentials',
    application_id: process.env.IDOKLAD_APPLICATION_ID!,
    client_id: process.env.IDOKLAD_CLIENT_ID!,
    client_secret: process.env.IDOKLAD_CLIENT_SECRET!,
    scope: 'idoklad_api',
  });

  const res = await fetch(IDENTITY_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  if (!res.ok) {
    throw new Error(`iDoklad: získání access tokenu selhalo (${res.status}): ${await res.text()}`);
  }

  const data = await res.json();
  return data.access_token as string;
}

async function idokladFetch(token: string, path: string, init?: RequestInit): Promise<Response> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });

  if (!res.ok) {
    throw new Error(`iDoklad ${path} selhalo (${res.status}): ${await res.text()}`);
  }

  return res;
}

// Cache seznamu zemí drží jen po dobu života serverless instance (cold start ho smaže) -
// seznam zemí se prakticky nemění, netřeba řešit invalidaci.
let countryIdCache: Map<string, number> | null = null;

async function getCountryId(token: string, billingCountry: string): Promise<number | null> {
  const iso2 = billingCountry === 'Česká republika' ? 'CZ' : COUNTRY_SHIPPING_INFO[billingCountry]?.iso2;
  if (!iso2) return null;

  if (!countryIdCache) {
    const res = await idokladFetch(token, '/Countries?pageSize=300');
    const json = await res.json();
    countryIdCache = new Map((json.Data.Items as { Code: string; Id: number }[]).map((c) => [c.Code, c.Id]));
  }

  return countryIdCache.get(iso2) ?? null;
}

type ContactInput = {
  companyName: string;
  firstName: string;
  surname: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  postalCode: string;
  countryId: number | null;
  identificationNumber?: string;
  vatIdentificationNumber?: string;
};

// Dedup podle IČO u firem (spolehlivější než název), podle e-mailu u fyzických osob (ty
// IČO nemají). Když kontakt existuje, přepíšeme ho aktuálními údaji z objednávky -
// jinak by faktura brala starou adresu uloženou z dřívější objednávky, ne tu aktuální
// (živě zjištěno 2026-08-07 - opakovaná objednávka se stejným e-mailem, jinou adresou).
async function findOrCreateContact(token: string, input: ContactInput): Promise<number> {
  const filterField = input.identificationNumber ? 'IdentificationNumber' : 'Email';
  const filterValue = input.identificationNumber || input.email;

  const payload = {
    CompanyName: input.companyName,
    Firstname: input.firstName,
    Surname: input.surname,
    Email: input.email,
    Phone: input.phone,
    Street: input.street,
    City: input.city,
    PostalCode: input.postalCode,
    CountryId: input.countryId,
    IdentificationNumber: input.identificationNumber || '',
    VatIdentificationNumber: input.vatIdentificationNumber || '',
  };

  // Pozor: hodnota se NESMÍ obalovat uvozovkami (~eq~'x') navzdory příkladu v dokumentaci -
  // živě ověřeno, s uvozovkami filtr vždy vrátí 0 výsledků, bez nich funguje správně.
  const searchRes = await idokladFetch(token, `/Contacts?filter=(${filterField}~eq~${encodeURIComponent(filterValue)})`);
  const searchJson = await searchRes.json();
  const existing = searchJson.Data?.Items?.[0];

  if (existing) {
    // Pozor: update jede přes PATCH na kolekci /Contacts (s Id v těle), NE PUT/PATCH na
    // /Contacts/{id} - obojí vrací 405 UnsupportedApiVersion, živě ověřeno 2026-08-07.
    await idokladFetch(token, '/Contacts', {
      method: 'PATCH',
      body: JSON.stringify({ Id: existing.Id, ...payload }),
    });
    return existing.Id as number;
  }

  const createRes = await idokladFetch(token, '/Contacts', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  const createJson = await createRes.json();
  return createJson.Data.Id as number;
}

async function resolveContactId(token: string, order: OrderRow): Promise<number> {
  const countryId = await getCountryId(token, order.billing_country);
  const isCompany = Boolean(order.billing_company_name);
  return findOrCreateContact(token, {
    companyName: isCompany ? order.billing_company_name : `${order.billing_first_name} ${order.billing_last_name}`,
    firstName: order.billing_first_name || '',
    surname: order.billing_last_name || '',
    email: order.billing_email || '',
    phone: order.billing_phone || '',
    street: order.billing_address_line1 || '',
    city: order.billing_city || '',
    postalCode: order.billing_zip || '',
    countryId,
    identificationNumber: isCompany ? order.billing_company_id || undefined : undefined,
    vatIdentificationNumber: isCompany ? order.billing_company_tax_id || undefined : undefined,
  });
}

// Položky faktury/zálohové faktury jsou stejné pro oba typy dokladu - cart_items + samostatná
// řádka za dopravu/platbu (pokud > 0) + záporná řádka slevy (pokud byl použit slevový kód).
function buildInvoiceItems(order: OrderRow, itemTemplate: IdokladItem): IdokladItem[] {
  const cartItems: IdokladItem[] = (order.cart_items as CartItemSnapshot[]).map((item) => ({
    ...itemTemplate,
    Name: item.name,
    Amount: item.quantity,
    UnitPrice: item.price,
    Unit: 'ks',
  }));

  const extraItems: IdokladItem[] = [];
  if (order.shipping_cost > 0) {
    extraItems.push({ ...itemTemplate, Name: `Doprava: ${order.shipping_method}`, Amount: 1, UnitPrice: order.shipping_cost });
  }
  if (order.payment_cost > 0) {
    extraItems.push({ ...itemTemplate, Name: `Platba: ${order.payment_method}`, Amount: 1, UnitPrice: order.payment_cost });
  }
  if (order.discount_amount > 0) {
    const label = order.discount_code ? `Sleva (${order.discount_code})` : 'Sleva';
    extraItems.push({ ...itemTemplate, Name: label, Amount: 1, UnitPrice: -order.discount_amount });
  }

  return [...cartItems, ...extraItems];
}

function shortOrderId(orderId: string): string {
  return orderId.slice(-8).toUpperCase();
}

// Hlavní vstupní bod pro PŘÍMÉ vystavení faktury (bez zálohové faktury) - dnes jen platba
// kartou (viz stripe-webhook.ts) a ruční admin záloha (create-idoklad-invoice/route.ts,
// notify-order-status/route.ts pro objednávky bez zálohové faktury). Platba převodem jde
// přes createProformaForOrder() + accountProformaInvoice(), ne přes tuhle funkci.
// idoklad_invoice_id na objednávce slouží jako idempotency guard.
export type IdokladInvoiceInfo = { idokladInvoiceId: number; idokladInvoiceNumber: string };

export async function createInvoiceForOrder(
  orderId: string,
  options: { markAsPaid: boolean; paymentOptionId?: number }
): Promise<IdokladInvoiceInfo | null> {
  const { data: order, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (error || !order) {
    console.error('iDoklad: objednávka pro vytvoření faktury nenalezena:', orderId, error);
    return null;
  }
  if (order.idoklad_invoice_id) {
    return { idokladInvoiceId: order.idoklad_invoice_id, idokladInvoiceNumber: order.idoklad_invoice_number };
  }

  try {
    const token = await getAccessToken();
    const contactId = await resolveContactId(token, order);

    const defaultsRes = await idokladFetch(token, '/IssuedInvoices/Default');
    const defaults = (await defaultsRes.json()).Data;
    const itemTemplate = defaults.Items[0] as IdokladItem;

    // Kurz jen orientační (aktuální k okamžiku vystavení faktury, ne k okamžiku objednávky -
    // appka historický kurz na objednávce neukládá) - u neplátce DPH jde jen o interní
    // přepočet do domácí měny pro účetní statistiky iDokladu, ne o daňově závaznou hodnotu.
    let exchangeRate = 1;
    if (order.currency === 'EUR') {
      const { data: rateRow } = await supabase
        .from('exchange_rates')
        .select('rate_to_eur')
        .eq('currency_code', 'CZK')
        .single();
      if (rateRow?.rate_to_eur) exchangeRate = rateRow.rate_to_eur;
    }

    const shortId = shortOrderId(order.id as string);

    const payload = {
      ...defaults,
      Id: undefined,
      PartnerId: contactId,
      CurrencyId: CURRENCY_IDS[order.currency] ?? 1,
      ExchangeRate: exchangeRate,
      ExchangeRateAmount: 1,
      ReportLanguage: order.currency === 'EUR' ? 3 : 1,
      Description: `Objednávka č. ${shortId}`,
      OrderNumber: shortId,
      PaymentOptionId: options.paymentOptionId ?? defaults.PaymentOptionId,
      Items: buildInvoiceItems(order, itemTemplate),
    };

    const createRes = await idokladFetch(token, '/IssuedInvoices', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const created = (await createRes.json()).Data;

    if (options.markAsPaid) {
      try {
        await idokladFetch(token, `/IssuedDocumentPayments/FullyPay/${created.Id}?dateOfPayment=${payload.DateOfIssue}`, { method: 'PUT' });
      } catch (err) {
        console.error(`iDoklad: označení faktury ${created.Id} jako uhrazené selhalo:`, err);
      }
    }

    await saveInvoiceInfo(orderId, created.Id, created.DocumentNumber);
    return { idokladInvoiceId: created.Id, idokladInvoiceNumber: created.DocumentNumber };
  } catch (err) {
    console.error(`iDoklad: vytvoření faktury pro objednávku ${orderId} selhalo:`, err);
    return null;
  }
}

// Přímý .update() by pod anon klíčem potichu upravil 0 řádků (orders nemá anon RLS UPDATE
// policy, viz docs/sql/017) - stejný bug se stejným řešením, RPC SECURITY DEFINER
// (docs/sql/022_orders_set_idoklad_invoice.sql).
async function saveInvoiceInfo(orderId: string, invoiceId: number, invoiceNumber: string): Promise<void> {
  const { error } = await supabase.rpc('set_order_idoklad_invoice', {
    p_order_id: orderId,
    p_invoice_id: invoiceId,
    p_invoice_number: invoiceNumber,
  });
  if (error) console.error(`iDoklad: uložení idoklad_invoice_id na objednávku ${orderId} selhalo:`, error);
}

// Pro admin "Stáhnout PDF" odkaz - iDoklad je zdrojem pravdy pro PDF, appka si ho neukládá
// (žádné duplicitní úložiště, vždy aktuální stav dokladu). Pozor: endpoint i přes "/Pdf"
// v cestě nevrací binárku, ale stejnou {Data, ErrorCode, ...} obálku jako zbytek v3 API,
// s PDF obsahem base64 v poli Data (ověřeno živě, Accept: application/pdf dá jen 406).
export async function getInvoicePdf(idokladInvoiceId: number): Promise<Buffer> {
  const token = await getAccessToken();
  const res = await idokladFetch(token, `/Reports/IssuedInvoice/${idokladInvoiceId}/Pdf`);
  const json = await res.json();
  return Buffer.from(json.Data as string, 'base64');
}

// --- Zálohová faktura (proforma) pro platbu převodem ---
//
// Architektura (rozhodnuto 2026-07-25 po konzultaci s uživatelem): platba převodem JDE
// spárovat se skutečnou příchozí platbou přes variabilní symbol (na rozdíl od platby kartou,
// kde Stripe posílá výplaty do banky dávkově a spárování 1:1 není možné). Proto se zálohová
// faktura vystaví HNED při vytvoření objednávky (ne až při "Zaplaceno") s variabilním symbolem
// shodným s tím na QR platbě/v e-mailu. Jakmile iDoklad platbu spáruje (bankovní účet Air Bank,
// zatím nenapojeno, nebo ručně v iDokladu), přijde webhook PaymentCreated/ProformaInvoice
// (viz /api/idoklad-webhook), který zálohovou fakturu "vyúčtuje" (accountProformaInvoice) -
// tím vznikne finální daňový doklad a objednávka se automaticky přepne na "Zaplaceno".

export type IdokladProformaInfo = { idokladProformaId: number; variableSymbol: string };

export async function createProformaForOrder(orderId: string): Promise<IdokladProformaInfo | null> {
  const { data: order, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (error || !order) {
    console.error('iDoklad: objednávka pro vytvoření zálohové faktury nenalezena:', orderId, error);
    return null;
  }
  if (order.idoklad_proforma_id) {
    return { idokladProformaId: order.idoklad_proforma_id, variableSymbol: getVariableSymbol(orderId) };
  }
  if (order.idoklad_invoice_id) return null;

  try {
    const token = await getAccessToken();
    const contactId = await resolveContactId(token, order);

    const defaultsRes = await idokladFetch(token, '/ProformaInvoices/Default');
    const defaults = (await defaultsRes.json()).Data;
    const itemTemplate = defaults.Items[0] as IdokladItem;

    const shortId = shortOrderId(order.id as string);
    const variableSymbol = getVariableSymbol(order.id as string);

    const payload = {
      ...defaults,
      Id: undefined,
      PartnerId: contactId,
      CurrencyId: CURRENCY_IDS[order.currency] ?? 1,
      // Bankovní převod je jen pro CZK objednávky (žádný EUR bankovní účet, viz create-order),
      // takže tu na rozdíl od createInvoiceForOrder není potřeba řešit kurz.
      ReportLanguage: 1,
      Description: `Objednávka č. ${shortId}`,
      OrderNumber: shortId,
      VariableSymbol: variableSymbol,
      Items: buildInvoiceItems(order, itemTemplate),
    };

    const createRes = await idokladFetch(token, '/ProformaInvoices', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const created = (await createRes.json()).Data;

    const { error: saveError } = await supabase.rpc('set_order_idoklad_proforma', {
      p_order_id: orderId,
      p_proforma_id: created.Id,
    });
    if (saveError) console.error(`iDoklad: uložení idoklad_proforma_id na objednávku ${orderId} selhalo:`, saveError);

    return { idokladProformaId: created.Id, variableSymbol };
  } catch (err) {
    console.error(`iDoklad: vytvoření zálohové faktury pro objednávku ${orderId} selhalo:`, err);
    return null;
  }
}

export async function getProformaPdf(idokladProformaId: number): Promise<Buffer> {
  const token = await getAccessToken();
  const res = await idokladFetch(token, `/Reports/ProformaInvoice/${idokladProformaId}/Pdf`);
  const json = await res.json();
  return Buffer.from(json.Data as string, 'base64');
}

// Vyúčtuje uhrazenou zálohovou fakturu - iDoklad z ní sám sestaví finální daňový doklad
// (Faktura musí být v iDokladu už označená jako uhrazená, jinak endpoint vrátí chybu).
// Volá se z webhooku (viz /api/idoklad-webhook) i z admin ručního fallbacku.
export async function accountProformaInvoice(idokladProformaId: number): Promise<IdokladInvoiceInfo | null> {
  try {
    const token = await getAccessToken();
    const res = await idokladFetch(token, `/ProformaInvoices/${idokladProformaId}/Account`, { method: 'PUT' });
    const created = (await res.json()).Data;
    return { idokladInvoiceId: created.Id, idokladInvoiceNumber: created.DocumentNumber };
  } catch (err) {
    console.error(`iDoklad: vyúčtování zálohové faktury ${idokladProformaId} selhalo:`, err);
    return null;
  }
}

// Ruční admin fallback (Zaplaceno kliknuté dřív, než iDoklad platbu sám spáruje/webhook
// dorazí) - označí zálohovou fakturu jako uhrazenou přímo, aby šlo hned zavolat Account výš.
export async function markProformaPaid(idokladProformaId: number, amount: number, dateOfPayment: string): Promise<boolean> {
  try {
    const token = await getAccessToken();
    await idokladFetch(token, '/IssuedDocumentPayments', {
      method: 'POST',
      body: JSON.stringify({
        InvoiceId: idokladProformaId,
        PaymentAmount: amount,
        // PaymentOptionId je API vyžadované navzdory dokumentaci (optional: true) - ověřeno
        // živě, bez něj vrátí 400. Zálohové faktury jsou u nás vždy jen bankovní převod.
        PaymentOptionId: 1,
        DateOfPayment: dateOfPayment,
        SendPaymentConfirmation: false,
        CreateIssuedTaxDocument: false,
      }),
    });
    return true;
  } catch (err) {
    console.error(`iDoklad: označení zálohové faktury ${idokladProformaId} jako uhrazené selhalo:`, err);
    return false;
  }
}

// Vyúčtuje zálohovou fakturu (musí už být uhrazená) a výsledek (Id/číslo finální faktury,
// stav objednávky) rovnou zapíše - společný krok pro webhook i admin ruční fallback.
export async function finalizeProformaInvoice(orderId: string, idokladProformaId: number): Promise<IdokladInvoiceInfo | null> {
  const invoice = await accountProformaInvoice(idokladProformaId);
  if (!invoice) return null;

  await saveInvoiceInfo(orderId, invoice.idokladInvoiceId, invoice.idokladInvoiceNumber);

  const { error } = await supabase.rpc('mark_order_paid', { p_order_id: orderId });
  if (error) console.error(`iDoklad: nastavení stavu Zaplaceno po vyúčtování zálohové faktury selhalo (objednávka ${orderId}):`, error);

  return invoice;
}

// Kompletní vyřízení jednou akcí pro admin ruční fallback (Zaplaceno bez čekání na webhook) -
// označí zálohovou fakturu jako uhrazenou a rovnou ji vyúčtuje na finální fakturu.
export async function payAndFinalizeProforma(orderId: string, idokladProformaId: number, amount: number): Promise<IdokladInvoiceInfo | null> {
  const today = new Date().toISOString().slice(0, 10);
  const paid = await markProformaPaid(idokladProformaId, amount, today);
  if (!paid) return null;
  return finalizeProformaInvoice(orderId, idokladProformaId);
}

// Ověření HMAC-SHA256 podpisu webhooku (hlavička X-idoklad-signature: sha256=<hex>),
// podle docs (#webhooks_signature) - secret je nastavený při registraci webhooku na
// developer.idoklad.cz, appka ho drží v IDOKLAD_WEBHOOK_SECRET. timingSafeEqual proti
// timing útoku (Buffer.compare/=== by unikaly informaci o tom, kde se hash liší).
export function verifyWebhookSignature(rawBody: string, signatureHeader: string | null): boolean {
  const secret = process.env.IDOKLAD_WEBHOOK_SECRET;
  if (!secret || !signatureHeader) return false;

  const expected = `sha256=${createHmac('sha256', secret).update(rawBody, 'utf8').digest('hex')}`;
  const expectedBuf = Buffer.from(expected);
  const receivedBuf = Buffer.from(signatureHeader);

  return expectedBuf.length === receivedBuf.length && timingSafeEqual(expectedBuf, receivedBuf);
}

export type IdokladWebhookEvent = {
  AgendaId: number;
  EntityId: number;
  EntityType: string;
  EventDate: string;
  EventType: string;
};

export type IdokladWebhookPayload = {
  DeliveryId: string;
  Events: IdokladWebhookEvent[];
};
