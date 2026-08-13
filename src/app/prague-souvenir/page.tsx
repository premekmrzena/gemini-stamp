'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { detectLangFromBrowser, detectLangFromQuery, LangCode } from './content';
import LandingContent from './LandingContent';

// Kampaňová landing page pro cílovou skupinu z 2026-08-13 (asijský turista v ČR,
// viz memory project_target_customer_asian_tourist) - JEDNA stránka, ne next-intl
// mutace, viz syntéza v "Poštovní itinerář" artefaktu: nejlevnější první krok je
// cílená landing page, ne celý next-intl storefront rollout.
//
// Tohle je KOŘENOVÁ varianta - jazyk se pozná z navigator.language a podle toho:
// - JA/ZH-Hans/ZH-Hant/KO detekováno → přesměruje (router.replace) na pevnou
//   /prague-souvenir/{jazyk} URL (bez přepínače, stejná stránka jako z reklamy).
// - Nic z toho (typicky EN) → zůstane na kořeni, anglicky, s přepínačem jako
//   záchrannou sítí pro případ špatné detekce.
// Explicitní ?lang= parametr je samostatný lokální override (zůstat na kořeni,
// jen přepnout obsah, žádné přesměrování) - hodí se na testování konkrétní
// varianty bez opuštění URL.
//
// Přesměrování zachovává celý query string (window.location.search) - kdyby na
// kořenovou URL někdy mířila reklama s gclid/utm_* parametry, ty přesměrováním
// nesmí zmizet, jinak by se rozbila atribuce kampaně v Google Ads/GA4.
//
// Pro pevné URL na konkrétní jazyk (Google Ads/QR kódy/sdílení) použít rovnou
// /prague-souvenir/ja, /prague-souvenir/zh-Hans, /prague-souvenir/zh-Hant,
// /prague-souvenir/ko, /prague-souvenir/en - viz [lang]/page.tsx.

export default function PragueSouvenirPage() {
  const router = useRouter();
  // Začíná na 'en', aby se první vykreslení shodovalo se serverem (žádný hydration
  // mismatch) - detekce je dostupná až po mountu na klientovi, stejný vzor jako
  // TrustBadges.tsx.
  const [lang, setLang] = useState<LangCode>('en');

  useEffect(() => {
    const queryOverride = detectLangFromQuery();
    if (queryOverride) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLang(queryOverride);
      return;
    }

    const browserLang = detectLangFromBrowser();
    if (browserLang !== 'en') {
      router.replace(`/prague-souvenir/${browserLang}${window.location.search}`);
      return;
    }

    setLang('en');
  }, [router]);

  return <LandingContent lang={lang} onSelectLang={setLang} />;
}
