'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function EditorHeader() {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#252C3C] border-b border-black300/30 h-[80px] md:h-[98px] lg:h-[116px] flex items-center justify-center shadow-md shrink-0">
      <div className="w-full max-w-[1440px] mx-auto px-4 lg:px-[84px] flex items-center justify-between relative">
        
        {/* LEVÁ ČÁST: Logo (Desktop / Mobilní z tvého košíku) */}
        <Link href="/" className="flex-shrink-0 flex items-center h-full">
          <Image 
            src="/images/creative-stamp_logo.svg" 
            alt="Logo" 
            width={250} 
            height={69} 
            priority 
            className="hidden md:block w-[250px] h-auto object-contain" 
          />
          <Image 
            src="/images/logo-black200_basked-mobile.svg" 
            alt="Logo Mobile" 
            width={40} 
            height={40} 
            priority 
            className="block md:hidden h-[40px] w-auto object-contain" 
          />
        </Link>

        {/* STŘEDNÍ ČÁST: Vycentrovaný titulek */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center hidden md:block">
          <h2 className="style-h2 text-secondary">
            Fotografie a text
          </h2>
        </div>

        {/* PRAVÁ ČÁST: Stepper (Kopie z košíku, natvrdo Krok 2) */}
        <div className="flex items-center">
          {[1, 2, 3].map((step, index) => (
            <div key={step} className="flex items-center">
              <div 
                className={`flex items-center justify-center rounded-full font-medium transition-colors w-[36px] h-[36px] ${
                  2 === step 
                    ? 'bg-primary text-black-custom font-bold shadow-lg shadow-primary/20' 
                    : 'bg-transparent text-black300 border border-black300'
                }`}
              >
                {step}
              </div>
              {/* Spojovací čára mezi kroky */}
              {index < 2 && <div className="h-[1px] bg-black300 w-[10px] md:w-[16px]" />}
            </div>
          ))}
        </div>
        
      </div>
    </header>
  );
}