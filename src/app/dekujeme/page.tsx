'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Button from '@/components/Button';

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
    {/* Vnější kruh (stylizované razítko) */}
    <circle cx="60" cy="60" r="58" stroke="#FDFBF7" strokeWidth="4" strokeDasharray="8 8"/>
    {/* Vnitřní plný kruh s barvou Primary */}
    <circle cx="60" cy="60" r="48" fill="#FF6B35"/>
    {/* Vektorová fajfka s barvou Secondary */}
    <path d="M40 60L55 75L80 45" stroke="#FDFBF7" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ThankYouPage = () => {
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
      <main className="flex-grow w-full px-4 lg:px-[84px] pt-[60px] md:pt-[80px] pb-[160px] max-w-[1440px] mx-auto flex flex-col items-center justify-center animate-fadeIn">
        
        {/* Velká ikona razítka s fajfkou */}
        <div className="mb-10">
          <SuccessStampIcon />
        </div>

        {/* Hlavní textový blok */}
        <div className="text-center flex flex-col items-center gap-4 max-w-2xl">
          {/* Titulek v barvě Secondary dle zadání */}
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

        {/* Blok se shrnutím objednávky (Vycentrovaný grid) */}
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
        </div>

        {/* Dělící linka */}
        <hr className="border-black400 w-full max-w-xl my-10" />

        {/* Závěrečný přací text */}
        <div className="text-center max-w-xl">
          <p className="style-body text-black200 Perex">
            Přejeme vám mnoho radosti s novými přírůstky do vaší sbírky! V případě dotazů nás neváhejte kontaktovat.
          </p>
        </div>

      </main>

      {/* PATIČKA (Fixní na spodku) */}
      <footer className="fixed bottom-0 left-0 w-full z-50 bg-[#252C3C] border-t border-black300/30 h-[80px] md:h-[98px] lg:h-[116px] shadow-[0_-10px_30px_rgba(0,0,0,0.5)] flex items-center justify-center">
        <div className="w-full max-w-[1440px] mx-auto px-4 lg:px-[84px] flex justify-between items-center gap-4">
          
          <Link href="/">
            <Button variant="outlined" arrow="left">Zpět k nákupu</Button>
          </Link>

          {/* Zobrazení celkové ceny pro přehled */}
          <div className="text-right">
            <p className="style-body text-black200">Celkem k úhradě</p>
            <span className="style-product-price text-success">
              {orderData.totalPrice.toLocaleString('cs-CZ')} Kč
            </span>
          </div>

        </div>
      </footer>

    </div>
  );
};

export default ThankYouPage;