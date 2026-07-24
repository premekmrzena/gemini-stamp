import * as React from 'react';
import { EmailLayout } from './EmailLayout';

interface PaymentReceivedEmailProps {
  orderId: string;
  customerName: string;
  totalPrice: number;
}

export const PaymentReceivedEmail: React.FC<Readonly<PaymentReceivedEmailProps>> = ({
  orderId,
  customerName,
  totalPrice,
}) => {
  return (
    <EmailLayout footerNote="Tento e-mail je automatickým oznámením o přijetí platby.">
      <h2 style={{ fontSize: '20px', marginBottom: '16px', fontWeight: '700' }}>
        Platbu jsme přijali!
      </h2>
      <p style={{ lineHeight: '1.6', fontSize: '15px', color: '#CBD5E1' }}>
        Ahoj {customerName},<br />
        platbu za objednávku <strong style={{ color: '#FDFBF7' }}>#{orderId}</strong> jsme úspěšně přijali. Teď ji začínáme připravovat.
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
          Přijatá platba
        </p>
        <p style={{ margin: '8px 0 0 0', fontSize: '20px', fontWeight: '700', color: '#22C55E' }}>
          {totalPrice.toLocaleString('cs-CZ')} Kč
        </p>
      </div>
    </EmailLayout>
  );
};
