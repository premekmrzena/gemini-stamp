import { getTranslations } from 'next-intl/server';
import Breadcrumbs from '@/components/Breadcrumbs';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.privacyPolicy' });
  return {
    title: t('title'),
    description: t('description'),
    alternates: { canonical: '/ochrana-osobnich-udaju' },
  };
}

const sectionKeys = ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8'] as const;

export default async function OchranaOsobnichUdajuPage() {
  const t = await getTranslations('privacyPolicy');

  return (
    <main className="bg-[#0F172A] text-secondary w-full min-h-screen">
      <Breadcrumbs items={[{ label: t('breadcrumb') }]} />
      <div className="layout-container py-[48px] md:py-[64px] lg:py-[80px]">

        <div className="max-w-[760px]">
          <h1 className="style-h1 mb-3">{t('title')}</h1>
          <p className="style-body text-secondary/40 mb-14">{t('validFrom')}</p>

          <div className="flex flex-col gap-10">
            {sectionKeys.map((key) => (
              <div key={key} className="border-t border-white/5 pt-8">
                <h2 className="style-h3 mb-4">{t(`sections.${key}.title`)}</h2>
                {t(`sections.${key}.content`).split('\n\n').map((para, i) => (
                  <p key={i} className="style-body text-secondary/60 mb-3 last:mb-0 whitespace-pre-line">
                    {para}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}
