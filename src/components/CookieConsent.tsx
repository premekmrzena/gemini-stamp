'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { gtagConsentUpdate } from '@/lib/gtag';

const STORAGE_KEY = 'mcs_cookie_consent';

type Consent = { analytics: boolean };

function readConsent(): Consent | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const existing = readConsent();
    if (existing) {
      if (existing.analytics) gtagConsentUpdate(true);
      return;
    }
    const timer = setTimeout(() => setVisible(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  const apply = (consent: Consent) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
    gtagConsentUpdate(consent.analytics);
    setVisible(false);
  };

  const buttonBase = 'style-body-bold h-11 px-5 rounded-[4px] transition-colors whitespace-nowrap';
  const primaryButton = `${buttonBase} bg-primary text-black hover:bg-primary-hover`;
  const neutralButton = `${buttonBase} bg-transparent border border-black200 text-black hover:border-black300`;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4 md:p-6">
      <div className="max-w-[900px] mx-auto bg-secondary border border-transparent rounded-[4px] shadow-xl p-5 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <p className="style-body text-black flex-1">
            Souhlas s cookies, pro zajištění základního chodu e-shopu, editoru archů a porozumění návštěvnosti.{' '}
            <Link href="/ochrana-osobnich-udaju" className="text-primary hover:underline">
              Více informací
            </Link>
          </p>
          <div className="flex flex-wrap gap-2 shrink-0">
            <button className={neutralButton} onClick={() => apply({ analytics: false })}>Odmítnout</button>
            <button className={primaryButton} onClick={() => apply({ analytics: true })}>Přijmout vše</button>
          </div>
        </div>
      </div>
    </div>
  );
}
