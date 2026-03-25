'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

// 1. Inicializace Stripe pomocí tvého veřejného klíče z .env.local
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// --- VNITŘNÍ KOMPONENTA: Samotný formulář s tlačítkem ---
const CheckoutForm = ({ amount }: { amount: number }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsLoading(true);

    // Odeslání platby do Stripe
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Sem uživatele přesměrujeme, když platba úspěšně projde.
        // Tuto stránku si vytvoříme hned potom.
        return_url: `${window.location.origin}/dekujeme`,
      },
    });

    // Pokud dojde k chybě (např. zamítnutá karta), ukážeme ji
    if (error) {
      setErrorMessage(error.message || 'Došlo k nečekané chybě při platbě.');
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6 animate-fadeIn">
      {/* Toto je to magické bezpečné políčko od Stripe */}
      <PaymentElement />
      
      <button
        disabled={!stripe || isLoading}
        className="w-full bg-[#FF6B35] text-[#FDFBF7] style-body font-bold py-4 rounded-full hover:bg-[#FF7F51] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
      >
        {isLoading ? 'Zpracovávám platbu...' : `Zaplatit ${amount.toLocaleString('cs-CZ')} Kč`}
      </button>

      {errorMessage && (
        <div className="text-red-400 text-sm text-center font-medium bg-red-400/10 py-3 rounded-[8px]">
          {errorMessage}
        </div>
      )}
    </form>
  );
};

// --- HLAVNÍ KOMPONENTA: Obal, který se stará o komunikaci s backendem ---
export default function StripePaymentForm({ amount }: { amount: number }) {
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    // Hned po načtení komponenty si řekneme backendu o vytvoření Záměru platby
    fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount }),
    })
      .then((res) => res.json())
      .then((data) => setClientSecret(data.clientSecret));
  }, [amount]);

  // Dokud nemáme tajný klíč ze serveru, ukážeme načítání
  if (!clientSecret) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-10 gap-4">
        <div className="w-8 h-8 border-4 border-[#FF6B35] border-t-transparent rounded-full animate-spin"></div>
        <p className="style-body text-sm text-white/50">Načítám bezpečnou platební bránu...</p>
      </div>
    );
  }

  // Jakmile máme klíč, vykreslíme formulář a nastavíme rovnou tmavý režim (night)
  return (
    <div className="bg-[#0F172A] p-1 md:p-6 rounded-[16px] border border-[#8B95AC]/30 shadow-lg">
      <Elements 
        stripe={stripePromise} 
        options={{ 
          clientSecret, 
          appearance: { 
            theme: 'night',
            variables: {
              colorPrimary: '#FF6B35',
              colorBackground: '#2B3755',
              colorText: '#FDFBF7',
              colorDanger: '#ef4444',
              fontFamily: 'Poppins, system-ui, sans-serif',
              borderRadius: '8px',
            }
          } 
        }}
      >
        <CheckoutForm amount={amount} />
      </Elements>
    </div>
  );
}