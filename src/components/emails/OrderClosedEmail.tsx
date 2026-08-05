import * as React from 'react';
import { EmailLayout } from './EmailLayout';

interface OrderClosedEmailProps {
  orderId: string;
  customerName: string;
  /** Jednorázový 10% slevový kód vygenerovaný při uzavření objednávky (viz notify-order-status route) - volitelný, ať vygenerování kódu nikdy nezablokuje samotné odeslání e-mailu. */
  discountCode?: string;
}

export const OrderClosedEmail: React.FC<Readonly<OrderClosedEmailProps>> = ({
  orderId,
  customerName,
  discountCode,
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

      {discountCode && (
        <div style={{
          marginTop: '24px',
          padding: '20px',
          backgroundColor: '#0F172A',
          borderRadius: '8px',
          border: '1px solid #2B3755',
          textAlign: 'center'
        }}>
          <p style={{ margin: '0', fontSize: '13px', color: '#8B95AC', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            A little thank-you - 10% off your next order
          </p>
          <p style={{ margin: '8px 0 0 0', fontSize: '20px', fontWeight: '600', color: '#22C55E' }}>
            {discountCode}
          </p>
          <p style={{ margin: '10px 0 0 0', fontSize: '13px', color: '#8B95AC' }}>
            Valid for one order, within the next 90 days.
          </p>
        </div>
      )}

      <p style={{ lineHeight: '1.6', fontSize: '15px', color: '#CBD5E1', marginTop: '16px' }}>
        If you have any questions about this order, feel free to reply to this email.
      </p>
    </EmailLayout>
  );
};
