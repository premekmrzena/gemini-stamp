import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import Button from '@/components/Button';
import Breadcrumbs from '@/components/Breadcrumbs';
import PurchaseCategoriesSection from '@/components/PurchaseCategoriesSection';
import { ApplePayBadge, GooglePayBadge } from '@/components/PayBadges';
import { ArteVeritasLink } from '@/components/PickupPartner';
import { ARTE_VERITAS_MAPS_URL } from '@/lib/pickupPartner';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.howToBuy' });
  return {
    title: t('title'),
    description: t('description'),
    alternates: { canonical: '/jak-nakupovat' },
  };
}

function Row({
  index,
  title,
  price,
  text,
  href,
  children,
}: {
  index?: string;
  title: string;
  price?: string;
  text: React.ReactNode;
  href?: string;
  children?: React.ReactNode;
}) {
  const inner = (
    <>
      {index && <span className="style-label text-primary/40 sm:w-8 sm:pt-1 shrink-0">{index}</span>}
      <div className="flex-1">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4">
          <h3 className={`style-h4 ${href ? 'group-hover:text-primary transition-colors' : ''}`}>{title}</h3>
          {price && <span className="style-body-bold text-primary">{price}</span>}
        </div>
        <p className="style-body text-secondary/60 mt-1">{text}</p>
        {children}
      </div>
    </>
  );

  const rowClasses = 'flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-8 py-6 border-b border-white/10 last:border-b-0';

  if (href) {
    return (
      <Link href={href} className={`group block ${rowClasses}`}>
        {inner}
      </Link>
    );
  }

  return <div className={rowClasses}>{inner}</div>;
}

export default async function JakNakupovatPage() {
  const t = await getTranslations('howToBuy');

  const pickupText = t.rich('shipping.pickup.text', {
    partner: (chunks) => <ArteVeritasLink>{chunks}</ArteVeritasLink>,
    maps: (chunks) => (
      <a
        href={ARTE_VERITAS_MAPS_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="font-bold underline decoration-primary/50 underline-offset-2 hover:text-primary transition-colors"
      >
        {chunks}
      </a>
    ),
  });

  const shippingOptions = [
    { title: t('shipping.pickup.title'), price: t('shipping.pickup.price'), text: pickupText },
    { title: t('shipping.czech.title'), price: t('shipping.czech.price'), text: t('shipping.czech.text') },
    { title: t('shipping.international.title'), price: t('shipping.international.price'), text: t('shipping.international.text') },
  ];

  const paymentOptions = [
    { title: t('payment.card.title'), text: t('payment.card.text'), logos: true },
    { title: t('payment.transfer.title'), text: t('payment.transfer.text') },
  ];

  const deliveryTimes = [
    { title: t('deliveryTime.standard.title'), price: t('deliveryTime.standard.price'), text: t('deliveryTime.standard.text') },
    { title: t('deliveryTime.customArch.title'), price: t('deliveryTime.customArch.price'), text: t('deliveryTime.customArch.text') },
  ];

  return (
    <main className="bg-[#0F172A] text-secondary w-full">
      <Breadcrumbs items={[{ label: t('breadcrumb') }]} />

      {/* ——— HERO ——— */}
      <section className="layout-container py-8 md:py-12 text-center">
        <h1 className="style-h1 mb-5 max-w-[740px] mx-auto">{t('hero.title')}</h1>
        <p className="style-perex text-secondary/70 max-w-[580px] mx-auto">
          {t('hero.perex')}
        </p>
      </section>

      {/* ——— CO SI MŮŽETE KOUPIT ——— */}
      <section className="border-t border-white/5 bg-[#0B1120] py-[48px] md:py-[64px] lg:py-[80px]">
        <PurchaseCategoriesSection />
      </section>

      {/* ——— DOPRAVA A OSOBNÍ ODBĚR ——— */}
      <section className="border-t border-white/5">
        <div className="layout-container py-[48px] md:py-[64px] lg:py-[80px]">
          <h2 className="style-h2 text-center mb-12 md:mb-16">{t('shipping.title')}</h2>

          <div className="max-w-[640px] mx-auto">
            {shippingOptions.map((opt) => (
              <Row key={opt.title} title={opt.title} price={opt.price} text={opt.text} />
            ))}
          </div>
        </div>
      </section>

      {/* ——— DOBA VÝROBY ——— */}
      <section className="border-t border-white/5 bg-[#0B1120]">
        <div className="layout-container py-[48px] md:py-[64px] lg:py-[80px]">
          <h2 className="style-h2 text-center mb-12 md:mb-16">{t('deliveryTime.title')}</h2>

          <div className="max-w-[640px] mx-auto">
            {deliveryTimes.map((item) => (
              <Row key={item.title} title={item.title} price={item.price} text={item.text} />
            ))}
          </div>
        </div>
      </section>

      {/* ——— PLATBA ——— */}
      <section className="border-t border-white/5">
        <div className="layout-container py-[48px] md:py-[64px] lg:py-[80px]">
          <h2 className="style-h2 text-center mb-12 md:mb-16">{t('payment.title')}</h2>

          <div className="max-w-[640px] mx-auto">
            {paymentOptions.map((opt) => (
              <Row key={opt.title} title={opt.title} text={opt.text}>
                {opt.logos && (
                  <div className="flex items-center gap-2 mt-3">
                    <ApplePayBadge />
                    <GooglePayBadge />
                  </div>
                )}
              </Row>
            ))}
          </div>
        </div>
      </section>

      {/* ——— CTA ——— */}
      <section className="border-t border-white/5 bg-[#0B1120]">
        <div className="layout-container py-[56px] md:py-[80px] text-center">
          <h2 className="style-h2 mb-4">{t('cta.title')}</h2>
          <p className="style-perex text-secondary/60 max-w-[480px] mx-auto mb-10">
            {t('cta.text')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/">
              <Button arrow="right">{t('cta.shopButton')}</Button>
            </Link>
            <Link href="/kontakt">
              <Button variant="outlined" arrow="right">{t('cta.questionButton')}</Button>
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}
