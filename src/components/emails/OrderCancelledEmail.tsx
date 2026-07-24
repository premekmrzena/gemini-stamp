import * as React from 'react';
import { EmailLayout } from './EmailLayout';

interface OrderCancelledEmailProps {
  orderId: string;
  customerName: string;
}

export const OrderCancelledEmail: React.FC<Readonly<OrderCancelledEmailProps>> = ({
  orderId,
  customerName,
}) => {
  return (
    <EmailLayout footerNote="Tento e-mail je automatickým oznámením o zrušení objednávky.">
      <h2 style={{ fontSize: '20px', marginBottom: '16px', fontWeight: '700' }}>
        Objednávka byla zrušena
      </h2>
      <p style={{ lineHeight: '1.6', fontSize: '15px', color: '#CBD5E1' }}>
        Ahoj {customerName},<br />
        objednávka <strong style={{ color: '#FDFBF7' }}>#{orderId}</strong> byla zrušena a dál se nepřipravuje.
      </p>
      <p style={{ lineHeight: '1.6', fontSize: '15px', color: '#CBD5E1', marginTop: '16px' }}>
        Pokud jste za objednávku již zaplatili, peníze vám v nejbližších dnech vrátíme na stejný platební prostředek.
      </p>
      <p style={{ lineHeight: '1.6', fontSize: '15px', color: '#CBD5E1', marginTop: '16px' }}>
        Máte-li k tomu dotaz, klidně nám odpovězte na tento e-mail.
      </p>
    </EmailLayout>
  );
};
