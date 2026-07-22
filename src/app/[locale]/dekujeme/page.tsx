'use client';

import React, { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Button from '@/components/Button';
import { useCart } from '@/context/CartContext';
import CheckoutHeader from '@/components/checkout/CheckoutHeader';

function ThankYouContent() {
  const { clearCart } = useCart();
  const t = useTranslations('checkout.thankYou');
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const displayId = orderId ? orderId.slice(-8).toUpperCase() : null;

  // Stripe u karetních plateb vyžadujících přesměrování (typicky 3D Secure)
  // vždy přesměruje na return_url bez ohledu na výsledek - úspěch/neúspěch
  // rozlišuje jen `redirect_status` v query. Bankovní převod (bez Stripe)
  // sem naviguje přímo bez tohoto parametru, takže tam žádný check není.
  const redirectStatus = searchParams.get('redirect_status');
  const paymentFailed = redirectStatus !== null && redirectStatus !== 'succeeded';

  useEffect(() => {
    if (paymentFailed) return;
    const timer = setTimeout(() => {
      clearCart();
      if (typeof window !== 'undefined') {
        localStorage.removeItem('razitka-cart');
      }
    }, 100);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentFailed]);

  if (paymentFailed) {
    return (
      <main className="flex-grow w-full py-[60px] md:py-[100px] animate-fadeIn">
        <div className="layout-container flex flex-col items-center justify-center">
          <div className="text-center flex flex-col items-center gap-6 max-w-2xl">
            <h1 className="style-h1 text-secondary">{t('paymentFailed.title')}</h1>
            <p className="style-perex text-secondary font-medium">
              {t.rich('paymentFailed.text', {
                orderId: displayId ?? '---',
                b: (chunks) => <span className="font-bold underline">{chunks}</span>,
              })}
            </p>
          </div>

          <Link href="/kosik" className="mt-10">
            <Button variant="outlined" arrow="left">{t('paymentFailed.backToCart')}</Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-grow w-full py-[60px] md:py-[100px] animate-fadeIn">
      <div className="layout-container flex flex-col items-center justify-center">
        <div className="text-center flex flex-col items-center gap-6 max-w-2xl">
          <h1 className="style-h1 text-secondary">
            {t('title')}
          </h1>
          <p className="style-perex text-secondary font-medium">
            {t.rich('thanksText', { b: (chunks) => <span className="font-bold underline">{chunks}</span> })}
          </p>
        </div>

        <div className="mt-12 mb-8 flex flex-col items-center gap-2 p-8 bg-black500 rounded-[12px] border border-black300/20 w-full max-w-sm shadow-xl text-center">
          <p className="style-body text-black300 uppercase tracking-wider text-sm">{t('orderNumberLabel')}</p>
          <p className="style-h3 text-secondary tracking-widest min-h-[1.5em]">
            {displayId ? `#${displayId}` : '---'}
          </p>
        </div>

        <p className="style-body text-black300 text-center mb-10 max-w-sm">
          {t('spamNotice')}
        </p>

        <Link href="/">
          <Button variant="outlined" arrow="left">{t('backToShop')}</Button>
        </Link>
      </div>
    </main>
  );
}

export default function ThankYouPage() {
  const t = useTranslations('checkout.thankYou');
  return (
    <div className="w-full min-h-screen flex flex-col bg-black text-secondary">
      <div className="sticky top-0 z-40 w-full"><CheckoutHeader /></div>

      <Suspense fallback={<div className="flex-grow bg-black" />}>
        <ThankYouContent />
      </Suspense>

      <footer className="py-8 text-center border-t border-black300/10">
        <p className="style-body text-black300 text-sm">{t('footer', { year: new Date().getFullYear() })}</p>
      </footer>
    </div>
  );
}
