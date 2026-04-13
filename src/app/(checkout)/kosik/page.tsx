'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Button from '@/components/Button';
import { useCart } from '@/context/CartContext';
import StripePaymentForm from '@/components/StripePaymentForm';
import { supabase } from '@/lib/supabase';

// --- CHYTRÁ DATA PRO DOPRAVU (Závislá na váze) ---
const getShippingOptions = (weight: number) => {
  let czPrice = 120;
  if (weight <= 50) czPrice = 40;
  else if (weight <= 500) czPrice = 80;

  let intPrice = weight <= 500 ? 150 : 300;

  return [
    { 
      id: 'osobni', 
      name: 'Osobní odběr (Praha)', 
      price: 0, 
      desc: 'Svoji objednávku si můžete vyzvednout na adrese: Jindřišská 126/15, Praha 1' 
    },
    { 
      id: 'ceska', 
      name: `Česká republika`,
      price: czPrice, 
      desc: czPrice === 40 ? 'Obyčejné psaní' : (czPrice === 80 ? 'Doporučené psaní' : 'Balíček')
    },
    { 
      id: 'mezinarodni', 
      name: `Mezinárodní doprava`,
      price: intPrice, 
      desc: 'Zemi doručení zadáte v dalším kroku'
    },
  ];
};

const paymentOptions = [
  { id: 'karta', name: 'Online platba kartou', price: 0, desc: 'Bezpečně přes Stripe' },
  { id: 'prevod', name: 'Bankovní převod', price: 0, desc: 'Pokyny obdržíte v e-mailu' },
];

// --- POMOCNÉ KOMPONENTY PRO FORMULÁŘ ---
const InputField = ({ label, ...props }: any) => (
  <div className="w-full flex flex-col gap-2">
    <label className="style-body-bold text-secondary">{label}</label>
    <input 
      {...props} 
      className="bg-secondary border border-black400 rounded-[4px] px-4 h-[48px] style-body text-black-custom placeholder:text-black300 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
    />
  </div>
);

const TextAreaField = ({ label, ...props }: any) => (
  <div className="w-full flex flex-col gap-2">
    <label className="style-body-bold text-secondary">{label}</label>
    <textarea 
      {...props} 
      className="bg-secondary border border-black400 rounded-[4px] p-4 min-h-[100px] style-body text-black-custom placeholder:text-black300 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-y"
    />
  </div>
);

const internationalCountries = [
  "", "Japonsko", "Jižní Korea", "Čína", "Vietnam", "---",
  "Austrálie", "Belgie", "Francie", "Itálie", "Kanada", "Německo", 
  "Nizozemsko", "Polsko", "Rakousko", "Slovensko", "Spojené království", 
  "Spojené státy (USA)", "Španělsko", "Švýcarsko"
];

const SelectField = ({ label, options, ...props }: any) => (
  <div className="w-full flex flex-col gap-2">
    <label className="style-body-bold text-secondary">{label}</label>
    <div className="relative">
      <select 
        {...props} 
        className="w-full bg-secondary border border-black400 rounded-[4px] px-4 h-[48px] style-body text-black-custom outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {options.map((opt: string, i: number) => (
          <option key={i} value={opt} disabled={opt === '---' || opt === ''}>
            {opt === '' ? 'Vyberte zemi...' : opt}
          </option>
        ))}
      </select>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-black-custom">
        <svg width="12" height="8" viewBox="0 0 12 8" fill="none"><path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </div>
    </div>
  </div>
);

// --- HLAVNÍ KOMPONENTA STRÁNKY ---
const CheckoutPage = () => {
  const { cartItems, cartTotal, removeFromCart, updateQuantity } = useCart();

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedShipping, setSelectedShipping] = useState('osobni');
  const [selectedPayment, setSelectedPayment] = useState(paymentOptions[0].id);
  
  const [showCompanyFields, setShowCompanyFields] = useState(false);
  const [shippingDifferentThanOrdering, setShippingDifferentThanOrdering] = useState(false);
  const [customerNote, setCustomerNote] = useState('');

  const [formData, setFormData] = useState({
    billing_first_name: '', billing_last_name: '', billing_email: '', billing_phone: '',
    billing_company_name: '', billing_company_id: '', billing_company_tax_id: '',
    billing_address_line1: '', billing_address_line2: '', billing_city: '', billing_region: '', billing_zip: '', billing_country: 'Česká republika',
    shipping_first_name: '', shipping_last_name: '', shipping_phone: '', shipping_company_name: '',
    shipping_address_line1: '', shipping_address_line2: '', shipping_city: '', shipping_region: '', shipping_zip: '', shipping_country: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const isMezinarodni = selectedShipping === 'mezinarodni';
  const isOsobni = selectedShipping === 'osobni';
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const totalWeightGrams = cartItems.reduce((sum, item) => sum + (item.weight_grams || 0) * item.quantity, 0);
  const currentShippingOptions = getShippingOptions(totalWeightGrams);
  const shippingCost = currentShippingOptions.find(o => o.id === selectedShipping)?.price || 0;
  const paymentCost = paymentOptions.find(o => o.id === selectedPayment)?.price || 0;
  const totalOrderPrice = cartTotal + shippingCost + paymentCost;

  // --- FUNKCE PRO ODESLÁNÍ OBJEDNÁVKY ---
const submitOrder = async () => {
  if (isSubmitting) return;
  setIsSubmitting(true);
  setOrderError(null);

  const orderData = {
    total_price: totalOrderPrice,
    shipping_method: currentShippingOptions.find(o => o.id === selectedShipping)?.name || 'Neznámá',
    shipping_cost: shippingCost,
    payment_method: paymentOptions.find(o => o.id === selectedPayment)?.name || 'Neznámá',
    payment_cost: paymentCost,
    cart_items: cartItems,
    customer_note: customerNote,
    status: 'Nová',
    ...formData,
    shipping_is_different: shippingDifferentThanOrdering,
    ...(isOsobni && { shipping_is_different: false })
  };

  try {
    // 1. Uložení do Supabase (musí proběhnout jako první)
    const { data, error } = await supabase
      .from('orders')
      .insert([orderData])
      .select('id')
      .single();

    if (error) throw error;
    
    const newOrderId = data.id;
    setCreatedOrderId(newOrderId);

    // 2. ODESLÁNÍ E-MAILU PŘES RESEND (BĚŽÍ NA POZADÍ)
    // Odebrali jsme 'await', aby se okamžitě pokračovalo k platbě
    // Odeslání e-mailu na pozadí
fetch('/api/send-confirmation', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: formData.billing_email,
    orderId: newOrderId.slice(-8).toUpperCase(),
    customerName: formData.billing_first_name,
    totalPrice: totalOrderPrice,
    cartItems: cartItems, // TENTO ŘÁDEK JSME PŘIDALI
  }),
}).catch(err => console.error("Email background error:", err));

    // 3. Rozcestník podle platby (SPOUŠTÍ SE IHNED)
    if (selectedPayment === 'karta') {
      // Modal se nyní otevře okamžitě, což vyřeší chybu IntegrationError
      setIsPaymentModalOpen(true);
      setIsSubmitting(false);
    } else {
      window.location.href = `/dekujeme?orderId=${newOrderId}`;
    }

  } catch (error: any) {
    console.error('Chyba objednávky:', error);
    setOrderError(error.message || 'Něco se pokazilo.');
    setIsSubmitting(false);
  }
};

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  if (cartItems.length === 0) {
    return (
      <div className="w-full min-h-screen flex flex-col bg-black-custom">
        <header className="w-full bg-[#252C3C] border-b border-black300/30 h-[80px] md:h-[98px] lg:h-[116px] flex items-center justify-center">
          <div className="w-full max-w-[1440px] mx-auto px-4 lg:px-[84px] flex items-center justify-center lg:justify-start">
            <Link href="/" className="flex-shrink-0 flex items-center h-full">
              <Image src="/images/creative-stamp_logo.svg" alt="Creative Stamp Logo" width={250} height={69} priority className="h-[56px] w-auto md:w-[250px] md:h-auto object-contain" />
            </Link>
          </div>
        </header>
        <div className="flex-grow flex flex-col items-center justify-center py-[100px] px-4 gap-6 text-center">
          <h1 className="style-h2 text-secondary">Váš košík je prázdný</h1>
          <Link href="/" className="mt-4"><Button>Zpět k nákupu</Button></Link>
        </div>
      </div>
    );
  }

  const renderOrderSummary = () => (
    <aside className="w-full lg:w-1/3 flex flex-col gap-6 lg:sticky lg:top-32 h-fit lg:order-2">
      <div className="bg-secondary rounded-[4px] p-4 shadow-xl text-black-custom flex flex-col">
        <h3 className="style-h3 text-center mb-4">Shrnutí objednávky</h3>
        {cartItems.map(item => (
          <div key={item.id} className="flex items-center gap-4 py-4 border-t border-black200">
            <div className="relative w-12 h-12 shrink-0 border border-black200 rounded-[4px] overflow-hidden bg-white p-1">
              <Image src={item.image_url} alt={item.name} fill className="object-contain" />
            </div>
            <div className="flex-grow flex flex-col gap-1">
              <h4 className="style-body text-black-custom line-clamp-2">{item.name}</h4>
              <p className="style-body text-black300">{item.quantity} ks</p>
            </div>
            <p className="style-body text-black-custom shrink-0">{(item.price * item.quantity).toLocaleString('cs-CZ')} Kč</p>
          </div>
        ))}
        <div className="flex flex-col gap-2 py-4 border-t border-black200 style-body text-black-custom">
          <div className="flex justify-between items-center"><span>Mezisoučet</span><span>{cartTotal.toLocaleString('cs-CZ')} Kč</span></div>
          <div className="flex justify-between items-center"><span>Doprava</span><span>{shippingCost} Kč</span></div>
        </div>
        <div className="flex justify-between items-center pt-4 border-t border-black200">
          <span className="style-body-bold text-black-custom">Celkem</span>
          <span className="style-product-price text-success">{totalOrderPrice.toLocaleString('cs-CZ')} Kč</span>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="w-full min-h-screen flex flex-col bg-black-custom relative">
      <header className="sticky top-0 z-40 w-full bg-[#252C3C] border-b border-black300/30 h-[80px] md:h-[98px] lg:h-[116px] flex items-center justify-center shadow-md">
        <div className="w-full max-w-[1440px] mx-auto px-4 lg:px-[84px] flex items-center justify-between">
          <Link href="/" className="flex-shrink-0 flex items-center h-full">
            <Image src="/images/creative-stamp_logo.svg" alt="Logo" width={250} height={69} priority className="hidden md:block w-[250px] h-auto object-contain" />
            <Image src="/images/logo-black200_basked-mobile.svg" alt="Logo Mobile" width={40} height={40} priority className="block md:hidden h-[40px] w-auto object-contain" />
          </Link>
          <div className="flex items-center">
            {[1, 2, 3].map((step, index) => (
              <div key={step} className="flex items-center">
                <div className={`flex items-center justify-center rounded-full font-medium transition-colors w-[36px] h-[36px] ${currentStep === step ? 'bg-primary text-black-custom' : 'bg-transparent text-black300 border border-black300'}`}>
                  {step}
                </div>
                {index < 2 && <div className="h-[1px] bg-black300 w-[10px] md:w-[16px]" />}
              </div>
            ))}
          </div>
        </div>
      </header>

      <main className="flex-grow w-full px-4 lg:px-[84px] pt-[32px] md:pt-[64px] pb-[140px] max-w-[1440px] mx-auto">
        <div className="w-full flex flex-col lg:flex-row gap-8 items-start">
          <div className="w-full lg:w-2/3 flex flex-col gap-8 lg:order-1">
            {currentStep === 1 && (
              <div className="flex flex-col gap-2">
                <h3 className="style-h3 text-secondary mb-2">Košík</h3>
                {cartItems.map(item => (
                  <div key={item.id} className="py-5 border-b border-black400 flex items-stretch gap-5">
                    <div className="relative w-[80px] h-[80px] shrink-0 bg-white rounded-[4px] p-1">
                      <Image src={item.image_url} alt={item.name} fill className="object-contain" />
                    </div>
                    <div className="flex-grow flex flex-col justify-between py-1">
                      <div className="flex justify-between items-start gap-4">
                        <h4 className="style-h4 text-secondary line-clamp-2">{item.name}</h4>
                        <button onClick={() => removeFromCart(item.id)} className="text-black300 hover:text-primary transition-colors">
                          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <div className="flex items-center bg-secondary rounded-full px-3 py-1 gap-3">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="text-black-custom">−</button>
                          <span className="style-body-bold text-black-custom">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="text-black-custom">+</button>
                        </div>
                        <p className="style-product-price text-success">{(item.price * item.quantity).toLocaleString('cs-CZ')} Kč</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {currentStep === 2 && (
              <div className="flex flex-col gap-8">
                <div>
                  <h3 className="style-h3 text-secondary mb-4">Doprava</h3>
                  {currentShippingOptions.map(option => (
                    <label key={option.id} className="py-5 flex items-start gap-4 cursor-pointer border-b border-black400 group">
                      <div className={`mt-[2px] w-5 h-5 shrink-0 rounded-full border-2 flex items-center justify-center ${selectedShipping === option.id ? 'border-secondary' : 'border-black200'}`}>
                        {selectedShipping === option.id && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                      </div>
                      <div className="flex-grow flex flex-col gap-1">
                        <div className="flex justify-between items-start gap-4">
                          <h4 className={`style-h4 ${selectedShipping === option.id ? 'text-primary' : 'text-secondary'}`}>{option.name}</h4>
                          <span className="style-body text-secondary">{option.price} Kč</span>
                        </div>
                        <p className="style-body text-black200">{option.desc}</p>
                      </div>
                      <input type="radio" checked={selectedShipping === option.id} onChange={() => setSelectedShipping(option.id)} className="sr-only" />
                    </label>
                  ))}
                </div>
                <div>
                  <h3 className="style-h3 text-secondary mb-4">Platba</h3>
                  {paymentOptions.map(option => (
                    <label key={option.id} className="py-5 flex items-start gap-4 cursor-pointer border-b border-black400 group">
                      <div className={`mt-[2px] w-5 h-5 shrink-0 rounded-full border-2 flex items-center justify-center ${selectedPayment === option.id ? 'border-secondary' : 'border-black200'}`}>
                        {selectedPayment === option.id && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                      </div>
                      <div className="flex-grow flex flex-col gap-1">
                        <h4 className={`style-h4 ${selectedPayment === option.id ? 'text-primary' : 'text-secondary'}`}>{option.name}</h4>
                        <p className="style-body text-black200">{option.desc}</p>
                      </div>
                      <input type="radio" checked={selectedPayment === option.id} onChange={() => setSelectedPayment(option.id)} className="sr-only" />
                    </label>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-6">
                  <h3 className="style-h3 text-secondary">Údaje</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="Jméno" name="billing_first_name" value={formData.billing_first_name} onChange={handleInputChange} required />
                    <InputField label="Příjmení" name="billing_last_name" value={formData.billing_last_name} onChange={handleInputChange} required />
                    <InputField label="Telefon" name="billing_phone" value={formData.billing_phone} onChange={handleInputChange} required />
                    <InputField label="E-mail" name="billing_email" value={formData.billing_email} onChange={handleInputChange} type="email" required />
                    <InputField label="Ulice a č.p." name="billing_address_line1" value={formData.billing_address_line1} onChange={handleInputChange} required />
                    <InputField label="Město" name="billing_city" value={formData.billing_city} onChange={handleInputChange} required />
                    <InputField label="PSČ" name="billing_zip" value={formData.billing_zip} onChange={handleInputChange} required />
                    {isMezinarodni ? (
                      <SelectField label="Země" name="billing_country" value={formData.billing_country} onChange={handleInputChange} options={internationalCountries} required />
                    ) : (
                      <InputField label="Země" value="Česká republika" disabled />
                    )}
                  </div>
                </div>
                <TextAreaField label="Poznámka" value={customerNote} onChange={(e: any) => setCustomerNote(e.target.value)} placeholder="Doplňující info..." />
              </div>
            )}
          </div>
          {renderOrderSummary()}
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 w-full z-50 bg-[#252C3C] border-t border-black300/30 h-[80px] md:h-[116px] flex items-center justify-center shadow-lg">
        <div className="w-full max-w-[1440px] mx-auto px-4 lg:px-[84px] flex justify-between items-center">
          <Button onClick={currentStep === 1 ? undefined : prevStep} variant="outlined" arrow="left">
            {currentStep === 1 ? <Link href="/">Zpět</Link> : 'Zpět'}
          </Button>
          <div className="flex flex-col items-end">
            {orderError && <p className="text-red-500 text-sm mb-2">{orderError}</p>}
            <Button onClick={currentStep === 3 ? submitOrder : nextStep} disabled={isSubmitting} arrow="right">
              {isSubmitting ? 'Odesílám...' : (currentStep === 3 ? (selectedPayment === 'karta' ? 'Zaplatit' : 'Dokončit') : 'Další krok')}
            </Button>
          </div>
        </div>
      </footer>

      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-black400 w-full max-w-[500px] rounded-[16px] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-black300/30 bg-[#252C3C]">
              <h3 className="style-h3 text-secondary">Platba kartou</h3>
              <button onClick={() => setIsPaymentModalOpen(false)} className="text-white text-2xl">×</button>
            </div>
            <div className="p-6 bg-white">
              <StripePaymentForm amount={totalOrderPrice} orderId={createdOrderId || ''} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;