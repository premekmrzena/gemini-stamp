import * as React from 'react';
import { Currency } from '@/types/database';
import { formatPrice } from '@/lib/currency';
import { EmailLayout } from './EmailLayout';

interface AwaitingPaymentEmailProps {
  orderId: string;
  customerName: string;
  totalPrice: number;
  currency: Currency;
}

export const AwaitingPaymentEmail: React.FC<Readonly<AwaitingPaymentEmailProps>> = ({
  orderId,
  customerName,
  totalPrice,
  currency,
}) => {
  return (
    <EmailLayout footerNote="This email is an automatic notification that your order is awaiting payment.">
      <h2 style={{ fontSize: '20px', marginBottom: '16px', fontWeight: '600' }}>
        We&apos;re waiting for your payment
      </h2>
      <p style={{ lineHeight: '1.6', fontSize: '15px', color: '#CBD5E1' }}>
        Hi {customerName},<br />
        your order <strong style={{ color: '#FDFBF7' }}>#{orderId}</strong>&nbsp;is currently awaiting payment. As soon as we receive it, we&apos;ll start preparing your order.
      </p>

      <div style={{
        marginTop: '24px',
        padding: '20px',
        backgroundColor: '#0F172A',
        borderRadius: '8px',
        border: '1px solid #2B3755',
        textAlign: 'center'
      }}>
        <p style={{ margin: '0', fontSize: '13px', color: '#8B95AC', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Amount due
        </p>
        <p style={{ margin: '8px 0 0 0', fontSize: '20px', fontWeight: '600', color: '#FDFBF7' }}>
          {formatPrice(totalPrice, currency)}
        </p>
      </div>

      <p style={{ fontSize: '13px', color: '#8B95AC', marginTop: '16px', lineHeight: '1.5' }}>
        If you&apos;ve already paid, please disregard this message - it may take a moment to process.
      </p>
    </EmailLayout>
  );
};
