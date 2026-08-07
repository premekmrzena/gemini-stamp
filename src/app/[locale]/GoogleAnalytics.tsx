import Script from 'next/script';
import { GA_MEASUREMENT_ID } from '@/lib/gtag';

// Consent Mode v2: dataLayer a výchozí "denied" musí být nastavené ještě před
// načtením gtag.js (proto beforeInteractive), jinak by GA stihl odeslat hit
// dřív, než víme, jestli má uživatel souhlas. wait_for_update dá CookieConsent
// komponentě chvilku na to, aby po zjištění dřívější volby stihla poslat update.
export default function GoogleAnalytics() {
  if (!GA_MEASUREMENT_ID) return null;

  return (
    <>
      {/* Trvalé vyloučení vlastních návštěv z GA4 (nezávisle na cookie liště -
          ta se dá kdykoliv omylem odkliknout na "Přijmout"). Jednorázově otevři
          web s ?ga_off=1 (?ga_off=0 zase zapne) - uloží se do localStorage a od
          teď se v tomhle prohlížeči nastaví oficiální gtag.js "ga-disable" flag,
          který GA hity zahazuje úplně, bez ohledu na consent stav. */}
      <Script id="ga-opt-out" strategy="beforeInteractive">
        {`
          (function () {
            var params = new URLSearchParams(location.search);
            if (params.has('ga_off')) {
              if (params.get('ga_off') === '0') localStorage.removeItem('ga_disable');
              else localStorage.setItem('ga_disable', '1');
            }
            if (localStorage.getItem('ga_disable') === '1') {
              window['ga-disable-${GA_MEASUREMENT_ID}'] = true;
            }
          })();
        `}
      </Script>
      <Script id="ga-consent-default" strategy="beforeInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('consent', 'default', {
            analytics_storage: 'denied',
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            wait_for_update: 500
          });
        `}
      </Script>
      <Script strategy="afterInteractive" src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>
    </>
  );
}
