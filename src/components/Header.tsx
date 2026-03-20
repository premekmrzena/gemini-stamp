"use client"; // Tohle říká Next.js, že jde o interaktivní komponentu

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Header() {
  // Stav pro sledování, zda je mobilní menu otevřené
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Funkce na přepínání menu
  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    // Přidali jsme 'relative' a 'z-50', aby mobilní menu správně překrývalo obsah pod ním
    <header className="bg-[#1E2330] text-white px-4 lg:px-[84px] py-[32px] flex items-center justify-between w-full relative z-50">
      
      {/* Levá část - Logo */}
      <Link href="/" className="flex-shrink-0">
        <Image 
          src="/images/creative-stamp_logo.svg" 
          alt="Creative Stamp Logo" 
          // Výška z Figmy je 69. Šířku jsem odhadl poměrově na cca 250 (případně si číslo uprav podle Figmy)
          width={250} 
          height={69} 
          priority
          // Na mobilu mu dáme velkorysých 200px, na desktopu plných 250px. 
          // h-auto je klíčové, aby se zachoval poměr stran a logo se nedeformovalo.
          className="w-[200px] md:w-[250px] h-auto" 
        />
      </Link>

      {/* Pravá část - Navigace a Košík (DESKTOP) */}
      <div className="hidden md:flex items-center">
        <nav className="flex items-center text-[15px] lg:text-[16px] font-medium tracking-[-0.02em] leading-none">
          <Link href="/znamky" className="pr-[22px] hover:text-gray-300 transition">Známky</Link>
          <span className="w-px h-5 bg-white/30"></span>
          
          <Link href="/kreativni-archy" className="px-[22px] hover:text-gray-300 transition">Kreativní archy</Link>
          <span className="w-px h-5 bg-white/30"></span>
          
          <Link href="/first-day-cover" className="px-[22px] hover:text-gray-300 transition">First day cover</Link>
          <span className="w-px h-5 bg-white/30"></span>
          
          <Link href="/darkove-sady" className="px-[22px] hover:text-gray-300 transition">Dárkové sady</Link>
        </nav>

        <Link href="/kosik" className="pl-[22px] flex items-center group">
          <div className="w-10 h-10 rounded-full bg-[#272D3D] group-hover:bg-[#32394A] transition flex items-center justify-center">
             <Image src="/images/shop-icon.svg" alt="Košík" width={20} height={20} />
          </div>
        </Link>
      </div>

      {/* Pravá část - Mobilní tlačítka (MOBILE) */}
      <div className="flex md:hidden items-center gap-3">
        {/* Košík chceme vidět i na mobilu pořád */}
        <Link href="/kosik">
          <div className="w-10 h-10 rounded-full bg-[#272D3D] flex items-center justify-center">
             <Image src="/images/shop-icon.svg" alt="Košík" width={18} height={18} />
          </div>
        </Link>
        
        {/* Hamburger Tlačítko */}
        <button 
          onClick={toggleMenu} 
          className="p-2 text-white focus:outline-none"
          aria-label="Přepnout menu"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMobileMenuOpen ? (
              // Ikona Křížku (zavřít)
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              // Ikona Hamburgeru (otevřít)
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Rozbalovací Mobilní Menu (Dropdown) */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-[#1E2330] border-t border-white/10 shadow-2xl md:hidden flex flex-col">
          <nav className="flex flex-col text-[16px] font-medium tracking-[-0.02em] p-4 gap-2">
            {/* Přidáno onClick={toggleMenu}, aby se menu po kliknutí na odkaz samo zavřelo */}
            <Link href="/znamky" onClick={toggleMenu} className="hover:bg-[#272D3D] transition px-4 py-3 rounded-md">Známky</Link>
            <Link href="/kreativni-archy" onClick={toggleMenu} className="hover:bg-[#272D3D] transition px-4 py-3 rounded-md">Kreativní archy</Link>
            <Link href="/first-day-cover" onClick={toggleMenu} className="hover:bg-[#272D3D] transition px-4 py-3 rounded-md">First day cover</Link>
            <Link href="/darkove-sady" onClick={toggleMenu} className="hover:bg-[#272D3D] transition px-4 py-3 rounded-md">Dárkové sady</Link>
          </nav>
        </div>
      )}

    </header>
  );
}