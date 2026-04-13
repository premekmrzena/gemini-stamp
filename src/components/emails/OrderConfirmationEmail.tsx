import * as React from 'react';

interface OrderEmailProps {
  orderId: string;
  customerName: string;
  totalPrice: number;
  cartItems: any[]; // Pole objektů z košíku
}

export const OrderConfirmationEmail: React.FC<Readonly<OrderEmailProps>> = ({
  orderId,
  customerName,
  totalPrice,
  cartItems,
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
          Creative Stamp
        </h1>

        <div style={{ 
          backgroundColor: '#1E293B', 
          padding: '30px', 
          borderRadius: '8px',
          border: '1px solid #334155'
        }}>
          <h2 style={{ fontSize: '20px', marginBottom: '16px', fontWeight: '700' }}>
            Děkujeme za vaši objednávku!
          </h2>
          <p style={{ lineHeight: '1.6', fontSize: '15px', color: '#CBD5E1' }}>
            Ahoj {customerName},<br />
            vaše objednávka <strong style={{ color: '#FDFBF7' }}>#{orderId}</strong> byla úspěšně přijata a brzy ji začneme připravovat.
          </p>

          {/* TABULKA POLOŽEK */}
          <div style={{ marginTop: '32px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ 
                    textAlign: 'left', 
                    borderBottom: '1px solid #334155', 
                    paddingBottom: '10px', 
                    color: '#64748B', 
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Položka
                  </th>
                  <th style={{ 
                    textAlign: 'right', 
                    borderBottom: '1px solid #334155', 
                    paddingBottom: '10px', 
                    color: '#64748B', 
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Cena
                  </th>
                </tr>
              </thead>
              <tbody>
                {cartItems && cartItems.map((item, index) => (
                  <tr key={index}>
                    <td style={{ padding: '16px 0', borderBottom: '1px solid #2B3755' }}>
                      <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#FDFBF7', marginBottom: '4px' }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: '13px', color: '#8B95AC' }}>
                        {item.quantity} ks
                      </div>
                    </td>
                    <td style={{ 
                      textAlign: 'right', 
                      padding: '16px 0', 
                      borderBottom: '1px solid #2B3755', 
                      fontWeight: 'bold', 
                      color: '#FDFBF7',
                      fontSize: '15px',
                      verticalAlign: 'top'
                    }}>
                      {(item.price * item.quantity).toLocaleString('cs-CZ')} Kč
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* CELKOVÁ CENA */}
          <div style={{ 
            marginTop: '20px', 
            paddingTop: '20px', 
            textAlign: 'right'
          }}>
            <p style={{ margin: '0', fontSize: '14px', color: '#8B95AC' }}>
              Celkem k úhradě
            </p>
            <p style={{ 
              margin: '5px 0 0 0', 
              fontSize: '24px', 
              fontWeight: '700', 
              color: '#22C55E' 
            }}>
              {totalPrice.toLocaleString('cs-CZ')} Kč
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
          <p style={{ margin: '0 0 10px 0' }}>Creative Stamp • Jindřišská 126/15, Praha 1</p>
          <p style={{ margin: '0' }}>Tento e-mail je potvrzením o přijetí vaší objednávky v našem systému.</p>
        </div>
      </div>
    </div>
  );
};