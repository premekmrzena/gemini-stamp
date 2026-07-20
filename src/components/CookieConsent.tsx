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

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange?: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={`relative shrink-0 w-11 h-6 rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-black300/30'} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-secondary transition-transform ${checked ? 'translate-x-5' : ''}`} />
    </button>
  );
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [analyticsChoice, setAnalyticsChoice] = useState(false);

  useEffect(() => {
    const existing = readConsent();
    if (existing) {
      if (existing.analytics) gtagConsentUpdate(true);
    } else {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  const apply = (consent: Consent) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
    gtagConsentUpdate(consent.analytics);
    setVisible(false);
    setShowSettings(false);
  };

  const buttonBase = 'style-body-bold h-11 px-5 rounded-[8px] transition-colors whitespace-nowrap';
  const primaryButton = `${buttonBase} bg-primary text-[#0F172A] hover:bg-primary-hover`;
  const neutralButton = `${buttonBase} bg-transparent border border-black300/30 text-secondary hover:border-black300/60`;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4 md:p-6">
      <div className="max-w-[900px] mx-auto bg-[#0F172A] border border-black300/30 rounded-[12px] shadow-2xl shadow-black/50 p-5 md:p-6">
        {!showSettings ? (
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <p className="style-body text-secondary/80 flex-1">
              Používáme cookies, abychom vám zajistili základní chod e-shopu a rozuměli návštěvnosti (Google Analytics).{' '}
              <Link href="/ochrana-osobnich-udaju" className="text-primary hover:underline">
                Více informací
              </Link>
            </p>
            <div className="flex flex-wrap gap-2 shrink-0">
              <button className={neutralButton} onClick={() => setShowSettings(true)}>Nastavení</button>
              <button className={neutralButton} onClick={() => apply({ analytics: false })}>Odmítnout</button>
              <button className={primaryButton} onClick={() => apply({ analytics: true })}>Přijmout vše</button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <h3 className="style-h4 text-secondary">Nastavení cookies</h3>

            <div className="flex items-center justify-between gap-4 py-3 border-b border-white/10">
              <div>
                <p className="style-body-bold text-secondary">Nezbytné</p>
                <p className="style-body text-secondary/60 mt-0.5">Potřebné pro základní fungování e-shopu (košík, objednávka). Nelze vypnout.</p>
              </div>
              <Toggle checked disabled />
            </div>

            <div className="flex items-center justify-between gap-4 py-3 border-b border-white/10">
              <div>
                <p className="style-body-bold text-secondary">Analytické</p>
                <p className="style-body text-secondary/60 mt-0.5">Google Analytics — pomáhá nám pochopit, jak web používáte.</p>
              </div>
              <Toggle checked={analyticsChoice} onChange={setAnalyticsChoice} />
            </div>

            <div className="flex justify-end gap-2 mt-2">
              <button className={neutralButton} onClick={() => setShowSettings(false)}>Zpět</button>
              <button className={primaryButton} onClick={() => apply({ analytics: analyticsChoice })}>Uložit nastavení</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
