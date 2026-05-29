import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getShippingOptions, PAYMENT_OPTIONS } from '@/lib/constants';
import { sendOrderConfirmation } from '@/lib/email';
import { CartItemSnapshot } from '@/types/database';

type CreateOrderBody = {
  cartItems: CartItemSnapshot[];
  shippingMethodId: string;
  paymentMethodId: string;
  formData: Record<string, string>;
  customerNote: string;
  shippingIsDifferent: boolean;
};

export async function POST(req: Request) {
  try {
    const body: CreateOrderBody = await req.json();
    const { cartItems, shippingMethodId, paymentMethodId, formData, customerNote, shippingIsDifferent } = body;

    if (!cartItems?.length) {
      return NextResponse.json({ error: 'Košík je prázdný' }, { status: 400 });
    }

    // Validate prices server-side — never trust client amounts
    let computedSubtotal = 0;
    let totalWeightGrams = 0;
    const validatedItems: CartItemSnapshot[] = [];

    for (const item of cartItems) {
      if (item.item_type === 'product') {
        const { data: product, error } = await supabase
          .from('products')
          .select('id, name, price, weight_grams')
          .eq('id', item.id)
          .eq('is_active', true)
          .single();

        if (error || !product) {
          return NextResponse.json({ error: `Produkt ${item.id} nenalezen nebo není aktivní` }, { status: 400 });
        }

        computedSubtotal += product.price * item.quantity;
        totalWeightGrams += (product.weight_grams || 0) * item.quantity;
        validatedItems.push({ ...item, price: product.price, weight_grams: product.weight_grams });

      } else if (item.item_type === 'custom') {
        const { data: stamp, error } = await supabase
          .from('custom_stamps')
          .select('id, preview_url, products(name, price, weight_grams)')
          .eq('id', item.id)
          .single();

        if (error || !stamp) {
          return NextResponse.json({ error: `Vlastní razítko ${item.id} nenalezeno` }, { status: 400 });
        }

        const product = Array.isArray(stamp.products) ? stamp.products[0] : stamp.products;
        if (!product) {
          return NextResponse.json({ error: 'Produkt pro vlastní razítko nenalezen' }, { status: 400 });
        }

        computedSubtotal += (product as any).price * item.quantity;
        totalWeightGrams += ((product as any).weight_grams || 0) * item.quantity;
        validatedItems.push({
          ...item,
          price: (product as any).price,
          weight_grams: (product as any).weight_grams,
        });
      } else {
        return NextResponse.json({ error: 'Neznámý typ položky v košíku' }, { status: 400 });
      }
    }

    const shippingOptions = getShippingOptions(totalWeightGrams);
    const shippingOption = shippingOptions.find((o) => o.id === shippingMethodId);
    if (!shippingOption) {
      return NextResponse.json({ error: 'Neplatná metoda dopravy' }, { status: 400 });
    }

    const paymentOption = PAYMENT_OPTIONS.find((o) => o.id === paymentMethodId);
    if (!paymentOption) {
      return NextResponse.json({ error: 'Neplatná metoda platby' }, { status: 400 });
    }

    const totalPrice = computedSubtotal + shippingOption.price + paymentOption.price;

    const orderData = {
      status: 'Nová',
      total_price: totalPrice,
      shipping_method: shippingOption.name,
      shipping_cost: shippingOption.price,
      payment_method: paymentOption.name,
      payment_cost: paymentOption.price,
      cart_items: validatedItems,
      customer_note: customerNote ?? '',
      shipping_is_different: shippingIsDifferent,
      ...formData,
    };

    const { data, error: insertError } = await supabase
      .from('orders')
      .insert([orderData])
      .select('id')
      .single();

    if (insertError) throw insertError;

    const shortOrderId = data.id.slice(-8).toUpperCase();
    sendOrderConfirmation({
      email: formData.billing_email,
      orderId: shortOrderId,
      customerName: formData.billing_first_name,
      totalPrice,
      cartItems: validatedItems,
    }).catch((err) => console.error('Email error:', err));

    return NextResponse.json({ orderId: data.id, totalPrice });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Interní chyba serveru';
    console.error('Chyba při vytváření objednávky:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
