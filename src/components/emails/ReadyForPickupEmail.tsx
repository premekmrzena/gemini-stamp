import * as React from 'react';
import { EmailLayout } from './EmailLayout';

interface ReadyForPickupEmailProps {
  orderId: string;
  customerName: string;
}

export const ReadyForPickupEmail: React.FC<Readonly<ReadyForPickupEmailProps>> = ({
  orderId,
  customerName,
}) => {
  return (
    <EmailLayout footerNote="Tento e-mail je automatickým oznámením o připravenosti objednávky k vyzvednutí.">
      <h2 style={{ fontSize: '20px', marginBottom: '16px', fontWeight: '700' }}>
        Objednávka je připravená k vyzvednutí!
      </h2>
      <p style={{ lineHeight: '1.6', fontSize: '15px', color: '#CBD5E1' }}>
        Ahoj {customerName},<br />
        objednávka <strong style={{ color: '#FDFBF7' }}>#{orderId}</strong> na vás čeká na naší prodejně.
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
          Místo vyzvednutí
        </p>
        <p style={{ margin: '8px 0 0 0', fontSize: '18px', fontWeight: '700', color: '#FDFBF7' }}>
          Jindřišská 126/15, Praha 1
        </p>
      </div>

      <p style={{ fontSize: '13px', color: '#8B95AC', marginTop: '16px', lineHeight: '1.5' }}>
        S sebou prosím vezměte číslo objednávky nebo tento e-mail.
      </p>
    </EmailLayout>
  );
};
