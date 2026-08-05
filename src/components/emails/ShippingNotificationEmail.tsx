import * as React from 'react';
import { EmailLayout } from './EmailLayout';

interface ShippingEmailProps {
  orderId: string;
  customerName: string;
  trackingNumber: string;
}

export const ShippingNotificationEmail: React.FC<Readonly<ShippingEmailProps>> = ({
  orderId,
  customerName,
  trackingNumber,
}) => {
  // Česká pošta je jediný dopravce, který zatím integrujeme (viz docs/10) - odkaz
  // na jejich veřejné Track & Trace, ne přes lib/ceska-posta.ts (ten za sebou táhne
  // TLS cert + nAPI auth, zbytečná zátěž jen kvůli sestavení URL).
  const trackingUrl = `https://www.postaonline.cz/trackandtrace/-/zasilka/cislo?parcelNumbers=${encodeURIComponent(trackingNumber)}`;

  return (
    <EmailLayout footerNote="This email is an automatic notification that your order has shipped.">
      <h2 style={{ fontSize: '20px', marginBottom: '16px', fontWeight: '600' }}>
        Your order is on its way!
      </h2>
      <p style={{ lineHeight: '1.6', fontSize: '15px', color: '#CBD5E1' }}>
        Hi {customerName},<br />
        your order <strong style={{ color: '#FDFBF7' }}>#{orderId}</strong>&nbsp;has just been shipped.
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
          Shipment tracking number
        </p>
        <p style={{ margin: '8px 0 0 0', fontSize: '20px', fontWeight: '600', color: '#22C55E' }}>
          {trackingNumber}
        </p>
        <a
          href={trackingUrl}
          style={{
            display: 'inline-block',
            marginTop: '16px',
            padding: '10px 24px',
            backgroundColor: '#FF6B35',
            color: '#0F172A',
            fontSize: '14px',
            fontWeight: '600',
            textDecoration: 'none',
            borderRadius: '6px'
          }}
        >
          Track your shipment
        </a>
      </div>
    </EmailLayout>
  );
};
