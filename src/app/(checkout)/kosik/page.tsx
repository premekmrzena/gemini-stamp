'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Button from '@/components/Button';
import { useCart } from '@/context/CartContext';
import StripePaymentForm from '@/components/StripePaymentForm'; // <-- TOTO PŘIDEJ

// --- MOCK DATA PRO DOPRAVU A PLATBU ---
const shippingOptions = [
  { id: 'ppl', name: 'PPL Courier', price: 99 },
  { id: 'zasilkovna', name: 'Zásilkovna - Výdejní místo', price: 69 },
  { id: 'osobni', name: 'Osobní odběr (Praha)', price: 0 },
];

const paymentOptions = [
  { id: 'karta', name: 'Platební karta online', price: 0 },
  { id: 'prevod', name: 'Bankovní převod', price: 0 },
  { id: 'dobirka', name: 'Dobírka', price: 30 },
];

// --- POMOCNÁ KOMPONENTA PRO FORMULÁŘ ---
const InputField = ({ label, className = "", ...props }: any) => (
  <div className={`w-full flex flex-col gap-2 ${className}`}>
    <label className="style-body text-black300">{label}</label>
    <input 
      {...props} 
      className="bg-transparent border border-black200 rounded-[8px] p-3 style-body text-black-custom placeholder:text-black300 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
    />
  </div>
);

export default function CheckoutPage() {
  const { cartItems, cartTotal, removeFromCart, updateQuantity } = useCart();

  // --- STAVY POKLADNY ---
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedShipping, setSelectedShipping] = useState(shippingOptions[0].id);
  const [selectedPayment, setSelectedPayment] = useState(paymentOptions[0].id);
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
  // TOTO PŘIDEJ: Stav pro zobrazení platebního modalu
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
      <div className="w-full min-h-screen flex flex-col bg-[#0F172A]">
       {/* Hlavička pro prázdný košík */}
        <header className="w-full bg-[#252C3C] border-b border-[#8B95AC]/30 h-[79px] md:h-[99px] lg:h-[133px] flex items-center justify-center">
          <div className="w-full max-w-[1440px] mx-auto px-[24px] md:px-[44px] lg:px-[84px] flex items-center justify-center lg:justify-start">
            <Link href="/" aria-label="Zpět na hlavní stránku">
              <Image 
                src="/images/creative-stamp_logo.svg" 
                alt="Creative Stamp Logo" 
                width={200} 
                height={60} 
                priority 
                className="h-[40px] md:h-[45px] lg:h-[60px] w-auto object-contain" 
              />
            </Link>
          </div>
        </header>
        {/* Obsah prázdného košíku */}
        <div className="flex-grow flex flex-col items-center justify-center py-[100px] px-4 gap-6 text-center">
          <div className="w-24 h-24 mb-4 rounded-full bg-[#2B3755] flex items-center justify-center">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
          </div>
          <h1 className="style-h2">Váš košík je prázdný</h1>
          <p className="style-body text-white/70 max-w-md">Vypadá to, že jste si zatím nevybrali žádnou známku. Pojďme to napravit a objevit skvosty do vaší sbírky.</p>
          <Link href="/" className="mt-4">
            <Button>Zpět k nákupu</Button>
          </Link>
        </div>
      </div>
    );
  }

  // --- SOUHRN OBJEDNÁVKY (Pravý sloupec dle Figmy) ---
  const renderOrderSummary = () => (
    <aside className="w-full lg:w-1/3 flex flex-col gap-6 lg:sticky lg:top-32 h-fit lg:order-2">
      <div className="bg-secondary rounded-[4px] p-4 shadow-xl text-black-custom flex flex-col">
        <h2 className="style-h3 text-center mb-4">Shrnutí objednávky</h2>
        
        {/* Výpis produktů ve shrnutí */}
        {cartItems.map(item => (
          <div key={item.id} className="flex items-center gap-4 py-4 border-t border-black200">
            <div className="relative w-12 h-12 shrink-0 border border-black200 rounded-[4px] overflow-hidden bg-white p-1">
              <Image src={item.image_url} alt={item.name} fill className="object-contain" />
            </div>
            <div className="flex-grow flex flex-col gap-1">
              <h4 className="style-body text-black-custom line-clamp-2">{item.name}</h4>
              <p className="style-body text-black300">{item.quantity} ks</p>
            </div>
            {/* Tady používáme jen style-body přesně podle tvého mapování fontů */}
            <p className="style-body text-black-custom shrink-0">{(item.price * item.quantity).toLocaleString('cs-CZ')} Kč</p>
          </div>
        ))}

        {/* Mezisoučet a Doprava */}
        <div className="flex flex-col gap-2 py-4 border-t border-black200 style-body text-black-custom">
          <div className="flex justify-between items-center">
            <span>Mezisoučet</span>
            <span>{cartTotal.toLocaleString('cs-CZ')} Kč</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Doprava</span>
            <span>{shippingCost > 0 ? `${shippingCost} Kč` : '0 Kč'}</span>
          </div>
          {paymentCost > 0 && (
            <div className="flex justify-between items-center">
              <span>Platba</span>
              <span>{paymentCost} Kč</span>
            </div>
          )}
        </div>

        {/* Slevový kupon */}
        <div className="flex flex-col gap-2 py-4 border-t border-black200">
          <label className="style-body text-black-custom">Mám slevový kupon</label>
          <input 
            type="text" 
            placeholder="Mám slevový kupon" 
            className="w-full border border-black200 rounded-[4px] px-3 py-2 style-body text-black-custom placeholder:text-black300 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
          />
          {/* Zde je použit tvůj nový styl Body bold */}
          <button className="style-body-bold text-primary hover:text-primary-hover self-end transition-colors mt-1">
            Uplatnit kód
          </button>
        </div>

        {/* Celkem */}
        <div className="flex justify-between items-center pt-4 border-t border-black200">
          <span className="style-body-bold text-black-custom">Celkem</span>
          <span className="style-product-price text-success">{totalOrderPrice.toLocaleString('cs-CZ')} Kč</span>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="w-full min-h-screen flex flex-col bg-[#0F172A] relative">
      
      {/* --- NOVÁ HLAVIČKA (Logo + Stepper dle Figmy) --- */}
      <header className="sticky top-0 z-40 w-full bg-[#252C3C] border-b border-[#8B95AC]/30 h-[79px] md:h-[99px] lg:h-[133px] flex items-center justify-center shadow-md">
        <div className="w-full max-w-[1440px] mx-auto px-[24px] md:px-[44px] lg:px-[84px] flex items-center justify-between">
          
          <Link href="/" aria-label="Zpět na hlavní stránku" className="flex-shrink-0">
            {/* Desktop / Tablet Logo */}
            <Image 
              src="/images/creative-stamp_logo.svg" 
              alt="Creative Stamp Logo" 
              width={240} 
              height={60} 
              priority 
              className="hidden md:block h-[45px] lg:h-[60px] w-auto object-contain" 
            />
            {/* Mobile Logo */}
            <Image 
              src="/images/logo-black200_basked-mobile.svg" 
              alt="Creative Stamp Logo Mobile" 
              width={40} 
              height={40} 
              priority 
              className="block md:hidden h-[40px] w-auto object-contain" 
            />
          </Link>
          
          {/* Stepper dle Figmy */}
          <div className="flex items-center">
            {[1, 2, 3].map((step, index) => (
              <div key={step} className="flex items-center">
                
                {/* Samotný kruh s číslem */}
                <div className={`
                  flex items-center justify-center rounded-full font-medium tracking-[-0.02em] leading-none transition-colors duration-300
                  w-[36px] h-[36px] text-[16px]
                  md:w-[44px] md:h-[44px] md:text-[21px]
                  lg:w-[48px] lg:h-[48px] lg:text-[28px]
                  ${currentStep === step 
                    ? 'bg-[#FF6B35] text-[#0F172A] border-none' 
                    : 'bg-transparent text-[#8B95AC] border border-[#8B95AC]'
                  }
                `}>
                  {step}
                </div>

                {/* Spojovací čára (kromě posledního kroku) */}
                {index < 2 && (
                  <div className="h-[1px] md:h-[1.5px] bg-[#8B95AC] w-[10px] md:w-[12px] lg:w-[16px] transition-colors duration-300" />
                )}

              </div>
            ))}
          </div>

        </div>
      </header>

      {/* --- HLAVNÍ OBSAH (s paddingem dole kvůli fixní patičce) --- */}
      <main className="flex-grow w-full px-[24px] md:px-[44px] lg:px-[84px] py-8 pb-[140px] max-w-[1440px] mx-auto animate-fadeIn">
        <div className="w-full flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
          
          {/* LEVÝ SLOUPEC: KROKY FORMULÁŘE */}
          <div className="w-full lg:w-2/3 flex flex-col gap-8 lg:order-1">
            
            {/* KROK 1 */}
            {currentStep === 1 && (
              <div className="flex flex-col gap-2">
                {/* Nadpis je nyní H3 přesně podle návrhu */}
                <h3 className="style-h3 text-secondary mb-2">Košík</h3>
                
                <div className="flex flex-col">
                  {cartItems.map(item => (
                    <div key={item.id} className="py-5 border-b border-black400 flex items-stretch gap-5">
                      
                      {/* Fotka produktu v bílém rámečku */}
                      <div className="relative w-[80px] h-[80px] shrink-0 bg-white rounded-[4px] p-1">
                        <Image src={item.image_url} alt={item.name} fill className="object-contain" />
                      </div>
                      
                      {/* Obsah položky (Název, ovládání, cena) */}
                      <div className="flex-grow flex flex-col justify-between py-1">
                        
                        {/* Horní řádek: Název a křížek */}
                        <div className="flex justify-between items-start gap-4">
                          <h4 className="style-h4 text-secondary line-clamp-2">{item.name}</h4>
                          <button 
                            onClick={() => removeFromCart(item.id)} 
                            className="text-black300 hover:text-primary transition-colors shrink-0 mt-1" 
                            aria-label="Odstranit z košíku"
                          >
                            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        
                        {/* Spodní řádek: Počet kusů a Cena */}
                        <div className="flex justify-between items-center mt-2">
                          
                          {/* Ovládání počtu kusů v bílé pilulce */}
                          <div className="flex items-center bg-secondary rounded-full px-3 py-1 gap-3">
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity - 1)} 
                              className="text-black-custom text-lg font-medium hover:text-primary transition-colors leading-none"
                              aria-label="Odebrat jeden kus"
                            >
                              −
                            </button>
                            <span className="style-body-bold text-black-custom min-w-[16px] text-center">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity + 1)} 
                              className="text-black-custom text-lg font-medium hover:text-primary transition-colors leading-none"
                              aria-label="Přidat jeden kus"
                            >
                              +
                            </button>
                          </div>

                          {/* Cena */}
                          <p className="style-product-price text-success">
                            {(item.price * item.quantity).toLocaleString('cs-CZ')} Kč
                          </p>
                        </div>

                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* KROK 2 */}
            {currentStep === 2 && (
              <div className="flex flex-col gap-10 animate-fadeIn">
                <h1 className="style-h2 mb-[-10px]">Doprava a platba</h1>
                <div className="flex flex-col gap-5">
                  <h3 className="style-h3">Způsob dopravy</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {shippingOptions.map(option => (
                      <label key={option.id} className={`border rounded-[12px] p-5 flex items-center justify-between gap-4 cursor-pointer transition-colors ${selectedShipping === option.id ? 'border-[#FF6B35] bg-[#2B3755]' : 'border-[#8B95AC]/30 bg-[#2B3755]/50 hover:border-[#D1D6DF]/50'}`}>
                        <div className="flex items-center gap-3">
                          <input type="radio" name="shipping" value={option.id} checked={selectedShipping === option.id} onChange={(e) => setSelectedShipping(e.target.value)} className="w-5 h-5 accent-[#FF6B35]" />
                          <span className="style-body font-medium">{option.name}</span>
                        </div>
                        <span className="style-body font-semibold">{option.price > 0 ? `${option.price} Kč` : 'Zdarma'}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-5">
                  <h3 className="style-h3">Způsob platby</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {paymentOptions.map(option => (
                      <label key={option.id} className={`border rounded-[12px] p-5 flex items-center gap-4 cursor-pointer transition-colors ${selectedPayment === option.id ? 'border-[#FF6B35] bg-[#2B3755]' : 'border-[#8B95AC]/30 bg-[#2B3755]/50 hover:border-[#D1D6DF]/50'}`}>
                        <input type="radio" name="payment" value={option.id} checked={selectedPayment === option.id} onChange={(e) => setSelectedPayment(e.target.value)} className="w-5 h-5 accent-[#FF6B35]" />
                        <div className="flex flex-col">
                          <span className="style-body font-medium">{option.name}</span>
                          {option.price > 0 && <span className="style-body text-xs text-white/70">poplatek +{option.price} Kč</span>}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* KROK 3 */}
            {currentStep === 3 && (
              <div className="flex flex-col gap-8 animate-fadeIn">
                <h1 className="style-h2 mb-[-10px]">Dodací údaje</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <InputField label="Jméno" placeholder="Jan" type="text" required />
                  <InputField label="Příjmení" placeholder="Novák" type="text" required />
                  <InputField label="Telefon" placeholder="+420 123 456 789" type="tel" required />
                  <InputField label="E-mail" placeholder="jan.novak@email.cz" type="email" required />
                </div>
                <div className="flex flex-col gap-5 pt-4 border-t border-[#8B95AC]/30">
                  <InputField label="Ulice a číslo popisné" placeholder="Václavské náměstí 1" type="text" required />
                  <div className="grid grid-cols-2 gap-5">
                    <InputField label="Město" placeholder="Praha" type="text" required />
                    <InputField label="PSČ" placeholder="110 00" type="text" required />
                  </div>
                </div>
                <div className="pt-6 border-t border-[#8B95AC]/30">
                  <label className="flex items-center gap-3 cursor-pointer style-body text-sm w-fit">
                    <input type="checkbox" checked={billingSameAsShipping} onChange={() => setBillingSameAsShipping(!billingSameAsShipping)} className="w-5 h-5 accent-[#FF6B35] rounded" />
                    <span>Fakturační údaje jsou stejné jako dodací</span>
                  </label>
                </div>
                {!billingSameAsShipping && (
                  <div className="flex flex-col gap-5 pt-8 mt-2 border-t border-[#8B95AC]/30 animate-fadeIn">
                    <h4 className="style-h4 text-base">Fakturační adresa</h4>
                    <InputField label="Název firmy / Jméno" placeholder="Firma s.r.o. / Jan Novák" />
                    <div className="grid grid-cols-2 gap-5">
                      <InputField label="IČO (volitelné)" placeholder="12345678" />
                      <InputField label="DIČ (volitelné)" placeholder="CZ12345678" />
                    </div>
                    <InputField label="Ulice" placeholder="Jiná ulice 10" />
                    <div className="grid grid-cols-2 gap-5">
                      <InputField label="Město" placeholder="Brno" />
                      <InputField label="PSČ" placeholder="602 00" />
                    </div>
                  </div>
                )}
                
              </div>
            )}

          </div>

          {renderOrderSummary()}

        </div>
      </main>

      {/* --- NOVÁ PATIČKA (Sticky akční lišta dole dle Figmy) --- */}
      {/* --- NOVÁ PATIČKA (Sticky akční lišta dole dle Figmy) --- */}
      <footer className="fixed bottom-0 left-0 w-full z-50 bg-[#2B3755] border-t border-[#8B95AC]/30 py-[20px] md:py-[24px] lg:py-[32px] shadow-[0_-10px_30px_rgba(0,0,0,0.5)] flex items-center justify-center">
        <div className="w-full max-w-[1440px] mx-auto px-[24px] md:px-[44px] lg:px-[84px] flex justify-between items-center gap-4">
          
          {/* Levé tlačítko: Zpět / Zpět k nákupu */}
          {currentStep === 1 ? (
             <Link href="/">
               <Button variant="outlined" arrow="left" className="!px-3 md:!px-6">
                 <span className="hidden md:inline">Zpět k nákupu</span>
               </Button>
             </Link>
          ) : (
            <Button onClick={prevStep} variant="outlined" arrow="left" className="!px-3 md:!px-6">
               <span className="hidden md:inline">Zpět</span>
            </Button>
          )}

          {/* Pravé tlačítko: Pokračovat / Zaplatit */}
          <Button 
            onClick={() => {
              if (currentStep < 3) {
                nextStep();
              } else {
                // Jsme ve 3. kroku
                if (selectedPayment === 'karta') {
                  setIsPaymentModalOpen(true); // Otevře okno s platbou
                } else {
                  alert('Objednávka odeslána (zvolen převod / dobírka)!');
                }
              }
            }} 
            arrow="right"
          >
            {currentStep === 1 
              ? 'K dopravě' 
              : currentStep === 2 
                ? 'K údajům' 
                : (selectedPayment === 'karta' ? 'Zaplatit' : 'Dokončit objednávku')}
          </Button>

        </div>
      </footer>

      {/* --- PLATEBNÍ MODAL (Zobrazí se po kliknutí na "Zaplatit") --- */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-[#0F172A]/80 backdrop-blur-sm p-4 animate-fadeIn">
          {/* Box modalu */}
          <div className="bg-[#2B3755] w-full max-w-[500px] rounded-[16px] border border-[#8B95AC]/30 shadow-2xl flex flex-col overflow-hidden relative">
            
            {/* Hlavička modalu s křížkem */}
            <div className="flex justify-between items-center p-5 md:p-6 border-b border-[#8B95AC]/30 bg-[#252C3C]">
              <h3 className="style-h3 text-lg m-0">Bezpečná platba kartou</h3>
              <button 
                onClick={() => setIsPaymentModalOpen(false)}
                className="text-[#8B95AC] hover:text-[#FF6B35] transition-colors p-1"
                aria-label="Zavřít"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>

            {/* Samotný Stripe Formulář */}
            <div className="p-5 md:p-6 bg-[#0F172A]">
              <StripePaymentForm amount={totalOrderPrice} />
            </div>

          </div>
        </div>
      )}

    </div>
  );
}