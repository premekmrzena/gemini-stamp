import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Inicializace Stripe s tvým tajným klíčem z .env.local
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-02-25.clover', // Aktualizováno na verzi, kterou vyžaduje nové SDK
});

export async function POST(request: Request) {
  try {
    // Získáme data, která nám pošle náš košík (celkovou částku)
    const body = await request.json();
    const { amount } = body; 

    // OCHRANA: Tady by v reálné velké aplikaci proběhla kontrola košíku proti databázi, 
    // aby si uživatel nemohl v prohlížeči snížit cenu. Pro náš start to zatím necháme takto.

    // Vytvoříme PaymentIntent u Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Stripe počítá v nejmenších jednotkách (pro CZK jsou to haléře, proto * 100)
      currency: 'czk',
      automatic_payment_methods: {
        enabled: true, // Stripe automaticky nabídne karty, Apple Pay atd. podle lokace
      },
    });

    // Vrátíme bezpečný klíč (client_secret) zpět do našeho frontendu
    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
    
  } catch (error: any) {
    console.error('Chyba při komunikaci se Stripe:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}