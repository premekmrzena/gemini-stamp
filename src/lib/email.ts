import * as React from 'react';
import { render } from '@react-email/render';
import { resend } from '@/lib/resend';
import { OrderConfirmationEmail } from '@/components/emails/OrderConfirmationEmail';
import { ShippingNotificationEmail } from '@/components/emails/ShippingNotificationEmail';

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

type SendShippingNotificationParams = {
  email: string;
  orderId: string;
  customerName: string;
  trackingNumber: string;
};

export async function sendShippingNotification({
  email,
  orderId,
  customerName,
  trackingNumber,
}: SendShippingNotificationParams) {
  const emailHtml = await render(
    React.createElement(ShippingNotificationEmail, { orderId, customerName, trackingNumber })
  );

  return resend.emails.send({
    from: 'Creative Stamp <onboarding@resend.dev>',
    to: [email],
    subject: `Objednávka č. ${orderId} byla odeslána – Creative Stamp`,
    html: emailHtml,
  });
}
