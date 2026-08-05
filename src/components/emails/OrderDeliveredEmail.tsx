import * as React from 'react';
import { EmailLayout } from './EmailLayout';

interface OrderDeliveredEmailProps {
  orderId: string;
  customerName: string;
}

export const OrderDeliveredEmail: React.FC<Readonly<OrderDeliveredEmailProps>> = ({
  orderId,
  customerName,
}) => {
  return (
    <EmailLayout footerNote="This email is an automatic notification that your order has been delivered.">
      <h2 style={{ fontSize: '20px', marginBottom: '16px', fontWeight: '600' }}>
        Your order has been delivered!
      </h2>
      <p style={{ lineHeight: '1.6', fontSize: '15px', color: '#CBD5E1' }}>
        Hi {customerName},<br />
        your order <strong style={{ color: '#FDFBF7' }}>#{orderId}</strong> has been delivered. We hope you enjoy it!
      </p>
      <p style={{ lineHeight: '1.6', fontSize: '15px', color: '#CBD5E1', marginTop: '16px' }}>
        If anything isn&apos;t right, feel free to reply to this email and we&apos;ll sort it out.
      </p>
    </EmailLayout>
  );
};
