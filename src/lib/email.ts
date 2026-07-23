import * as React from 'react';
import { render } from '@react-email/render';
import { resend } from '@/lib/resend';
import { OrderConfirmationEmail } from '@/components/emails/OrderConfirmationEmail';
import { ShippingNotificationEmail } from '@/components/emails/ShippingNotificationEmail';
import { CartItemSnapshot } from '@/types/database';
import { generatePaymentQrCodeDataUrl, getVariableSymbol } from '@/lib/czechQrPayment';

type SendOrderConfirmationParams = {
  email: string;
  orderId: string;
  customerName: string;
  totalPrice: number;
  cartItems: CartItemSnapshot[];
  isBankTransfer: boolean;
};

export async function sendOrderConfirmation({
  email,
  orderId,
  customerName,
  totalPrice,
  cartItems,
  isBankTransfer,
}: SendOrderConfirmationParams) {
  const bankTransfer = isBankTransfer
    ? {
        variableSymbol: getVariableSymbol(orderId),
        qrCodeDataUrl: await generatePaymentQrCodeDataUrl({
          amount: totalPrice,
          orderId,
          message: `Objednavka ${orderId}`,
        }),
      }
    : null;

  const emailHtml = await render(
    React.createElement(OrderConfirmationEmail, { orderId, customerName, totalPrice, cartItems, bankTransfer })
  );

  return resend.emails.send({
    from: 'My Creative Stamp <onboarding@resend.dev>',
    to: [email],
    subject: `Objednávka č. ${orderId} přijata – My Creative Stamp`,
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
    from: 'My Creative Stamp <onboarding@resend.dev>',
    to: [email],
    subject: `Objednávka č. ${orderId} byla odeslána – My Creative Stamp`,
    html: emailHtml,
  });
}
