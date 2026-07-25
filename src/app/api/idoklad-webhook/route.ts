import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyWebhookSignature, finalizeProformaInvoice, getInvoicePdf, IdokladWebhookPayload } from '@/lib/idoklad';
import { sendPaymentReceived } from '@/lib/email';

// iDoklad zavolá tenhle endpoint, jakmile spáruje platbu se zálohovou fakturou (bankovní
// výpis, nebo ruční potvrzení přímo v iDokladu) - viz docs/05-administrace.md#5-fakturace.
// Musí být mimo pre-launch gate (src/proxy.ts), stejně jako /api/stripe-webhook.
export async function POST(request: Request) {
  const rawBody = await request.text();
  // Detail webhooku na developer.idoklad.cz uvádí "X-iDoklad-Signature-256" (s příponou -256),
  // obecná API dokumentace ale "X-idoklad-signature" (bez ní) - hlavičky jsou case-insensitive,
  // ale kontrolujeme oba tvary názvu pro jistotu, ať se na tom nic nerozbije.
  const signature = request.headers.get('x-idoklad-signature-256') || request.headers.get('x-idoklad-signature');

  if (!verifyWebhookSignature(rawBody, signature)) {
    console.error('iDoklad webhook: neplatný nebo chybějící podpis.');
    return NextResponse.json({ error: 'Neplatný podpis' }, { status: 401 });
  }

  let payload: IdokladWebhookPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Neplatné tělo požadavku' }, { status: 400 });
  }

  for (const event of payload.Events || []) {
    if (event.EventType !== 'PaymentCreated' || event.EntityType !== 'ProformaInvoice') continue;

    const proformaId = event.EntityId;

    const { data: order, error } = await supabase
      .from('orders')
      .select('id, status, billing_email, billing_first_name, total_price, currency, idoklad_invoice_id')
      .eq('idoklad_proforma_id', proformaId)
      .single();

    if (error || !order) {
      console.error(`iDoklad webhook: objednávka pro zálohovou fakturu ${proformaId} nenalezena:`, error);
      continue;
    }
    // Idempotence - stejný event může dorazit vícekrát (doporučená praxe u webhooků obecně).
    if (order.idoklad_invoice_id) continue;

    const invoice = await finalizeProformaInvoice(order.id, proformaId);
    if (!invoice) {
      console.error(`iDoklad webhook: vyúčtování zálohové faktury ${proformaId} selhalo (objednávka ${order.id}).`);
      continue;
    }

    let invoicePdf: { buffer: Buffer; filename: string } | undefined;
    try {
      const buffer = await getInvoicePdf(invoice.idokladInvoiceId);
      invoicePdf = { buffer, filename: `faktura-${invoice.idokladInvoiceNumber}.pdf` };
    } catch (err) {
      console.error('iDoklad webhook: stažení PDF pro potvrzovací email selhalo:', err);
    }

    try {
      await sendPaymentReceived({
        email: order.billing_email,
        orderId: order.id.slice(-6).toUpperCase(),
        customerName: order.billing_first_name,
        totalPrice: order.total_price,
        currency: order.currency,
        invoicePdf,
      });
    } catch (err) {
      console.error('iDoklad webhook: odeslání potvrzovacího emailu selhalo:', err);
    }
  }

  return NextResponse.json({ received: true });
}
