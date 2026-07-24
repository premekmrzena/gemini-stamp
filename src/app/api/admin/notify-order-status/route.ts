import { NextResponse } from 'next/server';
import { sendPaymentReceived, sendReadyForPickup, sendOrderCancelled, sendRefunded } from '@/lib/email';
import { OrderStatus } from '@/types/database';

// Admin už má objednávku načtenou client-side (přihlášený, authenticated role) - stejný vzor
// jako existující /api/send-shipping-notification, žádné další čtení z DB tu není potřeba.
type NotifyOrderStatusBody = {
  newStatus: OrderStatus;
  email: string;
  orderId: string;
  customerName: string;
  totalPrice: number;
};

export async function POST(request: Request) {
  try {
    const { newStatus, email, orderId, customerName, totalPrice } = (await request.json()) as NotifyOrderStatusBody;

    if (!email || !orderId) {
      return NextResponse.json({ error: 'Chybí povinné údaje.' }, { status: 400 });
    }

    switch (newStatus) {
      case 'Zaplaceno':
        await sendPaymentReceived({ email, orderId, customerName, totalPrice });
        break;
      case 'K vyzvednutí':
        await sendReadyForPickup({ email, orderId, customerName });
        break;
      case 'Zrušeno':
        await sendOrderCancelled({ email, orderId, customerName });
        break;
      case 'Vráceny peníze':
        await sendRefunded({ email, orderId, customerName, refundAmount: totalPrice });
        break;
      default:
        // Ostatní stavy nemají mapovaný email - no-op, ne chyba.
        break;
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Chyba při odesílání notifikace o změně stavu objednávky:', error);
    return NextResponse.json({ error: 'Odeslání e-mailu selhalo.' }, { status: 500 });
  }
}
