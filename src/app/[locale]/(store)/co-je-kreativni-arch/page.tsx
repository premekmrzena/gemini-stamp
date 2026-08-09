import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import Button from '@/components/Button';
import Breadcrumbs from '@/components/Breadcrumbs';
import StampCategoriesSection from '@/components/StampCategoriesSection';
import { localeAlternates } from '@/lib/site';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.whatIsCreativeArch' });
  return {
    title: t('title'),
    description: t('description'),
    alternates: { canonical: '/co-je-kreativni-arch', languages: localeAlternates('/co-je-kreativni-arch') },
  };
}

export default async function CoJeKreativniArch() {
  const t = await getTranslations('whatIsCreativeArch');

  const processSteps = [
    { id: 1, title: t('howItWorks.step1.title'), text: t('howItWorks.step1.text') },
    { id: 2, title: t('howItWorks.step2.title'), text: t('howItWorks.step2.text') },
    { id: 3, title: t('howItWorks.step3.title'), text: t('howItWorks.step3.text') },
    { id: 4, title: t('howItWorks.step4.title'), text: t('howItWorks.step4.text') },
  ];

  const touristItems = [
    { num: '01', text: t('forTourists.item1') },
    { num: '02', text: t('forTourists.item2') },
    { num: '03', text: t('forTourists.item3') },
  ];

  return (
    <main className="bg-[#0F172A] text-secondary w-full">
      <Breadcrumbs items={[{ label: t('breadcrumb') }]} />

      {/* ——— HERO ——— */}
      <section className="layout-container py-8 md:py-12 text-center">
        <h1 className="style-h1 mb-5 max-w-[740px] mx-auto">
          {t('hero.title')}
        </h1>
        <p className="style-perex text-secondary/70 max-w-[580px] mx-auto mb-10">
          {t('hero.perex')}
        </p>
        <Link href="/vytvorit-arch">
          <Button arrow="right">{t('hero.cta')}</Button>
        </Link>
      </section>

      {/* ——— JAK TO FUNGUJE ——— */}
      <section className="border-t border-white/5 bg-[#0B1120]">
        <div className="layout-container py-[48px] md:py-[64px] lg:py-[80px]">
          <h2 className="style-h2 text-center mb-4">{t('howItWorks.title')}</h2>
          <p className="style-body text-secondary/50 text-center max-w-[43rem] mx-auto mb-12 md:mb-16">
            {t('howItWorks.perex')}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {processSteps.map((step) => (
              <div key={step.id} className="flex flex-col items-center text-center">
                <div className="w-9 h-9 lg:w-[34px] lg:h-[34px] rounded-full bg-primary text-black flex items-center justify-center font-semibold text-[22px] lg:text-[24px] mb-3 shrink-0">
                  {step.id}
                </div>
                <h3 className="style-h3 mb-2">{step.title}</h3>
                <p className="style-body text-secondary/60">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ——— UMĚNÍ VE ZNÁMKÁCH ——— */}
      <section className="border-t border-white/5 py-[48px] md:py-[64px] lg:py-[80px]">
        <StampCategoriesSection />
      </section>

      {/* ——— PRO TURISTY ——— */}
      <section className="border-t border-white/5">
        <div className="layout-container py-[48px] md:py-[64px] lg:py-[80px]">
          <h2 className="style-h2 text-center mb-4">{t('forTourists.title')}</h2>
          <p className="style-body text-secondary/50 text-center max-w-[43rem] mx-auto mb-12 md:mb-16">
            {t('forTourists.perex')}
          </p>

          <div className="grid grid-cols-1 gap-4 max-w-[640px] mx-auto">
            {touristItems.map((item) => (
              <div key={item.num} className="flex gap-4 items-start p-5 rounded-[4px] border border-white/5 bg-[#0B1120]">
                <span className="style-h2 text-primary/40 font-semibold shrink-0 leading-none">{item.num}</span>
                <p className="style-body text-secondary/70 mt-1">{item.text}</p>
              </div>
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
          <Link href="/vytvorit-arch">
            <Button arrow="right">{t('cta.button')}</Button>
          </Link>
        </div>
      </section>

    </main>
  );
}
