'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Button from '@/components/Button';
import { useCart } from '@/context/CartContext'; // <--- Vracíme import košíku

function ThankYouContent() {
  const { clearCart } = useCart(); // <--- Vracíme funkci pro vymazání
  const searchParams = useSearchParams();
  const [displayId, setDisplayId] = useState<string | null>(null);

  useEffect(() => {
    // 1. Načtení ID z URL
    const orderId = searchParams.get('orderId');
    if (orderId) {
      setDisplayId(orderId.slice(-8).toUpperCase());
    }

    // 2. Vyčištění košíku s mírným zpožděním (prevence zacyklení)
    const timer = setTimeout(() => {
      clearCart();
      // Pro jistotu smažeme i localStorage natvrdo
      if (typeof window !== 'undefined') {
        localStorage.removeItem('razitka-cart');
      }
    }, 100);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  return (
    <main className="flex-grow w-full px-4 lg:px-[84px] py-[60px] md:py-[100px] max-w-[1440px] mx-auto flex flex-col items-center justify-center animate-fadeIn">
      <div className="text-center flex flex-col items-center gap-6 max-w-2xl">
        <h1 className="style-h1 text-[#FDFBF7]">
          Objednávka byla úspěšně odeslána!
        </h1>
        <p className="style-perex text-secondary font-medium">
          Děkujeme za váš nákup na <span className="font-bold underline">Creative Stamp</span>. 
          Detaily objednávky s přehledem položek jsme vám právě odeslali na e-mail.
        </p>
      </div>

      <div className="mt-12 mb-8 flex flex-col items-center gap-2 p-8 bg-[#252C3C] rounded-[12px] border border-black300/20 w-full max-w-sm shadow-xl text-center">
        <p className="style-body text-[#8B95AC] uppercase tracking-wider text-sm">Číslo objednávky</p>
        <p className="style-h3 text-secondary tracking-widest min-h-[1.5em]">
          {displayId ? `#${displayId}` : '---'}
        </p>
      </div>

      <p className="style-body text-[#8B95AC] text-center mb-10 max-w-sm">
        Nezapomeňte zkontrolovat složku nevyžádané pošty nebo spam.
      </p>

      <Link href="/">
        <Button variant="outlined" arrow="left">Zpět do obchodu</Button>
      </Link>
    </main>
  );
}

export default function ThankYouPage() {
  return (
    <div className="w-full min-h-screen flex flex-col bg-black-custom text-[#FDFBF7]">
      <header className="sticky top-0 z-40 w-full bg-[#252C3C] border-b border-black300/30 h-[80px] md:h-[98px] lg:h-[116px] flex items-center justify-center shadow-md">
        <div className="w-full max-w-[1440px] mx-auto px-4 lg:px-[84px] flex items-center justify-center lg:justify-start">
          <Link href="/" aria-label="Zpět na hlavní stránku">
            <Image 
              src="/images/creative-stamp_logo.svg" 
              alt="Creative Stamp Logo" 
              width={250} height={69} priority 
              className="h-[56px] w-auto md:w-[250px] md:h-auto object-contain" 
            />
          </Link>
        </div>
      </header>

      <Suspense fallback={<div className="flex-grow bg-black-custom" />}>
        <ThankYouContent />
      </Suspense>

      <footer className="py-8 text-center border-t border-black300/10">
        <p className="style-body text-[#8B95AC] text-sm">© 2026 Creative Stamp – sběratelské známky s příběhem.</p>
      </footer>
    </div>
  );
}