import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';
import { sendOrderConfirmation } from '@/lib/email';
import { CartItemSnapshot } from '@/types/database';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-02-25.clover',
});

// Vrátí rezervovaný sklad zpět, když platba u dané objednávky nevyjde
// (zamítnutá karta, přerušené 3D Secure, vypršelý/zrušený PaymentIntent).
// `stock_released` na objednávce je pojistka proti dvojímu vrácení - Stripe
// umí payment_intent.payment_failed poslat víckrát za sebou (zákazník zkusí
// kartu znovu ve stejném platebním modalu), bez pojistky by se sklad
// nafoukl nad realitu.
async function releaseStockForFailedOrder(orderId: string): Promise<boolean> {
  const { data: order, error } = await supabase
    .from('orders')
    .select('id, status, cart_items, stock_released')
    .eq('id', orderId)
    .single();

  if (error) {
    console.error('Chyba při načítání objednávky pro vrácení skladu:', error);
    return false;
  }
  if (!order || order.stock_released || order.status === 'Zaplaceno') {
    return true;
  }

  const items = (order.cart_items as CartItemSnapshot[])
    .filter((item) => item.item_type === 'product')
    .map((item) => ({ product_id: item.id, qty: item.quantity }));

  if (items.length > 0) {
    const { error: releaseError } = await supabase.rpc('release_stock', { p_items: items });
    if (releaseError) {
      console.error('Chyba při vracení skladu po neúspěšné platbě:', releaseError);
      return false;
    }
  }

  const { error: updateError } = await supabase.rpc('set_order_stock_released', { p_order_id: orderId, p_released: true });
  if (updateError) {
    console.error('Chyba při označení stock_released:', updateError);
    return false;
  }
  return true;
}

// Stripe umí po neúspěšném pokusu (zamítnutá karta) nabídnout retry na tom
// samém PaymentIntentu ve stejném platebním modalu (StripePaymentForm drží
// jeden clientSecret po celou dobu, viz useEffect na orderId). Pokud tenhle
// retry uspěje PO TOM, co payment_intent.payment_failed už vrátil sklad,
// je potřeba ho znovu zarezervovat - jinak zůstane skutečný prodej v DB
// bez odečteného skladu.
async function reserveStockAfterRecoveredPayment(orderId: string) {
  const { data: order, error } = await supabase
    .from('orders')
    .select('id, cart_items, stock_released')
    .eq('id', orderId)
    .single();

  if (error || !order || !order.stock_released) return;

  const items = (order.cart_items as CartItemSnapshot[])
    .filter((item) => item.item_type === 'product')
    .map((item) => ({ product_id: item.id, qty: item.quantity }));

  if (items.length > 0) {
    const { error: reserveError } = await supabase.rpc('reserve_stock', { p_items: items });
    if (reserveError) {
      // Platba už proběhla (nejde vrátit přes webhook) a mezitím se poslední
      // kus prodal jinam - sklad zůstane neopravený, potřeba ruční zásah v adminu.
      console.error(`Objednávka ${orderId}: platba prošla po dřívějším vrácení skladu, ale re-rezervace selhala (patrně vyprodáno mezitím):`, reserveError);
      return;
    }
  }

  const { error: updateError } = await supabase.rpc('set_order_stock_released', { p_order_id: orderId, p_released: false });
  if (updateError) console.error('Chyba při resetu stock_released po úspěšné platbě:', updateError);
}

// Potvrzovací email u platby kartou se záměrně neposílá hned při vytvoření objednávky
// (viz create-order/route.ts) - dřív by ho zákazník dostal i u zamítnuté/nedokončené platby.
// Tohle je jeho jediné odeslání pro platbu kartou, proto plnohodnotné (položky, částka),
// ne jen obecná "Zaplaceno" notifikace jako u ručního potvrzení platby převodem v adminu.
// Volá se PŘED mark_order_paid, aby šlo poznat stav před tranzicí - Stripe umí stejný
// payment_intent.succeeded event doručit vícekrát, bez týhle pojistky by se email zdvojil.
async function sendOrderConfirmationForCardPayment(orderId: string) {
  const { data: order, error } = await supabase
    .from('orders')
    .select('id, status, billing_email, billing_first_name, total_price, cart_items')
    .eq('id', orderId)
    .single();

  if (error || !order) {
    console.error('Chyba při načítání objednávky pro potvrzovací email:', error);
    return;
  }

  if (order.status === 'Zaplaceno') return;

  try {
    await sendOrderConfirmation({
      email: order.billing_email,
      orderId: order.id.slice(-8).toUpperCase(),
      customerName: order.billing_first_name,
      totalPrice: order.total_price,
      cartItems: order.cart_items as CartItemSnapshot[],
      isBankTransfer: false,
    });
  } catch (err) {
    console.error('Chyba při odesílání potvrzovacího emailu po platbě kartou:', err);
  }
}

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
      await sendOrderConfirmationForCardPayment(orderId);

      const { error } = await supabase.rpc('mark_order_paid', { p_order_id: orderId });

      if (error) {
        console.error('Chyba při aktualizaci statusu objednávky:', error);
        return NextResponse.json({ error: 'DB error' }, { status: 500 });
      }

      await reserveStockAfterRecoveredPayment(orderId);
    }
  }

  // payment_failed: zamítnutá karta / selhané 3D Secure. canceled: PaymentIntent
  // explicitně zrušen nebo vypršel nepotvrzený. V obou případech se platba
  // nedokončí (v aktuální podobě, byť stejný PaymentIntent lze v tom samém
  // platebním modalu ještě zkusit znovu - proto se sklad vrací per-orderId
  // idempotentně, ne natvrdo).
  if (event.type === 'payment_intent.payment_failed' || event.type === 'payment_intent.canceled') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const orderId = paymentIntent.metadata?.orderId;

    if (orderId) {
      const released = await releaseStockForFailedOrder(orderId);
      if (!released) {
        return NextResponse.json({ error: 'DB error' }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
