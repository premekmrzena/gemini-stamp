'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { gtagLandingCtaClick } from '@/lib/gtag';

// Primární CTA kampaňových landing pages - stejné třídy jako Button.tsx (variant="contained"),
// replikované na <Link>, protože <button> uvnitř <a> je neplatné HTML a odkaz musí vést na
// /vytvorit-arch (cesta je mimo next-intl [locale], next/link stačí přímo).
export default function LandingCta({
  landing,
  children,
  className = '',
}: {
  /** Název landing page pro GA4 událost landing_cta_click (např. "prague-souvenir"). */
  landing: string;
  children: React.ReactNode;
  className?: string;
}) {
  const [href, setHref] = useState('/vytvorit-arch');

  useEffect(() => {
    // Přenese ?code=... (slevový kód z QR na letáku, viz GIFT8) na checkout -
    // CartContext ho tam po příchodu tiše ověří a rovnou aplikuje. window.location,
    // ne useSearchParams, ať stránka zůstane staticky prerenderovaná.
    const code = new URLSearchParams(window.location.search).get('code');
    // window.location je dostupné jen na klientovi, hodnotu nejde spočítat při renderu.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (code) setHref(`/vytvorit-arch?code=${encodeURIComponent(code)}`);
  }, []);

  return (
    <Link
      href={href}
      onClick={() => gtagLandingCtaClick(landing)}
      className={`inline-flex items-center justify-center font-medium tracking-[-0.02em] leading-[1.1] rounded-[12px] transition-all duration-300 hover:scale-[1.03] active:scale-95 text-[16px] md:text-[18px] p-[16px] bg-primary text-black hover:bg-primary-hover ${className}`}
    >
      {children}
    </Link>
  );
}
