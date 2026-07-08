import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getShippingOptions, PAYMENT_OPTIONS } from '@/lib/constants';
import { sendOrderConfirmation } from '@/lib/email';
import { CartItemSnapshot } from '@/types/database';
import { getEffectivePrice, computeDiscountAmount } from '@/lib/pricing';

type CreateOrderBody = {
  cartItems: CartItemSnapshot[];
  shippingMethodId: string;
  paymentMethodId: string;
  formData: Record<string, string>;
  customerNote: string;
  shippingIsDifferent: boolean;
  discountCode: string | null;
};

export async function POST(req: Request) {
  try {
    const body: CreateOrderBody = await req.json();
    const { cartItems, shippingMethodId, paymentMethodId, formData, customerNote, shippingIsDifferent, discountCode } = body;

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
          .select('id, name, price, sale_price, weight_grams')
          .eq('id', item.id)
          .eq('is_active', true)
          .single();

        if (error || !product) {
          return NextResponse.json({ error: `Produkt ${item.id} nenalezen nebo není aktivní` }, { status: 400 });
        }

        const effectivePrice = getEffectivePrice(product.price, product.sale_price);
        computedSubtotal += effectivePrice * item.quantity;
        totalWeightGrams += (product.weight_grams || 0) * item.quantity;
        validatedItems.push({ ...item, price: effectivePrice, weight_grams: product.weight_grams });

      } else if (item.item_type === 'custom') {
        const { data: stamp, error } = await supabase
          .from('custom_stamps')
          .select('id, preview_url, products(name, price, sale_price, weight_grams)')
          .eq('id', item.id)
          .single();

        if (error || !stamp) {
          return NextResponse.json({ error: `Vlastní razítko ${item.id} nenalezeno` }, { status: 400 });
        }

        const product = Array.isArray(stamp.products) ? stamp.products[0] : stamp.products;
        if (!product) {
          return NextResponse.json({ error: 'Produkt pro vlastní razítko nenalezen' }, { status: 400 });
        }

        const effectivePrice = getEffectivePrice((product as any).price, (product as any).sale_price);
        computedSubtotal += effectivePrice * item.quantity;
        totalWeightGrams += ((product as any).weight_grams || 0) * item.quantity;
        validatedItems.push({
          ...item,
          price: effectivePrice,
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

    // Slevový kód se validuje znovu server-side — klientský stav se nikdy nepovažuje za platný
    let discountAmount = 0;
    if (discountCode) {
      const { data: discountData, error: discountError } = await supabase.rpc('validate_discount_code', { p_code: discountCode });
      const discountResult = Array.isArray(discountData) ? discountData[0] : discountData;

      if (discountError || !discountResult?.is_valid) {
        return NextResponse.json(
          { error: discountResult?.message || 'Slevový kód se nepodařilo ověřit' },
          { status: 400 }
        );
      }

      discountAmount = computeDiscountAmount(computedSubtotal, { type: discountResult.code_type, value: discountResult.code_value });
    }

    const totalPrice = computedSubtotal - discountAmount + shippingOption.price + paymentOption.price;

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
      discount_code: discountCode ?? null,
      discount_amount: discountAmount,
      ...formData,
    };

    const { data, error: insertError } = await supabase
      .from('orders')
      .insert([orderData])
      .select('id')
      .single();

    if (insertError) throw insertError;

    if (discountCode) {
      supabase.rpc('redeem_discount_code', { p_code: discountCode }).then(({ error }) => {
        if (error) console.error('Chyba při uplatnění slevového kódu:', error);
      });
    }

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
