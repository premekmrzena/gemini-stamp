'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Button from '@/components/Button';
import { useCart } from '@/context/CartContext';
import StripePaymentForm from '@/components/StripePaymentForm';

// --- MOCK DATA PRO DOPRAVU A PLATBU (dle Figmy) ---
const shippingOptions = [
  { 
    id: 'osobni', 
    name: 'Osobní odběr (Praha)', 
    price: 280, 
    desc: 'Svoji objednávku si můžete vyzvednout na adrese: Jindřišská 126/15, Praha 1' 
  },
  { 
    id: 'ceska', 
    name: 'Česká republika', 
    price: 280, 
    desc: 'Vnitrostátní doprava' 
  },
  { 
    id: 'mezinarodni', 
    name: 'Mezinárodní doprava', 
    price: 280, 
    desc: 'Vyberte cílovou zemi',
    hasSelect: true
  },
];

const paymentOptions = [
  { id: 'karta', name: 'Online platba kartou', price: 280, desc: 'Vnitrostátní doprava' },
  { id: 'google', name: 'Google Pay', price: 280, desc: 'Vnitrostátní doprava' },
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

// --- HLAVNÍ KOMPONENTA STRÁNKY ---
const CheckoutPage = () => {
  const { cartItems, cartTotal, removeFromCart, updateQuantity } = useCart();

  // --- STAVY POKLADNY ---
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedShipping, setSelectedShipping] = useState(shippingOptions[0].id);
  const [selectedPayment, setSelectedPayment] = useState(paymentOptions[0].id);
  
  // --- STAVY PRO KROK 3 (Objednatel / Adresát) ---
  const [showCompanyFields, setShowCompanyFields] = useState(false);
  const [shippingDifferentThanOrdering, setShippingDifferentThanOrdering] = useState(false);
  
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // --- VÝPOČTY CELKOVÉ CENY ---
  const shippingCost = shippingOptions.find(o => o.id === selectedShipping)?.price || 0;
  const paymentCost = paymentOptions.find(o => o.id === selectedPayment)?.price || 0;
  const totalOrderPrice = cartTotal + shippingCost + paymentCost;

  // --- LOGIKA KROKŮ ---
  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  // --- STAV: PRÁZDNÝ KOŠÍK ---
  if (cartItems.length === 0) {
    return (
      <div className="w-full min-h-screen flex flex-col bg-black-custom">
        <header className="w-full bg-[#252C3C] border-b border-black300/30 h-[80px] md:h-[98px] lg:h-[116px] flex items-center justify-center">
          <div className="w-full max-w-[1440px] mx-auto px-4 lg:px-[84px] flex items-center justify-center lg:justify-start">
            <Link href="/" aria-label="Zpět na hlavní stránku" className="flex-shrink-0 flex items-center h-full">
              <Image src="/images/creative-stamp_logo.svg" alt="Creative Stamp Logo" width={250} height={69} priority className="h-[56px] w-auto md:w-[250px] md:h-auto object-contain" />
            </Link>
          </div>
        </header>
        <div className="flex-grow flex flex-col items-center justify-center py-[100px] px-4 gap-6 text-center">
          <div className="w-24 h-24 mb-4 rounded-full bg-black400 flex items-center justify-center">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-primary stroke-[1.5px] stroke-linecap-round stroke-linejoin-round">
              <circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
          </div>
          <h1 className="style-h2 text-secondary">Váš košík je prázdný</h1>
          <p className="style-body text-secondary/70 max-w-md">Vypadá to, že jste si zatím nevybrali žádnou známku. Pojďme to napravit a objevit skvosty do vaší sbírky.</p>
          <Link href="/" className="mt-4"><Button>Zpět k nákupu</Button></Link>
        </div>
      </div>
    );
  }

  // --- SOUHRN OBJEDNÁVKY (Pravý sloupec) ---
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
          <div className="flex justify-between items-center">
            <span>Mezisoučet</span><span>{cartTotal.toLocaleString('cs-CZ')} Kč</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Doprava</span><span>{shippingCost > 0 ? `${shippingCost} Kč` : '0 Kč'}</span>
          </div>
          {paymentCost > 0 && (
            <div className="flex justify-between items-center">
              <span>Platba</span><span>{paymentCost} Kč</span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 py-4 border-t border-black200">
          <div className="w-full flex flex-col gap-2">
            <label className="style-body-bold text-black-custom">Mám slevový kupon</label>
            <input type="text" placeholder="Vložte kód" className="bg-transparent border border-black200 rounded-[8px] px-4 h-[48px] style-body text-black-custom placeholder:text-black300 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
          </div>
          <button className="style-body-bold text-primary hover:text-primary-hover self-end transition-colors mt-1">Uplatnit kód</button>
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
      
      {/* HLAVIČKA */}
      <header className="sticky top-0 z-40 w-full bg-[#252C3C] border-b border-black300/30 h-[80px] md:h-[98px] lg:h-[116px] flex items-center justify-center shadow-md">
        <div className="w-full max-w-[1440px] mx-auto px-4 lg:px-[84px] flex items-center justify-between">
          <Link href="/" aria-label="Zpět na hlavní stránku" className="flex-shrink-0 flex items-center h-full">
            <Image src="/images/creative-stamp_logo.svg" alt="Logo" width={250} height={69} priority className="hidden md:block w-[250px] h-auto object-contain" />
            <Image src="/images/logo-black200_basked-mobile.svg" alt="Logo Mobile" width={40} height={40} priority className="block md:hidden h-[40px] w-auto object-contain" />
          </Link>
          <div className="flex items-center">
            {[1, 2, 3].map((step, index) => (
              <div key={step} className="flex items-center">
                <div className={`flex items-center justify-center rounded-full font-medium tracking-[-0.02em] leading-none transition-colors duration-300 w-[36px] h-[36px] text-[16px] md:w-[44px] md:h-[44px] md:text-[21px] lg:w-[48px] lg:h-[48px] lg:text-[28px] ${currentStep === step ? 'bg-primary text-black-custom border-none' : 'bg-transparent text-black300 border border-black300'}`}>
                  {step}
                </div>
                {index < 2 && <div className="h-[1px] md:h-[1.5px] bg-black300 w-[10px] md:w-[12px] lg:w-[16px] transition-colors duration-300" />}
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* HLAVNÍ OBSAH */}
      <main className="flex-grow w-full px-4 lg:px-[84px] pt-[32px] md:pt-[54px] lg:pt-[64px] pb-[140px] max-w-[1440px] mx-auto animate-fadeIn">
        <div className="w-full flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
          
          <div className="w-full lg:w-2/3 flex flex-col gap-8 lg:order-1">
            
            {/* KROK 1 */}
            {currentStep === 1 && (
              <div className="flex flex-col gap-2">
                <h3 className="style-h3 text-secondary mb-2">Košík</h3>
                <div className="flex flex-col">
                  {cartItems.map(item => (
                    <div key={item.id} className="py-5 border-b border-black400 flex items-stretch gap-5">
                      <div className="relative w-[80px] h-[80px] shrink-0 bg-white rounded-[4px] p-1">
                        <Image src={item.image_url} alt={item.name} fill className="object-contain" />
                      </div>
                      <div className="flex-grow flex flex-col justify-between py-1">
                        <div className="flex justify-between items-start gap-4">
                          <h4 className="style-h4 text-secondary line-clamp-2">{item.name}</h4>
                          <button onClick={() => removeFromCart(item.id)} className="text-black300 hover:text-primary transition-colors shrink-0 mt-1" aria-label="Odstranit">
                            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <div className="flex items-center bg-secondary rounded-full px-3 py-1 gap-3">
                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="text-black-custom text-lg font-medium hover:text-primary transition-colors leading-none">−</button>
                            <span className="style-body-bold text-black-custom min-w-[16px] text-center">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="text-black-custom text-lg font-medium hover:text-primary transition-colors leading-none">+</button>
                          </div>
                          <p className="style-product-price text-success">{(item.price * item.quantity).toLocaleString('cs-CZ')} Kč</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* KROK 2 */}
            {currentStep === 2 && (
              <div className="flex flex-col gap-[24px] md:gap-[28px] lg:gap-[32px] animate-fadeIn">
                <div className="flex flex-col">
                  <h3 className="style-h3 text-secondary mb-2">Doprava</h3>
                  <div className="flex flex-col">
                    {shippingOptions.map(option => {
                      const isSelected = selectedShipping === option.id;
                      return (
                        <label key={option.id} className="py-5 flex items-start gap-4 cursor-pointer border-b border-black400 group">
                          <div className={`mt-[2px] w-5 h-5 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'border-secondary bg-transparent' : 'border-black200 bg-black200 group-hover:bg-black300'}`}>
                            {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                          </div>
                          <div className="flex-grow flex flex-col gap-1">
                            <div className="flex justify-between items-start gap-4">
                              <h4 className={`style-h4 transition-colors ${isSelected ? 'text-primary' : 'text-secondary'}`}>{option.name}</h4>
                              <span className="style-body text-secondary shrink-0">{option.price > 0 ? `${option.price} Kč` : 'Zdarma'}</span>
                            </div>
                            <p className="style-body text-black200">{option.desc}</p>
                            {option.hasSelect && isSelected && (
                              <div className="relative mt-4 w-full md:w-2/3 lg:w-1/2 animate-fadeIn">
                                <select className="w-full bg-secondary border border-black200 text-black-custom rounded-[4px] px-4 h-[48px] style-body outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none cursor-pointer">
                                  <option value="" className="text-black300">Vyberte zemi...</option><option value="sk">Slovensko</option><option value="de">Německo</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-black-custom">
                                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none"><path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                </div>
                              </div>
                            )}
                          </div>
                          <input type="radio" name="shipping" value={option.id} checked={isSelected} onChange={(e) => setSelectedShipping(e.target.value)} className="sr-only" />
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-col">
                  <h3 className="style-h3 text-secondary mb-2">Platba</h3>
                  <div className="flex flex-col">
                    {paymentOptions.map(option => {
                      const isSelected = selectedPayment === option.id;
                      return (
                        <label key={option.id} className="py-5 flex items-start gap-4 cursor-pointer border-b border-black400 group">
                          <div className={`mt-[2px] w-5 h-5 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'border-secondary bg-transparent' : 'border-black200 bg-black200 group-hover:bg-black300'}`}>
                            {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                          </div>
                          <div className="flex-grow flex flex-col gap-1">
                            <div className="flex justify-between items-start gap-4">
                              <h4 className={`style-h4 transition-colors ${isSelected ? 'text-primary' : 'text-secondary'}`}>{option.name}</h4>
                              <span className="style-body text-secondary shrink-0">{option.price > 0 ? `${option.price} Kč` : 'Zdarma'}</span>
                            </div>
                            <p className="style-body text-black200">{option.desc}</p>
                          </div>
                          <input type="radio" name="payment" value={option.id} checked={isSelected} onChange={(e) => setSelectedPayment(e.target.value)} className="sr-only" />
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* KROK 3 */}
            {currentStep === 3 && (
              <div className="flex flex-col gap-[16px] animate-fadeIn">
                
                {/* --- SEKCJE 1: OBJEDNATEL --- */}
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-1">
                    <h3 className="style-h3 text-secondary">Objednatel</h3>
                    <p className="style-body text-secondary">To jste vy, kdo objednává, platí a komu vystavíme objednávku.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="Jméno" placeholder="Jméno" type="text" required />
                    <InputField label="Příjmení" placeholder="Příjmení" type="text" required />
                    <InputField label="Telefon" placeholder="Telefon" type="tel" required />
                    <InputField label="E-mail" placeholder="E-mail" type="email" required />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="Ulice a číslo popisné" placeholder="Ulice a číslo popisné" type="text" required />
                    <InputField label="Město" placeholder="Město" type="text" required />
                    <InputField label="PSČ" placeholder="PSČ" type="text" required />
                    <InputField label="Stát" placeholder="Stát" type="text" required />
                  </div>

                  <div className="pt-2">
                    <label className="flex items-start gap-3 cursor-pointer group w-fit">
                      <div className={`mt-1 w-5 h-5 shrink-0 rounded-[4px] border flex items-center justify-center transition-colors ${showCompanyFields ? 'border-primary bg-transparent' : 'border-black200 bg-black200 group-hover:bg-black300'}`}>
                        {showCompanyFields && (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-primary stroke-[3px] stroke-linecap-round stroke-linejoin-round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="style-body text-secondary">Nakupuji na firmu</span>
                        <span className="style-body text-black200">Můžete zadat jinou fakturační adresu</span>
                      </div>
                      <input type="checkbox" checked={showCompanyFields} onChange={() => setShowCompanyFields(!showCompanyFields)} className="sr-only" />
                    </label>
                  </div>

                  {showCompanyFields && (
                    <div className="flex flex-col gap-4 animate-fadeIn">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField label="Název firmy" placeholder="Název firmy" />
                        <InputField label="IČO" placeholder="IČO" />
                        <InputField label="DIČ" placeholder="DIČ" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField label="Ulice a číslo popisné" placeholder="Ulice a číslo popisné" />
                        <InputField label="Město" placeholder="Město" />
                        <InputField label="PSČ" placeholder="PSČ" />
                        <InputField label="Stát" placeholder="Stát" />
                      </div>
                    </div>
                  )}
                </div>

                <hr className="border-black400 w-full" />

                {/* --- SEKCJE 2: ADRESÁT --- */}
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-1">
                    <h3 className="style-h3 text-secondary">Adresát</h3>
                    <p className="style-body text-secondary">Zadejte kontaktní údaje osoby, které máme zásilku doručit.</p>
                  </div>

                  <div className="mb-2">
                    <label className="flex items-center gap-3 cursor-pointer group w-fit">
                      <div className={`w-5 h-5 shrink-0 rounded-[4px] border flex items-center justify-center transition-colors ${shippingDifferentThanOrdering ? 'border-primary bg-transparent' : 'border-black200 bg-black200 group-hover:bg-black300'}`}>
                        {shippingDifferentThanOrdering && (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-primary stroke-[3px] stroke-linecap-round stroke-linejoin-round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        )}
                      </div>
                      <span className="style-body text-secondary">Doručit na jinou adresu</span>
                      <input type="checkbox" checked={shippingDifferentThanOrdering} onChange={() => setShippingDifferentThanOrdering(!shippingDifferentThanOrdering)} className="sr-only" />
                    </label>
                  </div>

                  {!shippingDifferentThanOrdering && (
                    <p className="style-body text-black200 italic p-4 bg-black400 rounded-[8px]">
                      Bude doručeno na adresu objednatele.
                    </p>
                  )}

                  {shippingDifferentThanOrdering && (
                    <div className="flex flex-col gap-4 animate-fadeIn">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField label="Jméno" placeholder="Jméno" />
                        <InputField label="Příjmení" placeholder="Příjmení" />
                        <InputField label="Telefon" placeholder="Telefon" />
                        <InputField label="E-mail" placeholder="E-mail" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField label="Ulice a číslo popisné" placeholder="Ulice a číslo popisné" />
                        <InputField label="Město" placeholder="Město" />
                        <InputField label="PSČ" placeholder="PSČ" />
                        <InputField label="Stát" placeholder="Stát" />
                      </div>
                    </div>
                  )}

                  {/* Poznámka vždy nakonec */}
                  <TextAreaField label="Poznámka" placeholder="Poznámka" />
                </div>
              </div>
            )}

          </div>

          {renderOrderSummary()}

        </div>
      </main>

      {/* PATIČKA */}
      <footer className="fixed bottom-0 left-0 w-full z-50 bg-[#252C3C] border-t border-black300/30 h-[80px] md:h-[98px] lg:h-[116px] shadow-[0_-10px_30px_rgba(0,0,0,0.5)] flex items-center justify-center">
        <div className="w-full max-w-[1440px] mx-auto px-4 lg:px-[84px] flex justify-between items-center gap-4">
          {currentStep === 1 ? (
             <Link href="/"><Button variant="outlined" arrow="left">Zpět</Button></Link>
          ) : (
            <Button onClick={prevStep} variant="outlined" arrow="left">Zpět</Button>
          )}
          <Button 
            onClick={() => {
              if (currentStep < 3) nextStep();
              else if (selectedPayment === 'karta') setIsPaymentModalOpen(true);
              else alert('Objednávka odeslána!');
            }} 
            arrow="right"
          >
            {currentStep === 1 ? 'Další krok' : currentStep === 2 ? 'K údajům' : (selectedPayment === 'karta' ? 'Zaplatit' : 'Dokončit objednávku')}
          </Button>
        </div>
      </footer>

      {/* PLATEBNÍ MODAL */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black-custom/80 backdrop-blur-sm p-4 animate-fadeIn">
          {/* Přidáno max-h-[90vh] a odstraněno overflow-hidden z hlavního kontejneru */}
          <div className="bg-black400 w-full max-w-[500px] max-h-[90vh] rounded-[16px] border border-black300/30 shadow-2xl flex flex-col relative">
            
            {/* Hlavička modalu musí zůstat vždy nahoře (shrink-0) */}
            <div className="shrink-0 flex justify-between items-center p-5 md:p-6 border-b border-black300/30 bg-[#252C3C] rounded-t-[16px]">
              <h3 className="style-h3 text-secondary m-0">Bezpečná platba kartou</h3>
              <button onClick={() => setIsPaymentModalOpen(false)} className="text-black300 hover:text-primary transition-colors p-1" aria-label="Zavřít">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>

            {/* ZDE JE OPRAVA: overflow-y-auto umožní scrollovat pouze obsah, pokud je moc dlouhý */}
            <div className="p-5 md:p-6 bg-black-custom overflow-y-auto rounded-b-[16px]">
              <StripePaymentForm amount={totalOrderPrice} />
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default CheckoutPage;