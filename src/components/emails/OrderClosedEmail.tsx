import * as React from 'react';
import { EmailLayout } from './EmailLayout';

interface OrderClosedEmailProps {
  orderId: string;
  customerName: string;
}

export const OrderClosedEmail: React.FC<Readonly<OrderClosedEmailProps>> = ({
  orderId,
  customerName,
}) => {
  return (
    <EmailLayout footerNote="This email is an automatic notification that your order has been closed.">
      <h2 style={{ fontSize: '20px', marginBottom: '16px', fontWeight: '600' }}>
        Your order is now closed
      </h2>
      <p style={{ lineHeight: '1.6', fontSize: '15px', color: '#CBD5E1' }}>
        Hi {customerName},<br />
        your order <strong style={{ color: '#FDFBF7' }}>#{orderId}</strong>&nbsp;has been closed. Thank you for shopping with My Creative Stamp!
      </p>
      <p style={{ lineHeight: '1.6', fontSize: '15px', color: '#CBD5E1', marginTop: '16px' }}>
        If you have any questions about this order, feel free to reply to this email.
      </p>
    </EmailLayout>
  );
};
