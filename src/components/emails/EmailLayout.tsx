import * as React from 'react';

interface EmailLayoutProps {
  footerNote: string;
  children: React.ReactNode;
}

// Sdílená kostra pro všechny transakční e-maily - inline styly (ne Tailwind), protože
// e-mailoví klienti externí CSS/třídy nerespektují. Vytáhnuto z OrderConfirmationEmail a
// ShippingNotificationEmail beze změny vizuálního výstupu.
export function EmailLayout({ footerNote, children }: EmailLayoutProps) {
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
          {children}
        </div>

        <div style={{
          fontSize: '12px',
          color: '#64748B',
          marginTop: '40px',
          textAlign: 'center',
          lineHeight: '1.5'
        }}>
          <p style={{ margin: '0 0 10px 0' }}>My Creative Stamp • Jindřišská 126/15, Praha 1</p>
          <p style={{ margin: '0' }}>{footerNote}</p>
        </div>
      </div>
    </div>
  );
}
