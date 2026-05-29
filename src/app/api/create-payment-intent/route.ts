import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-02-25.clover' as any,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId } = body;

    if (!orderId || typeof orderId !== 'string') {
      return NextResponse.json({ error: 'Chybí ID objednávky' }, { status: 400 });
    }

    // Fetch the real amount from the order — never trust client-provided amount
    const { data: order, error } = await supabase
      .from('orders')
      .select('id, total_price')
      .eq('id', orderId)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: 'Objednávka nenalezena' }, { status: 404 });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.total_price * 100),
      currency: 'czk',
      automatic_payment_methods: { enabled: true },
      metadata: { orderId: order.id },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Interní chyba serveru';
    console.error('Chyba při komunikaci se Stripe:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
