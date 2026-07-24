import * as React from 'react';
import { Currency } from '@/types/database';
import { formatPrice } from '@/lib/currency';
import { EmailLayout } from './EmailLayout';

interface PaymentReceivedEmailProps {
  orderId: string;
  customerName: string;
  totalPrice: number;
  currency: Currency;
}

export const PaymentReceivedEmail: React.FC<Readonly<PaymentReceivedEmailProps>> = ({
  orderId,
  customerName,
  totalPrice,
  currency,
}) => {
  return (
    <EmailLayout footerNote="This email is an automatic notification that your payment has been received.">
      <h2 style={{ fontSize: '20px', marginBottom: '16px', fontWeight: '600' }}>
        We&apos;ve received your payment!
      </h2>
      <p style={{ lineHeight: '1.6', fontSize: '15px', color: '#CBD5E1' }}>
        Hi {customerName},<br />
        we&apos;ve successfully received the payment for your order <strong style={{ color: '#FDFBF7' }}>#{orderId}</strong>. We&apos;re now starting to prepare it.
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
          Payment received
        </p>
        <p style={{ margin: '8px 0 0 0', fontSize: '20px', fontWeight: '600', color: '#22C55E' }}>
          {formatPrice(totalPrice, currency)}
        </p>
      </div>
    </EmailLayout>
  );
};
