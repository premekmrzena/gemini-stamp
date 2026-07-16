import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const GATE_COOKIE = 'site_access';

// Pre-launch gate: dokud je MAINTENANCE_MODE=true, celý web (kromě /rekonstrukce
// a pár výjimek níže) se přepíše na stránku "web se připravuje". Vypnutím
// MAINTENANCE_MODE v env (bez zásahu do kódu) se gate celý vypne.
export function proxy(request: NextRequest) {
  if (process.env.MAINTENANCE_MODE !== 'true') {
    return NextResponse.next();
  }

  const cookie = request.cookies.get(GATE_COOKIE);
  if (cookie?.value && cookie.value === process.env.SITE_ACCESS_PASSWORD) {
    return NextResponse.next();
  }

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

export const config = {
  matcher: [
    // Bez gate: Stripe webhook (volá ho Stripe, ne prohlížeč), odemykací endpoint,
    // Next.js interní statické/image soubory, samotná gate stránka a jakýkoli
    // soubor s příponou (obrázky, video, favicon, sitemap.xml, robots.txt...).
    '/((?!api/stripe-webhook|api/site-access|_next/static|_next/image|rekonstrukce|.*\\..*).*)',
  ],
};
