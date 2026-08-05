import * as React from 'react';
import { EmailLayout } from './EmailLayout';

interface OrderPreparingEmailProps {
  orderId: string;
  customerName: string;
}

export const OrderPreparingEmail: React.FC<Readonly<OrderPreparingEmailProps>> = ({
  orderId,
  customerName,
}) => {
  return (
    <EmailLayout footerNote="This email is an automatic notification that your order is being prepared.">
      <h2 style={{ fontSize: '20px', marginBottom: '16px', fontWeight: '600' }}>
        We&apos;re preparing your order!
      </h2>
      <p style={{ lineHeight: '1.6', fontSize: '15px', color: '#CBD5E1' }}>
        Hi {customerName},<br />
        your order <strong style={{ color: '#FDFBF7' }}>#{orderId}</strong>&nbsp;is now being prepared. We&apos;ll let you know as soon as it&apos;s on its way.
      </p>
    </EmailLayout>
  );
};
