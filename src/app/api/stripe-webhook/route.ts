import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-02-25.clover' as any,
});

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Chybí Stripe podpis' }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET není nastaven');
    return NextResponse.json({ error: 'Webhook secret není nakonfigurován' }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Neplatný Stripe podpis:', err);
    return NextResponse.json({ error: 'Neplatný webhook podpis' }, { status: 400 });
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const orderId = paymentIntent.metadata?.orderId;

    if (orderId) {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'Zaplacena' })
        .eq('id', orderId);

      if (error) {
        console.error('Chyba při aktualizaci statusu objednávky:', error);
        return NextResponse.json({ error: 'DB error' }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
