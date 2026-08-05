import { NextResponse } from 'next/server';
import {
  sendPaymentReceived,
  sendReadyForPickup,
  sendOrderCancelled,
  sendRefunded,
  sendAwaitingPayment,
  sendOrderPreparing,
  sendOrderDelivered,
  sendOrderPickedUp,
  sendOrderReturned,
  sendShipmentLost,
  sendComplaintRegistered,
  sendOrderClosed,
} from '@/lib/email';
import { createInvoiceForOrder, getInvoicePdf, payAndFinalizeProforma, IdokladInvoiceInfo } from '@/lib/idoklad';
import { OrderStatus, Currency } from '@/types/database';

// Admin už má objednávku načtenou client-side (přihlášený, authenticated role) - stejný vzor
// jako existující /api/send-shipping-notification, žádné další čtení z DB tu není potřeba.
// fullOrderId (skutečné DB id, ne zkrácené zobrazovací orderId) a idokladProformaId jsou
// potřeba jen pro iDoklad u "Zaplaceno" - zbytek objednávky si idoklad.ts dotáhne sám.
type NotifyOrderStatusBody = {
  newStatus: OrderStatus;
  email: string;
  orderId: string;
  fullOrderId: string;
  idokladProformaId: number | null;
  customerName: string;
  totalPrice: number;
  currency: Currency;
};

export async function POST(request: Request) {
  try {
    const { newStatus, email, orderId, fullOrderId, idokladProformaId, customerName, totalPrice, currency } = (await request.json()) as NotifyOrderStatusBody;

    if (!email || !orderId) {
      return NextResponse.json({ error: 'Chybí povinné údaje.' }, { status: 400 });
    }

    switch (newStatus) {
      case 'Zaplaceno': {
        // Faktura musí vzniknout PŘED emailem, aby ho šlo rovnou přiložit jako PDF. Ruční
        // fallback pro platbu převodem (normálně to zařídí webhook z /api/idoklad-webhook,
        // jakmile iDoklad platbu spáruje) - admin tu potvrzuje, že platba fakticky dorazila,
        // takže zálohovou fakturu (pokud existuje) rovnou označíme uhrazenou a vyúčtujeme.
        // Platba kartou má fakturu už z stripe-webhook.ts (jde do Zaplaceno jen tudy) -
        // idempotency guard v createInvoiceForOrder/finalizeProformaInvoice i tak ochrání
        // před duplicitou.
        let invoice: IdokladInvoiceInfo | null = null;
        if (fullOrderId) {
          invoice = idokladProformaId
            ? await payAndFinalizeProforma(fullOrderId, idokladProformaId, totalPrice)
            : await createInvoiceForOrder(fullOrderId, { markAsPaid: true, paymentOptionId: 1 });
        }

        let invoicePdf: { buffer: Buffer; filename: string } | undefined;
        if (invoice) {
          try {
            const buffer = await getInvoicePdf(invoice.idokladInvoiceId);
            invoicePdf = { buffer, filename: `faktura-${invoice.idokladInvoiceNumber}.pdf` };
          } catch (err) {
            console.error('Chyba při stahování iDoklad PDF pro potvrzovací email:', err);
          }
        }
        await sendPaymentReceived({ email, orderId, customerName, totalPrice, currency, invoicePdf });
        break;
      }
      case 'K vyzvednutí':
        await sendReadyForPickup({ email, orderId, customerName });
        break;
      case 'Zrušeno':
        await sendOrderCancelled({ email, orderId, customerName });
        break;
      case 'Vráceny peníze':
        await sendRefunded({ email, orderId, customerName, refundAmount: totalPrice, currency });
        break;
      case 'Čekáme na platbu':
        await sendAwaitingPayment({ email, orderId, customerName, totalPrice, currency });
        break;
      case 'Připravujeme':
        await sendOrderPreparing({ email, orderId, customerName });
        break;
      case 'Doručeno':
        await sendOrderDelivered({ email, orderId, customerName });
        break;
      case 'Vyzvednuto':
        await sendOrderPickedUp({ email, orderId, customerName });
        break;
      case 'Vráceno':
        await sendOrderReturned({ email, orderId, customerName });
        break;
      case 'Ztracená zásilka':
        await sendShipmentLost({ email, orderId, customerName });
        break;
      case 'Reklamace':
        await sendComplaintRegistered({ email, orderId, customerName });
        break;
      case 'Uzavřeno':
        await sendOrderClosed({ email, orderId, customerName });
        break;
      default:
        // 'Nová' a 'Odesláno' nemají mapovaný email tady - Nová řeší create-order/Stripe
        // webhook, Odesláno má vlastní tok se sledovacím číslem (ShipmentModal, viz
        // /api/send-shipping-notification). Ne chyba, no-op.
        break;
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Chyba při odesílání notifikace o změně stavu objednávky:', error);
    return NextResponse.json({ error: 'Odeslání e-mailu selhalo.' }, { status: 500 });
  }
}
