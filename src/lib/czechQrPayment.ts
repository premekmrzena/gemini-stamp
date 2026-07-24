import QRCode from 'qrcode';

export const BANK_IBAN = 'CZ0430300000003686330015';
export const BANK_ACCOUNT_NUMBER = '3686330015/3030';
export const BANK_NAME = 'Air Bank, a.s.';
export const BANK_SWIFT = 'AIRACZPP';

/**
 * Variabilní symbol musí být čistě číselný (max 10 číslic) - ID objednávky je UUID (hex),
 * takže se posledních 8 hex znaků převede na desítkové číslo (max 4294967295, vejde se do
 * limitu). Stejná hodnota, kterou zákazník vidí jako "shortOrderId" (#1234ABCD) jinde
 * (e-mail, stránka Děkujeme), jen v jiné číselné soustavě - deterministické, dá se dopočítat.
 */
export function getVariableSymbol(orderId: string): string {
  const hex = orderId.replace(/-/g, '').slice(-8);
  return String(parseInt(hex, 16));
}

/**
 * Formát SPD (Short Payment Descriptor) - český standard "QR Platba" čitelný všemi
 * tuzemskými bankovními aplikacemi. Spec: https://qr-platba.cz/pro-vyvojare/
 */
function buildSpdString(params: { amount: number; variableSymbol: string; message: string }): string {
  const parts = [
    'SPD*1.0',
    `ACC:${BANK_IBAN}`,
    `AM:${params.amount.toFixed(2)}`,
    'CC:CZK',
    `X-VS:${params.variableSymbol}`,
    `MSG:${params.message}`,
  ];
  return parts.join('*');
}

/**
 * Vrací QR kód jako PNG buffer - vykresleno lokálně (knihovna `qrcode`), žádná externí služba.
 * Buffer (ne data URL) záměrně - v e-mailu jde jako inline `cid:` příloha, protože Gmail a
 * další klienti `data:` URI v `<img src>` potichu blokují i při povoleném načítání obrázků.
 */
export async function generatePaymentQrCodeBuffer(params: {
  amount: number;
  orderId: string;
  message: string;
}): Promise<Buffer> {
  const spd = buildSpdString({
    amount: params.amount,
    variableSymbol: getVariableSymbol(params.orderId),
    message: params.message,
  });
  return QRCode.toBuffer(spd, { errorCorrectionLevel: 'M', margin: 1, width: 240 });
}
