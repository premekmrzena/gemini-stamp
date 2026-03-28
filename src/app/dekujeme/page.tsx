'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Button from '@/components/Button';
import { useCart } from '@/context/CartContext'; // Přidán import našeho kontextu

// --- MOCK DATA PRO UKÁZKU (V produkci se načtou z API/URL) ---
const orderData = {
  number: 'CS2024051501',
  payment: 'Online platba kartou (Stripe)',
  shipping: 'PPL Courier',
  totalPrice: 12580,
};

// --- POMOCNÁ KOMPONENTA PRO SVG IKONU ---
const SuccessStampIcon = () => (
  <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-scaleIn">
    <circle cx="60" cy="60" r="58" stroke="#FDFBF7" strokeWidth="4" strokeDasharray="8 8"/>
    <circle cx="60" cy="60" r="48" fill="#FF6B35"/>
    <path d="M40 60L55 75L80 45" stroke="#FDFBF7" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ThankYouPage = () => {
  // 1. Vytáhneme si z kontextu funkci na vyčištění košíku
  const { clearCart } = useCart();

  // 2. Jakmile se stránka načte, košík nemilosrdně smažeme
  useEffect(() => {
    clearCart();
    // Přidáváme prázdné závislosti [], aby se to spustilo jen jednou při prvním načtení stránky
  }, []);

  return (
    <div className="w-full min-h-screen flex flex-col bg-black-custom">
      
      {/* HLAVIČKA (Zjednodušená verze bez kroků košíku) */}
      <header className="sticky top-0 z-40 w-full bg-[#252C3C] border-b border-black300/30 h-[80px] md:h-[98px] lg:h-[116px] flex items-center justify-center shadow-md">
        <div className="w-full max-w-[1440px] mx-auto px-4 lg:px-[84px] flex items-center justify-center lg:justify-start">
          <Link href="/" aria-label="Zpět na hlavní stránku" className="flex-shrink-0 flex items-center h-full">
            <Image 
              src="/images/creative-stamp_logo.svg" 
              alt="Creative Stamp Logo" 
              width={250} height={69} priority 
              className="h-[56px] w-auto md:w-[250px] md:h-auto object-contain" 
            />
          </Link>
        </div>
      </header>

      {/* HLAVNÍ OBSAH (Vycentrovaný na střed) */}
      <main className="flex-grow w-full px-4 lg:px-[84px] py-[60px] md:py-[80px] max-w-[1440px] mx-auto flex flex-col items-center justify-center animate-fadeIn">
        
        {/* Velká ikona razítka s fajfkou */}
        <div className="mb-10">
          <SuccessStampIcon />
        </div>

        {/* Hlavní textový blok */}
        <div className="text-center flex flex-col items-center gap-4 max-w-2xl">
          <h1 className="style-h1 text-secondary">
            Objednávka byla úspěšně odeslána!
          </h1>
          
          <p className="style-perex text-black200">
            Děkujeme za váš nákup na Creative Stamp. Potvrzení objednávky s přehledem položek a instrukcemi k platbě (pokud jste zvolili bankovní převod) jsme vám právě odeslali na e-mail.
          </p>
          
          <p className="style-body text-black200 italic mt-1 bg-black400 px-6 py-3 rounded-full">
            Nezapomeňte zkontrolovat složku nevyžádané pošty nebo spam.
          </p>
        </div>

        {/* Dělící linka */}
        <hr className="border-black400 w-full max-w-xl my-10" />

        {/* Blok se shrnutím objednávky */}
        <div className="flex flex-col items-center gap-6 text-center w-full max-w-md">
          <div className="flex flex-col gap-1 w-full p-6 bg-black400/50 rounded-[8px] border border-black300/20 shadow-inner">
            <p className="style-body text-black200">Číslo objednávky:</p>
            <p className="style-body-bold text-secondary text-lg">{orderData.number}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            <div className="flex flex-col gap-1 p-5 border border-black400 rounded-[8px]">
              <p className="style-body text-black200">Způsob platby:</p>
              <p className="style-body-bold text-secondary">{orderData.payment}</p>
            </div>
            <div className="flex flex-col gap-1 p-5 border border-black400 rounded-[8px]">
              <p className="style-body text-black200">Způsob dopravy:</p>
              <p className="style-body-bold text-secondary">{orderData.shipping}</p>
            </div>
          </div>
          
          {/* Zobrazení celkové ceny přímo ve shrnutí */}
          <div className="w-full flex justify-between items-center p-5 border border-black400 rounded-[8px] mt-2 bg-[#252C3C]">
             <p className="style-body-bold text-secondary">Celkem k úhradě</p>
             <p className="style-product-price text-success">{orderData.totalPrice.toLocaleString('cs-CZ')} Kč</p>
          </div>

        </div>

        {/* Dělící linka */}
        <hr className="border-black400 w-full max-w-xl my-10" />

        {/* Závěrečný přací text a obyčejné tlačítko */}
        <div className="text-center max-w-xl flex flex-col items-center gap-8">
          <p className="style-body text-black200 Perex">
            Přejeme vám mnoho radosti s novými přírůstky do vaší sbírky! V případě dotazů nás neváhejte kontaktovat.
          </p>
          
          {/* Tlačítko je teď normálně v obsahu stránky, nikoliv fixní */}
          <Link href="/">
            <Button variant="outlined" arrow="left">Zpět do obchodu</Button>
          </Link>
        </div>

      </main>

    </div>
  );
};

export default ThankYouPage;