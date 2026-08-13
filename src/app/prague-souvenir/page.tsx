'use client';

import { useEffect, useState } from 'react';
import { detectLang, LangCode } from './content';
import LandingContent from './LandingContent';

// Kampaňová landing page pro cílovou skupinu z 2026-08-13 (asijský turista v ČR,
// viz memory project_target_customer_asian_tourist) - JEDNA stránka, ne next-intl
// mutace, viz syntéza v "Poštovní itinerář" artefaktu: nejlevnější první krok je
// cílená landing page, ne celý next-intl storefront rollout.
//
// Tohle je KOŘENOVÁ (auto-detekující) varianta - jazyk se pozná z ?lang= parametru
// nebo navigator.language a přepínač dál mění jen lokální state, URL zůstává stejná.
// Pro pevné URL na konkrétní jazyk (Google Ads/QR kódy/sdílení) použít
// /prague-souvenir/ja, /prague-souvenir/zh-Hans, /prague-souvenir/zh-Hant,
// /prague-souvenir/ko, /prague-souvenir/en - viz [lang]/page.tsx.
//
// Jazyk se přepíná čistě v klientovi (žádný next-intl routing, viz proxy.ts
// LOCALE_EXEMPT_PATHS). Server vždy vrací anglickou verzi (hydratační shoda),
// přepnutí proběhne až po mountu.

export default function PragueSouvenirPage() {
  // Začíná na 'en', aby se první vykreslení shodovalo se serverem (žádný hydration
  // mismatch) - detekce (?lang=, navigator.language) je dostupná až po mountu na
  // klientovi, stejný vzor jako TrustBadges.tsx.
  const [lang, setLang] = useState<LangCode>('en');

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLang(detectLang());
  }, []);

  return <LandingContent lang={lang} onSelectLang={setLang} />;
}
