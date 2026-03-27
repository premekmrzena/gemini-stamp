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
        // Přesměrování po úspěšné platbě
        return_url: `${window.location.origin}/dekujeme`,
      },
    });

    if (error) {
      setErrorMessage(error.message || 'Došlo k nečekané chybě při platbě.');
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6 animate-fadeIn">
      {/* Políčko od Stripe s opravenými styly */}
      <PaymentElement />
      
      {/* Tlačítko upraveno tak, aby mělo tmavý text na oranžovém pozadí (dle návrhu) */}
      <button
        disabled={!stripe || isLoading}
        className="w-full bg-[#FF6B35] text-[#0F172A] style-body-bold py-[14px] rounded-full hover:bg-[#FF7F51] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
      >
        {isLoading ? 'Zpracovávám platbu...' : `Zaplatit ${amount.toLocaleString('cs-CZ')} Kč`}
      </button>

      {errorMessage && (
        <div className="text-[#F95755] text-sm text-center font-medium bg-[#F95755]/10 py-3 rounded-[8px]">
          {errorMessage}
        </div>
      )}
    </form>
  );
};

// --- HLAVNÍ KOMPONENTA: Obal, komunikace s backendem a předání designu ---
export default function StripePaymentForm({ amount }: { amount: number }) {
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount }),
    })
      .then((res) => res.json())
      .then((data) => setClientSecret(data.clientSecret));
  }, [amount]);

  // Loading state
  if (!clientSecret) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-10 gap-4">
        <div className="w-8 h-8 border-4 border-[#FF6B35] border-t-transparent rounded-full animate-spin"></div>
        <p className="style-body text-[#FDFBF7]/50">Načítám bezpečnou platební bránu...</p>
      </div>
    );
  }

  // Vykreslení formuláře s opraveným Appearance API
  return (
    <div className="w-full">
      <Elements 
        stripe={stripePromise} 
        options={{ 
          clientSecret, 
          appearance: { 
            theme: 'night', // Použijeme Stripe 'night' téma jako bezpečný základ
            variables: {
              fontFamily: 'Poppins, system-ui, sans-serif',
              borderRadius: '4px',
              colorPrimary: '#FF6B35', 
              colorDanger: '#F95755', 
              colorBackground: '#0F172A', // Pozadí se sjednotí s naším černým modalem
              colorText: '#FDFBF7', // Bílý text pro nadpisy a labely
              colorTextSecondary: '#8B95AC', // Šedé podtitulky
              colorTextPlaceholder: '#8B95AC', // Šedé placeholdery
            },
            rules: {
              // 1. Políčka formuláře (bílé s černým textem)
              '.Input': {
                backgroundColor: '#FDFBF7', 
                color: '#0F172A', 
                border: '1px solid #2B3755', 
                padding: '12px 16px',
                outline: 'none',
                transition: 'all 0.2s ease',
              },
              '.Input:focus': {
                border: '1px solid #FF6B35', 
                boxShadow: '0 0 0 1px #FF6B35', 
              },
              '.Label': {
                fontWeight: '600',
                fontSize: '15px',
                marginBottom: '8px',
              },
              // 2. Taby nahoře (Karta, Klarna...)
              '.Tab': {
                backgroundColor: '#2B3755', // Tmavé tlačítko pro nevybrané metody
                border: '1px solid #2B3755',
                color: '#FDFBF7',
              },
              '.Tab:hover': {
                backgroundColor: '#3b4b75',
              },
              '.Tab--selected': {
                backgroundColor: '#0F172A', // Ztmavne a získá oranžový okraj, když je vybráno
                borderColor: '#FF6B35',
                color: '#FF6B35',
              },
              // 3. Checkboxy (např. Uložit kartu pro příště)
              '.CheckboxInput': {
                backgroundColor: '#FDFBF7',
                border: '1px solid #2B3755',
              },
              '.CheckboxInput--checked': {
                backgroundColor: '#FF6B35',
                borderColor: '#FF6B35',
              }
            }
          } 
        }}
      >
        <CheckoutForm amount={amount} />
      </Elements>
    </div>
  );
}