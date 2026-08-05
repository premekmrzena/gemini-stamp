import * as React from 'react';
import { CartItemSnapshot, Currency } from '@/types/database';
import { BANK_ACCOUNT_NUMBER, BANK_IBAN, BANK_SWIFT } from '@/lib/czechQrPayment';
import { formatPrice } from '@/lib/currency';
import { EmailLayout } from './EmailLayout';

interface OrderEmailProps {
  orderId: string;
  customerName: string;
  totalPrice: number;
  currency: Currency;
  cartItems: CartItemSnapshot[];
  bankTransfer: { variableSymbol: string; qrCodeCid: string } | null;
}

export const OrderConfirmationEmail: React.FC<Readonly<OrderEmailProps>> = ({
  orderId,
  customerName,
  totalPrice,
  currency,
  cartItems,
  bankTransfer,
}) => {
  return (
    <EmailLayout footerNote="This email confirms that we've received your order in our system.">
      <h2 style={{ fontSize: '20px', marginBottom: '16px', fontWeight: '600' }}>
        Thank you for your order!
      </h2>
      <p style={{ lineHeight: '1.6', fontSize: '15px', color: '#CBD5E1' }}>
        Hi {customerName},<br />
        your order <strong style={{ color: '#FDFBF7' }}>#{orderId}</strong>&nbsp;has been successfully received and we&apos;ll start preparing it soon.
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
                Item
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
                Price
              </th>
            </tr>
          </thead>
          <tbody>
            {cartItems && cartItems.map((item, index) => (
              <tr key={index}>
                <td style={{ padding: '16px 0', borderBottom: '1px solid #2B3755' }}>
                  <div style={{ fontSize: '15px', fontWeight: '600', color: '#FDFBF7', marginBottom: '4px' }}>
                    {item.name}
                  </div>
                  <div style={{ fontSize: '13px', color: '#8B95AC' }}>
                    {item.quantity} pcs
                  </div>
                </td>
                <td style={{
                  textAlign: 'right',
                  padding: '16px 0',
                  borderBottom: '1px solid #2B3755',
                  fontWeight: '600',
                  color: '#FDFBF7',
                  fontSize: '15px',
                  verticalAlign: 'top'
                }}>
                  {formatPrice(item.price * item.quantity, currency)}
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
          Total due
        </p>
        <p style={{
          margin: '5px 0 0 0',
          fontSize: '24px',
          fontWeight: '600',
          color: '#22C55E'
        }}>
          {formatPrice(totalPrice, currency)}
        </p>
      </div>

      {bankTransfer && (
        <div style={{
          marginTop: '28px',
          paddingTop: '24px',
          borderTop: '1px solid #334155',
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 16px 0', color: '#FDFBF7' }}>
            Bank transfer payment details
          </h3>
          <style dangerouslySetInnerHTML={{ __html: `
            @media (max-width: 480px) {
              .qr-payment-cell { display: block !important; width: 100% !important; text-align: center !important; padding: 0 0 16px 0 !important; }
              .qr-payment-cell img { margin: 0 auto !important; }
              .qr-payment-text { display: block !important; width: 100% !important; padding-left: 0 !important; }
            }
          `}} />
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td className="qr-payment-cell" style={{ verticalAlign: 'top', width: '132px', paddingBottom: '12px' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- e-mailový klient, next/image tu nejde použít (navíc cid: příloha) */}
                  <img
                    src={`cid:${bankTransfer.qrCodeCid}`}
                    width={132}
                    height={132}
                    alt="Payment QR code"
                    style={{ display: 'block', borderRadius: '6px' }}
                  />
                </td>
                <td className="qr-payment-text" style={{ verticalAlign: 'top', paddingLeft: '20px', fontSize: '14px', color: '#CBD5E1', lineHeight: '1.8' }}>
                  <div>Account number: <strong style={{ color: '#FDFBF7' }}>{BANK_ACCOUNT_NUMBER}</strong></div>
                  <div>IBAN: <strong style={{ color: '#FDFBF7' }}>{BANK_IBAN.replace(/(.{4})/g, '$1 ').trim()}</strong></div>
                  <div>SWIFT/BIC: <strong style={{ color: '#FDFBF7' }}>{BANK_SWIFT}</strong></div>
                  <div>Variable symbol: <strong style={{ color: '#FDFBF7' }}>{bankTransfer.variableSymbol}</strong></div>
                  <div>Amount: <strong style={{ color: '#FDFBF7' }}>{formatPrice(totalPrice, currency)}</strong></div>
                </td>
              </tr>
            </tbody>
          </table>
          <p style={{ fontSize: '13px', color: '#8B95AC', marginTop: '14px', lineHeight: '1.5' }}>
            Scan the QR code in your banking app to prefill the payment, or enter the details manually. We&apos;ll start preparing your order once the payment arrives in our account.
          </p>
        </div>
      )}
    </EmailLayout>
  );
};
