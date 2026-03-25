'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Button from '@/components/Button';
import { useCart } from '@/context/CartContext';

export default function ThankYouPage() {
  const { clearCart } = useCart();
  // Použijeme ref, abychom zajistili, že se košík vysype jen jednou
  const hasClearedCart = useRef(false);

  useEffect(() => {
    if (!hasClearedCart.current) {
      // Dáme kontextu půl vteřiny, aby se v klidu načetl, a pak ho srovnáme se zemí
      setTimeout(() => {
        clearCart();
      }, 500);
      hasClearedCart.current = true;
    }
  }, [clearCart]);

  return (
    <div className="min-h-screen w-full bg-[#0F172A] flex flex-col relative overflow-hidden">
      
      {/* Jednoduchá hlavička s logem */}
      <header className="w-full h-[79px] md:h-[99px] lg:h-[133px] px-[24px] md:px-[64px] lg:px-[84px] flex items-center justify-center border-b border-[#8B95AC]/30 bg-[#252C3C]">
        <Link href="/" aria-label="Zpět na hlavní stránku">
          <Image 
            src="/images/creative-stamp_logo.svg" 
            alt="Creative Stamp Logo" 
            width={240} 
            height={60} 
            priority 
            className="h-[40px] md:h-[45px] lg:h-[60px] w-auto object-contain" 
          />
        </Link>
      </header>

      {/* Hlavní obsah */}
      <main className="flex-grow flex flex-col items-center justify-center p-6 text-center animate-fadeIn relative z-10">
        
       {/* Velká ikona úspěchu */}
        <div className="w-24 h-24 md:w-32 md:h-32 bg-[#059669]/10 rounded-full flex items-center justify-center mb-8 border border-[#059669]/30 shadow-[0_0_50px_rgba(5,150,105,0.2)]">
          <svg className="w-12 h-12 md:w-16 md:h-16" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>

        <h1 className="style-h2 mb-4">Děkujeme za vaši objednávku!</h1>
        <p className="style-body text-[#8B95AC] max-w-lg mb-10 text-sm md:text-base">
          Vaše platba proběhla v pořádku a objednávka byla úspěšně přijata. 
          Na e-mail jsme vám právě odeslali potvrzení se shrnutím a fakturou.
        </p>

        <Link href="/">
          <Button arrow="right" className="px-8 py-4">
            Zpět na úvodní stránku
          </Button>
        </Link>
        
      </main>

      {/* Dekorační prvky v pozadí pro prémiový feel */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#FF6B35]/5 rounded-full blur-[100px] pointer-events-none"></div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }
      `}</style>

    </div>
  );
}