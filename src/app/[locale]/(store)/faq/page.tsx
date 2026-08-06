import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import Button from '@/components/Button';
import Breadcrumbs from '@/components/Breadcrumbs';
import { ArteVeritasLink } from '@/components/PickupPartner';
import { ARTE_VERITAS_MAPS_URL } from '@/lib/pickupPartner';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.faq' });
  return {
    title: t('title'),
    description: t('description'),
    alternates: { canonical: '/faq' },
  };
}

function FaqRow({ question, answer }: { question: string; answer: React.ReactNode }) {
  return (
    <div className="py-6 border-b border-white/10 last:border-b-0">
      <h3 className="style-h4 mb-1">{question}</h3>
      <p className="style-body text-secondary/60">{answer}</p>
    </div>
  );
}

export default async function FaqPage() {
  const t = await getTranslations('faq');
  const questionKeys = ['q1', 'q2', 'q3'] as const;

  const pickupMapsLink = (chunks: React.ReactNode) => (
    <a
      href={ARTE_VERITAS_MAPS_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="font-bold underline decoration-primary/50 underline-offset-2 hover:text-primary transition-colors"
    >
      {chunks}
    </a>
  );

  const answers = {
    q1: t('questions.q1.answer'),
    q2: t('questions.q2.answer'),
    q3: t.rich('questions.q3.answer', {
      partner: (chunks) => <ArteVeritasLink>{chunks}</ArteVeritasLink>,
      maps: pickupMapsLink,
    }),
  };

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

      {/* ——— FAQ ——— */}
      <section className="border-t border-white/5 bg-[#0B1120]">
        <div className="layout-container py-[48px] md:py-[64px] lg:py-[80px]">
          <div className="max-w-[640px] mx-auto">
            {questionKeys.map((key) => (
              <FaqRow key={key} question={t(`questions.${key}.question`)} answer={answers[key]} />
            ))}
          </div>
        </div>
      </section>

      {/* ——— CTA ——— */}
      <section className="border-t border-white/5">
        <div className="layout-container py-[56px] md:py-[80px] text-center">
          <h2 className="style-h2 mb-4">{t('cta.title')}</h2>
          <p className="style-perex text-secondary/60 max-w-[480px] mx-auto mb-10">
            {t('cta.text')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/kontakt">
              <Button arrow="right">{t('cta.button')}</Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
