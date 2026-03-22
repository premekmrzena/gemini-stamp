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
    // ÚPRAVA VÝŠKY: h-[80px] pro mobil, md:h-[98px] pro tablet, lg:h-[116px] pro desktop
    // Vertikální padding (py) byl odstraněn, vycentrování zajišťuje 'items-center'
    <header className="bg-[#252C3C] text-[#FDFBF7] px-4 lg:px-[84px] h-[80px] md:h-[98px] lg:h-[116px] flex items-center justify-between gap-4 w-full relative z-50 border-b border-[#2B3755]">
      
      {/* Levá část - Logo */}
      <Link href="/" className="flex-shrink-0 flex items-center h-full">
        <Image 
          src="/images/creative-stamp_logo.svg" 
          alt="Creative Stamp Logo" 
          width={250} 
          height={69} 
          priority
          // Mobil: výška 56px, Desktop/Tablet: původní šířka
          className="h-[56px] w-auto md:w-[250px] md:h-auto object-contain" 
        />
      </Link>

      {/* Pravá část - Navigace a Košík (DESKTOP) */}
      <div className="hidden md:flex items-center gap-4 lg:gap-6">
        {/* whitespace-nowrap zabraňuje zalamování slov */}
        <nav className="flex items-center text-[15px] lg:text-[16px] font-medium tracking-[-0.02em] leading-none whitespace-nowrap">
          <Link href="/znamky" className="pr-[22px] hover:text-[#FF7F51] transition">Známky</Link>
          <span className="w-px h-5 bg-white/30"></span>
          
          <Link href="/kreativni-archy" className="px-[22px] hover:text-[#FF7F51] transition">Kreativní archy</Link>
          <span className="w-px h-5 bg-white/30"></span>
          
          <Link href="/first-day-cover" className="px-[22px] hover:text-[#FF7F51] transition">First day cover</Link>
          <span className="w-px h-5 bg-white/30"></span>
          
          <Link href="/darkove-sady" className="px-[22px] hover:text-[#FF7F51] transition">Dárkové sady</Link>
        </nav>

        {/* Sjednocený design košíku pro Desktop dle Mobilu */}
        <Link href="/kosik" className="flex items-center group flex-shrink-0">
          <div className="w-[40px] h-[40px] rounded-full bg-[#2B3755] group-hover:bg-[#FF6B35] transition flex items-center justify-center">
             {/* Pevná (Solid) ikona košíku dle mobilu */}
             <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-white">
               <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
             </svg>
          </div>
        </Link>
      </div>

      {/* Pravá část - Mobilní tlačítka (MOBILE) */}
      <div className="flex md:hidden items-center gap-4 flex-shrink-0">
        {/* Košík pro mobil - Nový vzhled s plnou ikonou a modrým pozadím */}
        <Link href="/kosik">
          <div className="w-[40px] h-[40px] rounded-full bg-[#2B3755] flex items-center justify-center">
             {/* Pevná (Solid) ikona košíku dle mobilu */}
             <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-white">
               <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
             </svg>
          </div>
        </Link>
        
        {/* Hamburger Tlačítko - 3 horizontální linky */}
        <button 
          onClick={toggleMenu} 
          className="text-white focus:outline-none w-[30px] h-[40px] flex items-center justify-center"
          aria-label="Přepnout menu"
        >
          {isMobileMenuOpen ? (
            // Ikona Křížku (zavřít)
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            // Ikona Hamburgeru (otevřít)
            <div className="flex flex-col justify-between h-[18px] w-[26px]">
              <span className="w-full h-[2.5px] bg-[#FDFBF7] rounded-full"></span>
              <span className="w-full h-[2.5px] bg-[#FDFBF7] rounded-full"></span>
              <span className="w-full h-[2.5px] bg-[#FDFBF7] rounded-full"></span>
            </div>
          )}
        </button>
      </div>

      {/* Rozbalovací Mobilní Menu (Dropdown) */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-[#1E2330] border-t border-[#2B3755] shadow-2xl md:hidden flex flex-col">
          <nav className="flex flex-col text-[16px] font-medium tracking-[-0.02em] p-4 gap-2">
            <Link href="/znamky" onClick={toggleMenu} className="transition px-4 py-3 rounded-md text-[#FDFBF7] hover:bg-[#272D3D] hover:text-[#FF7F51]">Známky</Link>
            <Link href="/kreativni-archy" onClick={toggleMenu} className="transition px-4 py-3 rounded-md text-[#FDFBF7] hover:bg-[#272D3D] hover:text-[#FF7F51]">Kreativní archy</Link>
            <Link href="/first-day-cover" onClick={toggleMenu} className="transition px-4 py-3 rounded-md text-[#FDFBF7] hover:bg-[#272D3D] hover:text-[#FF7F51]">First day cover</Link>
            <Link href="/darkove-sady" onClick={toggleMenu} className="transition px-4 py-3 rounded-md text-[#FDFBF7] hover:bg-[#272D3D] hover:text-[#FF7F51]">Dárkové sady</Link>
          </nav>
        </div>
      )}

    </header>
  );
}