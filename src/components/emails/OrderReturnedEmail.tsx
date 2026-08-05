import * as React from 'react';
import { EmailLayout } from './EmailLayout';

interface OrderReturnedEmailProps {
  orderId: string;
  customerName: string;
}

export const OrderReturnedEmail: React.FC<Readonly<OrderReturnedEmailProps>> = ({
  orderId,
  customerName,
}) => {
  return (
    <EmailLayout footerNote="This email is an automatic notification that your order has been returned.">
      <h2 style={{ fontSize: '20px', marginBottom: '16px', fontWeight: '600' }}>
        We&apos;ve received your return
      </h2>
      <p style={{ lineHeight: '1.6', fontSize: '15px', color: '#CBD5E1' }}>
        Hi {customerName},<br />
        your order <strong style={{ color: '#FDFBF7' }}>#{orderId}</strong>&nbsp;has been returned to us.
      </p>
      <p style={{ lineHeight: '1.6', fontSize: '15px', color: '#CBD5E1', marginTop: '16px' }}>
        If a refund is due, we&apos;ll send you a separate confirmation once it&apos;s been processed. If you have any questions, feel free to reply to this email.
      </p>
    </EmailLayout>
  );
};
