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
