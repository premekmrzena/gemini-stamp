import Stripe from 'stripe';

const STRIPE_API_VERSION = '2026-02-25.clover';

// Jeden Stripe účet (ověřeno 2026-08-06 - EUR jako default settlement currency,
// CZK jako druhá vyplácecí měna na tom samém účtu, viz docs/00-platby-meny-konverze.md).
// Nepotřebujeme routing podle měny objednávky na víc účtů - Stripe sám vyplatí
// CZK platby na CZK bankovní účet a EUR platby na EUR bankovní účet, obojí
// bez konverze. Klient se staví líně (ne na modulové úrovni), ať chybějící
// env proměnná nespadne celý build - viz feedback_vercel_build_env_var_check.
let client: Stripe | undefined;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Chybí env proměnná ${name}`);
  return value;
}

export function getStripeClient(): Stripe {
  if (!client) {
    client = new Stripe(requireEnv('STRIPE_SECRET_KEY'), { apiVersion: STRIPE_API_VERSION });
  }
  return client;
}

export function getStripeWebhookSecret(): string {
  return requireEnv('STRIPE_WEBHOOK_SECRET');
}
