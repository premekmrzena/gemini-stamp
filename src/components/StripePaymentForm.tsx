'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

// 1. Inicializace Stripe pomocí tvého veřejného klíče
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// --- VNITŘNÍ KOMPONENTA: Samotný formulář s tlačítkem ---
// Přidali jsme orderId do props
const CheckoutForm = ({ amount, orderId }: { amount: number, orderId: string }) => {
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
        // PŘESMĚROVÁNÍ PO ÚSPĚŠNÉ PLATBĚ S ID OBJEDNÁVKY
        return_url: `${window.location.origin}/dekujeme?orderId=${orderId}`,
      },
    });

    // Pokud dojde k chybě (např. zamítnutá karta), kód pokračuje zde
    if (error) {
      setErrorMessage(error.message || 'Došlo k nečekané chybě při platbě.');
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6 animate-fadeIn">
      <PaymentElement />
      
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

// --- HLAVNÍ KOMPONENTA ---
// Přidali jsme orderId do parametrů funkce
export default function StripePaymentForm({ amount, orderId }: { amount: number, orderId: string }) {
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    // Voláme naše API pro vytvoření platby s reálnou částkou
    fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        }
      })
      .catch(err => console.error("Chyba při načítání platby:", err));
  }, [amount]);

  if (!clientSecret) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-10 gap-4">
        <div className="w-8 h-8 border-4 border-[#FF6B35] border-t-transparent rounded-full animate-spin"></div>
        <p className="style-body text-[#FDFBF7]/50">Načítám bezpečnou platební bránu...</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Elements 
        stripe={stripePromise} 
        options={{ 
          clientSecret, 
          appearance: { 
            theme: 'night',
            variables: {
              fontFamily: 'Poppins, system-ui, sans-serif',
              borderRadius: '4px',
              colorPrimary: '#FF6B35', 
              colorDanger: '#F95755', 
              colorBackground: '#0F172A', 
              colorText: '#FDFBF7', 
              colorTextSecondary: '#8B95AC',
            },
            rules: {
              '.Input': {
                backgroundColor: '#FDFBF7', 
                color: '#0F172A', 
                border: '1px solid #2B3755', 
                padding: '12px 16px',
              },
              '.Input:focus': {
                border: '1px solid #FF6B35', 
                boxShadow: '0 0 0 1px #FF6B35', 
              },
              '.Tab--selected': {
                backgroundColor: '#0F172A', 
                borderColor: '#FF6B35',
                color: '#FF6B35',
              },
            }
          } 
        }}
      >
        {/* Předáme orderId dolů do vnitřního formuláře */}
        <CheckoutForm amount={amount} orderId={orderId} />
      </Elements>
    </div>
  );
}