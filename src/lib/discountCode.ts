import { randomBytes } from 'crypto';

// Bez matoucích znaků (0/O, 1/I) - kód se zákazníkovi posílá e-mailem a přepisuje
// ručně do checkoutu, viz DiscountCodeInput.tsx.
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/** Vygeneruje čitelný náhodný kód ve tvaru "PREFIX-XXXXXX" (33^6 ≈ 1.3 mld. kombinací). */
export function generateDiscountCode(prefix: string, length = 6): string {
  const bytes = randomBytes(length);
  const suffix = Array.from(bytes, (b) => CODE_CHARS[b % CODE_CHARS.length]).join('');
  return `${prefix}-${suffix}`;
}
