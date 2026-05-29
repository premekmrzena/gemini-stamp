'use client';

import { useState } from 'react';
import { CartItem } from '@/context/CartContext';

type FormData = Record<string, string>;

type CheckoutSubmitParams = {
  cartItems: CartItem[];
  selectedShipping: string;
  selectedPayment: string;
  formData: FormData;
  customerNote: string;
  shippingIsDifferent: boolean;
};

export function useCheckout() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [serverTotal, setServerTotal] = useState<number | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const submitOrder = async (params: CheckoutSubmitParams) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setOrderError(null);

    try {
      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartItems: params.cartItems,
          shippingMethodId: params.selectedShipping,
          paymentMethodId: params.selectedPayment,
          formData: params.formData,
          customerNote: params.customerNote,
          shippingIsDifferent: params.shippingIsDifferent,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Nepodařilo se vytvořit objednávku');

      setCreatedOrderId(data.orderId);
      setServerTotal(data.totalPrice);

      if (params.selectedPayment === 'karta') {
        setIsPaymentModalOpen(true);
      } else {
        window.location.href = `/dekujeme?orderId=${data.orderId}`;
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Něco se pokazilo.';
      setOrderError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitOrder,
    isSubmitting,
    orderError,
    createdOrderId,
    serverTotal,
    isPaymentModalOpen,
    setIsPaymentModalOpen,
  };
}
