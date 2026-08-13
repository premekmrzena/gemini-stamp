import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';

const GATE_COOKIE = 'site_access';
// next-intl si pamatuje poslední navštívenou mutaci v NEXT_LOCALE - potřebujeme
// jí umět nastavit (viz blokace /cs níže), jinak by středoevropský fanoušek
// interního náhledu skončil v nekonečné smyčce přesměrování.
const LOCALE_COOKIE = 'NEXT_LOCALE';

// next-intl řeší detekci/routing jazyka jen pro zákaznické (mezinárodní)
// stránky pod [locale] segmentem - /admin, /api a samotná gate stránka
// /rekonstrukce zůstávají mimo, viz docs/09-jazykove-mutace.md.
const handleI18nRouting = createMiddleware(routing);

// Cesty mimo next-intl routing úplně - vlastní jazykový přepínač si řeší samy (viz
// /prague-souvenir), next-intl by je jinak bral jako neprefixovanou výchozí (en) mutaci
// a při Accept-Language jiné než en přesměrovával na neexistující /ja/..., /ko/... atd.
// (přesně bug z feedback_proxy_locale_redirect_loop, jen jednou cestou navíc).
const LOCALE_EXEMPT_PATHS = ['/rekonstrukce', '/prague-souvenir'];

function isLocalizedPath(pathname: string): boolean {
  return (
    !pathname.startsWith('/admin') &&
    !pathname.startsWith('/api') &&
    !LOCALE_EXEMPT_PATHS.includes(pathname)
  );
}

// /cs (viz src/i18n/routing.ts) je jen interní pracovní náhled pro srovnání
// CZ/EN textů, NENÍ to skutečná CZK mutace - ceny tam jen zrcadlí EUR čísla
// pod jiným symbolem. Zákazník, který by se sem dostal s EUR položkami v
// košíku, by viděl špatnou měnu u stejné částky (viz CartStep/OrderSummary).
function isCsPreviewPath(pathname: string): boolean {
  return pathname === '/cs' || pathname.startsWith('/cs/');
}

// Pre-launch gate: dokud je MAINTENANCE_MODE=true, celý web (kromě /rekonstrukce
// a pár výjimek níže) se přepíše na stránku "web se připravuje". Vypnutím
// MAINTENANCE_MODE v env (bez zásahu do kódu) se gate celý vypne. Stejná
// "site_access" cookie navíc - bez ohledu na MAINTENANCE_MODE, i po ostrém
// spuštění - odemyká /cs, aby si ho autor mohl dál prohlížet, ale zákazníci
// se k němu nikdy nedostanou.
export function proxy(request: NextRequest) {
  const gateCookie = request.cookies.get(GATE_COOKIE);
  const authorized = !!gateCookie?.value && gateCookie.value === process.env.SITE_ACCESS_PASSWORD;

  if (process.env.MAINTENANCE_MODE === 'true' && !authorized) {
    const { pathname } = request.nextUrl;

    // API volání (fetch z klienta) chceme odmítnout čistou JSON odpovědí,
    // ne přepsat na HTML stránku, kterou by volající kód nedokázal naparsovat.
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Web se připravuje.' }, { status: 503 });
    }

    const url = request.nextUrl.clone();
    url.pathname = '/rekonstrukce';
    url.search = '';
    return NextResponse.rewrite(url);
  }

  if (isCsPreviewPath(request.nextUrl.pathname) && !authorized) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    url.search = '';
    const response = NextResponse.redirect(url);
    // Nestačí tuhle cookie smazat - next-intl by si jazyk zase odvodil z
    // Accept-Language hlavičky prohlížeče (má-li návštěvník "cs" jako
    // preferovaný jazyk, což je běžné) a rovnou přesměroval zpátky na /cs =
    // nekonečná smyčka bez ohledu na cookie. Musíme jazyk natvrdo nastavit na
    // výchozí "en", aby ho next-intl při dalším requestu vzal z cookie (má
    // přednost před Accept-Language) a smyčku tím přerušil.
    response.cookies.set(LOCALE_COOKIE, routing.defaultLocale, { path: '/' });
    return response;
  }

  return isLocalizedPath(request.nextUrl.pathname) ? handleI18nRouting(request) : NextResponse.next();
}

export const config = {
  matcher: [
    // Bez gate: Stripe a iDoklad webhooky (volají je Stripe/iDoklad, ne prohlížeč),
    // odemykací endpoint, Next.js interní statické/image soubory, samotná gate stránka,
    // Apple Pay doménová verifikace (public/.well-known/... - Stripe/Apple si ho stahují
    // sami, bez cookie; soubor nemá příponu, takže by ho jinak zachytil gate/i18n rewrite
    // stejně jako api/* - viz [[project_stripe_alt_payment_methods]] v paměti) a jakýkoli
    // soubor s příponou (obrázky, video, favicon, sitemap.xml, robots.txt...).
    '/((?!api/stripe-webhook|api/idoklad-webhook|api/site-access|_next/static|_next/image|rekonstrukce|\\.well-known/apple-developer-merchantid-domain-association|.*\\..*).*)',
  ],
};
