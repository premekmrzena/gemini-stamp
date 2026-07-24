import * as React from 'react';
import { EmailLayout } from './EmailLayout';

interface RefundedEmailProps {
  orderId: string;
  customerName: string;
  refundAmount: number;
}

export const RefundedEmail: React.FC<Readonly<RefundedEmailProps>> = ({
  orderId,
  customerName,
  refundAmount,
}) => {
  return (
    <EmailLayout footerNote="Tento e-mail je automatickým oznámením o vrácení platby.">
      <h2 style={{ fontSize: '20px', marginBottom: '16px', fontWeight: '700' }}>
        Platba vám byla vrácena
      </h2>
      <p style={{ lineHeight: '1.6', fontSize: '15px', color: '#CBD5E1' }}>
        Ahoj {customerName},<br />
        platbu za objednávku <strong style={{ color: '#FDFBF7' }}>#{orderId}</strong> jsme vám vrátili zpět na váš platební prostředek. V závislosti na bance se peníze mohou objevit na účtu za pár pracovních dní.
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
          Vrácená částka
        </p>
        <p style={{ margin: '8px 0 0 0', fontSize: '20px', fontWeight: '700', color: '#22C55E' }}>
          {refundAmount.toLocaleString('cs-CZ')} Kč
        </p>
      </div>
    </EmailLayout>
  );
};
