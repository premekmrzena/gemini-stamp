import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import Button from '@/components/Button';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('notFound');
  return { title: t('title') };
}

export default async function NotFound() {
  const t = await getTranslations('notFound');

  return (
    <main className="w-full min-h-[70vh] bg-[#0F172A] text-secondary flex flex-col items-center justify-center px-6 text-center">
      <h1 className="style-h1 mb-4">{t('title')}</h1>
      <p className="style-body text-secondary/60 mb-10 max-w-[420px]">{t('message')}</p>
      <Link href="/">
        <Button arrow="right">{t('backHome')}</Button>
      </Link>
    </main>
  );
}
