import * as React from 'react';
import { EmailLayout } from './EmailLayout';

interface ComplaintRegisteredEmailProps {
  orderId: string;
  customerName: string;
}

export const ComplaintRegisteredEmail: React.FC<Readonly<ComplaintRegisteredEmailProps>> = ({
  orderId,
  customerName,
}) => {
  return (
    <EmailLayout footerNote="This email is an automatic notification that your complaint has been registered.">
      <h2 style={{ fontSize: '20px', marginBottom: '16px', fontWeight: '600' }}>
        We&apos;ve registered your complaint
      </h2>
      <p style={{ lineHeight: '1.6', fontSize: '15px', color: '#CBD5E1' }}>
        Hi {customerName},<br />
        we&apos;ve registered a complaint for your order <strong style={{ color: '#FDFBF7' }}>#{orderId}</strong>&nbsp;and we&apos;re now looking into it.
      </p>
      <p style={{ lineHeight: '1.6', fontSize: '15px', color: '#CBD5E1', marginTop: '16px' }}>
        We&apos;ll get back to you with an update as soon as possible. If you&apos;d like to add any details, just reply to this email.
      </p>
    </EmailLayout>
  );
};
