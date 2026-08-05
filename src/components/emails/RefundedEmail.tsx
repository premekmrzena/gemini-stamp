import * as React from 'react';
import { Currency } from '@/types/database';
import { formatPrice } from '@/lib/currency';
import { EmailLayout } from './EmailLayout';

interface RefundedEmailProps {
  orderId: string;
  customerName: string;
  refundAmount: number;
  currency: Currency;
}

export const RefundedEmail: React.FC<Readonly<RefundedEmailProps>> = ({
  orderId,
  customerName,
  refundAmount,
  currency,
}) => {
  return (
    <EmailLayout footerNote="This email is an automatic notification that your payment has been refunded.">
      <h2 style={{ fontSize: '20px', marginBottom: '16px', fontWeight: '600' }}>
        Your payment has been refunded
      </h2>
      <p style={{ lineHeight: '1.6', fontSize: '15px', color: '#CBD5E1' }}>
        Hi {customerName},<br />
        we&apos;ve refunded the payment for your order <strong style={{ color: '#FDFBF7' }}>#{orderId}</strong>&nbsp;to your payment method. Depending on your bank, it may take a few business days to appear in your account.
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
          Refunded amount
        </p>
        <p style={{ margin: '8px 0 0 0', fontSize: '20px', fontWeight: '600', color: '#22C55E' }}>
          {formatPrice(refundAmount, currency)}
        </p>
      </div>
    </EmailLayout>
  );
};
