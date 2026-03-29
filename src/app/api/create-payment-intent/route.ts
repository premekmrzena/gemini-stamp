import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Inicializace Stripe s tvým tajným klíčem z .env.local
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-02-25.clover' as any, // Přetypováno pro kompatibilitu s SDK
});

export async function POST(request: Request) {
  try {
    // 1. Získáme data z frontendu (košíku)
    const body = await request.json();
    const { amount } = body; 

    // OCHRANA: Kontrola, zda máme částku a zda je to číslo
    if (!amount || typeof amount !== 'number') {
      return NextResponse.json(
        { error: 'Neplatná částka objednávky' },
        { status: 400 }
      );
    }

    // 2. Vytvoříme PaymentIntent u Stripe
    // Math.round zajistí, že pošleme Stripe vždy celé číslo v haléřích
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), 
      currency: 'czk',
      automatic_payment_methods: {
        enabled: true, // Automaticky nabídne Karty, Google Pay, Apple Pay
      },
      // Volitelně můžeme přidat metadata pro lepší přehled v Stripe Dashboardu
      metadata: {
        integration_check: 'accept_a_payment',
      },
    });

    // 3. Vrátíme bezpečný klíč (client_secret) zpět do našeho frontendu
    return NextResponse.json({ 
      clientSecret: paymentIntent.client_secret 
    });
    
  } catch (error: any) {
    console.error('Chyba při komunikaci se Stripe:', error);
    return NextResponse.json(
      { error: error.message || 'Interní chyba serveru při vytváření platby' },
      { status: 500 }
    );
  }
}