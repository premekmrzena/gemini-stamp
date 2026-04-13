import { NextResponse } from 'next/server';
import { resend } from '@/lib/resend';
import { OrderConfirmationEmail } from '@/components/emails/OrderConfirmationEmail';
import { render } from '@react-email/render';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Přidáváme cartItems do destrukce body
    const { email, orderId, customerName, totalPrice, cartItems } = body;

    // Kontrola základních dat
    if (!email || !orderId || !cartItems) {
      return NextResponse.json({ error: 'Chybí povinná data pro odeslání e-mailu' }, { status: 400 });
    }

    // Převedeme React komponentu na HTML text a předáme i cartItems
    const emailHtml = await render(OrderConfirmationEmail({ 
      orderId, 
      customerName, 
      totalPrice,
      cartItems 
    }));

    const { data, error } = await resend.emails.send({
      from: 'Creative Stamp <onboarding@resend.dev>',
      to: [email],
      subject: `Objednávka č. ${orderId} přijata – Creative Stamp`,
      html: emailHtml,
    });

    if (error) {
      console.error('Resend Error:', error);
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch (err: any) {
    console.error('API Error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}