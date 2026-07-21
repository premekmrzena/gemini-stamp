'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { X } from 'lucide-react';
import { useBackdropClose } from '@/hooks/useBackdropClose';
import Button from '@/components/Button';

type Review = {
  id: number;
  name: string;
  country: string;
  text: string;
  fullText: string;
  photo: string;
};

const REVIEW_META = [
  { id: 1, key: 'review1', name: 'Yuki Tanaka', photo: '/images/recenze01.png' },
  { id: 2, key: 'review2', name: 'Min-jun Lee', photo: '/images/recenze02.png' },
  { id: 3, key: 'review3', name: 'Zhang Wei', photo: '/images/recenze03.png' },
  { id: 4, key: 'review4', name: 'Aiko Suzuki', photo: '/images/recenze04.png' },
  { id: 5, key: 'review5', name: 'Hyun-soo Kim', photo: '/images/recenze05.png' },
] as const;

export default function ReviewStrip() {
  const t = useTranslations('home.reviewStrip');
  const reviews: Review[] = REVIEW_META.map((meta) => ({
    id: meta.id,
    name: meta.name,
    photo: meta.photo,
    country: t(`reviews.${meta.key}.country`),
    text: t(`reviews.${meta.key}.text`),
    fullText: t(`reviews.${meta.key}.fullText`),
  }));
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const modalBackdrop = useBackdropClose(() => setSelectedReview(null));

  return (
    <section className="w-full">
      <div className="layout-container">
        <h2 className="style-h2 text-secondary text-center mb-6 select-none">{t('title')}</h2>
        <div className="flex gap-3 overflow-x-auto lg:overflow-hidden snap-x snap-mandatory scrollbar-hide">
          {reviews.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setSelectedReview(r)}
              className="flex items-center gap-3 shrink-0 snap-start bg-black500 hover:bg-black400 rounded px-4 py-3 min-w-[190px] lg:min-w-0 lg:flex-1 text-left cursor-pointer transition-colors"
            >
              <div className="relative w-9 h-9 rounded overflow-hidden shrink-0">
                <Image src={r.photo} alt={r.name} fill className="object-cover" />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="style-body-bold text-secondary truncate">{r.name}</span>
                  <span className="style-label text-black300 shrink-0">{r.country}</span>
                </div>
                <div className="text-[#F9B420] text-[10px] leading-none mb-1">★★★★★</div>
                <p className="style-label text-secondary/60 truncate">{r.text}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 mt-10">
          <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden shrink-0">
            <Image src="/images/recenze01.png" alt={t('smilingCustomerAlt')} fill className="object-cover" />
          </div>
          <p className="style-h3 text-secondary">{t('faqTitle')}</p>
          <Link href="/faq">
            <Button variant="outlined" arrow="right">{t('readMore')}</Button>
          </Link>
        </div>
      </div>

      {selectedReview && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-all"
          {...modalBackdrop}
        >
          <div
            className="bg-black400 w-full max-w-md rounded-[24px] border border-black300/30 shadow-2xl animate-[fadeIn_0.15s_ease-out] p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start gap-4 mb-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative w-12 h-12 rounded overflow-hidden shrink-0">
                  <Image src={selectedReview.photo} alt={selectedReview.name} fill className="object-cover" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="style-body-bold text-secondary truncate">{selectedReview.name}</span>
                    <span className="style-label text-black300 shrink-0">{selectedReview.country}</span>
                  </div>
                  <div className="text-[#F9B420] text-[12px] leading-none mt-1">★★★★★</div>
                </div>
              </div>
              <button
                onClick={() => setSelectedReview(null)}
                className="p-2 -m-2 text-black300 hover:text-secondary hover:bg-black300/10 rounded-full transition-colors cursor-pointer shrink-0"
              >
                <X size={20} />
              </button>
            </div>
            <p className="style-body text-secondary/80">{selectedReview.fullText}</p>
          </div>
        </div>
      )}
    </section>
  );
}
