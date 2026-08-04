'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { gtagConsentUpdate } from '@/lib/gtag';

const STORAGE_KEY = 'mcs_cookie_consent';

type Consent = { analytics: boolean; marketing: boolean };

function readConsent(): Consent | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Starší verze lišty ukládala jen { analytics } bez marketing - chybějící
    // klíč se čte jako false (souhlas nikdy neudělen), ne jako chyba.
    return { analytics: !!parsed.analytics, marketing: !!parsed.marketing };
  } catch {
    return null;
  }
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [analyticsChecked, setAnalyticsChecked] = useState(false);
  const [marketingChecked, setMarketingChecked] = useState(false);
  const t = useTranslations('cookieConsent');

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

  const categories: { key: 'analytics' | 'marketing'; checked: boolean; onChange: (v: boolean) => void }[] = [
    { key: 'analytics', checked: analyticsChecked, onChange: setAnalyticsChecked },
    { key: 'marketing', checked: marketingChecked, onChange: setMarketingChecked },
  ];

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4 md:p-6">
      <div className="max-w-[900px] mx-auto bg-secondary border border-transparent rounded-[4px] shadow-xl p-5 md:p-6 flex flex-col gap-4">
        <p className="style-body text-black">
          {t('text')}{' '}
          <Link href="/ochrana-osobnich-udaju" className="text-primary hover:underline">
            {t('moreInfo')}
          </Link>
        </p>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex flex-wrap gap-4">
            {categories.map(({ key, checked, onChange }) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => onChange(e.target.checked)}
                  className="w-5 h-5 accent-primary rounded shrink-0"
                />
                <span className="style-body text-black">{t(`categories.${key}`)}</span>
              </label>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
            <button className={textButton} onClick={() => apply({ analytics: analyticsChecked, marketing: marketingChecked })}>
              {t('save')}
            </button>
            <button className={neutralButton} onClick={() => apply({ analytics: false, marketing: false })}>{t('reject')}</button>
            <button className={primaryButton} onClick={() => apply({ analytics: true, marketing: true })}>{t('accept')}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
