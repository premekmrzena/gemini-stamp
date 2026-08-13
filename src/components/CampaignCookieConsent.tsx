'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { gtagConsentUpdate } from '@/lib/gtag';

// Samostatná (ne next-intl) verze CookieConsent.tsx pro kampaňové stránky mimo
// [locale] (prague-souvenir, prague-gift) - ta hlavní používá useTranslations
// a next-intl Link, které tady nejsou dostupné (žádný NextIntlClientProvider).
// Stejný STORAGE_KEY jako hlavní web - souhlas daný na jednom místě platí i na
// druhém, návštěvník ho nemusí dávat dvakrát. Vždy jen anglicky, stejný
// kompromis jako "Checkout continues in English" u CTA - viz content.ts.
const STORAGE_KEY = 'mcs_cookie_consent';

type Consent = { analytics: boolean; marketing: boolean };

function readConsent(): Consent | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return { analytics: !!parsed.analytics, marketing: !!parsed.marketing };
  } catch {
    return null;
  }
}

export default function CampaignCookieConsent() {
  const [visible, setVisible] = useState(false);
  const [analyticsChecked, setAnalyticsChecked] = useState(false);
  const [marketingChecked, setMarketingChecked] = useState(false);

  useEffect(() => {
    const existing = readConsent();
    if (existing) {
      gtagConsentUpdate(existing.analytics, existing.marketing);
      return;
    }
    const timer = setTimeout(() => setVisible(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  const apply = (consent: Consent) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
    gtagConsentUpdate(consent.analytics, consent.marketing);
    setVisible(false);
  };

  const buttonBase = 'style-body-bold h-11 px-5 rounded-[4px] transition-colors whitespace-nowrap';
  const primaryButton = `${buttonBase} bg-primary text-black hover:bg-primary-hover`;
  const neutralButton = `${buttonBase} bg-transparent border border-black200 text-black hover:border-black300`;
  const textButton = 'style-body h-11 px-2 text-black underline hover:text-black300 transition-colors whitespace-nowrap';

  const categories: { key: 'analytics' | 'marketing'; label: string; checked: boolean; onChange: (v: boolean) => void }[] = [
    { key: 'analytics', label: 'Analytics', checked: analyticsChecked, onChange: setAnalyticsChecked },
    { key: 'marketing', label: 'Marketing', checked: marketingChecked, onChange: setMarketingChecked },
  ];

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4 md:p-6">
      <div className="max-w-[900px] mx-auto bg-secondary border border-transparent rounded-[4px] shadow-xl p-5 md:p-6 flex flex-col gap-4">
        <p className="style-body text-black">
          We use cookies to run the shop and the sheet editor properly. With your consent, also to understand
          site traffic and personalize ads.{' '}
          <Link href="/ochrana-osobnich-udaju" className="text-primary hover:underline">
            More information
          </Link>
        </p>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex flex-wrap gap-4">
            {categories.map(({ key, label, checked, onChange }) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => onChange(e.target.checked)}
                  className="w-5 h-5 accent-primary rounded shrink-0"
                />
                <span className="style-body text-black">{label}</span>
              </label>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
            <button className={textButton} onClick={() => apply({ analytics: analyticsChecked, marketing: marketingChecked })}>
              Save selection
            </button>
            <button className={neutralButton} onClick={() => apply({ analytics: false, marketing: false })}>Reject all</button>
            <button className={`${primaryButton} w-full sm:w-auto`} onClick={() => apply({ analytics: true, marketing: true })}>Accept all</button>
          </div>
        </div>
      </div>
    </div>
  );
}
