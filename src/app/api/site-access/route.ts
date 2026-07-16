import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const password = formData.get('password');

  const isValid = typeof password === 'string' && password.length > 0 && password === process.env.SITE_ACCESS_PASSWORD;

  const redirectUrl = request.nextUrl.clone();
  redirectUrl.search = '';
  redirectUrl.pathname = isValid ? '/' : '/rekonstrukce';
  if (!isValid) {
    redirectUrl.searchParams.set('error', '1');
  }

  // 303 = "See Other": prohlížeč po POSTu vždy zopakuje GET na cílové URL.
  // Výchozí 307 by metodu zachoval (POST na "/"), což by tam skončilo 405.
  const response = NextResponse.redirect(redirectUrl, 303);

  if (isValid) {
    response.cookies.set('site_access', password, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 dní
      path: '/',
    });
  }

  return response;
}
