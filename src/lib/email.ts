import * as React from 'react';
import { render } from '@react-email/render';
import { resend } from '@/lib/resend';
import { OrderConfirmationEmail } from '@/components/emails/OrderConfirmationEmail';
import { ShippingNotificationEmail } from '@/components/emails/ShippingNotificationEmail';
import { PaymentReceivedEmail } from '@/components/emails/PaymentReceivedEmail';
import { ReadyForPickupEmail } from '@/components/emails/ReadyForPickupEmail';
import { OrderCancelledEmail } from '@/components/emails/OrderCancelledEmail';
import { RefundedEmail } from '@/components/emails/RefundedEmail';
import { AwaitingPaymentEmail } from '@/components/emails/AwaitingPaymentEmail';
import { OrderPreparingEmail } from '@/components/emails/OrderPreparingEmail';
import { OrderDeliveredEmail } from '@/components/emails/OrderDeliveredEmail';
import { OrderPickedUpEmail } from '@/components/emails/OrderPickedUpEmail';
import { OrderReturnedEmail } from '@/components/emails/OrderReturnedEmail';
import { ShipmentLostEmail } from '@/components/emails/ShipmentLostEmail';
import { ComplaintRegisteredEmail } from '@/components/emails/ComplaintRegisteredEmail';
import { OrderClosedEmail } from '@/components/emails/OrderClosedEmail';
import { CartItemSnapshot, Currency } from '@/types/database';
import { generatePaymentQrCodeBuffer, getVariableSymbol } from '@/lib/czechQrPayment';

const QR_CODE_CONTENT_ID = 'qr-platba';
// Doména mycreativestamp.com ověřená v Resendu 2026-07-24 (DKIM/SPF/MX verified).
const EMAIL_FROM = 'My Creative Stamp <objednavky@mycreativestamp.com>';

type InvoicePdfAttachment = { buffer: Buffer; filename: string };

type SendOrderConfirmationParams = {
  email: string;
  orderId: string;
  customerName: string;
  totalPrice: number;
  currency: Currency;
  cartItems: CartItemSnapshot[];
  isBankTransfer: boolean;
  invoicePdf?: InvoicePdfAttachment;
};

export async function sendOrderConfirmation({
  email,
  orderId,
  customerName,
  totalPrice,
  currency,
  cartItems,
  isBankTransfer,
  invoicePdf,
}: SendOrderConfirmationParams) {
  // Bank transfer je dnes jen pro CZK objednávky - create-order odmítá
  // 'prevod' u EUR (žádný EUR bankovní účet), takže isBankTransfer &&
  // currency === 'EUR' v praxi nenastane, ale pojistka tu zůstává.
  const qrCodeBuffer = isBankTransfer && currency === 'CZK'
    ? await generatePaymentQrCodeBuffer({
        amount: totalPrice,
        orderId,
        message: `Order ${orderId}`,
      })
    : null;

  const bankTransfer = isBankTransfer && currency === 'CZK'
    ? { variableSymbol: getVariableSymbol(orderId), qrCodeCid: QR_CODE_CONTENT_ID }
    : null;

  const emailHtml = await render(
    React.createElement(OrderConfirmationEmail, { orderId, customerName, totalPrice, currency, cartItems, bankTransfer })
  );

  const attachments = [
    qrCodeBuffer ? { filename: 'qr-platba.png', content: qrCodeBuffer, contentType: 'image/png', contentId: QR_CODE_CONTENT_ID } : null,
    invoicePdf ? { filename: invoicePdf.filename, content: invoicePdf.buffer, contentType: 'application/pdf' } : null,
  ].filter((a): a is NonNullable<typeof a> => a !== null);

  return resend.emails.send({
    from: EMAIL_FROM,
    to: [email],
    subject: `Order #${orderId} received – My Creative Stamp`,
    html: emailHtml,
    attachments: attachments.length > 0 ? attachments : undefined,
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
    subject: `Order #${orderId} has shipped – My Creative Stamp`,
    html: emailHtml,
  });
}

type SendPaymentReceivedParams = {
  email: string;
  orderId: string;
  customerName: string;
  totalPrice: number;
  currency: Currency;
  invoicePdf?: InvoicePdfAttachment;
};

export async function sendPaymentReceived({ email, orderId, customerName, totalPrice, currency, invoicePdf }: SendPaymentReceivedParams) {
  const emailHtml = await render(
    React.createElement(PaymentReceivedEmail, { orderId, customerName, totalPrice, currency })
  );

  return resend.emails.send({
    from: EMAIL_FROM,
    to: [email],
    subject: `Payment for order #${orderId} received – My Creative Stamp`,
    html: emailHtml,
    attachments: invoicePdf ? [{ filename: invoicePdf.filename, content: invoicePdf.buffer, contentType: 'application/pdf' }] : undefined,
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
    subject: `Order #${orderId} ready for pickup – My Creative Stamp`,
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
    subject: `Order #${orderId} was cancelled – My Creative Stamp`,
    html: emailHtml,
  });
}

type SendRefundedParams = {
  email: string;
  orderId: string;
  customerName: string;
  refundAmount: number;
  currency: Currency;
};

export async function sendRefunded({ email, orderId, customerName, refundAmount, currency }: SendRefundedParams) {
  const emailHtml = await render(
    React.createElement(RefundedEmail, { orderId, customerName, refundAmount, currency })
  );

  return resend.emails.send({
    from: EMAIL_FROM,
    to: [email],
    subject: `Payment for order #${orderId} refunded – My Creative Stamp`,
    html: emailHtml,
  });
}

type SendAwaitingPaymentParams = {
  email: string;
  orderId: string;
  customerName: string;
  totalPrice: number;
  currency: Currency;
};

export async function sendAwaitingPayment({ email, orderId, customerName, totalPrice, currency }: SendAwaitingPaymentParams) {
  const emailHtml = await render(
    React.createElement(AwaitingPaymentEmail, { orderId, customerName, totalPrice, currency })
  );

  return resend.emails.send({
    from: EMAIL_FROM,
    to: [email],
    subject: `Order #${orderId} awaiting payment – My Creative Stamp`,
    html: emailHtml,
  });
}

type SendOrderPreparingParams = {
  email: string;
  orderId: string;
  customerName: string;
};

export async function sendOrderPreparing({ email, orderId, customerName }: SendOrderPreparingParams) {
  const emailHtml = await render(
    React.createElement(OrderPreparingEmail, { orderId, customerName })
  );

  return resend.emails.send({
    from: EMAIL_FROM,
    to: [email],
    subject: `Order #${orderId} is being prepared – My Creative Stamp`,
    html: emailHtml,
  });
}

type SendOrderDeliveredParams = {
  email: string;
  orderId: string;
  customerName: string;
};

export async function sendOrderDelivered({ email, orderId, customerName }: SendOrderDeliveredParams) {
  const emailHtml = await render(
    React.createElement(OrderDeliveredEmail, { orderId, customerName })
  );

  return resend.emails.send({
    from: EMAIL_FROM,
    to: [email],
    subject: `Order #${orderId} has been delivered – My Creative Stamp`,
    html: emailHtml,
  });
}

type SendOrderPickedUpParams = {
  email: string;
  orderId: string;
  customerName: string;
};

export async function sendOrderPickedUp({ email, orderId, customerName }: SendOrderPickedUpParams) {
  const emailHtml = await render(
    React.createElement(OrderPickedUpEmail, { orderId, customerName })
  );

  return resend.emails.send({
    from: EMAIL_FROM,
    to: [email],
    subject: `Order #${orderId} picked up – My Creative Stamp`,
    html: emailHtml,
  });
}

type SendOrderReturnedParams = {
  email: string;
  orderId: string;
  customerName: string;
};

export async function sendOrderReturned({ email, orderId, customerName }: SendOrderReturnedParams) {
  const emailHtml = await render(
    React.createElement(OrderReturnedEmail, { orderId, customerName })
  );

  return resend.emails.send({
    from: EMAIL_FROM,
    to: [email],
    subject: `Order #${orderId} was returned – My Creative Stamp`,
    html: emailHtml,
  });
}

type SendShipmentLostParams = {
  email: string;
  orderId: string;
  customerName: string;
};

export async function sendShipmentLost({ email, orderId, customerName }: SendShipmentLostParams) {
  const emailHtml = await render(
    React.createElement(ShipmentLostEmail, { orderId, customerName })
  );

  return resend.emails.send({
    from: EMAIL_FROM,
    to: [email],
    subject: `Order #${orderId} shipment update – My Creative Stamp`,
    html: emailHtml,
  });
}

type SendComplaintRegisteredParams = {
  email: string;
  orderId: string;
  customerName: string;
};

export async function sendComplaintRegistered({ email, orderId, customerName }: SendComplaintRegisteredParams) {
  const emailHtml = await render(
    React.createElement(ComplaintRegisteredEmail, { orderId, customerName })
  );

  return resend.emails.send({
    from: EMAIL_FROM,
    to: [email],
    subject: `Order #${orderId} complaint registered – My Creative Stamp`,
    html: emailHtml,
  });
}

type SendOrderClosedParams = {
  email: string;
  orderId: string;
  customerName: string;
  discountCode?: string;
};

export async function sendOrderClosed({ email, orderId, customerName, discountCode }: SendOrderClosedParams) {
  const emailHtml = await render(
    React.createElement(OrderClosedEmail, { orderId, customerName, discountCode })
  );

  return resend.emails.send({
    from: EMAIL_FROM,
    to: [email],
    subject: `Order #${orderId} closed – My Creative Stamp`,
    html: emailHtml,
  });
}
