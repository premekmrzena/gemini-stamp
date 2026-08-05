import * as React from 'react';
import { EmailLayout } from './EmailLayout';

interface ShipmentLostEmailProps {
  orderId: string;
  customerName: string;
}

export const ShipmentLostEmail: React.FC<Readonly<ShipmentLostEmailProps>> = ({
  orderId,
  customerName,
}) => {
  return (
    <EmailLayout footerNote="This email is an automatic notification about an issue with your shipment.">
      <h2 style={{ fontSize: '20px', marginBottom: '16px', fontWeight: '600' }}>
        An update on your shipment
      </h2>
      <p style={{ lineHeight: '1.6', fontSize: '15px', color: '#CBD5E1' }}>
        Hi {customerName},<br />
        it looks like your order <strong style={{ color: '#FDFBF7' }}>#{orderId}</strong>&nbsp;has gone missing in transit. We&apos;re sorry for the inconvenience.
      </p>
      <p style={{ lineHeight: '1.6', fontSize: '15px', color: '#CBD5E1', marginTop: '16px' }}>
        We&apos;re looking into it with the carrier and will be in touch shortly to sort out a solution. If you&apos;d like to reach us in the meantime, just reply to this email.
      </p>
    </EmailLayout>
  );
};
