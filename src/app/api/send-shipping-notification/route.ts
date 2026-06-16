import { NextResponse } from 'next/server';
import { sendShippingNotification } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const { email, orderId, customerName, trackingNumber } = await request.json();

    if (!email || !orderId || !trackingNumber) {
      return NextResponse.json({ error: 'Chybí povinné údaje.' }, { status: 400 });
    }

    await sendShippingNotification({ email, orderId, customerName, trackingNumber });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Chyba při odesílání notifikace o odeslání:', error);
    return NextResponse.json({ error: 'Odeslání e-mailu selhalo.' }, { status: 500 });
  }
}
