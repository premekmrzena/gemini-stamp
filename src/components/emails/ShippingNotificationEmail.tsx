import * as React from 'react';

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
  const fontStack = "'Poppins', 'Helvetica Neue', Helvetica, Arial, sans-serif";

  return (
    <div style={{
      backgroundColor: '#0F172A',
      padding: '40px 20px',
      minHeight: '100%',
      margin: '0'
    }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&display=swap');
      `}} />

      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        fontFamily: fontStack,
        color: '#FDFBF7'
      }}>
        <h1 style={{
          color: '#FF6B35',
          fontSize: '28px',
          fontWeight: '700',
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          My Creative Stamp
        </h1>

        <div style={{
          backgroundColor: '#1E293B',
          padding: '30px',
          borderRadius: '8px',
          border: '1px solid #334155'
        }}>
          <h2 style={{ fontSize: '20px', marginBottom: '16px', fontWeight: '700' }}>
            Vaše objednávka je na cestě!
          </h2>
          <p style={{ lineHeight: '1.6', fontSize: '15px', color: '#CBD5E1' }}>
            Ahoj {customerName},<br />
            objednávka <strong style={{ color: '#FDFBF7' }}>#{orderId}</strong> byla právě odeslána.
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
              Sledovací číslo zásilky
            </p>
            <p style={{ margin: '8px 0 0 0', fontSize: '20px', fontWeight: '700', color: '#22C55E' }}>
              {trackingNumber}
            </p>
          </div>
        </div>

        <div style={{
          fontSize: '12px',
          color: '#64748B',
          marginTop: '40px',
          textAlign: 'center',
          lineHeight: '1.5'
        }}>
          <p style={{ margin: '0 0 10px 0' }}>My Creative Stamp • Jindřišská 126/15, Praha 1</p>
          <p style={{ margin: '0' }}>Tento e-mail je automatickým oznámením o odeslání objednávky.</p>
        </div>
      </div>
    </div>
  );
};
