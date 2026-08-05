import * as React from 'react';
import { EmailLayout } from './EmailLayout';

interface OrderPickedUpEmailProps {
  orderId: string;
  customerName: string;
}

export const OrderPickedUpEmail: React.FC<Readonly<OrderPickedUpEmailProps>> = ({
  orderId,
  customerName,
}) => {
  return (
    <EmailLayout footerNote="This email is an automatic notification that your order has been picked up.">
      <h2 style={{ fontSize: '20px', marginBottom: '16px', fontWeight: '600' }}>
        Thanks for picking up your order!
      </h2>
      <p style={{ lineHeight: '1.6', fontSize: '15px', color: '#CBD5E1' }}>
        Hi {customerName},<br />
        we&apos;ve marked your order <strong style={{ color: '#FDFBF7' }}>#{orderId}</strong> as picked up. Thank you for shopping with us!
      </p>
    </EmailLayout>
  );
};
