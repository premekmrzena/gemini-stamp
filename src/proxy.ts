import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';

const GATE_COOKIE = 'site_access';

// next-intl řeší detekci/routing jazyka jen pro zákaznické (mezinárodní)
// stránky pod [locale] segmentem - /admin, /api a samotná gate stránka
// /rekonstrukce zůstávají mimo, viz docs/09-jazykove-mutace.md.
const handleI18nRouting = createMiddleware(routing);

function isLocalizedPath(pathname: string): boolean {
  return !pathname.startsWith('/admin') && !pathname.startsWith('/api') && pathname !== '/rekonstrukce';
}

// Pre-launch gate: dokud je MAINTENANCE_MODE=true, celý web (kromě /rekonstrukce
// a pár výjimek níže) se přepíše na stránku "web se připravuje". Vypnutím
// MAINTENANCE_MODE v env (bez zásahu do kódu) se gate celý vypne.
export function proxy(request: NextRequest) {
  if (process.env.MAINTENANCE_MODE === 'true') {
    const cookie = request.cookies.get(GATE_COOKIE);
    const authorized = cookie?.value && cookie.value === process.env.SITE_ACCESS_PASSWORD;

    if (!authorized) {
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
  }

  return isLocalizedPath(request.nextUrl.pathname) ? handleI18nRouting(request) : NextResponse.next();
}

export const config = {
  matcher: [
    // Bez gate: Stripe webhook (volá ho Stripe, ne prohlížeč), odemykací endpoint,
    // Next.js interní statické/image soubory, samotná gate stránka a jakýkoli
    // soubor s příponou (obrázky, video, favicon, sitemap.xml, robots.txt...).
    '/((?!api/stripe-webhook|api/site-access|_next/static|_next/image|rekonstrukce|.*\\..*).*)',
  ],
};
