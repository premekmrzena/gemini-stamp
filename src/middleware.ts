import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Kontrolujeme pouze cesty začínající na /admin
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const authHeader = request.headers.get('authorization');

    if (!authHeader) {
      return new NextResponse('Přihlášení vyžadováno', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Admin Dashboard"',
        },
      });
    }

    // Dekódování jména a hesla (formát jméno:heslo)
    const auth = authHeader.split(' ')[1];
    const [user, pwd] = Buffer.from(auth, 'base64').toString().split(':');

    const ADMIN_USER = 'admin'; // Jméno můžeš nechat napevno
    const ADMIN_PWD = process.env.ADMIN_PASSWORD;

    if (user === ADMIN_USER && pwd === ADMIN_PWD) {
      return NextResponse.next();
    }

    return new NextResponse('Neplatné údaje', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Admin Dashboard"',
      },
    });
  }

  return NextResponse.next();
}

// Tento řádek říká Next.js, aby middleware spouštěl jen pro /admin cesty
export const config = {
  matcher: '/admin/:path*',
};