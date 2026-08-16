'use client';

import React, { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Button from '@/components/Button';
import { useCart } from '@/context/CartContext';
import CheckoutHeader from '@/components/checkout/CheckoutHeader';
import { gtagPurchase } from '@/lib/gtag';
import { Currency } from '@/lib/currency';

const PURCHASE_SENT_KEY = 'mcs_ga_purchase_sent';

function ThankYouContent() {
  const { cartItems, clearCart } = useCart();
  const t = useTranslations('checkout.thankYou');
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const displayId = orderId ? orderId.slice(-8).toUpperCase() : null;
  const totalParam = searchParams.get('total');
  const currencyParam = searchParams.get('currency') as Currency | null;
  // Z URL, ne z CartContext.appliedDiscount - po fresh reloadu (viz komentář níže
  // u window.location.href) by tichá revalidace uloženého kódu mohla doběhnout
  // až PO odeslání purchase eventu (race). URL parametr nastavuje useCheckout.ts/
  // StripePaymentForm.tsx jen tehdy, když server objednávku s kódem skutečně přijal.
  const couponParam = searchParams.get('coupon');

  // Stripe u karetních plateb vyžadujících přesměrování (typicky 3D Secure)
  // vždy přesměruje na return_url bez ohledu na výsledek - úspěch/neúspěch
  // rozlišuje jen `redirect_status` v query. Bankovní převod (bez Stripe)
  // sem naviguje přímo bez tohoto parametru, takže tam žádný check není.
  const redirectStatus = searchParams.get('redirect_status');
  const paymentFailed = redirectStatus !== null && redirectStatus !== 'succeeded';

  useEffect(() => {
    if (paymentFailed) return;
    // Sem se naviguje plným reloadem (window.location.href/Stripe return_url), takže
    // CartContext natahuje cartItems z localStorage až ve vlastním efektu PO téhle
    // komponentě (React fire-uje efekty od nejhlubšího potomka k rodiči) - dokud
    // nedoběhne, cartItems je ještě prázdné [] a purchase by se poslal bez items.
    if (cartItems.length === 0) return;

    // sessionStorage dedup - refresh/návrat na tuhle URL nesmí odeslat purchase
    // znovu (rozpočet by se v GA4 započítal dvakrát za stejnou objednávku).
    if (orderId && totalParam && currencyParam && sessionStorage.getItem(PURCHASE_SENT_KEY) !== orderId) {
      sessionStorage.setItem(PURCHASE_SENT_KEY, orderId);
      gtagPurchase(
        orderId,
        Number(totalParam),
        currencyParam,
        cartItems.map((item) => ({ item_id: item.id, item_name: item.name, price: item.price, quantity: item.quantity })),
        couponParam
      );
    }

    const timer = setTimeout(() => {
      clearCart();
      if (typeof window !== 'undefined') {
        localStorage.removeItem('razitka-cart');
      }
    }, 100);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentFailed, cartItems]);

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
