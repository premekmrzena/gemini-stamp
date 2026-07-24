import * as React from 'react';
import { render } from '@react-email/render';
import { resend } from '@/lib/resend';
import { OrderConfirmationEmail } from '@/components/emails/OrderConfirmationEmail';
import { ShippingNotificationEmail } from '@/components/emails/ShippingNotificationEmail';
import { PaymentReceivedEmail } from '@/components/emails/PaymentReceivedEmail';
import { ReadyForPickupEmail } from '@/components/emails/ReadyForPickupEmail';
import { OrderCancelledEmail } from '@/components/emails/OrderCancelledEmail';
import { RefundedEmail } from '@/components/emails/RefundedEmail';
import { CartItemSnapshot } from '@/types/database';
import { generatePaymentQrCodeBuffer, getVariableSymbol } from '@/lib/czechQrPayment';

const QR_CODE_CONTENT_ID = 'qr-platba';
// Doména mycreativestamp.com ověřená v Resendu 2026-07-24 (DKIM/SPF/MX verified).
const EMAIL_FROM = 'My Creative Stamp <objednavky@mycreativestamp.com>';

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
  const qrCodeBuffer = isBankTransfer
    ? await generatePaymentQrCodeBuffer({
        amount: totalPrice,
        orderId,
        message: `Objednavka ${orderId}`,
      })
    : null;

  const bankTransfer = isBankTransfer
    ? { variableSymbol: getVariableSymbol(orderId), qrCodeCid: QR_CODE_CONTENT_ID }
    : null;

  const emailHtml = await render(
    React.createElement(OrderConfirmationEmail, { orderId, customerName, totalPrice, cartItems, bankTransfer })
  );

  return resend.emails.send({
    from: EMAIL_FROM,
    to: [email],
    subject: `Objednávka č. ${orderId} přijata – My Creative Stamp`,
    html: emailHtml,
    attachments: qrCodeBuffer
      ? [
          {
            filename: 'qr-platba.png',
            content: qrCodeBuffer,
            contentType: 'image/png',
            contentId: QR_CODE_CONTENT_ID,
          },
        ]
      : undefined,
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
    from: EMAIL_FROM,
    to: [email],
    subject: `Objednávka č. ${orderId} byla odeslána – My Creative Stamp`,
    html: emailHtml,
  });
}

type SendPaymentReceivedParams = {
  email: string;
  orderId: string;
  customerName: string;
  totalPrice: number;
};

export async function sendPaymentReceived({ email, orderId, customerName, totalPrice }: SendPaymentReceivedParams) {
  const emailHtml = await render(
    React.createElement(PaymentReceivedEmail, { orderId, customerName, totalPrice })
  );

  return resend.emails.send({
    from: EMAIL_FROM,
    to: [email],
    subject: `Platba za objednávku č. ${orderId} přijata – My Creative Stamp`,
    html: emailHtml,
  });
}

type SendReadyForPickupParams = {
  email: string;
  orderId: string;
  customerName: string;
};

export async function sendReadyForPickup({ email, orderId, customerName }: SendReadyForPickupParams) {
  const emailHtml = await render(
    React.createElement(ReadyForPickupEmail, { orderId, customerName })
  );

  return resend.emails.send({
    from: EMAIL_FROM,
    to: [email],
    subject: `Objednávka č. ${orderId} je připravená k vyzvednutí – My Creative Stamp`,
    html: emailHtml,
  });
}

type SendOrderCancelledParams = {
  email: string;
  orderId: string;
  customerName: string;
};

export async function sendOrderCancelled({ email, orderId, customerName }: SendOrderCancelledParams) {
  const emailHtml = await render(
    React.createElement(OrderCancelledEmail, { orderId, customerName })
  );

  return resend.emails.send({
    from: EMAIL_FROM,
    to: [email],
    subject: `Objednávka č. ${orderId} byla zrušena – My Creative Stamp`,
    html: emailHtml,
  });
}

type SendRefundedParams = {
  email: string;
  orderId: string;
  customerName: string;
  refundAmount: number;
};

export async function sendRefunded({ email, orderId, customerName, refundAmount }: SendRefundedParams) {
  const emailHtml = await render(
    React.createElement(RefundedEmail, { orderId, customerName, refundAmount })
  );

  return resend.emails.send({
    from: EMAIL_FROM,
    to: [email],
    subject: `Platba za objednávku č. ${orderId} vrácena – My Creative Stamp`,
    html: emailHtml,
  });
}
