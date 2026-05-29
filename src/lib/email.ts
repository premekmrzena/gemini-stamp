import * as React from 'react';
import { render } from '@react-email/render';
import { resend } from '@/lib/resend';
import { OrderConfirmationEmail } from '@/components/emails/OrderConfirmationEmail';

type SendOrderConfirmationParams = {
  email: string;
  orderId: string;
  customerName: string;
  totalPrice: number;
  cartItems: unknown[];
};

export async function sendOrderConfirmation({
  email,
  orderId,
  customerName,
  totalPrice,
  cartItems,
}: SendOrderConfirmationParams) {
  const emailHtml = await render(
    React.createElement(OrderConfirmationEmail, { orderId, customerName, totalPrice, cartItems })
  );

  return resend.emails.send({
    from: 'Creative Stamp <onboarding@resend.dev>',
    to: [email],
    subject: `Objednávka č. ${orderId} přijata – Creative Stamp`,
    html: emailHtml,
  });
}
