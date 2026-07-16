"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { cartCount } = useCart();
  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <header className="w-full bg-black500 text-secondary h-[62px] md:h-[78px] lg:h-[92px] relative z-50 border-b border-black300/30">
      <div className="layout-container h-full flex items-center justify-between gap-4">

        <Link href="/" className="flex-shrink-0 flex items-center h-full">
          <Image
            src="/images/creative-stamp_logo.svg"
            alt="My Creative Stamp Logo"
            width={250}
            height={69}
            priority
            className="h-[40px] w-auto md:h-[52px] lg:h-[62px] object-contain"
          />
        </Link>

        {/* Desktop: nav + košík */}
        <div className="hidden md:flex items-center gap-4 lg:gap-6">
          <nav className="flex items-center text-[15px] lg:text-[16px] font-medium tracking-[-0.02em] leading-none whitespace-nowrap">
            <Link href="/kategorie/znamky" className="pr-[22px] hover:text-primary-hover transition">Známky</Link>
            <span className="w-px h-5 bg-secondary/30" />
            <Link href="/vytvorit-arch" className="px-[22px] hover:text-primary-hover transition">Kreativní archy</Link>
            <span className="w-px h-5 bg-secondary/30" />
            <Link href="/kategorie/fdc" className="px-[22px] hover:text-primary-hover transition">First day cover</Link>
            <span className="w-px h-5 bg-secondary/30" />
            <Link href="/kategorie/plakety" className="px-[22px] hover:text-primary-hover transition">Dárkové plakety</Link>
          </nav>

          <Link href="/kosik" className="flex items-center group flex-shrink-0">
            <div className="relative w-[52px] h-[52px] rounded-full bg-black group-hover:bg-primary transition flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-secondary">
                <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-black text-[11px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-md">
                  {cartCount}
                </span>
              )}
            </div>
          </Link>
        </div>

        {/* Mobile: košík + hamburger */}
        <div className="flex md:hidden items-center gap-4 flex-shrink-0">
          <Link href="/kosik">
            <div className="relative w-[40px] h-[40px] rounded-full bg-black flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-secondary">
                <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-black text-[11px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-md">
                  {cartCount}
                </span>
              )}
            </div>
          </Link>

          <button
            onClick={toggleMenu}
            className="text-secondary focus:outline-none w-[30px] h-[40px] flex items-center justify-center"
            aria-label="Přepnout menu"
          >
            {isMobileMenuOpen ? (
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <div className="flex flex-col justify-between h-[18px] w-[26px]">
                <span className="w-full h-[2.5px] bg-secondary rounded-full" />
                <span className="w-full h-[2.5px] bg-secondary rounded-full" />
                <span className="w-full h-[2.5px] bg-secondary rounded-full" />
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-hamburger-bcgr border-t border-black400 shadow-2xl md:hidden flex flex-col">
          <nav className="flex flex-col text-[16px] font-medium tracking-[-0.02em] px-[24px] py-4 gap-2">
            <Link href="/kategorie/znamky" onClick={toggleMenu} className="transition px-4 py-3 rounded-md text-secondary hover:bg-black400 hover:text-primary-hover">Známky</Link>
            <Link href="/vytvorit-arch" onClick={toggleMenu} className="transition px-4 py-3 rounded-md text-secondary hover:bg-black400 hover:text-primary-hover">Kreativní archy</Link>
            <Link href="/kategorie/fdc" onClick={toggleMenu} className="transition px-4 py-3 rounded-md text-secondary hover:bg-black400 hover:text-primary-hover">First day cover</Link>
            <Link href="/kategorie/plakety" onClick={toggleMenu} className="transition px-4 py-3 rounded-md text-secondary hover:bg-black400 hover:text-primary-hover">Dárkové plakety</Link>
          </nav>
        </div>
      )}
    </header>
  );
}
