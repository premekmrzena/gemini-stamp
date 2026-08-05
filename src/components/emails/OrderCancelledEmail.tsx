import * as React from 'react';
import { EmailLayout } from './EmailLayout';

interface OrderCancelledEmailProps {
  orderId: string;
  customerName: string;
}

export const OrderCancelledEmail: React.FC<Readonly<OrderCancelledEmailProps>> = ({
  orderId,
  customerName,
}) => {
  return (
    <EmailLayout footerNote="This email is an automatic notification that your order has been cancelled.">
      <h2 style={{ fontSize: '20px', marginBottom: '16px', fontWeight: '600' }}>
        Your order has been cancelled
      </h2>
      <p style={{ lineHeight: '1.6', fontSize: '15px', color: '#CBD5E1' }}>
        Hi {customerName},<br />
        your order <strong style={{ color: '#FDFBF7' }}>#{orderId}</strong>&nbsp;has been cancelled and will not be processed further.
      </p>
      <p style={{ lineHeight: '1.6', fontSize: '15px', color: '#CBD5E1', marginTop: '16px' }}>
        If you&apos;ve already paid for the order, we&apos;ll refund it to the same payment method within the next few days.
      </p>
      <p style={{ lineHeight: '1.6', fontSize: '15px', color: '#CBD5E1', marginTop: '16px' }}>
        If you have any questions, feel free to reply to this email.
      </p>
    </EmailLayout>
  );
};
